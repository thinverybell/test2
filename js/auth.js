/* Shared auth for Gia Huy site — localStorage based */
const Auth = (() => {
  const SESSION_KEY = 'giahuy-session';
  const STUDENTS_KEY = 'giahuy-students';
  const TEACHER_PASS = 'giahuy-admin';

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

  function getStudents() {
    try { return JSON.parse(localStorage.getItem(STUDENTS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveStudents(list) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
  }

  function genInvite() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = 'GH-';
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
    const list = getStudents();
    const found = list.find(x =>
      x.username.toLowerCase() === u.toLowerCase() &&
      x.inviteCode.toLowerCase() === inv.toLowerCase()
    );
    if (!found) return { ok: false, msg: 'Sai tên đăng nhập hoặc mã mời.' };
    setSession({ role: 'student', username: found.username, id: found.id, at: Date.now() });
    return { ok: true };
  }

  function loginTeacher(password) {
    if ((password || '') !== TEACHER_PASS) {
      return { ok: false, msg: 'Mật khẩu giáo viên không đúng.' };
    }
    setSession({ role: 'teacher', username: 'Giáo viên', at: Date.now() });
    // keep legacy admin flag for existing admin features
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
    if (opts && opts.teacherOnly && s.role !== 'teacher') {
      location.replace('index.html');
      return null;
    }
    return s;
  }

  function createStudent(username) {
    const u = (username || '').trim();
    if (!u) return { ok: false, msg: 'Nhập tên đăng nhập.' };
    if (u.length < 2) return { ok: false, msg: 'Tên đăng nhập quá ngắn.' };
    const list = getStudents();
    if (list.some(x => x.username.toLowerCase() === u.toLowerCase())) {
      return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };
    }
    const row = {
      id: 'st_' + Date.now().toString(36),
      username: u,
      inviteCode: genInvite(),
      created: Date.now()
    };
    list.push(row);
    saveStudents(list);
    return { ok: true, student: row };
  }

  function deleteStudent(id) {
    let list = getStudents().filter(x => x.id !== id);
    saveStudents(list);
    return { ok: true };
  }

  function resetInvite(id) {
    const list = getStudents();
    const i = list.findIndex(x => x.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    list[i].inviteCode = genInvite();
    saveStudents(list);
    return { ok: true, student: list[i] };
  }

  return {
    toast, getStudents, saveStudents, getSession, setSession,
    loginStudent, loginTeacher, logout, requireAuth,
    createStudent, deleteStudent, resetInvite, TEACHER_PASS
  };
})();
