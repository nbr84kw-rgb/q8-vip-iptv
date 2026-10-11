// قاعدة البيانات: SQLite المدمجة في Node.js (بدون أي مكتبات خارجية)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dir = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(path.join(dir, 'iptv.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  banned INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  days INTEGER NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_channels_cat ON channels(category_id);

CREATE TABLE IF NOT EXISTS codes (
  code TEXT PRIMARY KEY,
  days INTEGER NOT NULL,
  used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

-- ربط التلفزيون بالجوال عبر كود/QR
CREATE TABLE IF NOT EXISTS tv_pairings (
  code TEXT PRIMARY KEY,
  secret_hash TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

-- مصادر القنوات المشتركة (Shared IPTV Sources - Xtream / M3U)
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  username TEXT DEFAULT '',
  password TEXT DEFAULT '',
  is_global INTEGER NOT NULL DEFAULT 1,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  active INTEGER NOT NULL DEFAULT 1,
  live_count INTEGER DEFAULT 0,
  vod_count INTEGER DEFAULT 0,
  series_count INTEGER DEFAULT 0,
  last_sync INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- القنوات المخفية
CREATE TABLE IF NOT EXISTS hidden_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id INTEGER,
  created_at INTEGER NOT NULL
);
`);

// Migrations
try { db.exec(`ALTER TABLE users ADD COLUMN features TEXT DEFAULT '{"live":true,"movies":true,"series":true,"kids":true}'`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN max_quality TEXT DEFAULT 'auto'`); } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN max_devices INTEGER DEFAULT 1`); } catch {}
try { db.exec(`ALTER TABLE codes ADD COLUMN features TEXT DEFAULT '{"live":true,"movies":true,"series":true,"kids":true}'`); } catch {}
try { db.exec(`ALTER TABLE codes ADD COLUMN max_quality TEXT DEFAULT 'auto'`); } catch {}
try { db.exec(`ALTER TABLE codes ADD COLUMN max_devices INTEGER DEFAULT 1`); } catch {}
try { db.exec(`ALTER TABLE channels ADD COLUMN source_id INTEGER`); } catch {}
try { db.exec(`ALTER TABLE channels ADD COLUMN stream_type TEXT DEFAULT 'live'`); } catch {}

const all = (sql, ...p) => db.prepare(sql).all(...p);
const get = (sql, ...p) => db.prepare(sql).get(...p);
const run = (sql, ...p) => db.prepare(sql).run(...p);

// ---- كلمات المرور (scrypt) ----
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(pw, salt, 64);
  const orig = Buffer.from(hash, 'hex');
  return orig.length === test.length && crypto.timingSafeEqual(orig, test);
}

// ---- بيانات أولية ----
function seed() {
  // حساب المدير الأساسي
  if (!get('SELECT id FROM users WHERE username = ?', 'admin')) {
    run(
      'INSERT INTO users (username,email,password_hash,role,expires_at,created_at) VALUES (?,?,?,?,?,?)',
      'admin', 'admin@local.host', hashPassword('admin123'), 'admin', 0, Date.now()
    );
  }
  
  // حساب المدير المباشر: 65555165
  const admin65 = get('SELECT id, role FROM users WHERE username = ?', '65555165');
  if (!admin65) {
    run(
      'INSERT INTO users (username,email,password_hash,role,expires_at,created_at) VALUES (?,?,?,?,?,?)',
      '65555165', '65555165@kingvip.app', hashPassword('65555165'), 'admin', 253402300799000, Date.now()
    );
    console.log('[seed] تم ترقية وتعيين المدير: 65555165 (65555165@kingvip.app)');
  } else if (admin65.role !== 'admin') {
    run('UPDATE users SET role = "admin", expires_at = 253402300799000 WHERE id = ?', admin65.id);
    console.log('[seed] تم ترقية 65555165 إلى مدير (admin)');
  }

  // حساب المدير 888888
  if (!get('SELECT id FROM users WHERE username = ?', '888888')) {
    run(
      'INSERT INTO users (username,email,password_hash,role,expires_at,created_at) VALUES (?,?,?,?,?,?)',
      '888888', '888888@q8vip.tv', hashPassword('888888'), 'admin', 253402300799000, Date.now()
    );
  }

  // حساب المشترك النشط: 131784
  if (!get('SELECT id FROM users WHERE username = ?', '131784')) {
    run(
      'INSERT INTO users (username,email,password_hash,role,expires_at,created_at) VALUES (?,?,?,?,?,?)',
      '131784', '131784@kingvip.app', hashPassword('131784'), 'user', Date.now() + 365 * 86400000, Date.now()
    );
    console.log('[seed] تم إنشاء وتفعيل حساب المشترك: 131784 (131784@kingvip.app)');
  }

  // كود التفعيل: 131723
  if (!get('SELECT code FROM codes WHERE code = ?', '131723')) {
    run('INSERT INTO codes (code,days,created_at) VALUES (?,?,?)', '131723', 365, Date.now());
  }

  if (!get('SELECT id FROM plans LIMIT 1')) {
    run('INSERT INTO plans (name,days,price,description) VALUES (?,?,?,?)', 'شهري', 30, 25, 'وصول كامل لكل القنوات لمدة شهر');
    run('INSERT INTO plans (name,days,price,description) VALUES (?,?,?,?)', '6 أشهر', 180, 120, 'وفّر مع الباقة النصف سنوية');
    run('INSERT INTO plans (name,days,price,description) VALUES (?,?,?,?)', 'سنوي', 365, 200, 'أفضل قيمة - سنة كاملة');
  }
  if (!get('SELECT id FROM categories LIMIT 1')) {
    ['عام', 'أخبار', 'رياضة', 'أفلام', 'أطفال'].forEach((n, i) =>
      run('INSERT INTO categories (name,sort) VALUES (?,?)', n, i));
    const cat = get('SELECT id FROM categories WHERE name = ?', 'عام');
    run('INSERT INTO channels (name,url,category_id) VALUES (?,?,?)',
      'قناة تجريبية (Test Stream)', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', cat.id);
  }
}
seed();

module.exports = { db, all, get, run, hashPassword, verifyPassword };
