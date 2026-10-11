const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { all, get, run, hashPassword, verifyPassword } = require('./db');

const PORT = process.env.PORT || 3000;
const SITE_NAME = process.env.SITE_NAME || 'Q8 VIP IPTV Pro';
const CONTACT_URL = process.env.CONTACT_URL || ''; // مثال: https://wa.me/965XXXXXXXX
const CURRENCY = process.env.CURRENCY || 'د.ك';
const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 1);
const SESSION_DAYS = 30;
const TV_SESSION_DAYS = 365;
const DAY = 86400000;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // خلف Railway/Render/Nginx
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// ---------- أدوات ----------
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch((e) => {
  console.error(e);
  res.status(500).json({ error: 'خطأ في الخادم' });
});
const fail = (res, code, msg) => res.status(code).json({ error: msg });
const isActive = (u) => u && !u.banned && (u.role === 'admin' || u.expires_at > Date.now());

function parseCookies(req) {
  const o = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) { try { o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); } catch {} }
  });
  return o;
}

function setSession(req, res, userId, days = SESSION_DAYS) {
  const token = crypto.randomBytes(32).toString('hex');
  run('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)', sha(token), userId, Date.now() + days * DAY);
  res.setHeader('Set-Cookie',
    `sid=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${days * 86400}${req.secure ? '; Secure' : ''}`);
}

// حماية CSRF بسيطة: كل طلب يغيّر بيانات لازم يحمل هذا الهيدر (استثناء استدعاءات التلفزيون والأجهزة الذكية)
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/tv/')) return next();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers['x-requested-with'] !== 'iptv')
    return fail(res, 403, 'طلب غير مسموح');
  next();
});

// تحديد المستخدم الحالي (يدعم Cookie أو Bearer Token للتلفزيون والتطبيق)
app.use((req, res, next) => {
  const authHeader = req.headers.authorization || '';
  let token = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    token = parseCookies(req).sid;
  }
  req.user = null;
  req.authToken = token;
  if (token) {
    const row = get(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`, sha(token), Date.now());
    if (row && !row.banned) req.user = row;
  }
  next();
});

const needLogin = (req, res, next) => (req.user ? next() : fail(res, 401, 'سجّل الدخول أولاً'));
const needAdmin = (req, res, next) =>
  req.user && req.user.role === 'admin' ? next() : fail(res, 403, 'للمدير فقط');
const needSub = (req, res, next) =>
  isActive(req.user) ? next() : fail(res, 402, 'اشتراكك منتهي أو غير مفعّل');

// تحديد المحاولات (حماية من التخمين)
const hits = new Map();
function limiter(max, windowMs) {
  return (req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();
    const h = hits.get(key);
    if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return next(); }
    if (++h.n > max) return fail(res, 429, 'محاولات كثيرة، حاول لاحقاً');
    next();
  };
}
setInterval(() => { const n = Date.now(); for (const [k, v] of hits) if (v.reset < n) hits.delete(k); }, 600000).unref();

const publicUser = (u) => ({
  id: u.id, username: u.username, email: u.email, role: u.role,
  expires_at: u.expires_at, active: isActive(u), created_at: u.created_at,
});

// ---------- عام ----------
app.get('/api/config', (req, res) => res.json({ siteName: SITE_NAME, contactUrl: CONTACT_URL, currency: CURRENCY, trialDays: TRIAL_DAYS }));
app.get('/api/plans', (req, res) => res.json(all('SELECT id,name,days,price,description FROM plans WHERE active=1 ORDER BY days')));

// ---------- حسابات ----------
app.post('/api/auth/register', limiter(10, 900000), wrap((req, res) => {
  let { username = '', email = '', password = '', is_tv = false } = req.body || {};
  username = String(username).trim();
  password = String(password).trim();
  
  // السماح بأسماء وأرقام، وبشكل خاص أرقام فقط (مثل 123456)
  if (!/^[\w.\-]{3,24}$/.test(username)) return fail(res, 400, 'اسم المستخدم يجب أن يكون من 3 إلى 24 رقم أو حرف');
  if (!email) email = `${username}@q8vip.tv`; // إنشاء بريد تلقائي إذا كان الإدخال من التلفزيون
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(res, 400, 'البريد الإلكتروني غير صحيح');
  if (password.length < 3 || password.length > 100) return fail(res, 400, 'كلمة المرور 3 أرقام على الأقل');
  if (get('SELECT id FROM users WHERE username=? OR email=?', username, email)) return fail(res, 409, 'اسم المستخدم أو الرقم مستخدم من قبل');
  const expires = TRIAL_DAYS > 0 ? Date.now() + TRIAL_DAYS * DAY : 0;
  const r = run('INSERT INTO users (username,email,password_hash,expires_at,created_at) VALUES (?,?,?,?,?)',
    username, email, hashPassword(password), expires, Date.now());
  const token = crypto.randomBytes(32).toString('hex');
  const days = is_tv ? TV_SESSION_DAYS : SESSION_DAYS;
  run('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)', sha(token), r.lastInsertRowid, Date.now() + days * DAY);
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${days * 86400}${req.secure ? '; Secure' : ''}`);
  res.json({ ok: true, token });
}));

