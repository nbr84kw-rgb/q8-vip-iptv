// لوحة التحكم
const view = document.getElementById('view');
const A = (path, method, body) => api('/api/admin' + path, method, body);
const confirmDo = (msg) => confirm(msg);
let cats = [];

const tabs = {
  // ---------- الإحصائيات ----------
  async stats() {
    const s = await A('/stats');
    const box = (n, t) => `<div class="card stat"><b>${n}</b><span>${t}</span></div>`;
    view.innerHTML = `<div class="stats">
      ${box(s.users, 'إجمالي المشتركين')}${box(s.active, 'اشتراكات نشطة')}
      ${box(s.channels, 'القنوات')}${box(s.categories, 'الفئات')}
      ${box(s.freeCodes, 'أكواد متاحة')}${box(s.usedCodes, 'أكواد مستخدمة')}</div>`;
  },

  // ---------- المشتركون ----------
  async users(q = '') {
    const users = await A('/users?q=' + encodeURIComponent(q));
    view.innerHTML = `
      <!-- إنشاء حساب مشترك برقم فقط للتلفزيون -->
      <div class="card" style="margin-bottom:18px">
        <h3 style="margin-bottom:12px">🔢 إنشاء حساب مشترك جديد (أرقام فقط)</h3>
        <p style="color:var(--muted); font-size:0.9rem; margin-bottom:12px">يمكنك تحديد رقم المشترك أو تركه فارغاً ليتم توليد رقم تلقائي من 6 أرقام مع كلمة مرور رقمية لتسهيل كتابتها بالريموت:</p>
        <form id="numUserForm" class="toolbar">
          <input name="username" placeholder="رقم المشترك (اتركه فارغاً للتوليد)" dir="ltr" type="number">
          <input name="password" placeholder="كلمة المرور (أرقام فقط)" dir="ltr" type="number">
          <input name="days" placeholder="المدة (أيام)" value="30" type="number" style="max-width:110px">
          <button class="btn primary">توليد حساب أرقام</button>
        </form>
        <div id="newNumUserBox"></div>
      </div>

      <div class="card">
      <div class="toolbar"><input id="uq" placeholder="بحث بالرقم أو الاسم" value="${esc(q)}"><button class="btn" id="usearch">بحث</button></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>المستخدم (الرقم)</th><th>البريد</th><th>الحالة</th><th>ينتهي</th><th>إجراءات</th></tr></thead><tbody>
      ${users.map((u) => {
        const active = u.expires_at > Date.now();
        const st = u.banned ? '<span class="badge bad">محظور</span>' : u.role === 'admin' ? '<span class="badge warn">مدير</span>' : active ? '<span class="badge ok">نشط</span>' : '<span class="badge bad">منتهي</span>';
        return `<tr><td>${u.id}</td><td style="font-weight:bold; font-family:monospace; font-size:1.1rem;">${esc(u.username)}</td><td dir="ltr">${esc(u.email)}</td><td>${st}</td><td>${fmtDate(u.expires_at)}</td>
          <td><div class="acts">
            <button class="btn sm" data-act="days" data-id="${u.id}">+ أيام</button>
            <button class="btn sm ghost" data-act="pw" data-id="${u.id}">كلمة مرور</button>
            ${u.role !== 'admin' ? `<button class="btn sm ghost" data-act="ban" data-id="${u.id}" data-b="${u.banned ? 0 : 1}">${u.banned ? 'رفع الحظر' : 'حظر'}</button>
            <button class="btn sm danger" data-act="del" data-id="${u.id}">حذف</button>` : ''}
          </div></td></tr>`;
      }).join('')}
      </tbody></table></div></div>`;
    
    numUserForm.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const r = await A('/users', 'POST', {
          username: numUserForm.username.value,
          password: numUserForm.password.value,
          days: numUserForm.days.value
        });
        newNumUserBox.innerHTML = `
          <div style="background:rgba(46,204,113,0.15); border:1px solid #2ecc71; padding:12px; border-radius:10px; margin-top:12px; color:#fff;">
            ✅ <b>تم إنشاء الحساب بنجاح:</b><br>
            اسم المستخدم: <b style="font-size:1.2rem; color:#f1c40f;">${r.username}</b> | 
            كلمة المرور: <b style="font-size:1.2rem; color:#f1c40f;">${r.password}</b> | 
            المدة: <b>${r.days} يوم</b>
          </div>`;
        toast('تم إنشاء الحساب الرقمي بنجاح', 'ok');
        tabs.users(uq.value);
      } catch (err) { toast(err.message, 'err'); }
    };
    uq.onkeydown = (e) => e.key === 'Enter' && tabs.users(uq.value);
    usearch.onclick = () => tabs.users(uq.value);
    view.querySelector('tbody').onclick = async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const id = b.dataset.id;
      try {
        if (b.dataset.act === 'days') {
          const d = prompt('عدد الأيام للإضافة (سالب للخصم):', '30'); if (d === null) return;
          await A('/users/' + id, 'PATCH', { add_days: Number(d) });
        } else if (b.dataset.act === 'pw') {
          const p = prompt('كلمة المرور الجديدة (6 أحرف على الأقل):'); if (!p) return;
          await A('/users/' + id, 'PATCH', { password: p });
        } else if (b.dataset.act === 'ban') await A('/users/' + id, 'PATCH', { banned: b.dataset.b === '1' });
        else if (b.dataset.act === 'del') { if (!confirmDo('حذف المستخدم نهائياً؟')) return; await A('/users/' + id, 'DELETE'); }
        toast('تم', 'ok'); tabs.users(uq.value);
      } catch (err) { toast(err.message, 'err'); }
    };
  },

  // ---------- الأكواد ----------
  async codes() {
    const [codes, plans] = await Promise.all([A('/codes'), A('/plans')]);
    view.innerHTML = `<div class="card" style="margin-bottom:18px"><h3 style="margin-bottom:14px">توليد أكواد جديدة</h3>
      <form id="cf"><div class="form-grid">
        <div class="field"><label>المدة (أيام)</label><input name="days" type="number" min="1" value="30" required list="dl"></div>
        <datalist id="dl">${plans.map((p) => `<option value="${p.days}">${esc(p.name)}</option>`).join('')}</datalist>
        <div class="field"><label>العدد</label><input name="count" type="number" min="1" max="200" value="1" required></div>
      </div><button class="btn primary">توليد</button></form><div id="newCodes"></div></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>الكود</th><th>الأيام</th><th>الحالة</th><th>أنشئ</th><th></th></tr></thead><tbody>
      ${codes.map((c) => `<tr><td dir="ltr" style="font-family:monospace">${esc(c.code)}</td><td>${c.days}</td>
        <td>${c.used_by ? `<span class="badge warn">استُخدم: ${esc(c.used_by)}</span>` : '<span class="badge ok">متاح</span>'}</td>
        <td>${fmtDate(c.created_at)}</td>
        <td>${c.used_at ? '' : `<button class="btn sm danger" data-code="${esc(c.code)}">حذف</button>`}</td></tr>`).join('')}
      </tbody></table></div></div>`;
    cf.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const r = await A('/codes', 'POST', { days: cf.days.value, count: cf.count.value });
        newCodes.innerHTML = `<pre class="codes">${r.codes.join('\n')}</pre>`;
        toast('تم توليد ' + r.codes.length + ' كود', 'ok');
      } catch (err) { toast(err.message, 'err'); }
    };
    view.querySelector('tbody').onclick = async (e) => {
      const b = e.target.closest('button[data-code]'); if (!b) return;
      await A('/codes/' + b.dataset.code, 'DELETE'); tabs.codes();
    };
  },

  // ---------- القنوات ----------
  async channels(q = '', cat = '') {
    [cats] = await Promise.all([A('/categories')]);
    const list = await A(`/channels?q=${encodeURIComponent(q)}&category=${cat}`);
    const catName = (id) => (cats.find((c) => c.id === id) || {}).name || '—';
    view.innerHTML = `<div class="card" style="margin-bottom:18px"><h3 style="margin-bottom:14px" id="ftitle">إضافة قناة</h3>
      <form id="chf"><input type="hidden" name="id">
        <div class="form-grid">
          <div class="field"><label>اسم القناة</label><input name="name" required></div>
          <div class="field"><label>رابط البث (m3u8)</label><input name="url" dir="ltr" required placeholder="https://..."></div>
          <div class="field"><label>رابط الشعار</label><input name="logo" dir="ltr" placeholder="https://..."></div>
          <div class="field"><label>الفئة</label><select name="category_id"><option value="">بدون فئة</option>${cats.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
          <div class="field"><label>الترتيب</label><input name="sort" type="number" value="0"></div>
          <div class="field"><label>مفعّلة</label><select name="active"><option value="1">نعم</option><option value="0">لا</option></select></div>
        </div>
        <button class="btn primary">حفظ</button> <button type="button" class="btn ghost" id="reset">جديد</button>
      </form></div>
      <div class="card"><div class="toolbar">
        <input id="cq" placeholder="بحث..." value="${esc(q)}">
        <select id="cc"><option value="">كل الفئات</option>${cats.map((c) => `<option value="${c.id}" ${cat == c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <button class="btn" id="csearch">بحث</button>
        <button class="btn danger" id="delAll">حذف الكل</button></div>
        <div class="table-wrap"><table><thead><tr><th>القناة</th><th>الفئة</th><th>الحالة</th><th></th></tr></thead><tbody>
        ${list.map((c) => `<tr><td>${esc(c.name)}</td><td>${esc(catName(c.category_id))}</td>
          <td>${c.active ? '<span class="badge ok">مفعّلة</span>' : '<span class="badge bad">معطّلة</span>'}</td>
          <td><div class="acts"><button class="btn sm" data-edit="${c.id}">تعديل</button><button class="btn sm danger" data-del="${c.id}">حذف</button></div></td></tr>`).join('')}
        </tbody></table></div>${list.length >= 1000 ? '<p class="empty">يتم عرض أول 1000 قناة فقط، استخدم البحث.</p>' : ''}</div>`;
    const reload = () => tabs.channels(cq.value, cc.value);
    csearch.onclick = reload; cq.onkeydown = (e) => e.key === 'Enter' && reload(); cc.onchange = reload;
    reset.onclick = () => { chf.reset(); chf.id.value = ''; ftitle.textContent = 'إضافة قناة'; };
    delAll.onclick = async () => { if (confirmDo('حذف كل القنوات؟ لا يمكن التراجع.')) { await A('/channels', 'DELETE'); reload(); } };
    chf.onsubmit = async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(chf));
      const id = d.id; delete d.id;
      d.category_id = d.category_id ? Number(d.category_id) : null; d.active = d.active === '1';
      try { await A(id ? '/channels/' + id : '/channels', id ? 'PUT' : 'POST', d); toast('تم الحفظ', 'ok'); reload(); }
      catch (err) { toast(err.message, 'err'); }
    };
    view.querySelector('tbody').onclick = async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.del) { if (!confirmDo('حذف القناة؟')) return; await A('/channels/' + b.dataset.del, 'DELETE'); return reload(); }
      const c = list.find((x) => x.id == b.dataset.edit);
      for (const k of ['id', 'name', 'url', 'logo', 'sort']) chf[k].value = c[k];
      chf.category_id.value = c.category_id ?? ''; chf.active.value = c.active;
      ftitle.textContent = 'تعديل قناة'; scrollTo({ top: 0, behavior: 'smooth' });
    };
  },

  // ---------- الفئات ----------
  async categories() {
    const list = await A('/categories');
    view.innerHTML = `<div class="card" style="margin-bottom:18px"><form id="cgf" class="toolbar">
        <input name="name" placeholder="اسم الفئة" required><input name="sort" type="number" placeholder="الترتيب" value="0" style="max-width:120px">
        <button class="btn primary">إضافة</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>الفئة</th><th>الترتيب</th><th>القنوات</th><th></th></tr></thead><tbody>
      ${list.map((c) => `<tr><td>${esc(c.name)}</td><td>${c.sort}</td><td>${c.count}</td>
        <td><div class="acts"><button class="btn sm" data-edit="${c.id}">تعديل</button><button class="btn sm danger" data-del="${c.id}">حذف</button></div></td></tr>`).join('')}
      </tbody></table></div></div>`;
    cgf.onsubmit = async (e) => {
      e.preventDefault();
      try { await A('/categories', 'POST', { name: cgf.name.value, sort: cgf.sort.value }); tabs.categories(); } catch (err) { toast(err.message, 'err'); }
    };
    view.querySelector('tbody').onclick = async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      try {
        if (b.dataset.del) { if (!confirmDo('حذف الفئة؟ (القنوات تبقى بدون فئة)')) return; await A('/categories/' + b.dataset.del, 'DELETE'); }
        else {
          const c = list.find((x) => x.id == b.dataset.edit);
          const name = prompt('اسم الفئة:', c.name); if (!name) return;
          const sort = prompt('الترتيب:', c.sort); if (sort === null) return;
          await A('/categories/' + c.id, 'PUT', { name, sort });
        }
        tabs.categories();
      } catch (err) { toast(err.message, 'err'); }
    };
  },

  // ---------- الباقات ----------
  async plans() {
    const list = await A('/plans');
    view.innerHTML = `<div class="card" style="margin-bottom:18px"><h3 style="margin-bottom:14px" id="ptitle">إضافة باقة</h3>
      <form id="pf"><input type="hidden" name="id"><div class="form-grid">
        <div class="field"><label>الاسم</label><input name="name" required></div>
        <div class="field"><label>المدة (أيام)</label><input name="days" type="number" min="1" required></div>
        <div class="field"><label>السعر (ر.س)</label><input name="price" type="number" step="0.01" min="0" value="0"></div>
        <div class="field"><label>الوصف</label><input name="description"></div>
        <div class="field"><label>ظاهرة بالموقع</label><select name="active"><option value="1">نعم</option><option value="0">لا</option></select></div>
      </div><button class="btn primary">حفظ</button> <button type="button" class="btn ghost" id="preset">جديد</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>الباقة</th><th>الأيام</th><th>السعر</th><th>الحالة</th><th></th></tr></thead><tbody>
      ${list.map((p) => `<tr><td>${esc(p.name)}</td><td>${p.days}</td><td>${p.price}</td><td>${p.active ? '<span class="badge ok">ظاهرة</span>' : '<span class="badge bad">مخفية</span>'}</td>
        <td><div class="acts"><button class="btn sm" data-edit="${p.id}">تعديل</button><button class="btn sm danger" data-del="${p.id}">حذف</button></div></td></tr>`).join('')}
      </tbody></table></div></div>`;
    preset.onclick = () => { pf.reset(); pf.id.value = ''; ptitle.textContent = 'إضافة باقة'; };
    pf.onsubmit = async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(pf)); const id = d.id; delete d.id; d.active = d.active === '1';
      try { await A(id ? '/plans/' + id : '/plans', id ? 'PUT' : 'POST', d); toast('تم الحفظ', 'ok'); tabs.plans(); } catch (err) { toast(err.message, 'err'); }
    };
    view.querySelector('tbody').onclick = async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.del) { if (!confirmDo('حذف الباقة؟')) return; await A('/plans/' + b.dataset.del, 'DELETE'); return tabs.plans(); }
      const p = list.find((x) => x.id == b.dataset.edit);
      for (const k of ['id', 'name', 'days', 'price', 'description']) pf[k].value = p[k];
      pf.active.value = p.active; ptitle.textContent = 'تعديل باقة'; scrollTo({ top: 0, behavior: 'smooth' });
    };
  },

  // ---------- الاستيراد ----------
  async import() {
    view.innerHTML = `<div class="card"><h3 style="margin-bottom:6px">استيراد قائمة M3U</h3>
      <p style="color:var(--muted);margin-bottom:16px">استورد قنوات من قوائم تملك حق استخدامها. يتم إنشاء الفئات تلقائياً من <code>group-title</code>.</p>
      <form id="imf">
        <div class="field"><label>رابط القائمة (اختياري)</label><input name="url" dir="ltr" placeholder="https://example.com/list.m3u"></div>
        <div class="field"><label>أو الصق محتوى القائمة</label><textarea name="text" placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-logo=&quot;&quot; group-title=&quot;أخبار&quot;,اسم القناة&#10;https://..."></textarea></div>
        <label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" name="replace"> حذف القنوات الحالية قبل الاستيراد</label>
        <button class="btn primary">استيراد</button></form></div>`;
    imf.onsubmit = async (e) => {
      e.preventDefault();
      const btn = imf.querySelector('button'); btn.disabled = true; btn.textContent = 'جاري الاستيراد...';
      try {
        const r = await A('/import', 'POST', { url: imf.url.value.trim(), text: imf.text.value, replace: imf.replace.checked });
        toast(`تم استيراد ${r.imported} قناة`, 'ok');
      } catch (err) { toast(err.message, 'err'); }
      btn.disabled = false; btn.textContent = 'استيراد';
    };
  },
};

(async () => {
  const { user } = await initNav('admin');
  if (!user || user.role !== 'admin') return (location.href = '/login.html');
  menu.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    menu.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
    tabs[b.dataset.tab]().catch((err) => toast(err.message, 'err'));
  };
  tabs.stats();
})();
