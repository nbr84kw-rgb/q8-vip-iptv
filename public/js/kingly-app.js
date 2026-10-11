/**
 * Q8 VIP IPTV 2.0 — نسخة التلفزيون الاحترافية
 * Smart TV 3-Zone Engine, Remote D-Pad Navigation & Unified UI
 */

const I18N = {
  ar: {
    appName: "Q8 VIP IPTV",
    version: "v2.0.0 Pro TV Edition",
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
    searchPlaceholder: "ابحث عن قناة...",
    searchChannels: "ابحث عن قناة...",
    allCategories: "كل التصنيفات",
    play: "تشغيل",
    trial: "تجربة مجانية",
    vipPlan: "باقة VIP الملكية",
    logout: "تسجيل الخروج",
    copy: "نسخ",
    copied: "تم النسخ!",
    quality: "الجودة",
    autoQuality: "تلقائي",
    fullscreen: "ملء الشاشة",
    reload: "إعادة تحميل",
    nowPlaying: "قيد التشغيل الآن",
    noResults: "لا توجد قنوات مطابقة",
    back: "رجوع",
    days: "يوم"
  },
  en: {
    appName: "Q8 VIP IPTV",
    version: "v2.0.0 Pro TV Edition",
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
    searchPlaceholder: "Search channels...",
    searchChannels: "Search channels...",
    allCategories: "All Categories",
    play: "Play",
    trial: "Free Trial",
    vipPlan: "VIP Royal Plan",
    logout: "Log Out",
    copy: "Copy",
    copied: "Copied!",
    quality: "Quality",
    autoQuality: "Auto",
    fullscreen: "Fullscreen",
    reload: "Reload",
    nowPlaying: "Now Playing",
    noResults: "No channels found",
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
let currentAdminTab = 'codes';
let isSearchInputActive = false;

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
  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) langBtn.textContent = currentLang === 'ar' ? 'English' : 'العربية';
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
      background: rgba(12, 16, 24, 0.96); border: 2px solid var(--gold-primary);
      color: #fff; padding: 12px 26px; border-radius: 999px; font-weight: 800;
      font-size: 14px; z-index: 100000; box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      transition: all 0.25s ease; opacity: 0; pointer-events: none;
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
  }, 2500);
}

// ---------------- Init App ----------------
window.addEventListener('DOMContentLoaded', async () => {
  updateDirection();
  setupSpatialRemoteEngine();

  // Hide splash after 1.5s
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 500);
    }
  }, 1400);

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
  if (input) setFocusedElement(input);
}

function showApp() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appContainer').style.display = 'flex';
  renderUserInfo();
  loadData();
  switchView('home');
}

function renderUserInfo() {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'admin' || currentUser.username === '65555165' || currentUser.username === '888888';
  
  // Admin button in rail
  const adminRailBtn = document.getElementById('railAdminBtn');
  if (adminRailBtn) adminRailBtn.style.display = isAdmin ? 'flex' : 'none';

  // Feature gate checks
  const feats = currentUser.features || { live: true, movies: true, series: true, kids: true };
  const railLive = document.getElementById('railLiveBtn');
  const railMovies = document.getElementById('railMoviesBtn');
  const railSeries = document.getElementById('railSeriesBtn');
  const railKids = document.getElementById('railKidsBtn');
  const tileLive = document.getElementById('tileLive');
  const tileMovies = document.getElementById('tileMovies');
  const tileSeries = document.getElementById('tileSeries');
  const tileKids = document.getElementById('tileKids');

  if (railLive) railLive.style.display = (feats.live !== false) ? 'flex' : 'none';
  if (tileLive) tileLive.style.display = (feats.live !== false) ? 'flex' : 'none';

  if (railMovies) railMovies.style.display = (feats.movies !== false) ? 'flex' : 'none';
  if (tileMovies) tileMovies.style.display = (feats.movies !== false) ? 'flex' : 'none';

  if (railSeries) railSeries.style.display = (feats.series !== false) ? 'flex' : 'none';
  if (tileSeries) tileSeries.style.display = (feats.series !== false) ? 'flex' : 'none';

  if (railKids) railKids.style.display = (feats.kids !== false) ? 'flex' : 'none';
  if (tileKids) tileKids.style.display = (feats.kids !== false) ? 'flex' : 'none';

  renderSubscriptionBadge();
}

