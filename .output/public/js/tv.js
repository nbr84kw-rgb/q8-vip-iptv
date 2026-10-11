// منطق وبرمجة شاشة Lion Ultra (Q8 VIP Ultra) المطابقة للصورة تماماً
let currentUser = null;
let allCategories = [];
let allChannels = [];
let selectedCategoryId = 'all';
let currentPlayingChannel = null;
let currentChannelIdx = 0;
let hlsInstance = null;
let isFullscreen = false;
let osdTimeout = null;

// عناصر الشاشة
const topExpiryDate = document.getElementById('topExpiryDate');
const channelsModal = document.getElementById('channelsModal');
const settingsModal = document.getElementById('settingsModal');
const loginModal = document.getElementById('loginModal');
const hlsVideoPlayer = document.getElementById('hlsVideoPlayer');
const tvOsdBar = document.getElementById('tvOsdBar');

// 1. بدء تشغيل الشاشة وفحص الحساب
async function initLionUltra() {
  try {
    const res = await api('/api/me');
    if (res.user) {
      currentUser = res.user;
      renderUserData();
    } else {
      showLoginModal();
    }
  } catch (err) {
    showLoginModal();
  }

  // إعطاء التركيز التلقائي لزر Live الكبير عند فتح الشاشة
  setTimeout(() => {
    const btnLive = document.getElementById('btnLive');
    if (btnLive) btnLive.focus();
  }, 200);
}

function renderUserData() {
  if (!currentUser) return;
  const expSec = currentUser.expires_at;
  const dateFormatted = (currentUser.role === 'admin')
    ? 'VIP Unlimited'
    : (expSec ? new Date(expSec).toLocaleDateString('en-GB') : 'Unlimited');

  topExpiryDate.textContent = dateFormatted;
  document.getElementById('settingsExpiresDate').textContent = dateFormatted;
  document.getElementById('settingsUsername').textContent = currentUser.username;
  document.getElementById('settingsStatus').textContent = (currentUser.role === 'admin' || currentUser.active) ? 'Active' : 'Expired';

  // إذا كان الحساب أدمين، يظهر قسم التحكم بالأدمن داخل التطبيق
  const adminSec = document.getElementById('adminMasterSection');
  if (adminSec) {
    adminSec.style.display = (currentUser.role === 'admin') ? 'block' : 'none';
  }
}

function showLoginModal() {
  loginModal.style.display = 'flex';
  const uInput = document.getElementById('loginUsername');
  const passRow = document.getElementById('adminPassRow');
  
  // إخفاء حقل الباسورد في البداية لأن الاشتراك رقم فقط
  passRow.style.display = 'none';

  uInput.oninput = () => {
    // إذا كان الرقم هو رقم الأدمن (888888 أو كلمة admin) يظهر حقل الـ PIN للأمان
    if (uInput.value === '888888' || uInput.value === 'admin') {
      passRow.style.display = 'block';
    } else {
      passRow.style.display = 'none';
    }
  };

  setTimeout(() => {
    uInput.focus();
  }, 100);
}

document.getElementById('userLoginForm').onsubmit = async (e) => {
  e.preventDefault();
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value.trim();
  try {
    const res = await api('/api/auth/login', 'POST', { username: u, password: p, is_tv: true });
    if (res.token) localStorage.setItem('iptv_token', res.token);
    currentUser = res.user;
    loginModal.style.display = 'none';
    renderUserData();
    document.getElementById('btnLive').focus();
  } catch (err) {
    alert(err.message || 'رقم الاشتراك غير صحيح');
  }
};

// ==================== ميزات الأدمن المدمجة بالتطبيق ====================
const adminControlModal = document.getElementById('adminControlModal');
document.getElementById('btnOpenAdminMaster').onclick = async () => {
  settingsModal.style.display = 'none';
  adminControlModal.style.display = 'flex';
  loadAdminUsersList();
  setTimeout(() => {
    document.getElementById('adminNewUserNum').focus();
  }, 100);
};

document.getElementById('btnCloseAdminModal').onclick = () => {
  adminControlModal.style.display = 'none';
  document.getElementById('btnSettings').focus();
};

