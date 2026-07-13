/* ═══════════════════════════════════════════════
   ledger.js — 账本模块
   依赖: app.js (全局变量, LDG_CATS, CURRENCIES)
         drive.js (ldgScheduleSave)
   ═══════════════════════════════════════════════
   功能: 记账 CRUD, 月视图, 统计图表, 日期选择器, 数字键盘
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════
// 页面切换
// ═══════════════════════════════════════════════
function ldgSwitchPage(page) {
  document.querySelectorAll('.ldg-subnav-btn').forEach((b, i) =>
    b.classList.toggle('active', ['home', 'stats'][i] === page)
  );
  document.querySelectorAll('.ldg-page').forEach(p =>
    p.classList.toggle('active', p.id === 'ldg-' + page)
  );
  document.getElementById('ldg-stats-month-label').textContent =
    document.getElementById('ldg-month-label').textContent;
  if (page === 'stats') ldgRenderStats();
}

// ═══════════════════════════════════════════════
// 月份管理
// ═══════════════════════════════════════════════
function ldgChangeMonth(dir) {
  ldgCurrentMonth = new Date(
    ldgCurrentMonth.getFullYear(),
    ldgCurrentMonth.getMonth() + dir,
    1
  );
  ldgRenderMonthLabel();
  ldgRenderList();
  ldgRenderOverview();
  document.getElementById('ldg-stats-month-label').textContent =
    document.getElementById('ldg-month-label').textContent;
}

function ldgRenderMonthLabel() {
  const y = ldgCurrentMonth.getFullYear();
  const m = ldgCurrentMonth.getMonth() + 1;
  const label = t().ldgMonthFmt(y, m);
  document.getElementById('ldg-month-label').textContent = label;
  document.getElementById('ldg-stats-month-label').textContent = label;
}

// ═══════════════════════════════════════════════
// 获取当月记录
// ═══════════════════════════════════════════════
function ldgGetMonthRecords() {
  const y = ldgCurrentMonth.getFullYear();
  const m = ldgCurrentMonth.getMonth();
  return ldgRecords.filter(r => {
    const d = new Date(r.ts);
    return d.getFullYear() === y && d.getMonth() === m;
  });
}

// ═══════════════════════════════════════════════
// 概览
// ═══════════════════════════════════════════════
function ldgRenderOverview() {
  const recs = ldgGetMonthRecords();
  const inc = recs.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const exp = recs.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const allInc = ldgRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const allExp = ldgRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const cur = CURRENCIES[ldgCurrency] || 'HK$';
  document.getElementById('ldg-ov-inc').textContent = inc.toFixed(2);
  document.getElementById('ldg-ov-exp').textContent = exp.toFixed(2);
  document.getElementById('ldg-ov-bal').textContent = (inc - exp).toFixed(2);
  document.getElementById('ldg-ov-total').textContent = (allInc - allExp).toFixed(2);
  document.getElementById('ldg-ov-currency').textContent = cur;
}

// ═══════════════════════════════════════════════
// 流水列表
// ═══════════════════════════════════════════════
function ldgRenderList() {
  ldgRenderMonthLabel();
  const recs = ldgGetMonthRecords().sort((a, b) => b.ts - a.ts);
  const el = document.getElementById('ldg-list');
  if (!recs.length) {
    el.innerHTML = '<div class="ldg-empty-state">'
      + '<div class="ei">💸</div>'
      + '<div>' + t().ldgEmptyMonth + '</div>'
      + '<div style="font-size:11px;color:var(--dim)">' + t().ldgEmptyHint + '</div></div>';
    return;
  }
  // 按日分组
  const groups = {};
  recs.forEach(r => {
    const d = new Date(r.ts);
    const key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  const cur = CURRENCIES[ldgCurrency] || 'HK$';
  el.innerHTML = Object.entries(groups).map(([key, dayRecs]) => {
    const [y, m, d] = key.split('-');
    const dateObj = new Date(+y, +m - 1, +d);
    const days = t().ldgDays;
    const dayInc = dayRecs.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const dayExp = dayRecs.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    const recHTML = dayRecs.map(r => {
      const cats = (t().cats || LDG_CATS)[r.type] || (t().cats || LDG_CATS).expense;
      const cat = cats.find(c => c.id === r.catId) || { icon: '📦', name: r.catId };
      const isExp = r.type === 'expense';
      return '<div class="ldg-record" onclick="ldgShowDetail(\'' + r.id + '\')">'
        + '<div class="ldg-rec-icon">' + cat.icon + '</div>'
        + '<div class="ldg-rec-info">'
        + '<div class="ldg-rec-cat">' + cat.name + (r.subcat ? ' · ' + esc(r.subcat) : '') + '</div>'
        + (r.note ? '<div class="ldg-rec-note">' + esc(r.note) + '</div>' : '')
        + '<div class="ldg-rec-time">'
        + new Date(r.ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        + '</div></div>'
        + '<div class="ldg-rec-amount ' + r.type + '">'
        + (isExp ? '-' : '+') + ' ' + cur + ' ' + r.amount.toFixed(2)
        + '</div></div>';
    }).join('');
    return '<div class="ldg-day-group">'
      + '<div class="ldg-day-header">'
      + '<div class="ldg-day-title">' + m + '月' + d + '日 周' + days[dateObj.getDay()] + '</div>'
      + '<div class="ldg-day-summary">'
      + (dayInc > 0 ? '<span class="ldg-day-inc">收 ' + dayInc.toFixed(2) + '</span>' : '')
      + (dayExp > 0 ? '<span class="ldg-day-exp">支 ' + dayExp.toFixed(2) + '</span>' : '')
      + '</div></div>'
      + '<div class="ldg-records">' + recHTML + '</div></div>';
  }).join('');
}

// ═══════════════════════════════════════════════
// 记账弹窗
// ═══════════════════════════════════════════════
function ldgOpenModal(editId) {
  ldgEditId = editId || null;
  if (editId) {
    const r = ldgRecords.find(x => x.id === editId);
    if (r) {
      ldgEditType = r.type;
      ldgSelectedCat = r.catId;
      ldgSelectedSubcat = r.subcat || '';
      ldgAmountStr = r.amount.toString();
      ldgCurrency = r.currency || 'HKD';
      ldgRecordTs = r.ts || null;
      document.getElementById('ldg-note').value = r.note || '';
    }
  } else {
    ldgEditType = 'expense';
    ldgSelectedCat = 'food';
    ldgSelectedSubcat = '';
    ldgAmountStr = '0';
    ldgRecordTs = null;
    document.getElementById('ldg-note').value = '';
  }
  document.getElementById('ldg-currency-sel').value = ldgCurrency;
  ldgUpdateDateLabel();
  document.getElementById('ldg-modal-overlay').classList.add('open');
  ldgRenderTypeBar();
  ldgRenderCats();
  ldgRenderKeypad();
  ldgUpdateAmountDisplay();
}

function ldgCloseModal() {
  document.getElementById('ldg-modal-overlay').classList.remove('open');
}

function ldgModalBgClick(e) {
  if (e.target === document.getElementById('ldg-modal-overlay')) ldgCloseModal();
}

// ═══════════════════════════════════════════════
// 类型 / 分类
// ═══════════════════════════════════════════════
function ldgSetType(t) {
  ldgEditType = t;
  ldgSelectedCat = LDG_CATS[t]?.[0]?.id || '';
  ldgSelectedSubcat = '';
  ldgRenderTypeBar();
  ldgRenderCats();
}

function ldgRenderTypeBar() {
  const map = { expense: '支出', income: '收入', transfer: '转账' };
  document.querySelectorAll('.ldg-type-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === map[ldgEditType]);
  });
}

function ldgRenderCats() {
  const cats = (t().cats || LDG_CATS)[ldgEditType] || [];
  if (!ldgSelectedCat && cats.length) ldgSelectedCat = cats[0].id;
  const selCat = cats.find(c => c.id === ldgSelectedCat) || cats[0];
  const mainHTML = cats.map(c =>
    '<div class="ldg-cat-item ' + (c.id === ldgSelectedCat ? 'active' : '') + '"'
    + ' onclick="ldgSelectCat(\'' + c.id + '\')">'
    + '<div class="ldg-cat-circle">' + c.icon + '</div>'
    + '<div class="ldg-cat-name">' + c.name + '</div></div>'
  ).join('');
  const subHTML = (selCat?.subs || []).map(s =>
    '<div class="ldg-subcat-item ' + (s === ldgSelectedSubcat ? 'active' : '') + '"'
    + ' onclick="ldgSelectSubcat(\'' + esc(s) + '\')">' + esc(s) + '</div>'
  ).join('');
  document.getElementById('ldg-cats-area').innerHTML =
    '<div class="ldg-cat-main">' + mainHTML + '</div>'
    + (subHTML ? '<div class="ldg-subcat">' + subHTML + '</div>' : '');
}

function ldgSelectCat(id) {
  ldgSelectedCat = id;
  ldgSelectedSubcat = '';
  ldgRenderCats();
}

function ldgSelectSubcat(s) {
  ldgSelectedSubcat = s === ldgSelectedSubcat ? '' : s;
  ldgRenderCats();
}

// ═══════════════════════════════════════════════
// 数字键盘
// ═══════════════════════════════════════════════
function ldgRenderKeypad() {
  const L2 = t();
  const keys = [
    '1','2','3','del',
    '4','5','6','+',
    '7','8','9','-',
    L2.ldgKeyAgain,'0','.',L2.ldgKeyConfirm
  ];
  document.getElementById('ldg-keypad').innerHTML = keys.map(k => {
    let cls = 'ldg-key';
    if (k === 'del') cls += ' del action';
    else if (k === L2.ldgKeyAgain || k === '再记' || k === '再記' || k === 'Add more') cls += ' action';
    else if (k === L2.ldgKeyConfirm || k === '确定' || k === '確定' || k === 'Done') cls += ' confirm';
    else if (['+', '-'].includes(k)) cls += ' action';
    return '<button class="' + cls + '" onclick="ldgKeyPress(\'' + esc(k) + '\')">' + esc(k) + '</button>';
  }).join('');
}

function ldgKeyPress(k) {
  if (k === 'del') {
    ldgAmountStr = ldgAmountStr.slice(0, -1) || '0';
  } else if (k === t().ldgKeyConfirm || k === '确定' || k === '確定' || k === 'Done') {
    ldgSaveRecord(false);
    return;
  } else if (k === t().ldgKeyAgain || k === '再记' || k === '再記' || k === 'Add more') {
    ldgSaveRecord(true);
    return;
  } else if (k === '.') {
    if (!ldgAmountStr.includes('.')) ldgAmountStr += '.';
  } else if (['+', '-'].includes(k)) {
    // 可扩展计算 — 目前无操作
  } else {
    if (ldgAmountStr === '0') ldgAmountStr = k;
    else ldgAmountStr += k;
  }
  ldgUpdateAmountDisplay();
}

function ldgUpdateAmountDisplay() {
  const cur = CURRENCIES[ldgCurrency] || 'HK$';
  const el = document.getElementById('ldg-amount-display');
  el.textContent = cur + ' ' + parseFloat(ldgAmountStr || 0).toFixed(2);
  el.className = 'ldg-amount-display ' + (ldgEditType === 'income' ? 'income' : 'expense');
}

function ldgUpdateCurrency() {
  ldgCurrency = document.getElementById('ldg-currency-sel').value;
  ldgUpdateAmountDisplay();
}

// ═══════════════════════════════════════════════
// 保存 / 删除记录
// ═══════════════════════════════════════════════
function ldgSaveRecord(again) {
  const amount = parseFloat(ldgAmountStr) || 0;
  if (amount <= 0) { toast(t().ldgNoAmount); return; }
  if (!ldgSelectedCat) { toast(t().ldgNoCat); return; }
  const note = document.getElementById('ldg-note').value.trim();

  if (ldgEditId) {
    const idx = ldgRecords.findIndex(r => r.id === ldgEditId);
    if (idx >= 0) {
      ldgRecords[idx] = {
        ...ldgRecords[idx],
        type: ldgEditType,
        catId: ldgSelectedCat,
        subcat: ldgSelectedSubcat,
        amount,
        note,
        currency: ldgCurrency,
        ts: ldgRecordTs || ldgRecords[idx].ts || Date.now()
      };
    }
  } else {
    ldgRecords.push({
      id: uid(),
      type: ldgEditType,
      catId: ldgSelectedCat,
      subcat: ldgSelectedSubcat,
      amount,
      note,
      currency: ldgCurrency,
      ts: ldgRecordTs || Date.now()
    });
  }

  ldgScheduleSave();
  ldgRenderList();
  ldgRenderOverview();
  toast(t().ldgSaved);

  if (again) {
    ldgAmountStr = '0';
    ldgRecordTs = null;
    document.getElementById('ldg-note').value = '';
    ldgUpdateAmountDisplay();
    ldgUpdateDateLabel();
  } else {
    ldgCloseModal();
  }
}

function ldgShowDetail(id) {
  const r = ldgRecords.find(x => x.id === id);
  if (!r) return;
  const cats = (t().cats || LDG_CATS)[r.type] || (t().cats || LDG_CATS).expense;
  const cat = cats.find(c => c.id === r.catId) || { icon: '📦', name: r.catId };
  const cur = CURRENCIES[r.currency || 'HKD'] || 'HK$';
  const isExp = r.type === 'expense';
  const d = new Date(r.ts);
  document.getElementById('ldg-detail-box').innerHTML =
    '<div class="ldg-detail-header">'
    + '<div class="ldg-detail-icon">' + cat.icon + '</div>'
    + '<div><div class="ldg-detail-cat">' + cat.name
    + (r.subcat ? ' · ' + esc(r.subcat) : '') + '</div></div>'
    + '<div class="ldg-detail-amount ' + r.type + '">'
    + (isExp ? '-' : '+') + ' ' + cur + ' ' + r.amount.toFixed(2) + '</div></div>'
    + '<div class="ldg-detail-rows">'
    + '<div class="ldg-detail-row"><span class="ldg-detail-row-label">' + t().ldgDetailDate + '</span>'
    + '<span class="ldg-detail-row-val">' + d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 '
    + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + '</span></div>'
    + '<div class="ldg-detail-row"><span class="ldg-detail-row-label">' + t().ldgDetailCurrency + '</span>'
    + '<span class="ldg-detail-row-val">' + cur + '</span></div>'
    + '<div class="ldg-detail-row"><span class="ldg-detail-row-label">' + t().ldgDetailNote + '</span>'
    + '<span class="ldg-detail-row-val">' + (r.note || t().ldgDetailNone) + '</span></div>'
    + '<div class="ldg-detail-row"><span class="ldg-detail-row-label">' + t().ldgDetailType + '</span>'
    + '<span class="ldg-detail-row-val">' + (t().typeNames[r.type] || r.type) + '</span></div></div>'
    + '<div class="ldg-detail-actions">'
    + '<button class="ldg-detail-action-btn del-btn" onclick="ldgConfirmDelete(\'' + r.id + '\')">'
    + t().ldgDetailDel + '</button>'
    + '<button class="ldg-detail-action-btn edit-btn" onclick="ldgCloseDetail();ldgOpenModal(\'' + r.id + '\')">'
    + '✏ ' + (t().ldgDetailEdit || '编辑') + '</button>'
    + '<button class="ldg-detail-action-btn close-btn" onclick="ldgCloseDetail()">'
    + t().ldgDetailClose + '</button></div>';
  document.getElementById('ldg-detail-modal').classList.add('open');
}

function ldgCloseDetail() {
  document.getElementById('ldg-detail-modal').classList.remove('open');
}

function ldgConfirmDelete(id) {
  appConfirm(
    t().ldgDeleteConfirm,
    () => ldgDeleteRecord(id),
    t().ldgDetailClose || '取消',
    t().ldgDetailDel || '删除'
  );
}

function ldgDeleteRecord(id) {
  ldgRecords = ldgRecords.filter(r => r.id !== id);
  ldgScheduleSave();
  ldgRenderList();
  ldgRenderOverview();
  ldgCloseDetail();
  toast(t().ldgDeleted);
}

// ═══════════════════════════════════════════════
// 统计页面
// ═══════════════════════════════════════════════
function ldgRenderStats() {
  const recs = ldgGetMonthRecords();
  const inc = recs.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const exp = recs.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const bal = inc - exp;
  const cur = CURRENCIES[ldgCurrency] || 'HK$';

  // 支出按分类汇总
  const expByCat = {};
  recs.filter(r => r.type === 'expense').forEach(r => {
    const cats = (t().cats || LDG_CATS).expense;
    const cat = cats.find(c => c.id === r.catId) || { id: r.catId, name: r.catId, icon: '📦' };
    if (!expByCat[r.catId]) expByCat[r.catId] = { name: cat.name, icon: cat.icon, amount: 0 };
    expByCat[r.catId].amount += r.amount;
  });
  const catList = Object.values(expByCat).sort((a, b) => b.amount - a.amount);
  const maxAmt = catList[0]?.amount || 1;

  // 按日汇总
  const daysInMonth = new Date(ldgCurrentMonth.getFullYear(), ldgCurrentMonth.getMonth() + 1, 0).getDate();
  const dailyExp = Array(daysInMonth).fill(0);
  const dailyInc = Array(daysInMonth).fill(0);
  recs.forEach(r => {
    const day = new Date(r.ts).getDate() - 1;
    if (r.type === 'expense') dailyExp[day] += r.amount;
    else if (r.type === 'income') dailyInc[day] += r.amount;
  });
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 报表明细
  const reportDays = {};
  recs.forEach(r => {
    const d = new Date(r.ts);
    const key = (d.getMonth() + 1) + '-' + String(d.getDate()).padStart(2, '0');
    if (!reportDays[key]) reportDays[key] = { inc: 0, exp: 0 };
    if (r.type === 'income') reportDays[key].inc += r.amount;
    else if (r.type === 'expense') reportDays[key].exp += r.amount;
  });
  const reportHTML = Object.entries(reportDays)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([d, v]) =>
      '<tr><td>' + d + '</td><td class="inc">' + v.inc.toFixed(2)
      + '</td><td class="exp">' + v.exp.toFixed(2)
      + '</td><td class="' + ((v.inc - v.exp) < 0 ? 'neg' : '') + '">'
      + (v.inc - v.exp).toFixed(2) + '</td></tr>'
    ).join('');

  const catBreakdownHTML = catList.map(c =>
    '<div class="ldg-cat-row">'
    + '<div class="ldg-cat-row-icon">' + c.icon + '</div>'
    + '<div class="ldg-cat-row-name">' + c.name + '</div>'
    + '<div class="ldg-cat-row-bar-wrap"><div class="ldg-cat-row-bar" style="width:'
    + ((c.amount / maxAmt * 100).toFixed(0)) + '%"></div></div>'
    + '<div class="ldg-cat-row-pct">' + (exp > 0 ? (c.amount / exp * 100).toFixed(0) : 0) + '%</div>'
    + '<div class="ldg-cat-row-amt">-' + c.amount.toFixed(2) + '</div></div>'
  ).join('');

  document.getElementById('ldg-stats-scroll').innerHTML =
    '<div class="ldg-stat-summary">'
    + '<div class="ldg-stat-sum-item"><div class="ldg-stat-sum-label">月支出</div>'
    + '<div class="ldg-stat-sum-val exp">' + exp.toFixed(2) + '</div></div>'
    + '<div class="ldg-stat-sum-item"><div class="ldg-stat-sum-label">月收入</div>'
    + '<div class="ldg-stat-sum-val inc">' + inc.toFixed(2) + '</div></div>'
    + '<div class="ldg-stat-sum-item"><div class="ldg-stat-sum-label">月结余</div>'
    + '<div class="ldg-stat-sum-val bal ' + (bal < 0 ? 'exp' : '') + '">'
    + bal.toFixed(2) + '</div></div></div>'
    + '<div class="ldg-stat-card">'
    + '<div class="ldg-stat-card-title">收支统计</div>'
    + '<canvas id="ldg-bar-chart" class="ldg-chart"></canvas></div>'
    + (catList.length
      ? '<div class="ldg-stat-card"><div class="ldg-stat-card-title">支出占比</div>'
        + '<div style="display:flex;gap:16px;align-items:center">'
        + '<canvas id="ldg-pie-chart" style="max-width:180px;max-height:180px"></canvas>'
        + '<div class="ldg-cat-breakdown" style="flex:1">' + catBreakdownHTML + '</div></div></div>'
      : '')
    + '<div class="ldg-stat-card"><div class="ldg-stat-card-title">报表统计</div>'
    + '<table class="ldg-report-table"><thead><tr>'
    + '<th>' + t().ldgReportDate + '</th><th>' + t().ldgReportInc + '</th>'
    + '<th>' + t().ldgReportExp + '</th><th>' + t().ldgReportBal + '</th>'
    + '</tr></thead><tbody>'
    + (reportHTML || '<tr><td colspan="4" style="text-align:center;color:var(--dim);padding:16px">'
      + t().ldgReportEmpty + '</td></tr>')
    + '</tbody></table></div>';

  // 渲染图表
  requestAnimationFrame(() => {
    const barCtx = document.getElementById('ldg-bar-chart')?.getContext('2d');
    if (barCtx) {
      if (ldgChartInst) ldgChartInst.destroy();
      ldgChartInst = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: '支出', data: dailyExp, backgroundColor: 'rgba(224,108,108,.7)', borderRadius: 2 },
            { label: '收入', data: dailyInc, backgroundColor: 'rgba(62,207,176,.5)', borderRadius: 2 }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#8b949e', font: { size: 11 } } } },
          scales: {
            x: { ticks: { color: '#8b949e', font: { size: 10 } }, grid: { color: '#30363d' } },
            y: { ticks: { color: '#8b949e', font: { size: 10 } }, grid: { color: '#30363d' } }
          }
        }
      });
    }
    const pieCtx = document.getElementById('ldg-pie-chart')?.getContext('2d');
    if (pieCtx && catList.length) {
      new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: catList.map(c => c.name),
          datasets: [{
            data: catList.map(c => c.amount),
            backgroundColor: ['#e06c6c','#3ecfb0','#d29922','#7ee787','#61afef','#c678dd','#e5c07b','#56b6c2','#abb2bf'],
            borderWidth: 0
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, cutout: '60%' }
      });
    }
  });
}

// ═══════════════════════════════════════════════
// 日期选择器
// ═══════════════════════════════════════════════
function ldgDpOpen() {
  const base = ldgRecordTs ? new Date(ldgRecordTs) : new Date();
  ldgDpYear = base.getFullYear();
  ldgDpMonth = base.getMonth();
  ldgDpSelectedDate = ldgRecordTs ? new Date(ldgRecordTs) : null;
  ldgDpRender();
  document.getElementById('ldg-dp-overlay').classList.add('open');
}

function ldgDpClose() {
  document.getElementById('ldg-dp-overlay').classList.remove('open');
}

function ldgDpConfirm() {
  if (ldgDpSelectedDate) {
    const d = ldgDpSelectedDate;
    const existing = ldgRecordTs ? new Date(ldgRecordTs) : new Date();
    d.setHours(existing.getHours() || 12, existing.getMinutes() || 0, 0, 0);
    ldgRecordTs = d.getTime();
    ldgUpdateDateLabel();
  }
  ldgDpClose();
}

function ldgUpdateDateLabel() {
  const el = document.getElementById('ldg-date-label');
  if (!el) return;
  if (!ldgRecordTs) { el.textContent = t().ldgToday || '今天'; return; }
  const d = new Date(ldgRecordTs);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    el.textContent = t().ldgToday || '今天';
  } else {
    el.textContent = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
  }
}

function ldgDpNav(dir) {
  ldgDpMonth += dir;
  if (ldgDpMonth < 0) { ldgDpMonth = 11; ldgDpYear--; }
  if (ldgDpMonth > 11) { ldgDpMonth = 0; ldgDpYear++; }
  ldgDpRender();
}

function ldgDpSelectDay(y, m, d) {
  ldgDpSelectedDate = new Date(y, m, d);
  ldgDpRender();
}

function ldgDpRender() {
  const L = t();
  const weekdays = L.ldgDays || ['日','一','二','三','四','五','六'];
  const titleEl = document.getElementById('ldg-dp-title');
  if (titleEl) {
    titleEl.textContent = L.ldgMonthFmt
      ? L.ldgMonthFmt(ldgDpYear, ldgDpMonth + 1)
      : ldgDpYear + '年 ' + (ldgDpMonth + 1) + '月';
  }
  const wdEl = document.getElementById('ldg-dp-weekdays');
  if (wdEl) wdEl.innerHTML = weekdays.map(w => '<div class="ldg-dp-wd">' + w + '</div>').join('');

  const firstDay = new Date(ldgDpYear, ldgDpMonth, 1).getDay();
  const daysInMonth = new Date(ldgDpYear, ldgDpMonth + 1, 0).getDate();
  const today = new Date();
  const sel = ldgDpSelectedDate;

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="ldg-dp-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === ldgDpYear
      && today.getMonth() === ldgDpMonth
      && today.getDate() === d;
    const isSel = sel
      && sel.getFullYear() === ldgDpYear
      && sel.getMonth() === ldgDpMonth
      && sel.getDate() === d;
    const cls = ['ldg-dp-day', isToday ? 'today' : '', isSel ? 'selected' : '']
      .filter(Boolean).join(' ');
    html += '<div class="' + cls + '" onclick="ldgDpSelectDay('
      + ldgDpYear + ',' + ldgDpMonth + ',' + d + ')">' + d + '</div>';
  }

  const daysEl = document.getElementById('ldg-dp-days');
  if (daysEl) daysEl.innerHTML = html;

  const cancelBtn = document.querySelector('.ldg-dp-cancel');
  const confirmBtn = document.querySelector('.ldg-dp-confirm');
  if (cancelBtn) cancelBtn.textContent = L.ldgDetailClose || '取消';
  if (confirmBtn) confirmBtn.textContent = L.ldgKeyConfirm || '确定';
}