app.post('/api/auth/login', limiter(10, 900000), wrap((req, res) => {
  const { username = '', password = '', is_tv = false } = req.body || {};
  const queryStr = String(username).trim();
  const u = get('SELECT * FROM users WHERE username=? OR email=?', queryStr, queryStr);
  
  if (!u) return fail(res, 401, 'رقم الاشتراك غير صحيح');
  if (u.banned) return fail(res, 403, 'هذا الحساب موقوف');

  // إذا تم إرسال كلمة مرور، يتم التحقق منها
  // أما إذا لم تُرسل كلمة مرور (نظام الاشتراك برقم فقط):
  // يُسمح بالدخول للمستخدم العادي مباشرة برقمه، أو للمدير إذا وضع كلمة المرور
  if (password) {
    if (!verifyPassword(String(password), u.password_hash)) {
      return fail(res, 401, 'كلمة المرور غير صحيحة');
    }
  } else {
    // إذا كان الحساب مديراً وتطلب الدخول بدون باسورد يُمنع للأمان، إلا إذا كان مستخدم عادي
    if (u.role === 'admin') {
      return fail(res, 401, 'حساب المدير يتطلب كلمة المرور');
    }
  }

  const token = crypto.randomBytes(32).toString('hex');
  const days = is_tv ? TV_SESSION_DAYS : SESSION_DAYS;
  run('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)', sha(token), u.id, Date.now() + days * DAY);
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${days * 86400}${req.secure ? '; Secure' : ''}`);
  res.json({ ok: true, token, user: publicUser(u) });
}));

app.post('/api/auth/logout', (req, res) => {
  const sid = parseCookies(req).sid;
  if (sid) run('DELETE FROM sessions WHERE token_hash=?', sha(sid));
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => res.json({ user: req.user ? publicUser(req.user) : null }));

app.post('/api/me/password', needLogin, wrap((req, res) => {
  const { current = '', next = '' } = req.body || {};
  if (!verifyPassword(String(current), req.user.password_hash)) return fail(res, 400, 'كلمة المرور الحالية خاطئة');
  if (next.length < 6) return fail(res, 400, 'كلمة المرور الجديدة قصيرة');
  run('UPDATE users SET password_hash=? WHERE id=?', hashPassword(next), req.user.id);
  res.json({ ok: true });
}));

// تفعيل كود اشتراك
app.post('/api/redeem', needLogin, limiter(15, 900000), wrap((req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  const c = get('SELECT * FROM codes WHERE code=? AND used_by IS NULL', code);
  if (!c) return fail(res, 404, 'الكود غير صحيح أو مستخدم');
  const base = Math.max(Date.now(), req.user.expires_at);
  const exp = base + c.days * DAY;
  run('UPDATE codes SET used_by=?, used_at=? WHERE code=?', req.user.id, Date.now(), code);
  run('UPDATE users SET expires_at=? WHERE id=?', exp, req.user.id);
  res.json({ ok: true, expires_at: exp, days: c.days });
}));

// ---------- ربط التلفزيون (TV Quick Pair via Code / Phone) ----------
function genPairCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// التلفزيون يطلب كود لربطه بالجوال
app.post('/api/tv/request-pair', wrap((req, res) => {
  const code = genPairCode();
  const secret = crypto.randomBytes(24).toString('hex');
  const exp = Date.now() + 10 * 60 * 1000; // 10 دقائق
  run('INSERT INTO tv_pairings (code, secret_hash, expires_at) VALUES (?, ?, ?)', code, sha(secret), exp);
  res.json({ code, secret, expires_in: 600 });
}));

// التلفزيون يفحص هل تم التفعيل من الجوال
app.post('/api/tv/check-pair', wrap((req, res) => {
  const { code = '', secret = '' } = req.body || {};
  const row = get('SELECT * FROM tv_pairings WHERE code = ? AND secret_hash = ? AND expires_at > ?', String(code).toUpperCase(), sha(String(secret)), Date.now());
  if (!row) return fail(res, 404, 'كود الربط منتهي أو غير صحيح');
  if (!row.user_id) return res.json({ paired: false, message: 'في انتظار التأكيد من الجوال' });

  const u = get('SELECT * FROM users WHERE id = ?', row.user_id);
  if (!u || u.banned) return fail(res, 403, 'الحساب غير صالح');

  // إنشاء جلسة سنوية خاصة بالتلفزيون
  const token = crypto.randomBytes(32).toString('hex');
  run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)', sha(token), u.id, Date.now() + TV_SESSION_DAYS * DAY);
  run('DELETE FROM tv_pairings WHERE code = ?', code);
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${TV_SESSION_DAYS * 86400}${req.secure ? '; Secure' : ''}`);
  res.json({ paired: true, token, user: publicUser(u) });
}));

