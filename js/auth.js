/* Shared auth — students, teachers (invite), admin (password) */
const Auth = (() => {
  const SESSION_KEY = 'giahuy-session';
  const STUDENTS_KEY = 'giahuy-students';
  const TEACHERS_KEY = 'giahuy-teachers';
  const ADMIN_PASS = 'giahuy-admin';

  function toast(msg, isError) {
    const el = document.getElementById('authToast') || document.getElementById('toast');
    if (!el) { alert(msg); return; }
    el.hidden = false;
    el.textContent = msg;
    el.classList.add('show');
    el.dataset.type = isError ? 'error' : 'ok';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.classList.remove('show'); el.hidden = true; }, 2800);
  }

  function getList(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }
  function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  function getStudents() { return getList(STUDENTS_KEY); }
  function saveStudents(list) { saveList(STUDENTS_KEY, list); }
  function getTeachers() { return getList(TEACHERS_KEY); }
  function saveTeachers(list) { saveList(TEACHERS_KEY, list); }

  function genInvite(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = (prefix || 'GH') + '-';
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.role) return null;
      return s;
    } catch { return null; }
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function loginStudent(username, invite) {
    const u = (username || '').trim();
    const inv = (invite || '').trim();
    if (!u || !inv) return { ok: false, msg: 'Nhập đủ tên đăng nhập và mã mời.' };
    const found = getStudents().find(x =>
      x.username.toLowerCase() === u.toLowerCase() &&
      x.inviteCode.toLowerCase() === inv.toLowerCase()
    );
    if (!found) return { ok: false, msg: 'Sai tên đăng nhập hoặc mã mời học sinh.' };
    setSession({ role: 'student', username: found.username, id: found.id, at: Date.now() });
    return { ok: true };
  }

  function loginTeacher(username, invite) {
    const u = (username || '').trim();
    const inv = (invite || '').trim();
    if (!u || !inv) return { ok: false, msg: 'Nhập đủ tên đăng nhập và mã mời giáo viên.' };
    const found = getTeachers().find(x =>
      x.username.toLowerCase() === u.toLowerCase() &&
      x.inviteCode.toLowerCase() === inv.toLowerCase()
    );
    if (!found) return { ok: false, msg: 'Sai tên đăng nhập hoặc mã mời giáo viên.' };
    setSession({ role: 'teacher', username: found.username, id: found.id, at: Date.now() });
    localStorage.setItem('giahuy-admin', '1');
    return { ok: true };
  }

  function loginAdmin(password) {
    if ((password || '') !== ADMIN_PASS) {
      return { ok: false, msg: 'Mật khẩu quản trị viên không đúng.' };
    }
    setSession({ role: 'admin', username: 'Quản trị viên', at: Date.now() });
    localStorage.setItem('giahuy-admin', '1');
    return { ok: true };
  }

  function logout() {
    clearSession();
    localStorage.removeItem('giahuy-admin');
    location.href = 'login.html';
  }

  function requireAuth(opts) {
    const s = getSession();
    if (!s) {
      location.replace('login.html');
      return null;
    }
    if (opts && opts.staffOnly && s.role !== 'admin' && s.role !== 'teacher') {
      location.replace('index.html');
      return null;
    }
    if (opts && opts.adminOnly && s.role !== 'admin') {
      location.replace(s.role === 'teacher' ? 'teacher.html' : 'index.html');
      return null;
    }
    return s;
  }

  function createAccount(kind, username) {
    const u = (username || '').trim();
    if (!u) return { ok: false, msg: 'Nhập tên đăng nhập.' };
    if (u.length < 2) return { ok: false, msg: 'Tên đăng nhập quá ngắn.' };
    const key = kind === 'teacher' ? TEACHERS_KEY : STUDENTS_KEY;
    const list = getList(key);
    if (list.some(x => x.username.toLowerCase() === u.toLowerCase())) {
      return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };
    }
    // also unique across both lists
    const other = kind === 'teacher' ? getStudents() : getTeachers();
    if (other.some(x => x.username.toLowerCase() === u.toLowerCase())) {
      return { ok: false, msg: 'Tên đã dùng cho vai trò khác.' };
    }
    const row = {
      id: (kind === 'teacher' ? 'tc_' : 'st_') + Date.now().toString(36),
      username: u,
      inviteCode: genInvite(kind === 'teacher' ? 'GV' : 'HS'),
      created: Date.now()
    };
    list.push(row);
    saveList(key, list);
    return { ok: true, account: row };
  }

  function deleteAccount(kind, id) {
    const key = kind === 'teacher' ? TEACHERS_KEY : STUDENTS_KEY;
    saveList(key, getList(key).filter(x => x.id !== id));
    return { ok: true };
  }

  function resetInvite(kind, id) {
    const key = kind === 'teacher' ? TEACHERS_KEY : STUDENTS_KEY;
    const list = getList(key);
    const i = list.findIndex(x => x.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    list[i].inviteCode = genInvite(kind === 'teacher' ? 'GV' : 'HS');
    saveList(key, list);
    return { ok: true, account: list[i] };
  }

  // backward-compatible aliases
  function createStudent(username) { return createAccount('student', username); }
  function deleteStudent(id) { return deleteAccount('student', id); }
  function resetInviteStudent(id) { return resetInvite('student', id); }

  return {
    toast, getStudents, saveStudents, getTeachers, saveTeachers,
    getSession, setSession, loginStudent, loginTeacher, loginAdmin,
    logout, requireAuth, createAccount, deleteAccount, resetInvite,
    createStudent, deleteStudent, resetInvite: resetInviteStudent,
    TEACHER_PASS: ADMIN_PASS, ADMIN_PASS
  };
})();
