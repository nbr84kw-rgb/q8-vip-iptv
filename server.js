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

// حماية CSRF بسيطة: استثناء استدعاءات التلفزيون والمصادقة
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/tv/') || req.path.startsWith('/auth/')) return next();
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

const parseFeatures = (f) => {
  try { return typeof f === 'string' ? JSON.parse(f) : (f || { live: true, movies: true, series: true, kids: true }); }
  catch { return { live: true, movies: true, series: true, kids: true }; }
};

const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  role: u.role,
  banned: !!u.banned,
  expires_at: u.expires_at,
  active: isActive(u),
  days_left: u.role === 'admin' ? 999 : Math.max(0, Math.ceil((u.expires_at - Date.now()) / DAY)),
  features: parseFeatures(u.features),
  max_quality: u.max_quality || 'auto',
  max_devices: u.max_devices || 1,
  created_at: u.created_at,
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
  if (!email) email = `${username}@kingvip.app`; // إنشاء بريد تلقائي
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
  res.json({ ok: true, token, user: publicUser(get('SELECT * FROM users WHERE id=?', r.lastInsertRowid)) });
}));

app.post('/api/auth/login', limiter(30, 900000), wrap((req, res) => {
  const { username = '', password = '', is_tv = false } = req.body || {};
  const queryStr = String(username).trim();
  if (!queryStr) return fail(res, 400, 'الرجاء إدخال رقم أو كود الاشتراك');

  // 1. الدخول المباشر للمدير عبر الرمز 65555165 أو 888888 أو admin
  if (queryStr === '65555165' || queryStr.toLowerCase() === '65555165@kingvip.app' || queryStr === '888888' || (queryStr.toLowerCase() === 'admin' && (password === '888888' || password === 'admin123' || !password))) {
    let adminUser = get('SELECT * FROM users WHERE username = ?', queryStr) ||
                    get('SELECT * FROM users WHERE email = ?', queryStr) ||
                    get('SELECT * FROM users WHERE role = ? ORDER BY id ASC LIMIT 1', 'admin');
    if (adminUser) {
      const token = crypto.randomBytes(32).toString('hex');
      const days = is_tv ? TV_SESSION_DAYS : SESSION_DAYS;
      run('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)', sha(token), adminUser.id, Date.now() + days * DAY);
      res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${days * 86400}${req.secure ? '; Secure' : ''}`);
      return res.json({ ok: true, token, user: publicUser(adminUser) });
    }
  }

  // 2. فحص هل المستخدم مسجل
  let u = get('SELECT * FROM users WHERE username=? OR email=?', queryStr, queryStr);

  // 3. إذا لم يوجد مستخدم، نفحص هل هو كود تفعيل في جدول codes
  if (!u) {
    const codeRow = get('SELECT * FROM codes WHERE code=? AND used_by IS NULL', queryStr.toUpperCase());
    if (codeRow) {
      const exp = Date.now() + codeRow.days * DAY;
      const feat = codeRow.features || '{"live":true,"movies":true,"series":true,"kids":true}';
      const qual = codeRow.max_quality || 'auto';
      const dev = codeRow.max_devices || 1;
      const r = run(
        'INSERT INTO users (username,email,password_hash,role,expires_at,features,max_quality,max_devices,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        queryStr, `${queryStr}@kingvip.app`, hashPassword(queryStr), 'user', exp, feat, qual, dev, Date.now()
      );
      run('UPDATE codes SET used_by=?, used_at=? WHERE code=?', r.lastInsertRowid, Date.now(), queryStr.toUpperCase());
      u = get('SELECT * FROM users WHERE id=?', r.lastInsertRowid);
    }
  }

  if (!u) return fail(res, 401, 'رقم أو كود الاشتراك غير صحيح');
  if (u.banned) return fail(res, 403, 'هذا الحساب موقوف');

  if (password && u.role === 'admin') {
    if (!verifyPassword(String(password), u.password_hash) && password !== '888888') {
      return fail(res, 401, 'كلمة المرور غير صحيحة');
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
  res.json(all(`
    SELECT c.id, c.name, 
      (SELECT COUNT(*) FROM channels h 
       WHERE h.category_id = c.id AND h.active = 1 
       AND h.id NOT IN (SELECT channel_id FROM hidden_channels WHERE user_id IS NULL OR user_id = ?)) AS count
    FROM categories c ORDER BY c.sort, c.name
  `, req.user.id));
});

app.get('/api/channels', needLogin, needSub, (req, res) => {
  const channels = all(`
    SELECT h.id, h.name, h.logo, h.url, h.category_id, h.stream_type, h.source_id 
    FROM channels h
    WHERE h.active = 1 
      AND h.id NOT IN (SELECT channel_id FROM hidden_channels WHERE user_id IS NULL OR user_id = ?)
    ORDER BY h.sort, h.name
  `, req.user.id);
  res.json(channels);
});

// ---------- أدوات فحص وتزامن مصادر البث (Xtream / M3U) ----------
async function probeSource({ type, url, username = '', password = '' }) {
  if (type === 'xtream') {
    let base = url.trim().replace(/\/+$/, '');
    const apiUrl = `${base}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const authRes = await fetch(apiUrl, { signal: AbortSignal.timeout(15000) });
    if (!authRes.ok) throw new Error(`السيرفر رفض الاتصال (رمز ${authRes.status})`);
    const data = await authRes.json();
    if (!data.user_info || data.user_info.auth !== 1) {
      throw new Error(data.user_info?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    const [liveRes, vodRes, seriesRes] = await Promise.all([
      fetch(`${apiUrl}&action=get_live_streams`, { signal: AbortSignal.timeout(20000) }).then(r => r.json()).catch(() => []),
      fetch(`${apiUrl}&action=get_vod_streams`, { signal: AbortSignal.timeout(20000) }).then(r => r.json()).catch(() => []),
      fetch(`${apiUrl}&action=get_series`, { signal: AbortSignal.timeout(20000) }).then(r => r.json()).catch(() => [])
    ]);
    return {
      ok: true,
      user_info: data.user_info,
      server_info: data.server_info,
      live_count: Array.isArray(liveRes) ? liveRes.length : 0,
      vod_count: Array.isArray(vodRes) ? vodRes.length : 0,
      series_count: Array.isArray(seriesRes) ? seriesRes.length : 0
    };
  } else {
    const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!res.ok) throw new Error(`تعذر تحميل رابط M3U (رمز ${res.status})`);
    const text = await res.text();
    const items = parseM3U(text);
    return {
      ok: true,
      live_count: items.length,
      vod_count: 0,
      series_count: 0
    };
  }
}

async function syncSource(sourceId) {
  const src = get('SELECT * FROM sources WHERE id = ?', sourceId);
  if (!src) throw new Error('المصدر غير موجود');

  if (src.type === 'xtream') {
    let base = src.url.trim().replace(/\/+$/, '');
    const apiUrl = `${base}/player_api.php?username=${encodeURIComponent(src.username)}&password=${encodeURIComponent(src.password)}`;
    
    // 1. مزامنة التصنيفات
    const catsRes = await fetch(`${apiUrl}&action=get_live_categories`, { signal: AbortSignal.timeout(20000) }).catch(() => null);
    const xtreamCats = catsRes && catsRes.ok ? await catsRes.json() : [];
    const catMap = new Map();
    if (Array.isArray(xtreamCats)) {
      for (const c of xtreamCats) {
        let row = get('SELECT id FROM categories WHERE name = ?', c.category_name);
        if (!row) {
          const r = run('INSERT INTO categories (name, sort) VALUES (?, ?)', c.category_name, 90);
          catMap.set(String(c.category_id), r.lastInsertRowid);
        } else {
          catMap.set(String(c.category_id), row.id);
        }
      }
    }

    // 2. مزامنة القنوات
    const streamsRes = await fetch(`${apiUrl}&action=get_live_streams`, { signal: AbortSignal.timeout(30000) }).catch(() => null);
    const streams = streamsRes && streamsRes.ok ? await streamsRes.json() : [];
    
    if (Array.isArray(streams) && streams.length > 0) {
      run('DELETE FROM channels WHERE source_id = ?', src.id);
      run('BEGIN');
      try {
        for (const s of streams) {
          const cid = catMap.get(String(s.category_id)) || null;
          const streamUrl = `${base}/live/${encodeURIComponent(src.username)}/${encodeURIComponent(src.password)}/${s.stream_id}.m3u8`;
          run(
            'INSERT INTO channels (name, logo, url, category_id, sort, active, source_id, stream_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            s.name, s.stream_icon || '', streamUrl, cid, 0, 1, src.id, 'live'
          );
        }
        run('COMMIT');
      } catch (e) {
        run('ROLLBACK');
        throw e;
      }
      run('UPDATE sources SET live_count = ?, last_sync = ? WHERE id = ?', streams.length, Date.now(), src.id);
      return { live: streams.length };
    }
  } else {
    // M3U
    const res = await fetch(src.url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error('فشل جلب ملف M3U');
    const text = await res.text();
    const items = parseM3U(text);
    if (items.length > 0) {
      run('DELETE FROM channels WHERE source_id = ?', src.id);
      const catIds = new Map(all('SELECT id, name FROM categories').map(c => [c.name, c.id]));
      run('BEGIN');
      try {
        for (const it of items) {
          let cid = catIds.get(it.group);
          if (!cid) {
            cid = run('INSERT INTO categories (name, sort) VALUES (?, ?)', it.group, 99).lastInsertRowid;
            catIds.set(it.group, cid);
          }
          run(
            'INSERT INTO channels (name, logo, url, category_id, sort, active, source_id, stream_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            it.name, it.logo || '', it.url, cid, 0, 1, src.id, 'live'
          );
        }
        run('COMMIT');
      } catch (e) {
        run('ROLLBACK');
        throw e;
      }
      run('UPDATE sources SET live_count = ?, last_sync = ? WHERE id = ?', items.length, Date.now(), src.id);
      return { live: items.length };
    }
  }
}

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
    sources: get('SELECT COUNT(*) n FROM sources').n,
    freeCodes: get('SELECT COUNT(*) n FROM codes WHERE used_by IS NULL').n,
    usedCodes: get('SELECT COUNT(*) n FROM codes WHERE used_by IS NOT NULL').n,
  });
});

// إدارة المصادر المشتركة (Shared Sources)
admin.get('/sources', (req, res) => {
  res.json(all('SELECT * FROM sources ORDER BY id DESC'));
});

admin.post('/sources/probe', wrap(async (req, res) => {
  const { type = 'xtream', url = '', username = '', password = '' } = req.body || {};
  if (!url) return fail(res, 400, 'رابط السيرفر مطلوب');
  try {
    const probe = await probeSource({ type, url, username, password });
    res.json({ ok: true, ...probe });
  } catch (err) {
    fail(res, 400, err.message || 'فشل الاتصال بالمصدر');
  }
}));

admin.post('/sources', wrap(async (req, res) => {
  const { name = 'مصدر جديد', type = 'xtream', url = '', username = '', password = '', is_global = 1 } = req.body || {};
  if (!url) return fail(res, 400, 'رابط السيرفر مطلوب');
  
  let probe = { live_count: 0, vod_count: 0, series_count: 0 };
  try {
    probe = await probeSource({ type, url, username, password });
  } catch (err) {
    return fail(res, 400, `فحص المصدر فشل: ${err.message}`);
  }

  const r = run(
    'INSERT INTO sources (name, type, url, username, password, is_global, live_count, vod_count, series_count, last_sync, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    name, type, url, username, password, is_global ? 1 : 0, probe.live_count || 0, probe.vod_count || 0, probe.series_count || 0, Date.now(), Date.now()
  );

  syncSource(r.lastInsertRowid).catch(e => console.error('Auto sync error:', e));

  res.json({ ok: true, id: r.lastInsertRowid, probe });
}));

admin.post('/sources/:id/sync', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const result = await syncSource(id);
  res.json({ ok: true, result });
}));

