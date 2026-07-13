/* ═══════════════════════════════════════════════
   inbox.js — 应用通知中心
   右上角邮件图标 → 下拉面板
   集成：备份通知 / 同步状态 / 更新提示 / 反馈
   ═══════════════════════════════════════════════ */

const inbox = [];
const INBOX_KEY = 'omnia_inbox';
let inboxUnread = 0;

// ── 初始化：恢复历史消息 ──────────────────────
function inboxInit() {
  const saved = localStorage.getItem(INBOX_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      inbox.push(...parsed);
      inboxUnread = inbox.filter(m => !m.read).length;
    } catch (_) {}
  }
  inboxUpdateBadge();
}

// ── 添加消息 ──────────────────────────────────
function inboxAdd(type, title, body) {
  const msg = { type, title, body, time: Date.now(), read: false };
  inbox.unshift(msg);
  if (inbox.length > 50) inbox.length = 50; // 最多保留 50 条
  inboxUnread++;
  inboxUpdateBadge();
  inboxSave();
  // 如果面板打开，实时刷新
  if (document.getElementById('inbox-panel')?.classList.contains('open')) {
    inboxRender();
  }
}

// ── 切换面板 ──────────────────────────────────
function inboxToggle() {
  const panel = document.getElementById('inbox-panel');
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  if (isOpen) inboxRender();
}

// ── 关闭面板（点外面） ─────────────────────────
function inboxClose(e) {
  const panel = document.getElementById('inbox-panel');
  const btn = document.getElementById('inbox-btn');
  if (!panel || !panel.classList.contains('open')) return;
  if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
    panel.classList.remove('open');
  }
}

// ── 全部标为已读 ──────────────────────────────
function inboxMarkAllRead() {
  inbox.forEach(m => { m.read = true; });
  inboxUnread = 0;
  inboxUpdateBadge();
  inboxSave();
  inboxRender();
}

// ── 清空收件箱 ────────────────────────────────
function inboxClear() {
  inbox.length = 0;
  inboxUnread = 0;
  inboxUpdateBadge();
  inboxSave();
  inboxRender();
}

// ── 发送反馈 ──────────────────────────────────
function inboxFeedback(e) {
  if (e) e.stopPropagation();
  inboxShowFeedbackForm();
}

function inboxShowFeedbackForm() {
  const panel = document.getElementById('inbox-panel');
  if (!panel) return;
  panel.innerHTML =
    '<div class="inbox-head">'
    + '<span class="inbox-title">✉ 发送反馈</span>'
    + '<button class="inbox-act-btn" onclick="inboxRender()" title="返回">← 返回</button>'
    + '</div>'
    + '<div style="padding:12px 14px;display:flex;flex-direction:column;gap:10px;">'
    + '<input id="fb-subject" placeholder="主题（可选）" style="padding:8px 10px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:4px;font-family:var(--mono);font-size:12px;outline:none;"/>'
    + '<textarea id="fb-body" rows="6" placeholder="请描述你的问题或建议..." style="padding:8px 10px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:4px;font-family:var(--mono);font-size:12px;resize:vertical;outline:none;"></textarea>'
    + '<div style="display:flex;gap:8px;justify-content:flex-end;">'
    + '<button onclick="inboxSendFeedback()" style="padding:6px 16px;background:var(--teal-dim);border:1px solid var(--teal);color:var(--teal-t);border-radius:4px;font-family:var(--mono);font-size:12px;cursor:pointer;">发送</button>'
    + '</div>'
    + '<div style="font-size:10px;color:var(--dim);text-align:center;">发送到 2867440557ftt@gmail.com</div>'
    + '</div>';
  setTimeout(() => {
    const subj = document.getElementById('fb-subject');
    if (subj) subj.focus();
  }, 100);
}

