const fs = require('fs');
const path = 'C:/Users/jefffan/Desktop/Omnia/cmdbook-desktop/js/sect.js';
let js = fs.readFileSync(path, 'utf8');

// Fix _renderMain topbar
js = js.replace(
  "    const ye = document.getElementById('sct-year');\n    if (se) se.textContent = this.spiritStones;\n    if (re) re.textContent = this.reputation;\n    if (te) te.textContent = this.turn;\n    if (ye) ye.textContent = this._year();",
  "    if (se) se.textContent = this.spiritStones;\n    if (re) re.textContent = this.reputation;\n    if (te) te.textContent = this.turn + ' (' + this._year() + '年)';"
);

// Replace _renderDisciples
const oldRender = `  _renderDisciples() {
    const grid = document.getElementById('sct-disciple-grid');
    if (!grid) return;
    const maxD = this._maxDisc();

    if (this.disciples.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--dim);font-size:13px">尚无弟子<br><span style="font-size:11px;opacity:.6">点击右侧「招募弟子」或等待事件触发</span></div>';
      return;
    }

    grid.innerHTML = this.disciples.map(d => {`;

const oldRender2 = `      const q = SECT_QUALITIES.find(qq => qq.key === d.quality) || SECT_QUALITIES[0];
      const sel = this.selectedDiscId === d.id ? ' selected' : '';
      const taskCls = d.task || 'none';
      const taskName = d.task ? SECT_TASKS.find(t => t.key === d.task)?.name || '未分配' : '未分配';
      const r = d.realm;
      const nextR = d.realmIdx < SECT_REALMS.length - 1 ? SECT_REALMS[d.realmIdx + 1] : null;
      const cultPct = nextR && nextR.cost > 0 ? Math.min(100, Math.round(d.cultivation / nextR.cost * 100)) : 100;
      const statusMark = d.status !== '正常' ? ' ⚠' + d.status : '';

      return '<div class="sct-disciple-card q-' + q.key + sel + '" onclick="SECT._selectDisciple(\\'' + d.id + '\\')">'
        + '<div class="dc-header">'
        + '<span class="dc-name">' + d.name + statusMark + '</span>'
        + '<span class="dc-quality" style="color:' + q.color + '">' + d.qualityName + '</span>'
        + '</div>'
        + '<div class="dc-cultivation">' + r.name + ' ' + cultPct + '%</div>'
        + '<div class="dc-stats">'
        + '<span>根' + d.rootBone + '</span>'
        + '<span>悟' + d.comprehension + '</span>'
        + '<span>体' + d.physique + '</span>'
        + '<span>魅' + d.charm + '</span>'
        + '</div>'
        + '<div class="dc-loyalty">忠' + d.loyalty + ' | 心魔' + d.innerDemon + '</div>'
        + '<div style="font-size:9px;color:var(--amber);margin-top:2px">' + (d.backstoryName || '') + ' · ' + d.traits.map(tt => tt.name).join(' ') + '</div>'
        + '<select class="sct-task-select" onclick="event.stopPropagation()" onchange="SECT._assignTask(\\'' + d.id + '\\', this.value)">'
        + '<option value=""' + (d.task ? '' : ' selected') + '>-- 选择任务 --</option>'
        + SECT_TASKS.map(t => '<option value="' + t.key + '"' + (d.task === t.key ? ' selected' : '') + '>' + t.icon + ' ' + t.name + '</option>').join('')
        + '</select>'
        + '</div>';
    }).join('');
  },`;

if (js.includes(oldRender)) {
  console.log('Found old _renderDisciples start');
  const idx = js.indexOf(oldRender);
  // Find the end of the function (the closing `},`)
  const endIdx = js.indexOf(oldRender2, idx);
  if (endIdx > 0) {
    const fullEnd = endIdx + oldRender2.length;
    const newFn = `  _renderDisciples() {
    const list = document.getElementById('sct-disciple-list');
    if (!list) return;

    if (this.disciples.length === 0) {
      list.innerHTML = '<div class="sct-empty-hint">尚无弟子<br>点击右侧「招募弟子」</div>';
      return;
    }

    list.innerHTML = this.disciples.map(d => {
      const q = SECT_QUALITIES.find(qq => qq.key === d.quality) || SECT_QUALITIES[0];
      const r = d.realm;
      const nextR = d.realmIdx < SECT_REALMS.length - 1 ? SECT_REALMS[d.realmIdx + 1] : null;
      const cultPct = nextR && nextR.cost > 0 ? Math.min(100, Math.round(d.cultivation / nextR.cost * 100)) : 100;
      const realmCls = d.loyalty >= 80 ? 'fine' : d.loyalty >= 50 ? 'superior' : d.loyalty >= 25 ? 'elite' : 'mortal';
      const statusMark = d.status !== '正常' ? ' ⚠' + d.status : '';

      return '<div class="sct-disc-card q-' + q.key + '" onclick="SECT._selectDisciple(\\'' + d.id + '\\')">'
        + '<div class="dc-realm ' + realmCls + '">' + r.name + '</div>'
        + '<div class="dc-name-row">'
        + '<span class="dc-name">' + d.name + statusMark + '</span>'
        + '<span class="dc-quality" style="color:' + q.color + '">' + d.qualityName + '</span>'
        + '<span style="font-size:7px;color:var(--dim)">' + cultPct + '%</span>'
        + '</div>'
        + '<div class="dc-stats-row">'
        + '<span class="dc-stat">根<b>' + d.rootBone + '</b></span>'
        + '<span class="dc-stat">悟<b>' + d.comprehension + '</b></span>'
        + '<span class="dc-stat">体<b>' + d.physique + '</b></span>'
        + '<span class="dc-stat">魅<b>' + d.charm + '</b></span>'
        + '</div>'
        + '<div class="dc-task-row">'
        + '<span class="dc-bg">' + (d.backstoryName || '') + '</span>'
        + '<select class="sct-task-select" onclick="event.stopPropagation()" onchange="SECT._assignTask(\\'' + d.id + '\\', this.value)">'
        + '<option value=""' + (d.task ? '' : ' selected') + '>--</option>'
        + SECT_TASKS.map(t => '<option value="' + t.key + '"' + (d.task === t.key ? ' selected' : '') + '>' + t.name + '</option>').join('')
        + '</select>'
        + '</div>'
        + '</div>';
    }).join('');
  },`;
    js = js.slice(0, idx) + newFn + js.slice(fullEnd);
    console.log('Replaced _renderDisciples');
  } else {
    console.log('Could not find end of _renderDisciples');
  }
} else {
  console.log('Could not find _renderDisciples start');
}

// Remove the old sct-year line reference in _renderMain if it still exists
js = js.replace("    const ye = document.getElementById('sct-year');\n", "");

fs.writeFileSync(path, js);
console.log('OK - JS updated');