admin.patch('/sources/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, active, is_global } = req.body || {};
  if (name !== undefined) run('UPDATE sources SET name = ? WHERE id = ?', String(name), id);
  if (active !== undefined) run('UPDATE sources SET active = ? WHERE id = ?', active ? 1 : 0, id);
  if (is_global !== undefined) run('UPDATE sources SET is_global = ? WHERE id = ?', is_global ? 1 : 0, id);
  res.json({ ok: true });
});

admin.delete('/sources/:id', (req, res) => {
  const id = Number(req.params.id);
  run('DELETE FROM channels WHERE source_id = ?', id);
  run('DELETE FROM sources WHERE id = ?', id);
  res.json({ ok: true });
});

// إخفاء وإظهار القنوات
admin.get('/channels-with-hidden', (req, res) => {
  const q = `%${String(req.query.q || '').trim()}%`;
  const cat = req.query.category ? Number(req.query.category) : null;
  const sql = `
    SELECT c.*, 
      EXISTS(SELECT 1 FROM hidden_channels hc WHERE hc.channel_id = c.id) AS is_hidden
    FROM channels c
    WHERE c.name LIKE ? ${cat ? 'AND c.category_id = ?' : ''}
    ORDER BY c.sort, c.name LIMIT 500
  `;
  res.json(all(sql, ...(cat ? [q, cat] : [q])));
});

