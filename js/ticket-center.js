(() => {
  'use strict';
  const KEY = 'giahuy-tickets-v1', ADMIN_KEY = 'giahuy-ticket-admin';
  // TODO: thay link mời Discord thật của bạn vào đây (Server Settings → Invite → tạo link không hết hạn)
  const DISCORD_URL = 'https://discord.gg/your-invite-code';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } };
  const set = v => localStorage.setItem(KEY, JSON.stringify(v));
  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const statusLabel = { pending: 'Chờ xử lý', progress: 'Đang xử lý', resolved: 'Đã duyệt', rejected: 'Từ chối' };
  const priorityLabel = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' };
  const cats = { support: 'Hỗ trợ website', resource: 'Yêu cầu tài nguyên', bug: 'Báo lỗi', account: 'Tài khoản', other: 'Khác' };
  const uid = () => { const d = new Date(), stamp = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join(''); let n = Number(localStorage.getItem('giahuy-ticket-seq') || 0) + 1; localStorage.setItem('giahuy-ticket-seq', String(n)); return `FUJI-${stamp}-${String(n).padStart(4, '0')}` };
  const fmt = t => new Date(t).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const notify = (msg, type = 'ok') => { const t = $('#toast'); if (t) { t.textContent = msg; t.dataset.type = type; t.classList.add('show'); clearTimeout(window.__ticketToast); window.__ticketToast = setTimeout(() => t.classList.remove('show'), 2600) } };

  function ensureUI() {
    if (!$('.ticket-launcher')) { const b = document.createElement('button'); b.className = 'ticket-launcher'; b.id = 'ticketOpen'; b.innerHTML = '<span>🎫 Đặt câu hỏi</span><span class="ticket-count" id="ticketCount">0</span>'; document.body.appendChild(b) }
    if (!$('#ticketModal')) {
      const m = document.createElement('div'); m.className = 'ticket-modal'; m.id = 'ticketModal'; m.setAttribute('aria-hidden', 'true');
      m.innerHTML = `<section class="ticket-panel" role="dialog" aria-modal="true" aria-labelledby="ticketTitle">
        <div class="ticket-panel-head">
          <div>
            <div class="ticket-kicker">GIA HUY / HỎI ĐÁP</div>
            <h2 class="ticket-title" id="ticketTitle"><span class="ticket-seal">GH</span>Trung tâm hỗ trợ</h2>
            <p class="ticket-subtitle">Tạo yêu cầu, theo dõi vị trí trong hàng chờ và xem lịch sử xử lý ngay trên website.</p>
          </div>
          <button class="ticket-close" id="ticketClose" aria-label="Đóng">×</button>
        </div>
        <a class="ticket-discord-banner" id="ticketDiscordBanner" href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">
          <span class="tdb-icon">🎮</span>
          <span class="tdb-text"><b>Tham gia nhóm Discord của lớp</b><span>Trao đổi trực tiếp, nhận thông báo ticket nhanh hơn</span></span>
          <span class="tdb-arrow">↗</span>
        </a>
        <div class="ticket-tabs">
          <button class="ticket-tab active" data-ticket-tab="create">📝 Tạo ticket</button>
          <button class="ticket-tab" data-ticket-tab="queue">📋 Hàng chờ</button>
          <button class="ticket-tab" data-ticket-tab="history">🕘 Lịch sử</button>
          <button class="ticket-tab" data-ticket-tab="admin">🛡️ Quản trị</button>
        </div>
        <div id="ticketBody"></div>
      </section>`;
      document.body.appendChild(m);
    }
    updateCount();
    $('#ticketOpen').addEventListener('click', () => open('create')); $('#ticketClose').addEventListener('click', close);
    $('#ticketModal').addEventListener('click', e => { if (e.target.id === 'ticketModal') close() });
    $$('.ticket-tab').forEach(b => b.addEventListener('click', () => renderTab(b.dataset.ticketTab)));
    addImageSafety();
  }
  function addImageSafety() { $$('img').forEach(img => { if (img.dataset.safeAttached) return; img.dataset.safeAttached = '1'; img.loading = img.loading || 'lazy'; img.decoding = 'async'; img.addEventListener('error', () => { img.removeAttribute('src'); img.classList.add('img-fallback'); img.alt = img.alt || 'Hình ảnh không khả dụng'; img.style.background = 'linear-gradient(135deg,#132736,#09141e)'; }, { once: true }) }) }
  function open(tab = 'create') { const m = $('#ticketModal'); m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); renderTab(tab) }
  function close() { const m = $('#ticketModal'); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true') }
  function updateCount() { const pending = get().filter(x => x.status === 'pending' || x.status === 'progress').length; const el = $('#ticketCount'); if (el) el.textContent = pending; $('#ticketOpen')?.classList.toggle('is-busy', pending > 0) }
  function renderTab(tab) { $$('.ticket-tab').forEach(b => b.classList.toggle('active', b.dataset.ticketTab === tab)); const body = $('#ticketBody'); if (!body) return; if (tab === 'create') renderCreate(body); else if (tab === 'queue') renderQueue(body, false); else if (tab === 'history') renderHistory(body); else renderAdmin(body) }

  function renderCreate(body) {
    body.innerHTML = `<div class="ticket-layout"><div class="ticket-card"><form class="ticket-form" id="ticketForm"><div class="ticket-row"><label class="ticket-field"><span>Tiêu đề *</span><input name="title" required maxlength="90" placeholder="Ví dụ: Không tải được file plugin"></label><label class="ticket-field"><span>Tên người gửi</span><input name="name" maxlength="50" placeholder="Tên hiển thị"></label></div><div class="ticket-row"><label class="ticket-field"><span>Loại yêu cầu *</span><select name="category">${Object.entries(cats).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label><label class="ticket-field"><span>Mức ưu tiên</span><select name="priority"><option value="low">Thấp</option><option value="medium" selected>Trung bình</option><option value="high">Cao</option></select></label></div><label class="ticket-field"><span>Nội dung *</span><textarea name="message" required maxlength="1200" placeholder="Mô tả vấn đề, link tài nguyên hoặc điều bạn cần hỗ trợ..."></textarea></label><div class="ticket-actions"><button class="ticket-btn primary" type="submit">Gửi ticket vào hàng chờ</button><button class="ticket-btn ghost" type="button" id="ticketFillExample">Điền mẫu</button></div><div class="ticket-helper">Ticket sẽ nhận mã tự động. Bạn có thể mở mục "Hàng chờ" để theo dõi trạng thái, phản hồi từ admin và vị trí tương đối.</div></form></div><div class="ticket-card"><div class="queue-head"><h3>Quy trình xử lý</h3><span class="status-pill status-progress"><i class="ticket-toast-dot"></i>24/7</span></div><div class="ticket-admin-note">1. Gửi yêu cầu → 2. Xếp hàng theo ưu tiên → 3. Admin duyệt / trả lời → 4. Đóng ticket. Ticket mới luôn được đặt số rõ ràng để dễ tra cứu.</div><div class="ticket-stats"><div class="ticket-stat"><span>⏳ Đang chờ</span><b id="quickPending">0</b></div><div class="ticket-stat"><span>🔧 Đang xử lý</span><b id="quickProgress">0</b></div><div class="ticket-stat"><span>✅ Đã duyệt</span><b id="quickResolved">0</b></div><div class="ticket-stat"><span>📦 Tổng</span><b id="quickTotal">0</b></div></div><div class="queue-list" id="recentTicketList"></div></div></div>`;
    $('#ticketForm').addEventListener('submit', createTicket); $('#ticketFillExample').addEventListener('click', () => { const f = $('#ticketForm'); f.title.value = 'Không tải được tài nguyên'; f.name.value = 'Khách'; f.category.value = 'bug'; f.priority.value = 'medium'; f.message.value = 'Mình không thể tải tài nguyên. Sau khi bấm nút tải, website không phản hồi hoặc báo lỗi.' }); renderQuickStats();
  }
  function renderQuickStats() { const a = get(), c = s => a.filter(x => x.status === s).length; ['quickPending', 'quickProgress', 'quickResolved', 'quickTotal'].forEach((id, i) => { const el = $('#' + id); if (el) el.textContent = [c('pending'), c('progress'), c('resolved'), a.length][i] }); const box = $('#recentTicketList'); if (!box) return; const arr = [...a].sort((x, y) => y.created - x.created).slice(0, 5); box.innerHTML = arr.length ? arr.map(x => ticketItem(x)).join('') : '<div class="queue-empty">Chưa có ticket nào.</div>' }

  function replyThread(x) {
    const list = x.replies || [];
    if (!list.length) return '';
    return `<div class="reply-thread">${list.map(r => `<div class="reply-msg"><div class="reply-msg-head"><span class="reply-author">🛠️ Admin</span><span class="reply-time">${fmt(r.time)}</span></div><p>${esc(r.text)}</p></div>`).join('')}</div>`;
  }
  function ticketItem(x, admin = false) {
    const replies = x.replies || [];
    const replyBadge = replies.length ? `<span class="reply-count-pill">💬 ${replies.length}</span>` : '';
    return `<article class="queue-item status-${esc(x.status)}">
      <div class="queue-top">
        <div><div class="queue-id">${esc(x.id)}</div><div class="queue-meta">${esc(x.title)} • ${esc(cats[x.category] || x.category)} • ${fmt(x.created)}</div></div>
        <div class="queue-pills">${statusPill(x.status)} ${priorityPill(x.priority)} ${replyBadge}</div>
      </div>
      <p class="queue-text">${esc(x.message)}</p>
      ${replyThread(x)}
      ${admin ? `<div class="queue-meta">Người gửi: ${esc(x.name || 'Ẩn danh')}</div>
      <div class="queue-actions">
        <button class="qa-btn qa-approve" data-status="resolved" data-id="${esc(x.id)}" type="button">✅ Duyệt</button>
        <button class="qa-btn qa-progress" data-status="progress" data-id="${esc(x.id)}" type="button">🔧 Nhận xử lý</button>
        <button class="qa-btn qa-reject" data-status="rejected" data-id="${esc(x.id)}" type="button">✖ Từ chối</button>
        <button class="qa-btn qa-pending" data-status="pending" data-id="${esc(x.id)}" type="button">↺ Đặt lại chờ</button>
        <button class="qa-btn qa-reply" data-reply-toggle="${esc(x.id)}" type="button">💬 Trả lời</button>
        <button class="qa-btn qa-delete" data-delete="${esc(x.id)}" type="button">🗑️ Xóa</button>
      </div>
      <div class="reply-box" id="replyBox-${esc(x.id)}" hidden>
        <textarea placeholder="Nhập phản hồi gửi tới người tạo ticket..." maxlength="800"></textarea>
        <div class="reply-box-actions">
          <button class="ticket-btn primary" data-send-reply="${esc(x.id)}" type="button">Gửi phản hồi</button>
          <button class="ticket-btn ghost" data-cancel-reply="${esc(x.id)}" type="button">Hủy</button>
        </div>
      </div>` : ''}
    </article>`;
  }
  function statusPill(s) { return `<span class="status-pill status-${s}">${esc(statusLabel[s] || s)}</span>` } function priorityPill(p) { return `<span class="priority-pill priority-${p}">${esc(priorityLabel[p] || p)}</span>` }
  function createTicket(e) { e.preventDefault(); const f = new FormData(e.currentTarget), title = String(f.get('title') || '').trim(), message = String(f.get('message') || '').trim(); if (!title || !message) return; const now = Date.now(), item = { id: uid(), title, name: String(f.get('name') || '').trim() || 'Ẩn danh', category: f.get('category') || 'other', priority: f.get('priority') || 'medium', message, status: 'pending', created: now, updated: now, replies: [] }; const all = get(); all.push(item); set(all); e.currentTarget.reset(); notify(`Đã tạo ${item.id}. Ticket đã vào hàng chờ.`); renderTab('queue'); updateCount() }
  function renderQueue(body, admin) { const all = get().filter(x => x.status === 'pending' || x.status === 'progress').sort((a, b) => { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority] || a.created - b.created }); body.innerHTML = `<div class="ticket-stats"><div class="ticket-stat"><span>⏳ Chờ xử lý</span><b>${all.filter(x => x.status === 'pending').length}</b></div><div class="ticket-stat"><span>🔧 Đang xử lý</span><b>${all.filter(x => x.status === 'progress').length}</b></div><div class="ticket-stat"><span>🔥 Ưu tiên cao</span><b>${all.filter(x => x.priority === 'high').length}</b></div><div class="ticket-stat"><span>📦 Tổng đang mở</span><b>${all.length}</b></div></div><div class="ticket-card"><div class="queue-head"><h3>Hàng chờ hiện tại</h3><button class="ticket-btn" id="refreshQueue">↻ Làm mới</button></div><div class="ticket-helper">Thứ tự ưu tiên: Cao → Trung bình → Thấp; cùng mức ưu tiên sẽ xếp theo thời gian tạo. Phản hồi của admin (nếu có) hiển thị ngay dưới nội dung ticket.</div><div class="queue-list" style="margin-top:10px">${all.length ? all.map(x => ticketItem(x, admin)).join('') : '<div class="queue-empty">🎉 Không còn ticket đang chờ.</div>'}</div></div>`; $('#refreshQueue')?.addEventListener('click', () => renderTab('queue')); bindAdminActions() }
  function renderHistory(body) { const all = [...get()].sort((a, b) => b.updated - a.updated); body.innerHTML = `<div class="ticket-card"><div class="queue-head"><h3>Lịch sử ticket</h3><span class="ticket-helper">${all.length} ticket</span></div><div class="queue-list">${all.length ? all.map(x => ticketItem(x)).join('') : '<div class="queue-empty">Chưa có lịch sử.</div>'}</div></div>` }
  function renderAdmin(body) {
    if (localStorage.getItem(ADMIN_KEY) !== '1') { body.innerHTML = `<div class="ticket-card"><form class="ticket-form" id="ticketAdminLogin"><label class="ticket-field"><span>Mật khẩu quản trị</span><input type="password" name="password" placeholder="Nhập mật khẩu admin" required></label><div class="ticket-actions"><button class="ticket-btn primary" type="submit">Mở hàng chờ quản trị</button></div><div class="ticket-helper">Dùng cùng mật khẩu Admin demo của website: <b>giahuy-admin</b>. Bản static chỉ bảo vệ ở trình duyệt.</div></form></div>`; $('#ticketAdminLogin').addEventListener('submit', e => { e.preventDefault(); if (e.currentTarget.password.value === 'giahuy-admin') { localStorage.setItem(ADMIN_KEY, '1'); renderAdmin(body); notify('Đã mở chế độ quản trị ticket.') } else notify('Sai mật khẩu.', 'error') }); return }
    const a = get();
    body.innerHTML = `<div class="ticket-stats"><div class="ticket-stat"><span>⏳ Chờ</span><b>${a.filter(x => x.status === 'pending').length}</b></div><div class="ticket-stat"><span>🔧 Đang xử lý</span><b>${a.filter(x => x.status === 'progress').length}</b></div><div class="ticket-stat"><span>✅ Đã duyệt</span><b>${a.filter(x => x.status === 'resolved').length}</b></div><div class="ticket-stat"><span>📦 Tổng</span><b>${a.length}</b></div></div><div class="ticket-tools"><input id="ticketAdminSearch" placeholder="Tìm mã, tiêu đề, người gửi..."><select id="ticketAdminFilter"><option value="all">Tất cả trạng thái</option>${Object.entries(statusLabel).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><button class="ticket-btn" id="ticketExport">Xuất JSON</button><button class="ticket-btn" id="ticketLogout">Đăng xuất</button></div><div class="queue-list" id="adminQueue"></div>`;
    const draw = () => { const q = ($('#ticketAdminSearch').value || '').toLowerCase(); const st = $('#ticketAdminFilter').value; const arr = get().filter(x => (st === 'all' || x.status === st) && (!q || [x.id, x.title, x.name, x.message].join(' ').toLowerCase().includes(q))).sort((a, b) => { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority] || b.updated - a.updated }); $('#adminQueue').innerHTML = arr.length ? arr.map(x => ticketItem(x, true)).join('') : '<div class="queue-empty">Không tìm thấy ticket phù hợp.</div>'; bindAdminActions() };
    $('#ticketAdminSearch').addEventListener('input', draw); $('#ticketAdminFilter').addEventListener('change', draw);
    $('#ticketExport').addEventListener('click', () => { const blob = new Blob([JSON.stringify(get(), null, 2)], { type: 'application/json' }), u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = 'giahuy-tickets.json'; a.click(); URL.revokeObjectURL(u) });
    $('#ticketLogout').addEventListener('click', () => { localStorage.removeItem(ADMIN_KEY); renderAdmin(body) });
    draw();
  }
  function bindAdminActions() {
    $$('#ticketBody [data-status]').forEach(b => b.addEventListener('click', () => { const a = get(), x = a.find(t => t.id === b.dataset.id); if (!x) return; x.status = b.dataset.status; x.updated = Date.now(); set(a); notify(`${x.id}: ${statusLabel[x.status]}`); renderTab('admin'); updateCount() }));
    $$('#ticketBody [data-delete]').forEach(b => b.addEventListener('click', () => { if (!confirm('Xóa câu hỏi này?')) return; set(get().filter(x => x.id !== b.dataset.delete)); notify('Đã xóa câu hỏi.'); renderTab('admin'); updateCount() }));
    $$('#ticketBody [data-reply-toggle]').forEach(b => b.addEventListener('click', () => { const box = $('#replyBox-' + b.dataset.replyToggle); if (!box) return; box.hidden = !box.hidden; if (!box.hidden) box.querySelector('textarea')?.focus() }));
    $$('#ticketBody [data-cancel-reply]').forEach(b => b.addEventListener('click', () => { const box = $('#replyBox-' + b.dataset.cancelReply); if (!box) return; box.hidden = true; const ta = box.querySelector('textarea'); if (ta) ta.value = '' }));
    $$('#ticketBody [data-send-reply]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.sendReply, box = $('#replyBox-' + id); if (!box) return;
      const ta = box.querySelector('textarea'), text = (ta.value || '').trim();
      if (!text) { notify('Nhập nội dung phản hồi trước khi gửi.', 'error'); return }
      const all = get(), x = all.find(t => t.id === id); if (!x) return;
      x.replies = x.replies || []; x.replies.push({ text, time: Date.now() }); x.updated = Date.now();
      set(all); notify(`${id}: Đã gửi phản hồi.`); renderTab('admin'); updateCount();
    }));
  }
  addEventListener('keydown', e => { if (e.key === 'Escape') close() });
  document.addEventListener('click', e => { const a = e.target.closest?.('[data-open-ticket-nav]'); if (a) { e.preventDefault(); open('create') } });
  ensureUI();
})();
