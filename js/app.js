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
// 共享状态
// ═══════════════════════════════════════════════
let token = null;
let driveFileId = null;
let ledgerFileId = null;

// cmd.book 状态
let entries = [];
let current = null;
let filterTag = null;
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
  return new Date(ts).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'short', day: 'numeric'
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
      if (typeof renderList === 'function') renderList();
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

// 点击更新状态手动检查
document.addEventListener('DOMContentLoaded', () => {
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
