/* ═══════════════════════════════════════════════
   auth.js — Google OAuth 认证
   依赖: app.js (CLIENT_ID, SCOPES, token 全局变量)
   提供: signIn, signOut, fetchUserInfo, gfetch
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════
// 登录
// ═══════════════════════════════════════════════
function signIn() {
  const REDIRECT = 'http://localhost:3000/callback';
  const SCOPE = encodeURIComponent(SCOPES + ' https://www.googleapis.com/auth/userinfo.profile');

  // 授权回调 — Electron 主进程通过 executeJavaScript 调用此函数传递 token
  window.__electronToken = async function(accessToken) {
    window.__electronToken = null;
    token = accessToken;
    try {
      await fetchUserInfo();
      // ★ 持久化 token 和用户信息
      localStorage.setItem('omnia_token', accessToken);
      localStorage.setItem('omnia_user', JSON.stringify({
        name: document.getElementById('user-name').textContent,
        picture: document.getElementById('avatar').src
      }));
      showApp();
      if (typeof loadFromDrive === 'function') await loadFromDrive();
      if (typeof ldgLoadFromDrive === 'function') await ldgLoadFromDrive();
      if (typeof checkDraftOnLoad === 'function') checkDraftOnLoad();
    } catch (e) {
      showAuthError('登录失败：' + e.message);
    }
  };

  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    + '?client_id=' + CLIENT_ID
    + '&redirect_uri=' + encodeURIComponent(REDIRECT)
    + '&response_type=token'
    + '&scope=' + SCOPE;

  window.open(authUrl, '_blank');
}

// ★ 启动时尝试恢复会话
async function tryRestoreSession() {
  const savedToken = localStorage.getItem('omnia_token');
  if (!savedToken) return false;

  token = savedToken;
  // 先尝试用缓存的用户信息渲染 UI
  const savedUser = localStorage.getItem('omnia_user');
  if (savedUser) {
    try {
      const u = JSON.parse(savedUser);
      document.getElementById('user-name').textContent = u.name || '';
      if (u.picture) {
        document.getElementById('avatar').src = u.picture;
        document.getElementById('avatar').style.display = 'block';
        const fb = document.getElementById('avatar-fallback');
        if (fb) fb.style.display = 'none';
      }
    } catch (_) {}
  }

  // 验证 token 是否仍然有效
  const r = await gfetch('https://www.googleapis.com/oauth2/v3/userinfo');
  if (!r) {
    // token 过期，清除
    token = null;
    localStorage.removeItem('omnia_token');
    localStorage.removeItem('omnia_user');
    return false;
  }

  // token 有效，更新用户信息
  document.getElementById('user-name').textContent = r.name || r.email || '';
  if (r.picture) document.getElementById('avatar').src = r.picture;
  localStorage.setItem('omnia_user', JSON.stringify({
    name: r.name || r.email || '',
    picture: r.picture || ''
  }));

  showApp();
  if (typeof loadFromDrive === 'function') await loadFromDrive();
  if (typeof ldgLoadFromDrive === 'function') await ldgLoadFromDrive();
  if (typeof checkDraftOnLoad === 'function') checkDraftOnLoad();
  return true;
}

function showApp() {
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
}

// ═══════════════════════════════════════════════
// 退出
// ═══════════════════════════════════════════════
function signOut() {
  token = null;
  driveFileId = null;
  ledgerFileId = null;
  entries = [];
  current = null;
  localStorage.removeItem('omnia_token');
  localStorage.removeItem('omnia_user');
  if (typeof stopDraftTimer === 'function') stopDraftTimer();
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-overlay').style.display = 'flex';
  document.getElementById('avatar').src = '';
  document.getElementById('avatar').style.display = 'none';
  const fb = document.getElementById('avatar-fallback');
  if (fb) { fb.style.display = 'none'; fb.textContent = ''; }
  document.getElementById('user-name').textContent = '';
}

// ═══════════════════════════════════════════════
// 用户信息
// ═══════════════════════════════════════════════
async function fetchUserInfo() {
  const r = await gfetch('https://www.googleapis.com/oauth2/v3/userinfo');
  if (!r) return;
  const displayName = r.name || r.email || '';
  document.getElementById('user-name').textContent = displayName;
  const avatarEl = document.getElementById('avatar');
  if (r.picture && avatarEl) {
    avatarEl.src = r.picture;
    // 头像加载失败时显示首字母 fallback
    avatarEl.onerror = function() {
      avatarEl.style.display = 'none';
      const fallback = document.getElementById('avatar-fallback');
      if (fallback) {
        fallback.style.display = 'flex';
        fallback.textContent = (displayName.charAt(0) || '?').toUpperCase();
      }
    };
    avatarEl.onload = function() {
      avatarEl.style.display = 'block';
      const fallback = document.getElementById('avatar-fallback');
      if (fallback) fallback.style.display = 'none';
    };
  } else if (avatarEl) {
    // 没有 picture，直接用首字母 fallback
    avatarEl.style.display = 'none';
    const fallback = document.getElementById('avatar-fallback');
    if (fallback) {
      fallback.style.display = 'flex';
      fallback.textContent = (displayName.charAt(0) || '?').toUpperCase();
    }
  }
}

// ═══════════════════════════════════════════════
// 认证过的 Google API fetch
// ═══════════════════════════════════════════════
async function gfetch(url, opts = {}) {
  if (!token) return null;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: 'Bearer ' + token,
      ...(opts.headers || {})
    }
  });
  if (!res.ok) return null;
  return res.headers.get('content-type')?.includes('json')
    ? res.json()
    : res.text();
}

// ═══════════════════════════════════════════════
// 内部工具
// ═══════════════════════════════════════════════
function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = '登录失败：' + msg;
  el.style.display = 'block';
}

// ★ 启动时自动尝试恢复登录会话
tryRestoreSession();