function renderSubscriptionBadge() {
  const badge = document.getElementById('subBadge');
  if (!badge || !currentUser) return;
  const expDate = currentUser.expires_at ? new Date(currentUser.expires_at).toLocaleDateString(currentLang === 'ar' ? 'ar-KW' : 'en-US') : 'Lifetime VIP';
  const isExp = !currentUser.active;
  const isAdmin = currentUser.role === 'admin' || currentUser.username === '65555165' || currentUser.username === '888888';
  badge.innerHTML = `
    <div class="panel-lux flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gold">
      <span>👑 ${isAdmin ? 'Master Admin' : t('vipPlan')}</span>
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
    renderChannelsList();
    renderContinueWatching();

    // Auto-select first channel in player preview if available
    if (channelsList.length > 0 && !currentChannel) {
      selectChannelPreview(channelsList[0], false);
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

function renderCategories() {
  const container = document.getElementById('tvCategoryList');
  if (!container) return;
  
  let html = `
    <div class="tv-cat-item tv-focusable ${currentCategory === 'all' ? 'active' : ''}" 
         data-zone="cats" onclick="selectCategory('all')" tabindex="0">
      <span>⭐ ${t('allCategories')}</span>
      <span class="text-[11px] opacity-70">${channelsList.length}</span>
    </div>
  `;
  categoriesList.forEach(c => {
    html += `
      <div class="tv-cat-item tv-focusable ${currentCategory === String(c.id) ? 'active' : ''}" 
           data-zone="cats" onclick="selectCategory('${c.id}')" tabindex="0">
        <span>${c.name}</span>
        <span class="text-[11px] opacity-70">${c.count || 0}</span>
      </div>
    `;
  });
  container.innerHTML = html;
}

function selectCategory(id) {
  currentCategory = id;
  renderCategories();
  renderChannelsList();
}

function renderChannelsList() {
  const container = document.getElementById('tvChannelsList');
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
    container.innerHTML = `<div class="p-8 text-center text-xs text-muted">${t('noResults')}</div>`;
    return;
  }

  container.innerHTML = list.map((c, idx) => {
    const isPlaying = currentChannel && currentChannel.id === c.id;
    const isFav = favorites.includes(c.id);
    const num = String(idx + 1).padStart(2, '0');
    return `
      <div class="tv-channel-item tv-focusable ${isPlaying ? 'now-playing' : ''}" 
           data-zone="channels" onclick="onChannelClick(${c.id})" tabindex="0">
        <span class="tv-channel-num">#${num}</span>
        <img src="${c.logo || '/img/king-logo.png'}" class="tv-channel-logo" alt="" onerror="this.src='/img/king-logo.png'">
        <span class="tv-channel-title">${c.name}</span>
        ${isPlaying ? '<span class="text-xs animate-pulse text-gold">▶</span>' : ''}
        <button class="text-xs p-1 text-muted hover:text-gold" onclick="toggleFavorite(event, ${c.id})">
          ${isFav ? '⭐' : '☆'}
        </button>
      </div>
    `;
  }).join('');
}

function onChannelClick(id) {
  const ch = channelsList.find(c => c.id === id);
  if (!ch) return;
  // If already playing this channel, open fullscreen!
  if (currentChannel && currentChannel.id === ch.id) {
    openFullscreenPlayer();
  } else {
    selectChannelPreview(ch, true);
  }
}

// ---------------- Video Player Preview & Fullscreen ----------------
function selectChannelPreview(channel, autoPlay = true) {
  currentChannel = channel;
  renderChannelsList();

  // Update Now Playing Info Box
  const titleEl = document.getElementById('tvPlayerTitle');
  const catEl = document.getElementById('tvPlayerCat');
  const logoEl = document.getElementById('tvPlayerLogo');
  const catName = categoriesList.find(c => c.id === channel.category_id)?.name || 'عام';

  if (titleEl) titleEl.textContent = channel.name;
  if (catEl) catEl.textContent = catName;
  if (logoEl) logoEl.src = channel.logo || '/img/king-logo.png';

  // Add to watch history
  watchHistory = [channel, ...watchHistory.filter(h => h.id !== channel.id)].slice(0, 10);
  localStorage.setItem('kingvip_history', JSON.stringify(watchHistory));
  renderContinueWatching();

  const video = document.getElementById('tvEmbeddedVideo');
  if (!video) return;

  const qualitySelect = document.getElementById('playerQualitySelect');
  if (qualitySelect) qualitySelect.innerHTML = `<option value="-1">${t('autoQuality')}</option>`;

  if (Hls.isSupported()) {
    if (hlsPlayer) hlsPlayer.destroy();
    hlsPlayer = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsPlayer.loadSource(channel.url);
    hlsPlayer.attachMedia(video);

    hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      if (autoPlay) video.play().catch(() => {});
      if (qualitySelect && data.levels && data.levels.length > 1) {
        qualitySelect.innerHTML = `<option value="-1">${t('autoQuality')}</option>`;
        data.levels.forEach((lvl, idx) => {
          qualitySelect.innerHTML += `<option value="${idx}">${lvl.height || 'HD'}p</option>`;
        });
      }
    });

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
    if (autoPlay) video.play().catch(() => {});
  }
}

function openFullscreenPlayer() {
  const wrapper = document.getElementById('tvEmbeddedVideoWrapper');
  if (wrapper) {
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }
}

function reloadCurrentStream() {
  if (currentChannel) selectChannelPreview(currentChannel, true);
}

function setPlayerQuality(lvl) {
  if (hlsPlayer) {
    hlsPlayer.currentLevel = Number(lvl);
    showToast(lvl === '-1' ? 'جودة تلقائية (Auto)' : 'تم ضبط الجودة');
  }
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
  renderChannelsList();
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
    <div class="media-card tv-focusable" data-zone="hub" onclick="selectChannelPreviewAndSwitch(${c.id})">
      <span class="card-badge">VIP HD</span>
      <img src="${c.logo || '/img/king-logo.png'}" alt="${c.name}" onerror="this.src='/img/king-logo.png'">
      <div class="card-name">${c.name}</div>
    </div>
  `).join('');
}