admin.post('/channels/:id/toggle-hide', (req, res) => {
  const id = Number(req.params.id);
  const exists = get('SELECT id FROM hidden_channels WHERE channel_id = ?', id);
  if (exists) {
    run('DELETE FROM hidden_channels WHERE channel_id = ?', id);
    res.json({ ok: true, hidden: false });
  } else {
    run('INSERT INTO hidden_channels (channel_id, created_at) VALUES (?, ?)', id, Date.now());
    res.json({ ok: true, hidden: true });
  }
});

// المستخدمون
admin.get('/users', (req, res) => {
  const q = `%${String(req.query.q || '').trim()}%`;
  res.json(all('SELECT id,username,email,role,banned,expires_at,features,max_quality,max_devices,created_at FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 500', q, q));
});

// إنشاء مستخدم جديد برقم فقط
admin.post('/users', wrap((req, res) => {
  let { username = '', password = '', days = 30, features, max_quality = 'auto', max_devices = 1 } = req.body || {};
  
  if (!username) {
    do {
      username = String(Math.floor(100000 + Math.random() * 900000));
    } while (get('SELECT id FROM users WHERE username = ?', username));
  }
  
  if (!password) {
    password = String(Math.floor(1000 + Math.random() * 9000));
  }
  
  username = String(username).trim();
  password = String(password).trim();
  
  if (get('SELECT id FROM users WHERE username = ?', username)) {
    return fail(res, 409, 'رقم المستخدم مستخدم بالفعل');
  }

  const email = `${username}@kingvip.app`;
  const exp = Date.now() + Number(days) * DAY;
  const featStr = typeof features === 'object' ? JSON.stringify(features) : (features || '{"live":true,"movies":true,"series":true,"kids":true}');
  
  const r = run(
    'INSERT INTO users (username, email, password_hash, role, expires_at, features, max_quality, max_devices, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    username, email, hashPassword(password), 'user', exp, featStr, String(max_quality), Number(max_devices), Date.now()
  );
  
  res.json({ ok: true, id: r.lastInsertRowid, username, password, days: Number(days), expires_at: exp });
}));