async function loadAdminUsersList() {
  const container = document.getElementById('adminUsersListContainer');
  container.innerHTML = 'جاري التحميل...';
  try {
    const users = await api('/api/admin/users');
    container.innerHTML = users.map(u => {
      const exp = u.expires_at ? new Date(u.expires_at).toLocaleDateString('en-GB') : 'دائم';
      const isAct = u.role === 'admin' || (u.expires_at > Date.now());
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
          <span>الرقم: <b style="color:#f1c40f; font-family:monospace; font-size:1.1rem;">${esc(u.username)}</b> (${esc(u.role)})</span>
          <span>الحالة: <b style="color:${isAct ? '#2ecc71':'#e74c3c'}">${isAct ? 'نشط' : 'منتهي'}</b> (${exp})</span>
        </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = 'فشل تحميل المشتركين';
  }
}

// توليد مشترك جديد برقم فقط من التلفزيون
document.getElementById('adminQuickGenForm').onsubmit = async (e) => {
  e.preventDefault();
  const num = document.getElementById('adminNewUserNum').value.trim();
  const days = document.getElementById('adminNewDays').value.trim();
  const resEl = document.getElementById('adminGenResult');
  try {
    const r = await api('/api/admin/users', 'POST', { username: num, days });
    resEl.innerHTML = `<span style="color:#2ecc71;">✅ تم إنشاء رقم الاشتراك: <b style="font-size:1.3rem; color:#f1c40f;">${r.username}</b> (صالح لمدة ${r.days} يوم)</span>`;
    document.getElementById('adminNewUserNum').value = '';
    loadAdminUsersList();
  } catch (err) {
    resEl.innerHTML = `<span style="color:#e74c3c;">خطأ: ${err.message}</span>`;
  }
};

document.getElementById('btnAdminReloadAll').onclick = async () => {
  alert('جاري تحديث كافة القنوات وإعادة مزامنة السيرفر...');
  try {
    await initLionUltra();
    alert('تم التحديث بنجاح!');
  } catch (e) {}
};

// 2. ربط أزرار الشاشة الرئيسية (Lion Ultra Dashboard Actions)

// [Live] - فتح قائمة القنوات والبث المباشر
document.getElementById('btnLive').onclick = () => openChannelsView();

// [Sports] - فتح تصنيف الرياضة مباشرة
document.getElementById('btnSports').onclick = () => {
  openChannelsView('رياضة');
};

// [Movies & Series & Playlist]
document.getElementById('btnMovies').onclick = () => alert('Movies library coming soon!');
document.getElementById('btnSeries').onclick = () => alert('Series collection coming soon!');
document.getElementById('btnPlaylist').onclick = () => openChannelsView();

// [Settings] - فتح نافذة الحساب وتجديد الاشتراك
document.getElementById('btnSettings').onclick = () => {
  settingsModal.style.display = 'flex';
  setTimeout(() => {
    document.getElementById('renewCodeInput').focus();
  }, 100);
};

document.getElementById('btnCloseSettings').onclick = () => {
  settingsModal.style.display = 'none';
  document.getElementById('btnSettings').focus();
};

document.getElementById('renewSubscriptionForm').onsubmit = async (e) => {
  e.preventDefault();
  const code = document.getElementById('renewCodeInput').value.trim();
  try {
    const res = await api('/api/redeem', 'POST', { code });
    alert(`Subscription extended successfully (+${res.days} days)!`);
    document.getElementById('renewCodeInput').value = '';
    settingsModal.style.display = 'none';
    const me = await api('/api/me');
    currentUser = me.user;
    renderUserData();
  } catch (err) {
    alert(err.message || 'Invalid code');
  }
};

// [Reload] - إعادة تحديث بيانات السيرفر والقنوات
document.getElementById('btnReload').onclick = async () => {
  alert('Reloading playlist and channels...');
  try {
    await initLionUltra();
    alert('Channels updated successfully!');
  } catch (e) {}
};

// [EXIT] - تسجيل الخروج
document.getElementById('btnExit').onclick = async () => {
  if (confirm('Do you want to log out?')) {
    localStorage.removeItem('iptv_token');
    await api('/api/auth/logout', 'POST').catch(() => {});
    currentUser = null;
    showLoginModal();
  }
};

// 3. شاشة المشغل وعرض القنوات
async function openChannelsView(filterCatName = null) {
  channelsModal.style.display = 'grid';

  try {
    const [cats, chs] = await Promise.all([
      api('/api/categories'),
      api('/api/channels')
    ]);
    allCategories = cats;
    allChannels = chs;

    if (filterCatName) {
      const found = allCategories.find(c => c.name.includes(filterCatName));
      if (found) selectedCategoryId = found.id;
    } else {
      selectedCategoryId = 'all';
    }

    renderCategoriesList();
    renderChannelsList();

    if (allChannels.length > 0 && !currentPlayingChannel) {
      playChannelItem(allChannels[0], 0);
    }

    setTimeout(() => {
      const firstCh = document.querySelector('.ch-item-btn');
      if (firstCh) firstCh.focus();
    }, 200);

  } catch (err) {
    if (err.status === 402) {
      alert('Subscription expired! Please renew.');
      channelsModal.style.display = 'none';
      document.getElementById('btnSettings').click();
    } else {
      alert('Failed to load channels');
    }
  }
}

document.getElementById('btnCloseLiveView').onclick = () => {
  channelsModal.style.display = 'none';
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  document.getElementById('btnLive').focus();
};

function renderCategoriesList() {
  const container = document.getElementById('tvCatScroll');
  container.innerHTML = `
    <button class="ch-cat-btn focusable ${selectedCategoryId === 'all' ? 'active' : ''}" data-id="all">
      <span>ALL CHANNELS</span>
      <span style="opacity:0.6;font-size:0.9rem">${allChannels.length}</span>
    </button>
  ` + allCategories.map(c => `
    <button class="ch-cat-btn focusable ${selectedCategoryId == c.id ? 'active' : ''}" data-id="${c.id}">
      <span>${esc(c.name)}</span>
      <span style="opacity:0.6;font-size:0.9rem">${c.count}</span>
    </button>
  `).join('');

  container.querySelectorAll('.ch-cat-btn').forEach(btn => {
    btn.onclick = () => {
      selectedCategoryId = btn.dataset.id;
      renderCategoriesList();
      renderChannelsList();
      const first = document.querySelector('.ch-item-btn');
      if (first) first.focus();
    };
  });
}

function renderChannelsList() {
  const filtered = allChannels.filter(c => selectedCategoryId === 'all' || c.category_id == selectedCategoryId);
  document.getElementById('tvChannelHeading').textContent = `CHANNELS (${filtered.length})`;

  const container = document.getElementById('tvChScroll');
  container.innerHTML = filtered.map((ch, idx) => `
    <div class="ch-item-btn focusable ${currentPlayingChannel?.id === ch.id ? 'active' : ''}" tabindex="0" data-idx="${idx}" data-id="${ch.id}">
      ${ch.logo ? `<img class="ch-item-logo" src="${esc(ch.logo)}" onerror="this.outerHTML='<div class=ch-item-logo>📺</div>'">` : `<div class="ch-item-logo">📺</div>`}
      <div style="font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${esc(ch.name)}</div>
    </div>
  `).join('');

  container.querySelectorAll('.ch-item-btn').forEach(card => {
    card.onclick = () => {
      const idx = parseInt(card.dataset.idx);
      playChannelItem(filtered[idx], idx);
    };
  });
}

function playChannelItem(ch, index) {
  if (!ch) return;
  currentPlayingChannel = ch;
  currentChannelIdx = index;

  document.getElementById('osdTitleText').textContent = ch.name;
  const cat = allCategories.find(c => c.id == ch.category_id);
  document.getElementById('osdCategoryText').textContent = `${cat ? cat.name : 'Live'} • Playing`;
  showChannelOsd();

  document.querySelectorAll('.ch-item-btn').forEach(c => {
    c.classList.toggle('active', c.dataset.id == ch.id);
  });

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  const isHls = /\.m3u8(\?|$)/i.test(ch.url) || !/\.(mp4|webm)(\?|$)/i.test(ch.url);
  if (isHls && window.Hls && Hls.isSupported()) {
    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
    hlsInstance.loadSource(ch.url);
    hlsInstance.attachMedia(hlsVideoPlayer);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      hlsVideoPlayer.play().catch(() => {});
    });
  } else {
    hlsVideoPlayer.src = ch.url;
    hlsVideoPlayer.play().catch(() => {});
  }
}