function selectChannelPreviewAndSwitch(id) {
  const ch = channelsList.find(c => c.id === id);
  if (ch) {
    switchView('live');
    selectChannelPreview(ch, true);
  }
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
    <div class="media-card tv-focusable" data-zone="hub" onclick="selectChannelPreviewAndSwitch(${c.id})">
      <span class="card-badge">▶</span>
      <img src="${c.logo || '/img/king-logo.png'}" alt="${c.name}" onerror="this.src='/img/king-logo.png'">
      <div class="card-name">${c.name}</div>
    </div>
  `).join('');
}

// ---------------- View Switching ----------------
function switchView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.view-page').forEach(v => v.style.display = 'none');
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.style.display = 'block';
  }

  // Active state on rail items
  document.querySelectorAll('.tv-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
  });

  if (viewName === 'favorites') renderFavoritesView();
  if (viewName === 'settings') renderSettingsView();

  // Set initial focus in newly active view
  setTimeout(() => {
    if (viewName === 'live') {
      const firstCat = document.querySelector('.tv-cat-item.active') || document.querySelector('.tv-cat-item');
      if (firstCat) setFocusedElement(firstCat);
    } else if (viewName === 'home') {
      const firstTile = document.querySelector('#view-home .tv-focusable');
      if (firstTile) setFocusedElement(firstTile);
    }
  }, 100);
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

// ---------------- Admin Panel Tabs & Handlers ----------------
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.add('active');
    switchAdminTab('codes');
    loadAdminStats();
  }
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('active');
}

function switchAdminTab(tab) {
  currentAdminTab = tab;
  document.querySelectorAll('.admin-tab-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));

  const pane = document.getElementById(`adminTabPane-${tab}`);
  if (pane) pane.style.display = 'block';

  const btn = document.getElementById(`adminTabBtn-${tab}`);
  if (btn) btn.classList.add('active');

  if (tab === 'codes') loadAdminCodes();
  if (tab === 'users') loadAdminUsers();
  if (tab === 'sources') loadAdminSources();
  if (tab === 'channels') loadAdminChannelsWithHidden();
  if (tab === 'stats') loadAdminStats();
}

async function loadAdminStats() {
  try {
    const stats = await api('/api/admin/stats');
    document.getElementById('statActiveUsers').textContent = stats.active || 0;
    document.getElementById('statTotalUsers').textContent = stats.users || 0;
    document.getElementById('statChannels').textContent = stats.channels || 0;
    document.getElementById('statSources').textContent = stats.sources || 0;
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

async function generateCustomCode() {
  const days = document.getElementById('codeDaysSelect')?.value || 30;
  const live = document.getElementById('featLiveCheck')?.checked ?? true;
  const movies = document.getElementById('featMoviesCheck')?.checked ?? true;
  const series = document.getElementById('featSeriesCheck')?.checked ?? true;
  const kids = document.getElementById('featKidsCheck')?.checked ?? true;
  const quality = document.getElementById('codeQualitySelect')?.value || 'auto';

  try {
    const res = await api('/api/admin/codes', {
      method: 'POST',
      body: JSON.stringify({
        days: Number(days),
        count: 1,
        features: { live, movies, series, kids },
        max_quality: quality
      })
    });
    if (res.ok && res.codes && res.codes[0]) {
      showToast(`تم إنشاء الكود: ${res.codes[0]}`);
      navigator.clipboard.writeText(res.codes[0]).catch(() => {});
      loadAdminCodes();
      loadAdminStats();
    }
  } catch (e) {
    showToast('Failed to generate code', true);
  }
}

async function createNumericSubscriber(days) {
  const live = document.getElementById('featLiveCheck')?.checked ?? true;
  const movies = document.getElementById('featMoviesCheck')?.checked ?? true;
  const series = document.getElementById('featSeriesCheck')?.checked ?? true;
  const kids = document.getElementById('featKidsCheck')?.checked ?? true;
  const quality = document.getElementById('codeQualitySelect')?.value || 'auto';

  try {
    const res = await api('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        days: Number(days),
        features: { live, movies, series, kids },
        max_quality: quality
      })
    });
    if (res.ok) {
      showToast(`تم إنشاء المشترك: ${res.username}`);
      navigator.clipboard.writeText(res.username).catch(() => {});
      loadAdminUsers();
      loadAdminStats();
    }
  } catch (e) {
    showToast('Failed to create subscriber', true);
  }
}

async function loadAdminUsers() {
  const listEl = document.getElementById('adminUsersList');
  if (!listEl) return;
  try {
    const users = await api('/api/admin/users');
    listEl.innerHTML = users.slice(0, 50).map(u => {
      const exp = u.role === 'admin' ? 'دائم' : new Date(u.expires_at).toLocaleDateString('ar-KW');
      const isSuspended = !!u.banned;
      return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-surface/50 border border-border/40 gap-2">
          <div>
            <span class="font-mono font-bold text-gold">${u.username}</span>
            <span class="text-xs text-muted ms-2">${u.role === 'admin' ? '👑 مدير' : 'مشترك'} · ينتهي: ${exp}</span>
            ${isSuspended ? '<span class="text-[10px] text-red-400 ms-2 font-bold">[موقوف]</span>' : ''}
          </div>
          <div class="flex flex-wrap items-center gap-1">
            <button class="btn-ghost-gold text-xs py-1 px-1.5" onclick="extendUser(${u.id}, 7)">+7 أيام</button>
            <button class="btn-ghost-gold text-xs py-1 px-1.5" onclick="extendUser(${u.id}, 30)">+شهر</button>
            <button class="btn-ghost-gold text-xs py-1 px-1.5" onclick="extendUser(${u.id}, 90)">+3 أشهر</button>
            <button class="btn-ghost-gold text-xs py-1 px-1.5" onclick="extendUser(${u.id}, 365)">+سنة</button>
            <button class="btn-ghost-gold text-xs py-1 px-2 ${isSuspended ? 'text-emerald-400' : 'text-amber-400'}" onclick="toggleUserStatus(${u.id}, ${isSuspended ? 0 : 1})">
              ${isSuspended ? 'تفعيل' : 'إيقاف'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {}
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

async function toggleUserStatus(id, banned) {
  try {
    await api(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ banned })
    });
    showToast(banned ? 'تم إيقاف الحساب' : 'تم تفعيل الحساب');
    loadAdminUsers();
  } catch (e) {}
}

// Tab 3: Sources
async function loadAdminSources() {
  const listEl = document.getElementById('adminSourcesList');
  if (!listEl) return;
  try {
    const sources = await api('/api/admin/sources');
    if (sources.length === 0) {
      listEl.innerHTML = `<div class="p-4 text-center text-xs text-muted">لا توجد مصادر مضافة حالياً. أضف سيرفرك المشترك بالأسفل.</div>`;
      return;
    }
    listEl.innerHTML = sources.map(s => `
      <div class="p-4 rounded-xl bg-surface/60 border border-border/40 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">${s.type === 'xtream' ? '📡' : '📄'}</span>
            <span class="font-bold text-white">${s.name}</span>
            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">${s.type}</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-ghost-gold text-xs py-1 px-2.5" onclick="syncSource(${s.id})">🔄 مزامنة</button>
            <button class="btn-ghost-gold text-xs py-1 px-2 text-red-400 border-red-900/40" onclick="deleteSource(${s.id})">🗑️</button>
          </div>
        </div>
        <div class="flex items-center gap-4 text-xs text-muted">
          <span>القنوات: <b class="text-white">${s.live_count || 0}</b></span>
          <span>الأفلام: <b class="text-white">${s.vod_count || 0}</b></span>
          <span>المسلسلات: <b class="text-white">${s.series_count || 0}</b></span>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

async function probeNewSource() {
  const type = document.getElementById('sourceTypeSelect')?.value || 'xtream';
  const url = (document.getElementById('sourceUrlInput')?.value || '').trim();
  const username = (document.getElementById('sourceUserInput')?.value || '').trim();
  const password = (document.getElementById('sourcePassInput')?.value || '').trim();
  const probeStatus = document.getElementById('sourceProbeResult');

  if (!url) {
    showToast('رابط السيرفر مطلوب', true);
    return;
  }

  probeStatus.style.display = 'block';
  probeStatus.innerHTML = `<span class="text-amber-300">⏳ جاري فحص الاتصال بالسيرفر...</span>`;

  try {
    const res = await api('/api/admin/sources/probe', {
      method: 'POST',
      body: JSON.stringify({ type, url, username, password })
    });
    if (res.ok) {
      probeStatus.innerHTML = `
        <div class="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 text-xs text-emerald-300 space-y-1">
          <div class="font-bold">✅ تم الاتصال بنجاح!</div>
          <div>بث مباشر: <b>${res.live_count}</b> | أفلام: <b>${res.vod_count}</b> | مسلسلات: <b>${res.series_count}</b></div>
        </div>
      `;
    } else {
      probeStatus.innerHTML = `<div class="p-3 rounded-lg bg-red-950/60 border border-red-700 text-xs text-red-300">❌ ${res.error || 'فشل الاتصال'}</div>`;
    }
  } catch (e) {
    probeStatus.innerHTML = `<div class="p-3 rounded-lg bg-red-950/60 border border-red-700 text-xs text-red-300">❌ تعذر الاتصال بالسيرفر</div>`;
  }
}

async function saveNewSource() {
  const name = (document.getElementById('sourceNameInput')?.value || 'سيرفر VIP').trim();
  const type = document.getElementById('sourceTypeSelect')?.value || 'xtream';
  const url = (document.getElementById('sourceUrlInput')?.value || '').trim();
  const username = (document.getElementById('sourceUserInput')?.value || '').trim();
  const password = (document.getElementById('sourcePassInput')?.value || '').trim();

  if (!url) {
    showToast('رابط السيرفر مطلوب', true);
    return;
  }

  try {
    const res = await api('/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify({ name, type, url, username, password, is_global: 1 })
    });
    if (res.ok) {
      showToast('تمت إضافة المصدر وبدء مزامنة القنوات!');
      document.getElementById('sourceUrlInput').value = '';
      document.getElementById('sourceUserInput').value = '';
      document.getElementById('sourcePassInput').value = '';
      document.getElementById('sourceProbeResult').style.display = 'none';
      loadAdminSources();
      loadData();
    } else {
      showToast(res.error || 'فشل حفظ المصدر', true);
    }
  } catch (e) {
    showToast('خطأ أثناء حفظ المصدر', true);
  }
}

