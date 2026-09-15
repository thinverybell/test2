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

  /** Students belonging to a teacher (ownerId). Admin / no filter = all. */
  function getStudentsByOwner(ownerId) {
    const all = getStudents();
    if (!ownerId || ownerId === 'admin') return all;
    return all.filter(s => s.ownerId === ownerId);
  }

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
    setSession({
      role: 'student',
      username: found.username,
      id: found.id,
      ownerId: found.ownerId || null,
      at: Date.now()
    });
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

  /**
   * Create account.
   * For students: pass ownerId (teacher id) so each teacher has their own list.
   * Admin creating student without owner → ownerId 'admin'.
   */
  function createAccount(kind, username, ownerId) {
    const u = (username || '').trim();
    if (!u) return { ok: false, msg: 'Nhập tên đăng nhập.' };
    if (u.length < 2) return { ok: false, msg: 'Tên đăng nhập quá ngắn.' };
    const key = kind === 'teacher' ? TEACHERS_KEY : STUDENTS_KEY;
    const list = getList(key);
    if (list.some(x => x.username.toLowerCase() === u.toLowerCase())) {
      return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };
    }
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
    if (kind === 'student') {
      row.ownerId = ownerId || 'admin';
    }
    if (kind === 'teacher') {
      row.avatar = null;
    }
    list.push(row);
    saveList(key, list);
    return { ok: true, account: row };
  }

  function deleteAccount(kind, id) {
    const key = kind === 'teacher' ? TEACHERS_KEY : STUDENTS_KEY;
    if (kind === 'teacher') {
      // also remove students owned by this teacher
      const students = getStudents().filter(s => s.ownerId !== id);
      saveStudents(students);
      try { localStorage.removeItem('giahuy-avatar-' + id); } catch (_) {}
    }
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

  /**
   * Update username and/or invite code for an account.
   * opts: { username?, inviteCode? }
   */
  function updateAccount(kind, id, opts) {
    const key = kind === 'teacher' ? TEACHERS_KEY : STUDENTS_KEY;
    const list = getList(key);
    const i = list.findIndex(x => x.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    const row = list[i];
    if (opts && opts.username != null) {
      const u = String(opts.username).trim();
      if (u.length < 2) return { ok: false, msg: 'Tên đăng nhập quá ngắn.' };
      const clashSelf = list.some(x => x.id !== id && x.username.toLowerCase() === u.toLowerCase());
      if (clashSelf) return { ok: false, msg: 'Tên đăng nhập đã tồn tại.' };
      const other = kind === 'teacher' ? getStudents() : getTeachers();
      if (other.some(x => x.username.toLowerCase() === u.toLowerCase())) {
        return { ok: false, msg: 'Tên đã dùng cho vai trò khác.' };
      }
      row.username = u;
    }
    if (opts && opts.inviteCode != null) {
      const inv = String(opts.inviteCode).trim();
      if (inv.length < 4) return { ok: false, msg: 'Mã mời quá ngắn.' };
      row.inviteCode = inv;
    }
    list[i] = row;
    saveList(key, list);
    // refresh session username if self
    const s = getSession();
    if (s && s.id === id && s.role === kind) {
      s.username = row.username;
      setSession(s);
    }
    return { ok: true, account: row };
  }

  function getTeacherById(id) {
    return getTeachers().find(t => t.id === id) || null;
  }

  function setTeacherAvatar(id, dataUrl) {
    const list = getTeachers();
    const i = list.findIndex(x => x.id === id);
    if (i < 0) return { ok: false, msg: 'Không tìm thấy.' };
    list[i].avatar = dataUrl || null;
    saveTeachers(list);
    try {
      if (dataUrl) localStorage.setItem('giahuy-avatar-' + id, dataUrl);
      else localStorage.removeItem('giahuy-avatar-' + id);
    } catch (_) {}
    return { ok: true, account: list[i] };
  }

  function getTeacherAvatar(id) {
    try {
      const cached = localStorage.getItem('giahuy-avatar-' + id);
      if (cached) return cached;
    } catch (_) {}
    const t = getTeacherById(id);
    return (t && t.avatar) || null;
  }

  function createStudent(username, ownerId) {
    return createAccount('student', username, ownerId);
  }
  function deleteStudent(id) { return deleteAccount('student', id); }
  function resetInviteStudent(id) { return resetInvite('student', id); }

  return {
    toast,
    getStudents,
    saveStudents,
    getTeachers,
    saveTeachers,
    getStudentsByOwner,
    getSession,
    setSession,
    loginStudent,
    loginTeacher,
    loginAdmin,
    logout,
    requireAuth,
    createAccount,
    deleteAccount,
    resetInvite,
    updateAccount,
    getTeacherById,
    setTeacherAvatar,
    getTeacherAvatar,
    createStudent,
    deleteStudent,
    resetInviteStudent,
    TEACHER_PASS: ADMIN_PASS,
    ADMIN_PASS
  };
})();