function showChannelOsd() {
  tvOsdBar.classList.remove('hidden-osd');
  clearTimeout(osdTimeout);
  osdTimeout = setTimeout(() => {
    tvOsdBar.classList.add('hidden-osd');
  }, 4000);
}

function toggleChannelsFullscreen(enable) {
  isFullscreen = enable !== undefined ? enable : !isFullscreen;
  if (isFullscreen) {
    channelsModal.classList.add('fullscreen-mode');
    showChannelOsd();
  } else {
    channelsModal.classList.remove('fullscreen-mode');
    const cur = document.querySelector('.ch-item-btn.active') || document.querySelector('.ch-item-btn');
    if (cur) cur.focus();
  }
}

// 4. التحكم الكامل بالريموت كنترول (D-Pad Keyboard Navigation)
window.addEventListener('keydown', (e) => {
  const code = e.keyCode || e.which;

  // زر العودة (BACK / Escape)
  if (code === 4 || code === 27 || code === 10009 || code === 461) {
    if (settingsModal.style.display !== 'none') {
      settingsModal.style.display = 'none';
      document.getElementById('btnSettings').focus();
      e.preventDefault();
      return;
    }
    if (channelsModal.style.display !== 'none') {
      if (isFullscreen) {
        toggleChannelsFullscreen(false);
      } else {
        channelsModal.style.display = 'none';
        document.getElementById('btnLive').focus();
      }
      e.preventDefault();
      return;
    }
  }

  // زر OK / Enter
  if (code === 13) {
    const active = document.activeElement;
    if (active && active.classList.contains('ch-item-btn')) {
      active.click();
      toggleChannelsFullscreen(true);
      e.preventDefault();
      return;
    }
  }

  // أثناء ملء الشاشة: الأسهم فوق وتحت لتبديل القنوات بسرعة
  if (isFullscreen) {
    const filtered = allChannels.filter(c => selectedCategoryId === 'all' || c.category_id == selectedCategoryId);
    if (code === 38) { // Up
      if (currentChannelIdx > 0) playChannelItem(filtered[currentChannelIdx - 1], currentChannelIdx - 1);
      e.preventDefault();
      return;
    } else if (code === 40) { // Down
      if (currentChannelIdx < filtered.length - 1) playChannelItem(filtered[currentChannelIdx + 1], currentChannelIdx + 1);
      e.preventDefault();
      return;
    }
  }
});

// بدء التشغيل
initLionUltra();
