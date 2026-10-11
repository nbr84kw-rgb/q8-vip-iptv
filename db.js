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
`);

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
  if (!get('SELECT id FROM users WHERE role = ?', 'admin')) {
    const user = process.env.ADMIN_USER || 'admin';
    const pass = process.env.ADMIN_PASS || 'admin123';
    run(
      'INSERT INTO users (username,email,password_hash,role,expires_at,created_at) VALUES (?,?,?,?,?,?)',
      user, `${user}@local.host`, hashPassword(pass), 'admin', 0, Date.now()
    );
    console.log(`[seed] تم إنشاء حساب المدير: ${user} / ${pass}  (غيّر كلمة المرور فوراً!)`);
  }
  if (!get('SELECT id FROM plans LIMIT 1')) {
    run('INSERT INTO plans (name,days,price,description) VALUES (?,?,?,?)', 'شهري', 30, 25, 'وصول كامل لكل القنوات لمدة شهر');
    run('INSERT INTO plans (name,days,price,description) VALUES (?,?,?,?)', '6 أشهر', 180, 120, 'وفّر مع الباقة النصف سنوية');
    run('INSERT INTO plans (name,days,price,description) VALUES (?,?,?,?)', 'سنوي', 365, 200, 'أفضل قيمة - سنة كاملة');
  }
  if (!get('SELECT id FROM categories LIMIT 1')) {
    ['عام', 'أخبار', 'رياضة', 'أفلام', 'أطفال'].forEach((n, i) =>
      run('INSERT INTO categories (name,sort) VALUES (?,?)', n, i));
    // قناة تجريبية قانونية للتأكد من عمل المشغّل (بث اختبار عام)
    const cat = get('SELECT id FROM categories WHERE name = ?', 'عام');
    run('INSERT INTO channels (name,url,category_id) VALUES (?,?,?)',
      'قناة تجريبية (Test Stream)', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', cat.id);
  }
}
seed();

module.exports = { db, all, get, run, hashPassword, verifyPassword };