async function syncSource(id) {
  showToast('جاري تحديث ومزامنة القنوات...');
  try {
    const res = await api(`/api/admin/sources/${id}/sync`, { method: 'POST' });
    if (res.ok) {
      showToast('تمت المزامنة بنجاح!');
      loadAdminSources();
      loadData();
    }
  } catch (e) {
    showToast('فشل التزامن', true);
  }
}

async function deleteSource(id) {
  if (!confirm('هل تريد حذف هذا المصدر وقنواته؟')) return;
  try {
    await api(`/api/admin/sources/${id}`, { method: 'DELETE' });
    showToast('تم حذف المصدر');
    loadAdminSources();
    loadData();
  } catch (e) {}
}

// Tab 4: Channel Hiding
async function loadAdminChannelsWithHidden() {
  const listEl = document.getElementById('adminChannelsWithHiddenList');
  if (!listEl) return;
  const q = (document.getElementById('adminChannelSearchInput')?.value || '').trim();
  try {
    const channels = await api(`/api/admin/channels-with-hidden?q=${encodeURIComponent(q)}`);
    listEl.innerHTML = channels.slice(0, 100).map(c => `
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border/40">
        <div class="flex items-center gap-2">
          <img src="${c.logo || '/img/king-logo.png'}" class="h-6 w-6 object-contain" onerror="this.src='/img/king-logo.png'">
          <span class="text-xs font-bold ${c.is_hidden ? 'text-zinc-500 line-through' : 'text-white'}">${c.name}</span>
          ${c.is_hidden ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-400">مخفية</span>' : ''}
        </div>
        <button class="btn-ghost-gold text-xs py-1 px-2.5 ${c.is_hidden ? 'text-emerald-400' : 'text-zinc-400'}" onclick="toggleChannelHide(${c.id})">
          ${c.is_hidden ? '👁️ إظهار' : '🚫 إخفاء'}
        </button>
      </div>
    `).join('');
  } catch (e) {}
}

