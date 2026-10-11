/**
 * Q8 VIP IPTV Pro - Kingly Luxury Web & Smart TV Application
 * Replicating https://kingly-media-hub.lovable.app
 */

const I18N = {
  ar: {
    appName: "Q8 VIP IPTV",
    tagline: "بوابتك الملكية للبث المباشر والأفلام والمسلسلات",
    activationCode: "كود التفعيل / رقم الاشتراك",
    codeHint: "أدخل كود الاشتراك الرقمي المكون من أرقام فقط",
    enter: "دخول",
    codeFooter: "اشتراك آمن ومحمي بأعلى معايير الجودة",
    home: "الرئيسية",
    live: "بث مباشر",
    movies: "أفلام",
    series: "مسلسلات",
    kids: "أطفال",
    favorites: "المفضلة",
    search: "البحث",
    settings: "الإعدادات",
    admin: "لوحة الإدارة",
    continueWatching: "أكمل المشاهدة",
    subscriptionActive: "اشتراك فعال",
    subscriptionExpired: "اشتراك منتهي",
    expiresAt: "ينتهي في",
    remainingDays: "الأيام المتبقية",
    channelsCount: "قناة",
    searchPlaceholder: "ابحث عن قناة أو فيلم أو مسلسل...",
    searchChannels: "ابحث عن قناة...",
    allCategories: "كل التصنيفات",
    play: "تشغيل",
    trial: "تجربة مجانية",
    vipPlan: "باقة VIP الملكية",
    logout: "تسجيل الخروج",
    version: "v4.3 VIP King Edition",
    copy: "نسخ",
    copied: "تم النسخ!",
    generateCode: "توليد كود تفعيل",
    activeSubscribers: "المشتركون النشطون",
    totalStreams: "إجمالي القنوات",
    addChannel: "إضافة قناة",
    importM3U: "استيراد ملف M3U",
    noResults: "لا توجد نتائج مطابقة",
    back: "رجوع",
    days: "يوم"
  },
  en: {
    appName: "Q8 VIP IPTV",
    tagline: "Your royal gateway to live streaming and cinema",
    activationCode: "Activation Code / Subscriber ID",
    codeHint: "Enter your numeric activation code",
    enter: "Enter",
    codeFooter: "Secure VIP subscription with high-end quality",
    home: "Home",
    live: "Live TV",
    movies: "Movies",
    series: "Series",
    kids: "Kids",
    favorites: "Favorites",
    search: "Search",
    settings: "Settings",
    admin: "Admin Panel",
    continueWatching: "Continue Watching",
    subscriptionActive: "Active VIP",
    subscriptionExpired: "Expired",
    expiresAt: "Expires at",
    remainingDays: "Days Left",
    channelsCount: "channels",
    searchPlaceholder: "Search channels, movies, series...",
    searchChannels: "Search channels...",
    allCategories: "All Categories",
    play: "Play",
    trial: "Free Trial",
    vipPlan: "VIP Royal Plan",
    logout: "Log Out",
    version: "v4.3 VIP King Edition",
    copy: "Copy",
    copied: "Copied!",
    generateCode: "Generate Code",
    activeSubscribers: "Active Subscribers",
    totalStreams: "Total Streams",
    addChannel: "Add Channel",
    importM3U: "Import M3U",
    noResults: "No results found",
    back: "Back",
    days: "days"
  }
};

let currentLang = localStorage.getItem('kingvip_lang') || 'ar';
let currentUser = null;
let categoriesList = [];
let channelsList = [];
let currentCategory = 'all';
let currentChannel = null;
let hlsPlayer = null;
let currentView = 'home';
let favorites = JSON.parse(localStorage.getItem('kingvip_favs') || '[]');
let watchHistory = JSON.parse(localStorage.getItem('kingvip_history') || '[]');

function t(key) {
  return I18N[currentLang]?.[key] || key;
}

function updateDirection() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[currentLang]?.[key]) {
      el.textContent = I18N[currentLang][key];
    }
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (I18N[currentLang]?.[key]) {
      el.setAttribute('placeholder', I18N[currentLang][key]);
    }
  });
  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.textContent = currentLang === 'ar' ? 'English' : 'العربية';
  }
}

function toggleLang() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('kingvip_lang', currentLang);
  updateDirection();
  renderSubscriptionBadge();
}