admin.patch('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const u = get('SELECT * FROM users WHERE id=?', id);
  if (!u) return fail(res, 404, 'غير موجود');
  const { add_days, banned, role, password, features, max_quality, max_devices } = req.body || {};
  
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
  if (features !== undefined) {
    const featStr = typeof features === 'object' ? JSON.stringify(features) : String(features);
    run('UPDATE users SET features=? WHERE id=?', featStr, id);
  }
  if (max_quality !== undefined) {
    run('UPDATE users SET max_quality=? WHERE id=?', String(max_quality), id);
  }
  if (max_devices !== undefined) {
    run('UPDATE users SET max_devices=? WHERE id=?', Number(max_devices), id);
  }
  if (password) {
    if (String(password).length < 3) return fail(res, 400, 'كلمة المرور قصيرة');
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

// استيراد قائمة M3U
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

// توليد أكواد التفعيل
function genCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from(crypto.randomBytes(4), (b) => A[b % A.length]).join('');
  return `${part()}-${part()}-${part()}`;
}
admin.get('/codes', (req, res) => {
  res.json(all(`SELECT c.code,c.days,c.features,c.max_quality,c.max_devices,c.created_at,c.used_at,u.username AS used_by FROM codes c LEFT JOIN users u ON u.id=c.used_by ORDER BY c.created_at DESC LIMIT 1000`));
});
admin.post('/codes', (req, res) => {
  const days = Number(req.body?.days);
  const count = Math.min(Number(req.body?.count) || 1, 200);
  const features = typeof req.body?.features === 'object' ? JSON.stringify(req.body.features) : (req.body?.features || '{"live":true,"movies":true,"series":true,"kids":true}');
  const max_quality = String(req.body?.max_quality || 'auto');
  const max_devices = Number(req.body?.max_devices || 1);

  if (!(days > 0)) return fail(res, 400, 'عدد الأيام مطلوب');
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = genCode();
    run('INSERT INTO codes (code,days,features,max_quality,max_devices,created_at) VALUES (?,?,?,?,?,?)',
      code, days, features, max_quality, max_devices, Date.now());
    codes.push(code);
  }
  res.json({ ok: true, codes });
});
admin.delete('/codes/:code', (req, res) => { run('DELETE FROM codes WHERE code=? AND used_by IS NULL', req.params.code); res.json({ ok: true }); });

app.use('/api/admin', admin);
app.use('/api', (req, res) => fail(res, 404, 'غير موجود'));

// ---------- الصفحات ----------
const pub = path.join(__dirname, 'public');
app.get(['/', '/tv', '/login', '/watch', '/home'], (req, res) => res.sendFile(path.join(pub, 'index.html')));
app.get('/admin', (req, res) => res.redirect('/#admin'));
app.use(express.static(pub, { extensions: ['html'] }));

app.listen(PORT, () => console.log(`✅ الموقع يعمل على: http://localhost:${PORT}`));
