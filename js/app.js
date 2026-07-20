/* ═══════════════════════════════════════════════
   app.js — 应用共享状态与工具函数
   依赖: i18n.js (t函数)
   提供: 全局变量, uid, esc, fmtDate, setSyncStatus,
         toast, appConfirm, autoResize, switchTab
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════
const CLIENT_ID  = '121154591261-38dov5afo9e1boks76l8aia1roqj5kg0.apps.googleusercontent.com';
const DRIVE_FILE = 'cmdbook_data.json';
const LEDGER_FILE= 'ledger_data.json';
const SCOPES     = 'https://www.googleapis.com/auth/drive.appdata';
const DRAFT_KEY  = 'cmdbook_draft_v2';

const CURRENCIES = { HKD: 'HK$', CNY: 'CN¥', USD: 'US$' };

// ═══════════════════════════════════════════════
// 错误上报系统
// ═══════════════════════════════════════════════
const ERROR_LOG_KEY = 'omnia_error_log';
const DEV_EMAILS = ['2867440557ftt@gmail.com', '2867440557@qq.com'];
let _devMode = false;

(function initErrorReporter() {
  const _origError = window.onerror;
  window.onerror = function(msg, src, line, col, err) {
    // 收集错误
    const entry = {
      msg: String(msg).slice(0, 200),
      src: String(src || '').slice(0, 200),
      line: line || 0,
      ts: Date.now(),
      ua: navigator.userAgent.slice(0, 100)
    };
    try {
      const log = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]');
      log.push(entry);
      // 保留最近 100 条
      if (log.length > 100) log.splice(0, log.length - 100);
      localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(log));
      // 发送到 Apps Script
      const url = 'https://script.google.com/macros/s/AKfycbyDR6xKzyevIhi3e1zgWC8KvnWH2JaB7ni7Eo_Md7SKknRASUOtRt8Hj_02470Z-CmV3w/exec?action=err_report&msg=' + encodeURIComponent(entry.msg) + '&src=' + encodeURIComponent(entry.src) + '&line=' + entry.line + '&ua=' + encodeURIComponent(entry.ua);
      new Image().src = url;
    } catch(e) {}
    if (_origError) _origError.call(window, msg, src, line, col, err);
    return true;
  };
})();

// ═══════════════════════════════════════════════
// 开发者模式检测（登录后调用 _checkDevMode）
// ═══════════════════════════════════════════════
function _checkDevMode(email) {
  if (!email) { _devMode = false; return; }
  _devMode = DEV_EMAILS.some(e => email.toLowerCase() === e.toLowerCase());

  // 直接在 body 上插入浮动 DEV 标志，不依赖 DOM ready
  function _showBadge(color, title) {
    if (document.getElementById('dev-float-badge')) return;
    var b = document.createElement('div');
    b.id = 'dev-float-badge';
    b.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:99998;padding:4px 10px;border-radius:4px;font-size:11px;font-family:monospace;cursor:pointer;background:' + (color === 'gold' ? 'var(--amber-dim)' : 'var(--bg3)') + ';color:' + (color === 'gold' ? 'var(--amber)' : 'var(--dim)') + ';border:1px solid ' + (color === 'gold' ? 'var(--amber)' : 'var(--border)');
    b.textContent = _devMode ? '🛠 DEV' : '🐛 ' + email;
    b.title = title || '';
    b.onclick = _devMode ? _toggleDevPanel : null;
    document.body.appendChild(b);
  }

  if (_devMode) {
    _showBadge('gold', 'Ctrl+Shift+D 打开控制台');
    // 同时更新 header 中的 dev-badge（如果存在）
    var hdrBadge = document.getElementById('dev-badge');
    if (hdrBadge) hdrBadge.style.display = 'inline-block';
  } else {
    _showBadge('dim', '非开发者账号');
    var hdrBadge = document.getElementById('dev-badge');
    if (hdrBadge) { hdrBadge.style.display = 'inline-block'; hdrBadge.style.opacity = '0.3'; hdrBadge.title = email; }
  }

  // 快捷键
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      _toggleDevPanel();
    }
  });
}

function _toggleDevPanel() {
  if (!_devMode) return;
  let panel = document.getElementById('dev-panel');
  if (panel) { panel.remove(); return; }

  // 先渲染面板骨架
  panel = document.createElement('div');
  panel.id = 'dev-panel';
  panel.innerHTML =
    '<div style="position:fixed;top:50px;right:10px;width:440px;max-height:85vh;background:var(--bg2);border:1px solid var(--amber);border-radius:8px;z-index:99999;padding:16px;overflow-y:auto;font-size:11px;font-family:var(--mono);color:var(--text);box-shadow:0 8px 32px rgba(0,0,0,.5)">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="color:var(--amber);font-size:14px">🛠 开发者控制台</b><button onclick="document.getElementById(\'dev-panel\').remove()" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:16px">✕</button></div>'
    + '<div style="margin-bottom:10px"><b>系统信息</b><br>UA: ' + esc(navigator.userAgent.slice(0,80)) + '<br>屏幕: ' + screen.width + '×' + screen.height + ' @' + window.devicePixelRatio + 'x<br>在线: ' + (navigator.onLine ? '✅' : '❌') + ' | Token: ' + (token ? '✅' : '❌') + ' | Electron: ' + (!!window.electronAPI ? '✅' : '❌') + '<br>本地错误: <span id="dev-err-local">...</span> 条 | 远程错误: <span id="dev-err-remote">加载中...</span></div>'
    + '<div style="margin-bottom:10px"><b>远程错误日志（所有用户）</b> <button id="dev-refresh-btn" onclick="_devRefreshErrors()" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px;transition:all .15s" onmousedown="this.style.background=\'var(--amber-dim)\';this.style.color=\'var(--amber)\'" onmouseup="this.style.background=\'\';this.style.color=\'\'">🔄 刷新</button> <button onclick="_devTestError()" style="background:var(--bg3);border:1px solid var(--red);color:var(--red);padding:2px 8px;border-radius:4px;cursor:pointer;font-size:10px">🧪 测试</button><br><div id="dev-err-list" style="max-height:300px;overflow-y:auto">加载中...</div></div>'
    + '<div style="margin-bottom:10px"><b>快捷操作</b><br>'
    + '<button onclick="if(confirm(\'只清空本地错误日志，不会影响笔记/账本/游戏数据。确认？\')){localStorage.removeItem(\'' + ERROR_LOG_KEY + '\');_devRefreshErrors();}" style="background:var(--bg3);border:1px solid var(--border);color:var(--amber);padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;margin-right:4px">🧹 清空本地错误日志</button>'
    + '<button onclick="_devClearRemoteErrors()" style="background:var(--bg3);border:1px solid var(--border);color:var(--amber);padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px">🧹 清空远程错误</button>'
    + '</div>'
    + '<div style="color:var(--dim);text-align:center;margin-top:8px">Ctrl+Shift+D 开关此面板</div>'
    + '</div>';
  document.body.appendChild(panel);

  // 异步加载远程错误
  _devRefreshErrors();
}

// 刷新远程错误
function _devRefreshErrors() {
  const btn = document.getElementById('dev-refresh-btn');
  if (btn) { btn.textContent = '⏳ 刷新中...'; btn.disabled = true; }
  const APPSCRIPT = 'https://script.google.com/macros/s/AKfycbyDR6xKzyevIhi3e1zgWC8KvnWH2JaB7ni7Eo_Md7SKknRASUOtRt8Hj_02470Z-CmV3w/exec';
  // 更新本地计数
  const localLog = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]');
  const localEl = document.getElementById('dev-err-local');
  if (localEl) localEl.textContent = localLog.length;

  // 拉取远程
  fetch(APPSCRIPT + '?action=err_list')
    .then(r => r.json())
    .then(log => {
      const el = document.getElementById('dev-err-remote');
      const list = document.getElementById('dev-err-list');
      if (el) el.textContent = Array.isArray(log) ? log.length : 0;
      if (list) {
        if (!Array.isArray(log) || log.length === 0) {
          list.innerHTML = '<span style="color:var(--green)">无远程错误 ✅</span>';
          return;
        }
        const recent = log.slice(-20).reverse();
        list.innerHTML = recent.map((e, i) =>
          '<div style="margin:3px 0;padding:4px 6px;background:var(--bg3);border-radius:4px;border-left:2px solid var(--red)">'
          + '<span style="color:var(--red)">' + esc(e.msg || '') + '</span><br>'
          + '<span style="color:var(--dim)">' + esc(e.src || '') + ':' + (e.line || 0)
          + ' | ' + (e.ts ? new Date(e.ts).toLocaleString() : '')
          + ' | UA: ' + esc((e.ua || '').slice(0, 40)) + '</span>'
          + '</div>'
        ).join('');
      }
      if (btn) { btn.textContent = '🔄 刷新 ✓'; btn.disabled = false; setTimeout(() => { if(btn) btn.textContent = '🔄 刷新'; }, 1500); }
    })
    .catch(() => {
      const el = document.getElementById('dev-err-remote');
      const list = document.getElementById('dev-err-list');
      if (el) el.textContent = '❌';
      if (list) list.innerHTML = '<span style="color:var(--red)">无法连接远程</span>';
      if (btn) { btn.textContent = '🔄 刷新 ✗'; btn.disabled = false; setTimeout(() => { if(btn) btn.textContent = '🔄 刷新'; }, 2000); }
    });
}

// 发送测试错误
function _devTestError() {
  var btn = document.querySelector('#dev-panel button');
  var url = 'https://script.google.com/macros/s/AKfycbyDR6xKzyevIhi3e1zgWC8KvnWH2JaB7ni7Eo_Md7SKknRASUOtRt8Hj_02470Z-CmV3w/exec?action=err_report&msg=DEV测试错误&src=dev-panel&line=0&ua=' + encodeURIComponent(navigator.userAgent.slice(0,60));
  new Image().src = url;
  // 也触发本地的 error handler
  setTimeout(() => { throw new Error('DEV测试错误 - 验证上报链路'); }, 100);
}

// 清空远程错误
function _devClearRemoteErrors() {
  const APPSCRIPT = 'https://script.google.com/macros/s/AKfycbyDR6xKzyevIhi3e1zgWC8KvnWH2JaB7ni7Eo_Md7SKknRASUOtRt8Hj_02470Z-CmV3w/exec';
  if (!confirm('确认清空所有远程错误日志？')) return;
  fetch(APPSCRIPT + '?action=err_clear').then(() => _devRefreshErrors()).catch(() => {});
}

// ═══════════════════════════════════════════════
// 共享状态
// ═══════════════════════════════════════════════
let token = null;
let driveFileId = null;
let ledgerFileId = null;

// cmd.book 状态
let entries = [];
let current = null;
let filterTag = null;
let noteFilter = 'cmd';     // 'cmd' | 'note' — 当前笔记模式
let isEditingNew = false;
let editSteps = [];
let draftTimer = null;

// Lightbox 状态
let lbImgs = [];
let lbIdx = 0;

// 账本状态
let ldgRecords = [];
let ldgCurrentMonth = new Date();
let ldgEditType = 'expense';
let ldgSelectedCat = '';
let ldgSelectedSubcat = '';
let ldgAmountStr = '0';
let ldgEditId = null;
let ldgCurrency = 'HKD';
let ldgDpYear = new Date().getFullYear();
let ldgDpMonth = new Date().getMonth();
let ldgDpSelectedDate = null;
let ldgRecordTs = null;
let ldgChartInst = null;

// 分类数据（用于账本）
const LDG_CATS = {
  expense: [
    {id:'food',name:'食品餐饮',icon:'🍜',subs:['早餐','午餐','晚餐','零食','外卖','聚餐']},
    {id:'transport',name:'出行交通',icon:'🚇',subs:['公共交通','打车','加油','停车','高铁','机票']},
    {id:'shopping',name:'购物消费',icon:'🛍',subs:['服装鞋帽','数码电器','日用品','化妆护肤','网购']},
    {id:'entertainment',name:'休闲娱乐',icon:'🎮',subs:['游戏','电影','旅游','运动健身','KTV']},
    {id:'home',name:'居家生活',icon:'🏠',subs:['家用','话费宽带','电费','水费','燃气费','物业费','房租还贷','车位费','家政清洁']},
    {id:'education',name:'文化教育',icon:'📚',subs:['学费','书报杂志','培训考试']},
    {id:'gift',name:'送礼人情',icon:'🎁',subs:['孝敬长辈','礼物','借出','红包','打赏']},
    {id:'health',name:'健康医疗',icon:'🏥',subs:['滋补保健','医院','买药']},
    {id:'other',name:'其他',icon:'📦',subs:['其他支出']},
  ],
  income: [
    {id:'salary',name:'工资',icon:'💼',subs:['基本工资','加班费']},
    {id:'bonus',name:'奖金',icon:'🏆',subs:['年终奖','绩效奖金']},
    {id:'parttime',name:'兼职外快',icon:'⚡',subs:['兼职','外快','接单']},
    {id:'invest',name:'理财盈利',icon:'📈',subs:['股票','基金','利息','分红']},
    {id:'redpacket',name:'红包',icon:'🧧',subs:['微信红包','收礼']},
    {id:'borrow',name:'借入',icon:'💰',subs:['借款']},
    {id:'prize',name:'中奖',icon:'🎯',subs:['彩票','抽奖']},
    {id:'gift_in',name:'礼金人情',icon:'🎀',subs:['亲友转账','礼金']},
    {id:'subsidy',name:'补贴',icon:'☀',subs:['政府补贴','报销']},
    {id:'secondhand',name:'二手闲置',icon:'♻',subs:['二手出售']},
    {id:'other_in',name:'其他',icon:'📦',subs:['其他收入']},
  ],
  transfer: [{id:'transfer',name:'转账',icon:'↔',subs:['银行转账','钱包转账']}],
};

// ═══════════════════════════════════════════════
// Toast / 确认框
// ═══════════════════════════════════════════════
let toastTimer;

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function appConfirm(msg, onOk, cancelText, okText) {
  const overlay = document.getElementById('app-confirm-overlay');
  const msgEl = document.getElementById('app-confirm-msg');
  const okBtn = document.getElementById('app-confirm-ok');
  const cancelBtn = document.getElementById('app-confirm-cancel');
  if (!overlay || !msgEl || !okBtn || !cancelBtn) return;
  msgEl.textContent = msg;
  okBtn.textContent = okText || '确定';
  cancelBtn.textContent = cancelText || '取消';
  overlay.classList.add('open');
  const close = () => overlay.classList.remove('open');
  okBtn.onclick = () => { close(); onOk(); };
  cancelBtn.onclick = close;
}

// ═══════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'short', day: 'numeric'
  }) + ' ' + d.toLocaleTimeString('zh-CN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function setSyncStatus(html) {
  const el = document.getElementById('sync-status');
  if (el) el.innerHTML = html;
}

// ═══════════════════════════════════════════════
// 标签切换
// ═══════════════════════════════════════════════
function switchTab(id) {
  const ids = ['cmdbook','ledger','calendar','news','game'];
  // 游戏模块激活/停用
  const activeMod = document.querySelector('.module.active');
  const prevId = activeMod ? activeMod.id.replace('mod-', '') : '';
  if (prevId === 'game' && id !== 'game' && typeof deactivateGame === 'function') deactivateGame();
  document.querySelectorAll('.tab').forEach((t, i) =>
    t.classList.toggle('active', ids[i] === id)
  );
  document.querySelectorAll('.module').forEach(m =>
    m.classList.toggle('active', m.id === 'mod-' + id)
  );
  if (id === 'game' && typeof activateGame === 'function') activateGame();
  if (id === 'ledger') {
    if (typeof ldgRenderList === 'function') ldgRenderList();
    if (typeof ldgRenderOverview === 'function') ldgRenderOverview();
  }
}

// ═══════════════════════════════════════════════
// 事件监听
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const searchEl = document.getElementById('search');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      filterTag = null;
      if (typeof renderList === 'function') renderList();
    });
  }
  // 随笔编辑器 — 输入时标记脏状态
  const contentEl = document.getElementById('f-content');
  if (contentEl) {
    contentEl.addEventListener('input', () => {
      if (typeof markDirtyContent === 'function') markDirtyContent();
    });
  }
});

// 页面关闭前尝试保存草稿 + 刷新 Drive 保存队列
window.addEventListener('beforeunload', () => {
  const editMode = document.getElementById('edit-mode');
  if (editMode && editMode.style.display !== 'none') {
    if (typeof _syncAllStepsFromDOM === 'function') _syncAllStepsFromDOM();
    if (typeof saveDraft === 'function') saveDraft();
  }
  // Web 版：尝试同步刷新待保存数据（navigator.sendBeacon 保证发送）
  if (typeof _flushBeforeUnload === 'function') _flushBeforeUnload();
});

// 初始化月份显示
document.addEventListener('DOMContentLoaded', () => {
  if (typeof ldgRenderMonthLabel === 'function') ldgRenderMonthLabel();
});

// ═══════════════════════════════════════════════
// 自动更新事件监听
// ═══════════════════════════════════════════════
if (window.electronAPI && typeof window.electronAPI.onUpdateStatus === 'function') {
  window.electronAPI.onUpdateStatus(function(data) {
    const el = document.getElementById('update-status');
    if (!el) return;

    switch (data.type) {
      case 'checking':
        el.textContent = '⏳';
        el.title = '检查更新中...';
        el.classList.remove('has-update');
        break;
      case 'available':
        el.textContent = '↓ ' + data.version;
        el.title = '正在下载 v' + data.version + '...';
        el.classList.add('has-update');
        if (typeof inboxAdd === 'function') inboxAdd('update', '⬆️ 发现新版本 v' + data.version, '正在自动下载更新，完成后重启即可。');
        break;
      case 'progress':
        el.textContent = '↓ ' + data.percent + '%';
        el.title = '下载中 ' + data.percent + '%';
        el.classList.add('has-update');
        break;
      case 'downloaded':
        el.textContent = '↻ 重启';
        el.title = '更新已下载，点击重启安装';
        el.classList.add('has-update');
        el.onclick = function() {
          if (window.electronAPI.installUpdate) window.electronAPI.installUpdate();
        };
        if (typeof inboxAdd === 'function') inboxAdd('update', '✅ 更新已就绪', '新版本已下载完成，点击右上角 ↻重启 即可安装。');
        break;
      case 'up-to-date':
        el.textContent = '✓';
        el.title = '已是最新版本';
        el.classList.remove('has-update');
        setTimeout(() => { el.textContent = ''; }, 3000);
        break;
      case 'error':
        el.textContent = '⚠';
        el.title = '更新失败: ' + (data.message || '');
        el.classList.remove('has-update');
        break;
    }
  });
}

// ═══════════════════════════════════════════════
// 随笔笔记 — 内容格式化
// ═══════════════════════════════════════════════
function renderContent(html) {
  // 渲染存储的 HTML — 只做基本安全过滤，允许 b/u/ul/ol/li/br/div
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  // 递归移除不允许的标签和属性
  function clean(node) {
    const allowTags = { B:1, U:1, I:1, UL:1, OL:1, LI:1, BR:1, DIV:1, P:1, SPAN:1, STRONG:1, EM:1 };
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];
      if (child.nodeType === 1) { // Element
        if (!allowTags[child.tagName]) {
          // 用文本节点替换不允许的元素
          node.replaceChild(document.createTextNode(child.textContent), child);
        } else {
          // 清除所有属性
          while (child.attributes.length > 0) {
            child.removeAttribute(child.attributes[0].name);
          }
          clean(child);
        }
      }
    }
  }
  clean(div);
  return div.innerHTML;
}

function stripHtml(html) {
  // 去除 HTML 标签，用于列表预览和搜索
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

// ═══════════════════════════════════════════════
// 格式化工具栏 — 使用 contenteditable execCommand
// ═══════════════════════════════════════════════
function execFmt(command, value) {
  const ed = document.getElementById('f-content');
  if (!ed) return;
  ed.focus();
  document.execCommand(command, false, value || null);
  markDirtyContent();
}

function markDirtyContent() {
  const el = document.getElementById('draft-indicator');
  if (el) {
    el.style.display = 'block';
    el.textContent = '⏳ 有未保存的更改...';
  }
}

// ═══════════════════════════════════════════════
// Ctrl+滚轮缩放（桌面端，会话内有效，重启恢复100%）
// ═══════════════════════════════════════════════
let _zoomFactor = 1;

function _applyZoom(factor) {
  _zoomFactor = Math.max(0.5, Math.min(2.0, Math.round(factor * 10) / 10));
  if (window.electronAPI && window.electronAPI.setZoom) {
    window.electronAPI.setZoom(_zoomFactor);
  }
}

// Ctrl+滚轮
window.addEventListener('wheel', (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  _applyZoom(_zoomFactor + (e.deltaY < 0 ? 0.1 : -0.1));
}, { passive: false });

// Ctrl+0 重置
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === '0') {
    e.preventDefault();
    _applyZoom(1);
  }
});

// ═══════════════════════════════════════════════
// 窗口分辨率切换
// ═══════════════════════════════════════════════
function changeResolution(val) {
  const [w, h] = val.split('x').map(Number)
  if (window.electronAPI && window.electronAPI.setWindowSize) {
    window.electronAPI.setWindowSize(w, h)
  }
  localStorage.setItem('omnia_win_res', val)
}

function updateResSelect() {
  const sel = document.getElementById('res-select')
  if (!sel) return
  // Web 版隐藏分辨率选择器（仅桌面端可用）
  if (!window.electronAPI || !window.electronAPI.setWindowSize) {
    sel.style.display = 'none'; return
  }
  const saved = localStorage.getItem('omnia_win_res')
  if (saved) {
    for (const opt of sel.options) {
      if (opt.value === saved) { sel.value = saved; return }
    }
  }
}

// 点击更新状态手动检查
document.addEventListener('DOMContentLoaded', () => {
  updateResSelect();
  if (typeof _initSidebarState === 'function') _initSidebarState();
  // 兜底：从 localStorage 读取邮箱检测开发者
  const savedEmail = localStorage.getItem('omnia_email');
  if (savedEmail && typeof _checkDevMode === 'function') _checkDevMode(savedEmail);
  const el = document.getElementById('update-status');
  if (el) {
    el.addEventListener('click', function() {
      if (this.textContent === '↻ 重启') return; // handled by onclick above
      if (window.electronAPI && window.electronAPI.checkForUpdates) {
        window.electronAPI.checkForUpdates();
      }
    });
  }
});
