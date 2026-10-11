// أدوات مشتركة بين كل الصفحات
const API_BASE = window.API_BASE || '';

async function api(url, method = 'GET', body) {
  const fullUrl = url.startsWith('http') ? url : (API_BASE + url);
  const token = localStorage.getItem('iptv_token');
  const headers = { 'X-Requested-With': 'iptv' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const opts = { method, headers, credentials: 'same-origin' };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const r = await fetch(fullUrl, opts);
  let data = {};
  try { data = await r.json(); } catch {}
  if (!r.ok) { const e = new Error(data.error || 'حدث خطأ'); e.status = r.status; throw e; }
  return data;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastTimer;
function toast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = type;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
const daysLeft = (ms) => Math.max(0, Math.ceil((ms - Date.now()) / 86400000));

// شريط التنقل
async function initNav(active) {
  const [cfg, me] = await Promise.all([api('/api/config'), api('/api/me')]);
  document.title = document.title.replace('{site}', cfg.siteName);
  const u = me.user;
  const link = (href, text, key) => `<a href="${href}" class="${active === key ? 'active' : ''}">${text}</a>`;
  const nav = document.createElement('header');
  nav.className = 'nav';
  nav.innerHTML = `<div class="container">
    <a href="/" class="logo">📺 ${esc(cfg.siteName)}</a>
    <nav class="nav-links">
      ${link('/', 'الرئيسية', 'home')}
      ${u ? link('/watch.html', 'المشاهدة', 'watch') + link('/account.html', 'حسابي', 'account') : ''}
      ${u && u.role === 'admin' ? link('/admin', 'لوحة التحكم', 'admin') : ''}
      ${u ? '<button id="logoutBtn">خروج</button>' : link('/login.html', 'دخول / تسجيل', 'login')}
    </nav></div>`;
  document.body.prepend(nav);
  const lb = document.getElementById('logoutBtn');
  if (lb) lb.onclick = async () => { await api('/api/auth/logout', 'POST'); location.href = '/'; };
  return { cfg, user: u };
}