// المستخدم يفعل كود التلفزيون من حسابه (من الجوال)
app.post('/api/tv/confirm-pair', needLogin, wrap((req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  const row = get('SELECT * FROM tv_pairings WHERE code = ? AND expires_at > ?', code, Date.now());
  if (!row) return fail(res, 404, 'الكود غير صحيح أو انتهت صلاحيته');
  run('UPDATE tv_pairings SET user_id = ? WHERE code = ?', req.user.id, code);
  res.json({ ok: true, message: 'تم ربط التلفزيون بنجاح!' });
}));
// ---------- Xtream Codes API Compatibility (player_api.php) ----------
function authenticateXtream(req) {
  const username = req.query.username || req.body?.username || '';
  const password = req.query.password || req.body?.password || '';
  const u = get('SELECT * FROM users WHERE username = ? OR email = ?', String(username), String(username));
  if (!u || !verifyPassword(String(password), u.password_hash) || u.banned) return null;
  return u;
}

app.all(['/player_api.php', '/api/xtream'], wrap((req, res) => {
  const user = authenticateXtream(req);
  if (!user) {
    return res.json({ user_info: { auth: 0, status: 'Failed', message: 'اسم المستخدم أو كلمة المرور غير صحيحة' } });
  }

  const action = req.query.action || req.body?.action || '';
  const expTimestamp = user.role === 'admin' ? 253402300799 : Math.floor(user.expires_at / 1000);
  const activeStatus = (user.role === 'admin' || user.expires_at > Date.now()) ? 'Active' : 'Expired';

  // 1. فحص الحساب الافتراضي
  if (!action) {
    return res.json({
      user_info: {
        username: user.username,
        password: '***',
        message: 'مرحباً بك في Q8 VIP IPTV Pro',
        auth: 1,
        status: activeStatus,
        exp_date: String(expTimestamp),
        is_trial: '0',
        active_cons: '1',
        created_at: String(Math.floor(user.created_at / 1000)),
        max_connections: '5',
        allowed_output_formats: ['m3u8', 'ts', 'rtmp']
      },
      server_info: {
        url: req.hostname,
        port: String(PORT),
        https_port: '443',
        server_protocol: req.protocol,
        rtmp_port: '8880',
        timezone: 'Asia/Kuwait',
        timestamp_now: Math.floor(Date.now() / 1000),
        time_now: new Date().toISOString()
      }
    });
  }

  if (activeStatus !== 'Active') {
    return res.status(403).json({ error: 'الاشتراك منتهي' });
  }

  // 2. تصنيفات القنوات المباشرة
  if (action === 'get_live_categories') {
    const cats = all('SELECT id AS category_id, name AS category_name, 0 AS parent_id FROM categories ORDER BY sort, name');
    return res.json(cats);
  }

  // 3. القنوات المباشرة
  if (action === 'get_live_streams') {
    const catId = req.query.category_id || req.body?.category_id;
    let sql = 'SELECT id AS stream_id, name, logo AS stream_icon, url, category_id, "live" AS stream_type FROM channels WHERE active = 1';
    const params = [];
    if (catId) {
      sql += ' AND category_id = ?';
      params.push(catId);
    }
    sql += ' ORDER BY sort, name';
    const streams = all(sql, ...params).map(s => ({
      num: s.stream_id,
      name: s.name,
      stream_type: 'live',
      stream_id: s.stream_id,
      stream_icon: s.logo,
      epg_channel_id: '',
      added: '1700000000',
      category_id: String(s.category_id || 1),
      custom_sid: '',
      tv_archive: 0,
      direct_source: s.url,
      tv_archive_duration: 0
    }));
    return res.json(streams);
  }

  // 4. تصنيفات الأفلام (VOD)
  if (action === 'get_vod_categories') {
    return res.json([{ category_id: '99', category_name: 'أفلام VIP قريباً', parent_id: 0 }]);
  }

  // 5. تصنيفات المسلسلات (Series)
  if (action === 'get_series_categories') {
    return res.json([{ category_id: '98', category_name: 'مسلسلات VIP قريباً', parent_id: 0 }]);
  }

  res.json([]);
}));