async function toggleChannelHide(channelId) {
  try {
    const res = await api(`/api/admin/channels/${channelId}/toggle-hide`, { method: 'POST' });
    if (res.ok) {
      showToast(res.hidden ? 'تم إخفاء القناة' : 'تم إظهار القناة');
      loadAdminChannelsWithHidden();
      loadData();
    }
  } catch (e) {}
}

// ---------------- Smart TV 3-Zone Spatial Remote Engine ----------------
let currentFocusedEl = null;

function setFocusedElement(el) {
  if (!el) return;
  if (currentFocusedEl) currentFocusedEl.classList.remove('tv-focused');
  currentFocusedEl = el;
  currentFocusedEl.classList.add('tv-focused');
  if (currentFocusedEl.tagName !== 'INPUT') {
    currentFocusedEl.focus();
  }
  currentFocusedEl.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}

function setupSpatialRemoteEngine() {
  window.addEventListener('keydown', (e) => {
    // If user is currently typing in an input field, let normal typing happen!
    if (document.activeElement && document.activeElement.tagName === 'INPUT' && e.key !== 'Escape' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
      return;
    }

    const isRtl = currentLang === 'ar';

    // 1. BACK / ESCAPE KEY
    if (e.key === 'Backspace' || e.key === 'Escape') {
      if (document.fullscreenElement) {
        e.preventDefault();
        document.exitFullscreen?.().catch(() => {});
        return;
      }
      if (document.getElementById('adminModal')?.classList.contains('active')) {
        e.preventDefault();
        closeAdminModal();
        return;
      }
      if (currentView !== 'home') {
        e.preventDefault();
        switchView('home');
        return;
      }
    }

    // 2. FULLSCREEN ARROW CONTROLS (Quick Channel Zapping)
    if (document.fullscreenElement) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (channelsList.length > 0 && currentChannel) {
          const curIdx = channelsList.findIndex(c => c.id === currentChannel.id);
          let nextIdx = e.key === 'ArrowDown' ? (curIdx + 1) % channelsList.length : (curIdx - 1 + channelsList.length) % channelsList.length;
          selectChannelPreview(channelsList[nextIdx], true);
          showToast(`قناة: ${channelsList[nextIdx].name}`);
        }
        return;
      }
    }

    // 3. ARROW KEYS NAVIGATION
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      handleSpatialMove(e.key, isRtl);
      return;
    }

    // 4. ENTER / OK KEY
    if (e.key === 'Enter') {
      if (currentFocusedEl) {
        if (currentFocusedEl.id === 'channelSearchButton') {
          // Explicitly activate search input
          const input = document.getElementById('channelSearchInput');
          if (input) input.focus();
        } else if (currentFocusedEl.tagName !== 'INPUT') {
          currentFocusedEl.click();
        }
      }
    }
  });

  // Search input live filtering
  document.getElementById('channelSearchInput')?.addEventListener('input', () => {
    renderChannelsList();
  });
  document.getElementById('adminChannelSearchInput')?.addEventListener('input', () => {
    loadAdminChannelsWithHidden();
  });
}