async function api(url, options = {}) {
  const token = localStorage.getItem('kingvip_token');
  const headers = {
    'Content-Type': 'application/json',
    'x-requested-with': 'iptv',
    ...(options.headers || {})
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && !url.includes('/api/auth/login')) {
    logout();
    throw new Error('Unauthorized');
  }
  return res.json();
}

function showToast(msg, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: rgba(15, 18, 25, 0.95); border: 1px solid var(--gold-primary);
      color: #fff; padding: 12px 24px; border-radius: 999px; font-weight: 700;
      font-size: 14px; z-index: 100000; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      transition: all 0.3s ease; opacity: 0; pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.borderColor = isError ? '#ef4444' : 'var(--gold-primary)';
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 3000);
}

// ---------------- Init App ----------------
window.addEventListener('DOMContentLoaded', async () => {
  updateDirection();
  setupEventListeners();

  // Hide splash after 1.5s
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 600);
    }
  }, 1500);

  // Check login state
  try {
    const me = await api('/api/me');
    if (me && me.user) {
      currentUser = me.user;
      showApp();
    } else {
      showLogin();
    }
  } catch (e) {
    showLogin();
  }
});

function showLogin() {
  document.getElementById('authContainer').style.display = 'flex';
  document.getElementById('appContainer').style.display = 'none';
  const input = document.getElementById('activationInput');
  if (input) {
    input.focus();
  }
}

function showApp() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  renderUserInfo();
  loadData();
  switchView('home');
}

function renderUserInfo() {
  if (!currentUser) return;
  const adminBtn = document.getElementById('navAdminBtn');
  if (adminBtn) {
    adminBtn.style.display = (currentUser.role === 'admin' || currentUser.username === '888888') ? 'flex' : 'none';
  }
  renderSubscriptionBadge();
}

function renderSubscriptionBadge() {
  const badge = document.getElementById('subBadge');
  if (!badge || !currentUser) return;
  const expDate = currentUser.expires_at ? new Date(currentUser.expires_at).toLocaleDateString(currentLang === 'ar' ? 'ar-KW' : 'en-US') : 'Lifetime VIP';
  const isExp = !currentUser.active;
  badge.innerHTML = `
    <div class="panel-lux flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-gold">
      <span>👑 ${currentUser.role === 'admin' ? 'Master Admin' : t('vipPlan')}</span>
      <span class="opacity-40">|</span>
      <span>${isExp ? t('subscriptionExpired') : t('expiresAt')} ${expDate}</span>
      <span class="opacity-40">|</span>
      <span>${currentUser.days_left || 365} ${t('days')}</span>
    </div>
  `;
}