// ---------- القنوات (للمشتركين) ----------
app.get('/api/categories', needLogin, needSub, (req, res) => {
  res.json(all(`SELECT c.id,c.name,(SELECT COUNT(*) FROM channels h WHERE h.category_id=c.id AND h.active=1) AS count
                FROM categories c ORDER BY c.sort,c.name`));
});
app.get('/api/channels', needLogin, needSub, (req, res) => {
  res.json(all('SELECT id,name,logo,url,category_id FROM channels WHERE active=1 ORDER BY sort,name'));
});

// ---------- لوحة الإدارة ----------
const admin = express.Router();
admin.use(needAdmin);

admin.get('/stats', (req, res) => {
  const now = Date.now();
  res.json({
    users: get('SELECT COUNT(*) n FROM users WHERE role!=?', 'admin').n,
    active: get('SELECT COUNT(*) n FROM users WHERE role!=? AND banned=0 AND expires_at>?', 'admin', now).n,
    channels: get('SELECT COUNT(*) n FROM channels').n,
    categories: get('SELECT COUNT(*) n FROM categories').n,
    freeCodes: get('SELECT COUNT(*) n FROM codes WHERE used_by IS NULL').n,
    usedCodes: get('SELECT COUNT(*) n FROM codes WHERE used_by IS NOT NULL').n,
  });
});

// المستخدمون
admin.get('/users', (req, res) => {
  const q = `%${String(req.query.q || '').trim()}%`;
  res.json(all('SELECT id,username,email,role,banned,expires_at,created_at FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 500', q, q));
});

// إنشاء مستخدم جديد برقم فقط (Numeric Account Generator)
admin.post('/users', wrap((req, res) => {
  let { username = '', password = '', days = 30 } = req.body || {};
  
  // إذا لم يتم تحديد اسم مستخدم رقمي، يتم توليد رقم عشوائي من 6 أرقام
  if (!username) {
    do {
      username = String(Math.floor(100000 + Math.random() * 900000));
    } while (get('SELECT id FROM users WHERE username = ?', username));
  }
  
  // إذا لم تحدد كلمة مرور، تكون 4 إلى 6 أرقام
  if (!password) {
    password = String(Math.floor(1000 + Math.random() * 9000));
  }
  
  username = String(username).trim();
  password = String(password).trim();
  
  if (get('SELECT id FROM users WHERE username = ?', username)) {
    return fail(res, 409, 'رقم المستخدم مستخدم بالفعل');
  }

  const email = `${username}@q8vip.tv`;
  const exp = Date.now() + Number(days) * DAY;
  
  const r = run(
    'INSERT INTO users (username, email, password_hash, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    username, email, hashPassword(password), 'user', exp, Date.now()
  );
  
  res.json({ ok: true, id: r.lastInsertRowid, username, password, days: Number(days), expires_at: exp });
}));
admin.patch('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const u = get('SELECT * FROM users WHERE id=?', id);
  if (!u) return fail(res, 404, 'غير موجود');
  const { add_days, banned, role, password } = req.body || {};
  if (add_days !== undefined) {
    const d = Number(add_days);
    if (!Number.isFinite(d)) return fail(res, 400, 'عدد أيام غير صحيح');
    const base = d >= 0 ? Math.max(Date.now(), u.expires_at) : u.expires_at;
    run('UPDATE users SET expires_at=? WHERE id=?', Math.max(0, base + d * DAY), id);
  }
  if (id !== req.user.id) {
    if (banned !== undefined) {
      run('UPDATE users SET banned=? WHERE id=?', banned ? 1 : 0, id);
      if (banned) run('DELETE FROM sessions WHERE user_id=?', id);
    }
    if (role === 'admin' || role === 'user') run('UPDATE users SET role=? WHERE id=?', role, id);
  }
  if (password) {
    if (String(password).length < 6) return fail(res, 400, 'كلمة المرور قصيرة');
    run('UPDATE users SET password_hash=? WHERE id=?', hashPassword(String(password)), id);
  }
  res.json({ ok: true });
});
admin.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return fail(res, 400, 'لا يمكنك حذف حسابك');
  run('DELETE FROM users WHERE id=?', id);
  res.json({ ok: true });
});