function handleSpatialMove(key, isRtl) {
  if (!currentFocusedEl) {
    const first = document.querySelector('.tv-focusable');
    if (first) setFocusedElement(first);
    return;
  }

  const currentZone = currentFocusedEl.getAttribute('data-zone') || 'hub';

  // Zone Transitions on Left/Right
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const isForward = isRtl ? (key === 'ArrowLeft') : (key === 'ArrowRight');

    if (currentView === 'live') {
      if (isForward) {
        // Nav -> Cats -> Channels -> Player
        if (currentZone === 'nav') {
          const target = document.querySelector('.tv-cat-item.active') || document.querySelector('.tv-cat-item');
          if (target) return setFocusedElement(target);
        } else if (currentZone === 'cats') {
          const target = document.querySelector('.tv-channel-item.now-playing') || document.querySelector('.tv-channel-item');
          if (target) return setFocusedElement(target);
        } else if (currentZone === 'channels') {
          const target = document.querySelector('[data-zone="player"].tv-focusable');
          if (target) return setFocusedElement(target);
        }
      } else {
        // Player -> Channels -> Cats -> Nav
        if (currentZone === 'player') {
          const target = document.querySelector('.tv-channel-item.now-playing') || document.querySelector('.tv-channel-item');
          if (target) return setFocusedElement(target);
        } else if (currentZone === 'channels') {
          const target = document.querySelector('.tv-cat-item.active') || document.querySelector('.tv-cat-item');
          if (target) return setFocusedElement(target);
        } else if (currentZone === 'cats') {
          const target = document.querySelector('.tv-nav-item.active') || document.querySelector('.tv-nav-item');
          if (target) return setFocusedElement(target);
        }
      }
    } else {
      // General view (Home / Settings): Nav <-> Content
      if (isForward && currentZone === 'nav') {
        const target = document.querySelector(`#view-${currentView} .tv-focusable`);
        if (target) return setFocusedElement(target);
      } else if (!isForward && currentZone !== 'nav') {
        const target = document.querySelector('.tv-nav-item.active') || document.querySelector('.tv-nav-item');
        if (target) return setFocusedElement(target);
      }
    }
  }

  // Vertical Navigation (Up / Down) within current zone or grid
  const zoneElements = Array.from(document.querySelectorAll(`[data-zone="${currentZone}"]:not([disabled])`))
    .filter(el => el.offsetParent !== null);

  if (zoneElements.length <= 1) return;

  const idx = zoneElements.indexOf(currentFocusedEl);
  if (idx === -1) return;

  let nextIdx = idx;
  if (key === 'ArrowDown') {
    nextIdx = (idx + 1) % zoneElements.length;
  } else if (key === 'ArrowUp') {
    nextIdx = (idx - 1 + zoneElements.length) % zoneElements.length;
  }

  if (zoneElements[nextIdx]) {
    setFocusedElement(zoneElements[nextIdx]);
  }
}