async function inboxSendFeedback() {
  const subject = document.getElementById('fb-subject')?.value?.trim() || 'Omnia 反馈';
  const body = document.getElementById('fb-body')?.value?.trim() || '';
  if (!body) {
    if (typeof toast === 'function') toast('请填写反馈内容');
    return;
  }
  const platform = navigator.userAgent.includes('Electron') ? '桌面版' : 'Web 版';

  // 通过 Google Apps Script 静默发送到你邮箱
  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbyDR6xKzyevIhi3e1zgWC8KvnWH2JaB7ni7Eo_Md7SKknRASUOtRt8Hj_02470Z-CmV3w/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ subject, body, platform })
    });
    inboxRender();
    if (typeof toast === 'function') toast('✅ 反馈已发送，感谢！');
    inboxAdd('system', '📤 反馈已发送', subject + ' — ' + body.slice(0, 50) + '...');
  } catch (_) {
    // 降级到邮件客户端
    const devEmails = '2867440557ftt@gmail.com,2867440557@qq.com';
    const mailtoUrl = 'mailto:' + devEmails + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body + '\n\n---\n来自 Omnia ' + platform);
    window.open(mailtoUrl, '_blank');
    inboxRender();
    if (typeof toast === 'function') toast('📋 请在邮件客户端中点击发送');
    inboxAdd('system', '📤 反馈已打开邮件客户端', subject);
  }
}

function inboxOpenGithub() {
  window.open('https://github.com/SunsetzF2023/omnia', '_blank');
}

// ── 渲染面板 ──────────────────────────────────
function inboxRender() {
  const panel = document.getElementById('inbox-panel');
  if (!panel) return;
  if (!inbox.length) {
    panel.innerHTML =
      '<div class="inbox-head">'
      + '<span class="inbox-title">📬 通知中心</span>'
      + '</div>'
      + '<div class="inbox-empty">暂无通知 ✨</div>'
      + '<div class="inbox-foot">'
      + '<button class="inbox-fb-btn" onclick="inboxFeedback(event)">✉ 反馈建议</button>'
      + '<button class="inbox-fb-btn" onclick="inboxOpenGithub()">☆ GitHub</button>'
      + '</div>';
    return;
  }
  const typeIcon = { backup: '💾', sync: '☁️', update: '⬆️', system: '📋', save: '💿' };
  panel.innerHTML =
    '<div class="inbox-head">'
    + '<span class="inbox-title">📬 通知中心</span>'
    + '<div class="inbox-actions">'
    + '<button class="inbox-act-btn" onclick="inboxMarkAllRead()" title="全部已读">✔ 已读</button>'
    + '<button class="inbox-act-btn" onclick="inboxClear()" title="清空">✕</button>'
    + '</div></div>'
    + '<div class="inbox-list">'
    + inbox.map(m => {
      const icon = typeIcon[m.type] || '📌';
      const cls = m.read ? 'inbox-msg' : 'inbox-msg unread';
      const t = new Date(m.time);
      const ts = t.toLocaleDateString('zh-CN') + ' ' + t.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return '<div class="' + cls + '">'
        + '<span class="inbox-msg-icon">' + icon + '</span>'
        + '<div class="inbox-msg-body">'
        + '<div class="inbox-msg-title">' + esc(m.title) + '</div>'
        + '<div class="inbox-msg-text">' + esc(m.body) + '</div>'
        + '<div class="inbox-msg-time">' + ts + '</div>'
        + '</div></div>';
    }).join('')
    + '</div>'
    + '<div class="inbox-foot">'
    + '<button class="inbox-fb-btn" onclick="inboxFeedback(event)">✉ 反馈建议</button>'
    + '<button class="inbox-fb-btn" onclick="inboxOpenGithub()">☆ GitHub</button>'
    + '</div>';
}

// ── 更新角标 ──────────────────────────────────
function inboxUpdateBadge() {
  const badge = document.getElementById('inbox-badge');
  if (!badge) return;
  if (inboxUnread > 0) {
    badge.textContent = inboxUnread > 99 ? '99+' : inboxUnread;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ── 持久化 ────────────────────────────────────
function inboxSave() {
  try {
    localStorage.setItem(INBOX_KEY, JSON.stringify(inbox.slice(0, 30)));
  } catch (_) {}
}

// ── 监听主进程推送的消息 ──────────────────────
if (window.electronAPI && typeof window.electronAPI.onInboxMsg === 'function') {
  window.electronAPI.onInboxMsg(function(data) {
    inboxAdd(data.type, data.title, data.body);
  });
}

// 点击外部关闭
document.addEventListener('click', inboxClose);
// 启动初始化
document.addEventListener('DOMContentLoaded', inboxInit);