// الباقات
admin.get('/plans', (req, res) => res.json(all('SELECT * FROM plans ORDER BY days')));
admin.post('/plans', (req, res) => {
  const { name, days, price = 0, description = '', active = 1 } = req.body || {};
  if (!name || !(Number(days) > 0)) return fail(res, 400, 'الاسم وعدد الأيام مطلوبان');
  run('INSERT INTO plans (name,days,price,description,active) VALUES (?,?,?,?,?)', String(name), Number(days), Number(price), String(description), active ? 1 : 0);
  res.json({ ok: true });
});
admin.put('/plans/:id', (req, res) => {
  const { name, days, price = 0, description = '', active = 1 } = req.body || {};
  if (!name || !(Number(days) > 0)) return fail(res, 400, 'الاسم وعدد الأيام مطلوبان');
  run('UPDATE plans SET name=?,days=?,price=?,description=?,active=? WHERE id=?', String(name), Number(days), Number(price), String(description), active ? 1 : 0, Number(req.params.id));
  res.json({ ok: true });
});
admin.delete('/plans/:id', (req, res) => { run('DELETE FROM plans WHERE id=?', Number(req.params.id)); res.json({ ok: true }); });

// الفئات
admin.get('/categories', (req, res) => res.json(all(`SELECT c.*,(SELECT COUNT(*) FROM channels h WHERE h.category_id=c.id) AS count FROM categories c ORDER BY sort,name`)));
admin.post('/categories', (req, res) => {
  const { name, sort = 0 } = req.body || {};
  if (!name) return fail(res, 400, 'الاسم مطلوب');
  try { run('INSERT INTO categories (name,sort) VALUES (?,?)', String(name).trim(), Number(sort) || 0); }
  catch { return fail(res, 409, 'الفئة موجودة'); }
  res.json({ ok: true });
});
admin.put('/categories/:id', (req, res) => {
  const { name, sort = 0 } = req.body || {};
  if (!name) return fail(res, 400, 'الاسم مطلوب');
  try { run('UPDATE categories SET name=?,sort=? WHERE id=?', String(name).trim(), Number(sort) || 0, Number(req.params.id)); }
  catch { return fail(res, 409, 'الاسم مستخدم'); }
  res.json({ ok: true });
});
admin.delete('/categories/:id', (req, res) => { run('DELETE FROM categories WHERE id=?', Number(req.params.id)); res.json({ ok: true }); });

// القنوات
const validUrl = (u) => /^https?:\/\/\S+$/i.test(u);
admin.get('/channels', (req, res) => {
  const q = `%${String(req.query.q || '').trim()}%`;
  const cat = req.query.category ? Number(req.query.category) : null;
  res.json(all(`SELECT * FROM channels WHERE name LIKE ? ${cat ? 'AND category_id=?' : ''} ORDER BY sort,name LIMIT 1000`, ...(cat ? [q, cat] : [q])));
});
admin.post('/channels', (req, res) => {
  const { name, logo = '', url, category_id = null, sort = 0, active = 1 } = req.body || {};
  if (!name || !validUrl(url)) return fail(res, 400, 'الاسم ورابط البث (http/https) مطلوبان');
  run('INSERT INTO channels (name,logo,url,category_id,sort,active) VALUES (?,?,?,?,?,?)', String(name), String(logo), url, category_id || null, Number(sort) || 0, active ? 1 : 0);
  res.json({ ok: true });
});
admin.put('/channels/:id', (req, res) => {
  const { name, logo = '', url, category_id = null, sort = 0, active = 1 } = req.body || {};
  if (!name || !validUrl(url)) return fail(res, 400, 'الاسم ورابط البث (http/https) مطلوبان');
  run('UPDATE channels SET name=?,logo=?,url=?,category_id=?,sort=?,active=? WHERE id=?', String(name), String(logo), url, category_id || null, Number(sort) || 0, active ? 1 : 0, Number(req.params.id));
  res.json({ ok: true });
});
admin.delete('/channels/:id', (req, res) => { run('DELETE FROM channels WHERE id=?', Number(req.params.id)); res.json({ ok: true }); });
admin.delete('/channels', (req, res) => { run('DELETE FROM channels'); res.json({ ok: true }); });