// ---------------- Login / Activation ----------------
async function handleLogin(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('activationInput');
  const code = (input.value || '').trim();
  if (!code) {
    showToast(currentLang === 'ar' ? 'الرجاء إدخال كود أو رقم الاشتراك' : 'Please enter code or subscriber ID', true);
    return;
  }

  const btn = document.getElementById('loginSubmitBtn');
  const origText = btn.innerHTML;
  btn.innerHTML = `<span class="animate-spin inline-block">⏳</span> ${t('enter')}...`;
  btn.disabled = true;

  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: code, is_tv: true })
    });
    if (res.ok && res.user) {
      if (res.token) localStorage.setItem('kingvip_token', res.token);
      localStorage.setItem('kingvip.code', code);
      currentUser = res.user;
      showToast(currentLang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Welcome VIP Subscriber!');
      showApp();
    } else {
      showToast(res.error || (currentLang === 'ar' ? 'كود الاشتراك غير صالح' : 'Invalid activation code'), true);
    }
  } catch (err) {
    showToast(currentLang === 'ar' ? 'فشل التحقق من الكود' : 'Connection error', true);
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

function numPadClick(num) {
  const input = document.getElementById('activationInput');
  if (!input) return;
  if (num === 'DEL') {
    input.value = input.value.slice(0, -1);
  } else if (num === 'CLEAR') {
    input.value = '';
  } else {
    input.value += num;
  }
}

function quickFillCode(code) {
  const input = document.getElementById('activationInput');
  if (input) {
    input.value = code;
    handleLogin();
  }
}

function logout() {
  localStorage.removeItem('kingvip_token');
  currentUser = null;
  if (hlsPlayer) {
    hlsPlayer.destroy();
    hlsPlayer = null;
  }
  showLogin();
}

// ---------------- Load Channels & Categories ----------------
async function loadData() {
  try {
    const [cats, chans] = await Promise.all([
      api('/api/categories').catch(() => []),
      api('/api/channels').catch(() => [])
    ]);
    categoriesList = cats || [];
    channelsList = chans || [];
    renderCategories();
    renderChannels();
    renderContinueWatching();
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

function renderCategories() {
  const container = document.getElementById('categoryPills');
  if (!container) return;
  let html = `
    <button class="cat-pill tv-focusable ${currentCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')">
      ⭐ ${t('allCategories')} (${channelsList.length})
    </button>
  `;
  categoriesList.forEach(c => {
    html += `
      <button class="cat-pill tv-focusable ${currentCategory === String(c.id) ? 'active' : ''}" onclick="selectCategory('${c.id}')">
        ${c.name} (${c.count || 0})
      </button>
    `;
  });
  container.innerHTML = html;
}

function selectCategory(id) {
  currentCategory = id;
  renderCategories();
  renderChannels();
}

function renderChannels() {
  const container = document.getElementById('channelsGrid');
  if (!container) return;
  const searchVal = (document.getElementById('channelSearchInput')?.value || '').toLowerCase().trim();
  
  let list = channelsList;
  if (currentCategory !== 'all') {
    list = list.filter(c => String(c.category_id) === currentCategory);
  }
  if (searchVal) {
    list = list.filter(c => c.name.toLowerCase().includes(searchVal));
  }

  if (list.length === 0) {
    container.innerHTML = `<div class="col-span-full py-12 text-center text-muted">${t('noResults')}</div>`;
    return;
  }

  container.innerHTML = list.map(c => {
    const isFav = favorites.includes(c.id);
    const logo = c.logo || '/img/king-logo.png';
    return `
      <div class="media-card tv-focusable" onclick="playChannel(${c.id})" tabindex="0">
        <span class="card-badge">VIP HD</span>
        <img src="${logo}" alt="${c.name}" onerror="this.src='/img/king-logo.png'">
        <div class="card-name">${c.name}</div>
        <button class="absolute bottom-2 left-2 text-xs opacity-75 hover:opacity-100" onclick="toggleFavorite(event, ${c.id})">
          ${isFav ? '⭐' : '☆'}
        </button>
      </div>
    `;
  }).join('');
}

// ---------------- Video Player ----------------
function playChannel(id) {
  const channel = channelsList.find(c => c.id === id);
  if (!channel) return;
  currentChannel = channel;

  // Add to watch history
  watchHistory = [channel, ...watchHistory.filter(h => h.id !== channel.id)].slice(0, 10);
  localStorage.setItem('kingvip_history', JSON.stringify(watchHistory));
  renderContinueWatching();

  const playerOverlay = document.getElementById('playerOverlay');
  const video = document.getElementById('videoElement');
  const title = document.getElementById('playerChannelTitle');
  if (title) title.textContent = channel.name;

  playerOverlay.style.display = 'flex';
  
  if (Hls.isSupported()) {
    if (hlsPlayer) hlsPlayer.destroy();
    hlsPlayer = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsPlayer.loadSource(channel.url);
    hlsPlayer.attachMedia(video);
    hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hlsPlayer.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hlsPlayer.recoverMediaError();
            break;
          default:
            hlsPlayer.destroy();
            break;
        }
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = channel.url;
    video.play();
  }
}

function closePlayer() {
  const playerOverlay = document.getElementById('playerOverlay');
  const video = document.getElementById('videoElement');
  if (video) video.pause();
  if (hlsPlayer) {
    hlsPlayer.destroy();
    hlsPlayer = null;
  }
  playerOverlay.style.display = 'none';
}

function togglePlayerFullscreen() {
  const el = document.getElementById('playerWrapper');
  if (!document.fullscreenElement) {
    el.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

function reloadCurrentStream() {
  if (currentChannel) playChannel(currentChannel.id);
}

// ---------------- Favorites ----------------
function toggleFavorite(e, id) {
  if (e) e.stopPropagation();
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    showToast(currentLang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from Favorites');
  } else {
    favorites.push(id);
    showToast(currentLang === 'ar' ? 'تمت الإضافة للمفضلة' : 'Added to Favorites');
  }
  localStorage.setItem('kingvip_favs', JSON.stringify(favorites));
  renderChannels();
  if (currentView === 'favorites') renderFavoritesView();
}

function renderFavoritesView() {
  const container = document.getElementById('favoritesGrid');
  if (!container) return;
  const favChannels = channelsList.filter(c => favorites.includes(c.id));
  if (favChannels.length === 0) {
    container.innerHTML = `<div class="col-span-full py-16 text-center text-muted">☆ ${currentLang === 'ar' ? 'لم تقم بإضافة قنوات للمفضلة بعد' : 'No favorites yet'}</div>`;
    return;
  }
  container.innerHTML = favChannels.map(c => `
    <div class="media-card tv-focusable" onclick="playChannel(${c.id})">
      <span class="card-badge">VIP HD</span>
      <img src="${c.logo || '/img/king-logo.png'}" alt="${c.name}" onerror="this.src='/img/king-logo.png'">
      <div class="card-name">${c.name}</div>
    </div>
  `).join('');
}

// ---------------- Continue Watching ----------------
function renderContinueWatching() {
  const container = document.getElementById('continueWatchingGrid');
  const section = document.getElementById('continueWatchingSection');
  if (!container || !section) return;

  if (watchHistory.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  container.innerHTML = watchHistory.slice(0, 6).map(c => `
    <div class="media-card tv-focusable" onclick="playChannel(${c.id})">
      <span class="card-badge">▶</span>
      <img src="${c.logo || '/img/king-logo.png'}" alt="${c.name}" onerror="this.src='/img/king-logo.png'">
      <div class="card-name">${c.name}</div>
    </div>
  `).join('');
}

// ---------------- Navigation / View Switching ----------------
function switchView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.view-page').forEach(v => v.style.display = 'none');
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.style.display = 'block';
  }

  // Active state on nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
  });

  if (viewName === 'favorites') renderFavoritesView();
  if (viewName === 'settings') renderSettingsView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderSettingsView() {
  const userBox = document.getElementById('settingsUserBox');
  if (!userBox || !currentUser) return;
  const expDate = currentUser.expires_at ? new Date(currentUser.expires_at).toLocaleDateString(currentLang === 'ar' ? 'ar-KW' : 'en-US') : 'Lifetime VIP';
  userBox.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-center py-2 border-b border-border/40">
        <span class="text-muted">${t('activationCode')}</span>
        <span class="font-bold text-gold font-mono">${currentUser.username}</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-border/40">
        <span class="text-muted">الحالة (Status)</span>
        <span class="font-bold text-emerald-400">🟢 ${t('subscriptionActive')}</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-border/40">
        <span class="text-muted">${t('expiresAt')}</span>
        <span class="font-bold">${expDate}</span>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-border/40">
        <span class="text-muted">${t('remainingDays')}</span>
        <span class="font-bold text-gold">${currentUser.days_left || 365} ${t('days')}</span>
      </div>
      <div class="flex justify-between items-center py-2">
        <span class="text-muted">إصدار التطبيق (Version)</span>
        <span class="font-bold text-gold font-mono">${t('version')}</span>
      </div>
    </div>
  `;
}

// ---------------- Admin Panel ----------------
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.add('active');
    loadAdminStats();
    loadAdminCodes();
    loadAdminUsers();
  }
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('active');
}

async function loadAdminStats() {
  try {
    const stats = await api('/api/admin/stats');
    document.getElementById('statActiveUsers').textContent = stats.active || 0;
    document.getElementById('statTotalUsers').textContent = stats.users || 0;
    document.getElementById('statChannels').textContent = stats.channels || 0;
    document.getElementById('statFreeCodes').textContent = stats.freeCodes || 0;
  } catch (e) {}
}

async function loadAdminCodes() {
  const listEl = document.getElementById('adminCodesList');
  if (!listEl) return;
  try {
    const codes = await api('/api/admin/codes');
    listEl.innerHTML = codes.slice(0, 50).map(c => `
      <div class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/40">
        <div>
          <span class="font-mono font-bold text-gold">${c.code}</span>
          <span class="text-xs text-muted ms-2">${c.days} يوم</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs px-2 py-0.5 rounded ${c.used_by ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}">
            ${c.used_by ? 'مستخدم (' + c.used_by + ')' : 'جاهز للتفعيل'}
          </span>
          <button class="btn-ghost-gold text-xs py-1 px-2" onclick="navigator.clipboard.writeText('${c.code}'); showToast(t('copied'))">
            ${t('copy')}
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

async function loadAdminUsers() {
  const listEl = document.getElementById('adminUsersList');
  if (!listEl) return;
  try {
    const users = await api('/api/admin/users');
    listEl.innerHTML = users.slice(0, 50).map(u => {
      const exp = u.role === 'admin' ? 'دائم' : new Date(u.expires_at).toLocaleDateString('ar-KW');
      return `
        <div class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/40">
          <div>
            <span class="font-mono font-bold">${u.username}</span>
            <span class="text-xs text-muted ms-2">${u.role === 'admin' ? 'مدير' : 'مشترك'} · ينتهي: ${exp}</span>
          </div>
          <div class="flex items-center gap-1">
            <button class="btn-ghost-gold text-xs py-1 px-2" onclick="extendUser(${u.id}, 30)">+30 يوم</button>
            <button class="btn-ghost-gold text-xs py-1 px-2" onclick="extendUser(${u.id}, 365)">+سنة</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {}
}

async function generateNewCode(days) {
  try {
    const res = await api('/api/admin/codes', {
      method: 'POST',
      body: JSON.stringify({ days: Number(days), count: 1 })
    });
    if (res.ok && res.codes && res.codes[0]) {
      showToast(`${currentLang === 'ar' ? 'تم إنشاء الكود:' : 'Generated code:'} ${res.codes[0]}`);
      navigator.clipboard.writeText(res.codes[0]).catch(() => {});
      loadAdminCodes();
      loadAdminStats();
    }
  } catch (e) {
    showToast('Failed to generate code', true);
  }
}

async function createNumericSubscriber(days) {
  try {
    const res = await api('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ days: Number(days) })
    });
    if (res.ok) {
      showToast(`${currentLang === 'ar' ? 'تم إنشاء المشترك الرقمي:' : 'Subscriber created:'} ${res.username}`);
      navigator.clipboard.writeText(res.username).catch(() => {});
      loadAdminUsers();
      loadAdminStats();
    }
  } catch (e) {
    showToast('Failed to create subscriber', true);
  }
}

async function extendUser(id, days) {
  try {
    await api(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ add_days: days })
    });
    showToast(`تم تمديد الحساب +${days} يوم`);
    loadAdminUsers();
  } catch (e) {}
}

// ---------------- Smart TV D-Pad Remote Navigation ----------------
let focusedElement = null;

function setupEventListeners() {
  // Global TV remote keys listener
  window.addEventListener('keydown', (e) => {
    const focusable = Array.from(document.querySelectorAll('.tv-focusable:not([disabled])')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });

    if (focusable.length === 0) return;

    if (!focusedElement || !focusable.includes(focusedElement)) {
      focusedElement = focusable[0];
      focusedElement.focus();
      focusedElement.classList.add('tv-focused');
    }

    const currentIndex = focusable.indexOf(focusedElement);

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        nextIndex = currentLang === 'ar' ? Math.max(0, currentIndex - 1) : Math.min(focusable.length - 1, currentIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        nextIndex = currentLang === 'ar' ? Math.min(focusable.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);
      } else if (e.key === 'ArrowDown') {
        nextIndex = Math.min(focusable.length - 1, currentIndex + 4);
      } else if (e.key === 'ArrowUp') {
        nextIndex = Math.max(0, currentIndex - 4);
      }

      if (focusable[nextIndex]) {
        if (focusedElement) focusedElement.classList.remove('tv-focused');
        focusedElement = focusable[nextIndex];
        focusedElement.focus();
        focusedElement.classList.add('tv-focused');
        focusedElement.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      }
    } else if (e.key === 'Enter') {
      if (focusedElement && focusedElement.tagName !== 'INPUT') {
        focusedElement.click();
      }
    } else if (e.key === 'Backspace' || e.key === 'Escape') {
      const playerOverlay = document.getElementById('playerOverlay');
      if (playerOverlay && playerOverlay.style.display === 'flex') {
        e.preventDefault();
        closePlayer();
      } else if (document.getElementById('adminModal')?.classList.contains('active')) {
        e.preventDefault();
        closeAdminModal();
      } else if (currentView !== 'home') {
        e.preventDefault();
        switchView('home');
      }
    }
  });

  // Search inputs
  document.getElementById('channelSearchInput')?.addEventListener('input', () => {
    renderChannels();
  });
}