// استيراد قائمة M3U (نص أو رابط)
function parseM3U(text) {
  const out = [];
  let cur = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')) {
      const attr = (k) => (line.match(new RegExp(`${k}="([^"]*)"`, 'i')) || [])[1] || '';
      const name = line.slice(line.lastIndexOf(',') + 1).trim() || attr('tvg-name') || 'بدون اسم';
      cur = { name, logo: attr('tvg-logo'), group: attr('group-title') || 'عام' };
    } else if (!line.startsWith('#') && cur) {
      if (validUrl(line)) out.push({ ...cur, url: line });
      cur = null;
    }
  }
  return out;
}
admin.post('/import', wrap(async (req, res) => {
  let { text = '', url = '', replace = false } = req.body || {};
  if (!text && url) {
    if (!validUrl(url)) return fail(res, 400, 'رابط غير صحيح');
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) }).catch(() => null);
    if (!r || !r.ok) return fail(res, 400, 'تعذر تحميل القائمة من الرابط');
    text = await r.text();
  }
  const items = parseM3U(String(text));
  if (!items.length) return fail(res, 400, 'لم يتم العثور على قنوات في القائمة');
  if (replace) run('DELETE FROM channels');
  const catIds = new Map(all('SELECT id,name FROM categories').map((c) => [c.name, c.id]));
  run('BEGIN');
  try {
    for (const it of items) {
      let cid = catIds.get(it.group);
      if (!cid) { cid = run('INSERT INTO categories (name,sort) VALUES (?,?)', it.group, 99).lastInsertRowid; catIds.set(it.group, cid); }
      run('INSERT INTO channels (name,logo,url,category_id) VALUES (?,?,?,?)', it.name, it.logo, it.url, cid);
    }
    run('COMMIT');
  } catch (e) { run('ROLLBACK'); throw e; }
  res.json({ ok: true, imported: items.length });
}));

// أكواد الاشتراك
function genCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from(crypto.randomBytes(4), (b) => A[b % A.length]).join('');
  return `${part()}-${part()}-${part()}`;
}
admin.get('/codes', (req, res) => {
  res.json(all(`SELECT c.code,c.days,c.created_at,c.used_at,u.username AS used_by FROM codes c LEFT JOIN users u ON u.id=c.used_by ORDER BY c.created_at DESC LIMIT 1000`));
});
admin.post('/codes', (req, res) => {
  const days = Number(req.body?.days);
  const count = Math.min(Number(req.body?.count) || 1, 200);
  if (!(days > 0)) return fail(res, 400, 'عدد الأيام مطلوب');
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = genCode();
    run('INSERT INTO codes (code,days,created_at) VALUES (?,?,?)', code, days, Date.now());
    codes.push(code);
  }
  res.json({ ok: true, codes });
});
admin.delete('/codes/:code', (req, res) => { run('DELETE FROM codes WHERE code=? AND used_by IS NULL', req.params.code); res.json({ ok: true }); });

app.use('/api/admin', admin);
app.use('/api', (req, res) => fail(res, 404, 'غير موجود'));

// ---------- الصفحات ----------
const pub = path.join(__dirname, 'public');
app.get('/tv', (req, res) => res.sendFile(path.join(pub, 'tv.html')));
app.get('/admin', (req, res) =>
  req.user && req.user.role === 'admin' ? res.sendFile(path.join(__dirname, 'views', 'admin.html')) : res.redirect('/login.html'));
app.use(express.static(pub, { extensions: ['html'] }));

app.listen(PORT, () => console.log(`✅ الموقع يعمل على: http://localhost:${PORT}`));
