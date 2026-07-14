/* ═══════════════════════════════════════════════
   cmdbook.js — cmd.book 笔记模块
   依赖: app.js (全局变量, uid, esc, fmtDate 等)
         drive.js (scheduleSave)
   ═══════════════════════════════════════════════
   功能: 条目 CRUD, 列表/视图, 编辑/草稿, 图片灯箱, 导入/导出
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════
// 笔记模式切换
// ═══════════════════════════════════════════════
function setNoteFilter(type) {
  noteFilter = type;
  const L = t();
  // 更新 tab 高亮
  document.getElementById('mode-tab-cmd').classList.toggle('active', type === 'cmd');
  document.getElementById('mode-tab-note').classList.toggle('active', type === 'note');
  // 更新新建按钮文字
  const addBtn = document.getElementById('add-btn');
  if (addBtn) addBtn.textContent = type === 'cmd' ? L.cbNewCmd : L.cbNewNote;
  // 更新搜索框 placeholder
  const search = document.getElementById('search');
  if (search) search.placeholder = type === 'cmd' ? L.cbSearch : L.cbSearchNote;
  // 关闭当前编辑器并重渲染
  if (document.getElementById('edit-mode').style.display !== 'none') {
    stopDraftTimer();
  }
  current = null;
  renderList();
  if (entries.length > 0) {
    const firstOfType = entries.find(e => (e.type || 'cmd') === noteFilter);
    if (firstOfType) showEntry(firstOfType.id);
    else showEmpty();
  } else {
    showEmpty();
  }
  updateTagFilters();
}

// ═══════════════════════════════════════════════
// 列表与过滤器
// ═══════════════════════════════════════════════
function renderList() {
  const q = document.getElementById('search').value.toLowerCase();
  const filtered = entries.filter(e => {
    const eType = e.type || 'cmd';
    const typeMatch = q ? true : eType === noteFilter;
    const mt = !filterTag || (e.tags || []).some(t => t.toLowerCase() === filterTag.toLowerCase());
    const allCmds = (e.steps || []).map(s => s.cmd).join(' ');
    const content = e.content || '';
    const mq = !q
      || (e.title || '').toLowerCase().includes(q)
      || allCmds.toLowerCase().includes(q)
      || (e.desc || '').toLowerCase().includes(q)
      || content.toLowerCase().includes(q) || (e.tags || []).some(t => t.toLowerCase().includes(q));
    return typeMatch && mt && mq;
  });
  const L = t();
  updateTagFilters();
  document.getElementById('count-line').textContent =
    filtered.length + ' / ' + entries.length + ' 条';
  document.getElementById('list').innerHTML = filtered.map(e => {
    const eType = e.type || 'cmd';
    const isCmd = eType === 'cmd';
    const firstCmd = (e.steps || [])[0]?.cmd || '';
    const preview = isCmd
      ? (firstCmd ? '<div class="e-cmd-preview">$ ' + esc(firstCmd) + '</div>' : '')
      : '<div class="e-note-preview">' + esc(stripHtml(e.content || '').split('\n')[0] || L.cbNoTitle) + '</div>';
    return '<div class="e-item ' + (current?.id === e.id ? 'active' : '')
      + '" onclick="showEntry(\'' + e.id + '\')">'
      + '<div class="e-title">' + esc(e.title || L.cbNoTitle) + '</div>'
      + preview
      + '<div class="e-date">' + fmtDate(e.ts) + '</div>'
      + (filterTag && (e.tags||[]).includes(filterTag) ? '<div class="tags-row" style="margin-top:4px"><span class="tag-badge" style="font-size:10px;padding:1px 6px">' + esc(filterTag) + '</span></div>' : '') + '</div>';
  }).join('');
}

function updateTagFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  let source;
  if (q) {
    source = entries.filter(e => {
      const ac = (e.steps || []).map(s => s.cmd).join(' ');
      const ct = e.content || '';
      return (e.title || '').toLowerCase().includes(q) || ac.toLowerCase().includes(q) || (e.desc || '').toLowerCase().includes(q) || ct.toLowerCase().includes(q) || (e.tags || []).some(t => t.toLowerCase().includes(q));
    });
  } else {
    source = entries.slice().sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,3);
  }
  const raw = [...new Set(source.flatMap(e => e.tags || []))];
  const all = q ? raw.filter(t => t.toLowerCase().includes(q)) : raw;
  document.getElementById('tags-wrap').innerHTML = all.map(t =>
    '<span class="tag-filter ' + (filterTag && filterTag.toLowerCase() === t.toLowerCase() ? 'active' : '')
    + '" onclick="setFilter(\'' + esc(t) + '\')">' + esc(t) + '</span>'
  ).join('');
}

function setFilter(t) {
  filterTag = filterTag === t ? null : t;
  updateTagFilters();
  renderList();
}

// ═══════════════════════════════════════════════
// 显示条目
// ═══════════════════════════════════════════════
function showEmpty() {
  document.getElementById('empty').style.display = 'flex';
  document.getElementById('view-mode').style.display = 'none';
  document.getElementById('edit-mode').style.display = 'none';
}

function showEntry(id) {
  current = entries.find(e => e.id === id);
  if (!current) return;

  document.getElementById('edit-mode').style.display = 'none';
  document.getElementById('empty').style.display = 'none';
  document.getElementById('view-mode').style.display = 'block';

  const eType = current.type || 'cmd';
  const L = t();

  if (eType === 'note') {
    // ── 随笔笔记视图 ──
    document.getElementById('view-mode').innerHTML =
      (current.title
        ? '<div class="view-title">' + esc(current.title) + '</div>'
        : '')
      + '<div class="note-body">' + renderContent(current.content || '') + '</div>'
      + ((current.tags || []).length
        ? '<div class="tags-row">'
          + (current.tags || []).map(t =>
              '<span class="tag-badge">' + esc(t) + '</span>'
            ).join('')
          + '</div>'
        : '')
      + '<div class="meta-line">' + L.cbRecordedAt + ' ' + fmtDate(current.ts) + '</div>';
  } else {
    // ── 命令笔记视图 (现有逻辑) ──
    const steps = current.steps || [];
    if (current.imgs?.length && !steps[0]?.imgs?.length) {
      if (steps[0]) steps[0].imgs = current.imgs;
    }
    lbImgs = steps.flatMap(s => s.imgs || []);

    let lbOffset = 0;
    const stepsHTML = steps.map((s, si) => {
      const sImgs = s.imgs || [];
      const thumbs = sImgs.map((src, ii) => {
        const globalIdx = lbOffset + ii;
        return '<img class="term-img-thumb" src="' + src
          + '" onclick="openLightboxAt(' + globalIdx + ')"/>';
      }).join('');
      lbOffset += sImgs.length;
      return '<div class="term-block" data-step-index="' + si + '">'
        + '<div class="term-cmd-row">'
        + '<span class="term-prompt">$</span>'
        + '<span class="term-cmd" title="双击编辑">' + esc(s.cmd) + '</span>'
        + '<button class="term-copy" onclick="inlineEditStep(' + si + ')" title="编辑此步骤">编辑</button>'
        + '</div>'
        + (s.output ? '<div class="term-output" title="双击编辑">' + esc(s.output) + '</div>' : '')
        + (sImgs.length ? '<div class="term-imgs">' + thumbs + '</div>' : '')
        + '</div>';
    }).join('');

    document.getElementById('view-mode').innerHTML =
      (current.title
        ? '<div class="view-title">' + esc(current.title) + '</div>'
        : '')
      + '<div style="margin-bottom:16px">' + stepsHTML + '</div>'
      + (current.desc
        ? '<div style="margin-bottom:16px"><div class="sec-label">' + L.cbScenario + '</div>'
          + '<div class="scenario" title="双击编辑">' + esc(current.desc) + '</div></div>'
        : '')
      + ((current.tags || []).length
        ? '<div class="tags-row">'
          + (current.tags || []).map(t =>
              '<span class="tag-badge">' + esc(t) + '</span>'
            ).join('')
          + '</div>'
        : '')
      + '<div class="meta-line">' + L.cbRecordedAt + ' ' + fmtDate(current.ts) + '</div>';
  }

  renderList();
}

function copyStep(i) {
  const s = (current?.steps || [])[i];
  if (!s) return;
  navigator.clipboard.writeText(s.cmd);
  toast(t().cbCopied);
}

// ═══════════════════════════════════════════════
// 就地编辑 (Inline Edit)
// ═══════════════════════════════════════════════
function inlineEditStep(i) {
  const block = document.querySelector('.term-block[data-step-index="' + i + '"]');
  if (!block || !current?.steps?.[i]) return;

  const s = current.steps[i];
  const cmd = esc(s.cmd);
  const output = esc(s.output || '');
  const imgs = s.imgs || [];

  block.classList.add('editing');
  block.innerHTML =
    '<div class="term-cmd-row">'
    + '<span class="term-prompt">$</span>'
    + '<textarea class="term-cmd-edit" rows="1" placeholder="输入命令..."'
    + ' oninput="autoResize(this)">' + cmd + '</textarea>'
    + '<button class="term-save" onclick="inlineSaveStep(' + i + ')" title="保存">✔</button>'
    + '<button class="term-cancel" onclick="inlineCancelStep(' + i + ')" title="取消">✕</button>'
    + '</div>'
    + '<div class="step-out-wrap" style="padding:8px 12px">'
    + '<textarea class="term-output-edit" rows="2" placeholder="输出结果（可选）..."'
    + ' oninput="autoResize(this)">' + output + '</textarea></div>'
    + (imgs.length
      ? '<div class="term-imgs">'
        + imgs.map(src => '<img class="term-img-thumb" src="' + src + '"/>').join('')
        + '</div>'
      : '');

  // 聚焦命令输入框
  const cmdInput = block.querySelector('.term-cmd-edit');
  if (cmdInput) {
    cmdInput.focus();
    autoResize(cmdInput);
  }
  const outInput = block.querySelector('.term-output-edit');
  if (outInput) autoResize(outInput);
}

function inlineSaveStep(i) {
  const block = document.querySelector('.term-block[data-step-index="' + i + '"]');
  if (!block || !current?.steps?.[i]) return;

  const cmd = block.querySelector('.term-cmd-edit')?.value?.trim() || '';
  const output = block.querySelector('.term-output-edit')?.value || '';

  if (!cmd) {
    toast('命令不能为空');
    return;
  }

  current.steps[i].cmd = cmd;
  current.steps[i].output = output;
  // 更新 entries 引用
  const idx = entries.findIndex(e => e.id === current.id);
  if (idx >= 0) entries[idx] = current;

  showEntry(current.id);
  scheduleSave();
  toast('✅ 步骤已更新');
}

function inlineCancelStep(i) {
  // 直接重新渲染视图，丢弃编辑
  showEntry(current.id);
}

// 双击触发就地编辑（通过事件代理）
document.addEventListener('dblclick', function(e) {
  // 点击 .term-cmd 或 .term-output 时触发对应步骤的就地编辑
  const block = e.target.closest('.term-block');
  if (block && current) {
    const idx = block.getAttribute('data-step-index');
    if (idx !== null && !block.classList.contains('editing')) {
      inlineEditStep(parseInt(idx));
      return;
    }
  }
  // 双击标题进入完整编辑模式
  if (e.target.closest('.view-title') && current) {
    enterEdit();
  }
});

// ═══════════════════════════════════════════════
// 灯箱 (Lightbox)
// ═══════════════════════════════════════════════
function openLightboxAt(idx) {
  lbIdx = idx;
  document.getElementById('lightbox').classList.add('open');
  lbShow();
  document.addEventListener('keydown', lbKeydown);
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lb-img').classList.remove('zoomed');
  document.removeEventListener('keydown', lbKeydown);
}

function lbBgClick(e) {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
}

function lbShow() {
  document.getElementById('lb-img').src = lbImgs[lbIdx];
  document.getElementById('lb-img').classList.remove('zoomed');
  document.getElementById('lb-counter').textContent =
    (lbIdx + 1) + ' / ' + lbImgs.length;
  document.getElementById('lb-prev').disabled = lbIdx === 0;
  document.getElementById('lb-next').disabled = lbIdx === lbImgs.length - 1;
}

function lbNav(dir) {
  lbIdx = Math.max(0, Math.min(lbImgs.length - 1, lbIdx + dir));
  lbShow();
}

function toggleZoom() {
  document.getElementById('lb-img').classList.toggle('zoomed');
}

function lbKeydown(e) {
  if (e.key === 'ArrowLeft') lbNav(-1);
  else if (e.key === 'ArrowRight') lbNav(1);
  else if (e.key === 'Escape') closeLightbox();
}

// ═══════════════════════════════════════════════
// 编辑模式 — 步骤渲染
// ═══════════════════════════════════════════════
function renderSteps() {
  const c = document.getElementById('steps-container');
  let html = '';
  editSteps.forEach((s, i) => {
    const isOpen = s.imgOpen || false;
    const imgCount = s.imgs?.length || 0;
    html += '<div class="step-block" id="step-' + i + '">'
      + '<div class="step-header">'
      + '<span class="step-num">' + t().cbStepN(i + 1) + '</span>'
      + '<div class="step-actions">'
      + '<button class="step-act-btn up" onclick="moveStep(' + i + ',-1)"'
      + (i === 0 ? ' disabled' : '') + '>↑</button>'
      + '<button class="step-act-btn dn" onclick="moveStep(' + i + ',1)"'
      + (i === editSteps.length - 1 ? ' disabled' : '') + '>↓</button>'
      + '<button class="step-act-btn del" onclick="removeStep(' + i + ')">✕ 删除</button>'
      + '</div></div>'
      + '<div class="step-cmd-wrap">'
      + '<span class="step-dollar">$</span>'
      + '<textarea class="step-cmd-input" rows="1" placeholder="' + esc(t().cbCmdPH) + '"'
      + ' oninput="syncStep(' + i + ',\'cmd\',this.value);autoResize(this);markDirty()">'
      + esc(s.cmd) + '</textarea></div>'
      + '<div class="step-out-wrap">'
      + '<textarea class="step-out-input" rows="2" placeholder="' + esc(t().cbOutputPH) + '"'
      + ' oninput="syncStep(' + i + ',\'output\',this.value);markDirty()">'
      + esc(s.output) + '</textarea></div>'
      + '<div class="step-img-zone">'
      + '<button class="step-img-toggle' + (isOpen ? ' open' : '') + '"'
      + ' onclick="toggleStepImgs(' + i + ')">'
      + '<span class="arr">▶</span> '
      + t().cbScreenshot(imgCount)
      + '</button>'
      + '<div class="step-img-body' + (isOpen ? ' open' : '') + '" id="step-imgs-' + i + '">'
      + '<div class="step-drop" onclick="triggerStepImgPick(' + i + ')"'
      + ' ondragover="event.preventDefault();this.classList.add(\'drag-over\')"'
      + ' ondragleave="this.classList.remove(\'drag-over\')"'
      + ' ondrop="handleStepDrop(event,' + i + ')">' + t().cbDropImg + '</div>'
      + '<input type="file" id="step-img-input-' + i + '" accept="image/*" multiple style="display:none"'
      + ' onchange="handleStepImg(event,' + i + ')"/>'
      + '<div class="step-img-grid" id="step-img-grid-' + i + '">'
      + (s.imgs || []).map((src, ii) =>
          '<div class="step-img-item"><img src="' + src + '"/>'
          + '<button class="step-img-del" onclick="removeStepImg(' + i + ',' + ii + ')">✕</button></div>'
        ).join('')
      + '</div></div></div></div>';

    // 步骤之间的"插入"按钮
    if (i < editSteps.length - 1) {
      html += '<div class="insert-between"><div class="ib-line"></div>'
        + '<button class="ib-btn" onclick="addStep(' + i + ')">' + esc(t().cbInsertStep) + '</button>'
        + '<div class="ib-line"></div></div>';
    }
  });
  c.innerHTML = html;
  document.querySelectorAll('.step-cmd-input').forEach(autoResize);
}

function toggleStepImgs(i) {
  editSteps[i].imgOpen = !editSteps[i].imgOpen;
  const toggle = document.querySelector('#step-' + i + ' .step-img-toggle');
  const body = document.getElementById('step-imgs-' + i);
  if (toggle) toggle.classList.toggle('open', editSteps[i].imgOpen);
  if (body) body.classList.toggle('open', editSteps[i].imgOpen);
}

function addStep(insertAfter) {
  const newStep = { cmd: '', output: '', imgs: [], imgOpen: false };
  if (insertAfter === -1 || insertAfter === undefined) {
    editSteps.push(newStep);
  } else {
    editSteps.splice(insertAfter + 1, 0, newStep);
  }
  renderSteps();
  const newIdx = insertAfter === -1 ? editSteps.length - 1 : insertAfter + 1;
  setTimeout(() => {
    const el = document.querySelector('#step-' + newIdx + ' .step-cmd-input');
    if (el) el.focus();
  }, 50);
}

function removeStep(i) {
  if (editSteps.length <= 1) {
    editSteps[0] = { cmd: '', output: '', imgs: [], imgOpen: false };
    renderSteps();
    return;
  }
  editSteps.splice(i, 1);
  renderSteps();
}

function moveStep(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= editSteps.length) return;
  _syncAllStepsFromDOM();
  [editSteps[i], editSteps[j]] = [editSteps[j], editSteps[i]];
  renderSteps();
}

function syncStep(i, field, val) {
  if (editSteps[i]) editSteps[i][field] = val;
}

function _syncAllStepsFromDOM() {
  document.querySelectorAll('.step-block').forEach((el, i) => {
    if (!editSteps[i]) return;
    editSteps[i].cmd = el.querySelector('.step-cmd-input')?.value || '';
    editSteps[i].output = el.querySelector('.step-out-input')?.value || '';
  });
}

function markDirty() {
  const el = document.getElementById('draft-indicator');
  if (el) {
    el.style.display = 'block';
    el.textContent = '⏳ 有未保存的更改...';
  }
}

// ═══════════════════════════════════════════════
// 编辑模式 — 图片管理
// ═══════════════════════════════════════════════
function triggerStepImgPick(i) {
  document.getElementById('step-img-input-' + i)?.click();
}

function handleStepImg(e, i) {
  [...e.target.files].forEach(f => readStepImg(f, i));
  e.target.value = '';
}

function handleStepDrop(e, i) {
  e.preventDefault();
  e.target.classList.remove('drag-over');
  [...e.dataTransfer.files]
    .filter(f => f.type.startsWith('image/'))
    .forEach(f => readStepImg(f, i));
}

function readStepImg(file, i) {
  const r = new FileReader();
  r.onload = ev => {
    if (!editSteps[i].imgs) editSteps[i].imgs = [];
    editSteps[i].imgs.push(ev.target.result);
    editSteps[i].imgOpen = true;
    _refreshStepImgGrid(i);
    markDirty();
  };
  r.readAsDataURL(file);
}

function removeStepImg(i, ii) {
  editSteps[i].imgs.splice(ii, 1);
  _refreshStepImgGrid(i);
  markDirty();
}

function _refreshStepImgGrid(i) {
  const grid = document.getElementById('step-img-grid-' + i);
  const toggle = document.querySelector('#step-' + i + ' .step-img-toggle');
  if (!grid) return;
  const imgs = editSteps[i].imgs || [];
  grid.innerHTML = imgs.map((src, ii) =>
    '<div class="step-img-item"><img src="' + src + '"/>'
    + '<button class="step-img-del" onclick="removeStepImg(' + i + ',' + ii + ')">✕</button></div>'
  ).join('');
  if (toggle) {
    const cnt = imgs.length;
    toggle.innerHTML = '<span class="arr">▶</span> ' + t().cbScreenshot(cnt);
  }
  const body = document.getElementById('step-imgs-' + i);
  if (body) body.classList.toggle('open', editSteps[i].imgOpen || false);
}

// ═══════════════════════════════════════════════
// 编辑模式 — 进入/退出
// ═══════════════════════════════════════════════
function _openEditMode() {
  document.getElementById('empty').style.display = 'none';
  document.getElementById('view-mode').style.display = 'none';
  document.getElementById('edit-mode').style.display = 'block';
  const eType = (current && current.type) || noteFilter || 'cmd';
  if (eType === 'note') {
    document.getElementById('edit-cmd').style.display = 'none';
    document.getElementById('edit-note').style.display = 'block';
  } else {
    document.getElementById('edit-cmd').style.display = 'block';
    document.getElementById('edit-note').style.display = 'none';
    renderSteps();
  }
}

function enterEdit() {
  if (!current) return;
  isEditingNew = false;
  const eType = current.type || 'cmd';
  if (eType === 'note') {
    document.getElementById('f-title').value = current.title || '';
    document.getElementById('f-content').innerHTML = current.content || '';
    document.getElementById('f-tags').value = (current.tags || []).join(', ');
    document.getElementById('draft-indicator').style.display = 'none';
    _openEditMode();
    document.getElementById('f-title').focus();
  } else {
    const steps = current.steps || [{ cmd: '', output: '' }];
    if (current.imgs?.length && !steps[0]?.imgs?.length) {
      steps[0] = { ...steps[0], imgs: current.imgs };
    }
    editSteps = steps.map(s => ({
      cmd: s.cmd || '',
      output: s.output || '',
      imgs: s.imgs || [],
      imgOpen: s.imgOpen || false
    }));
    if (!editSteps.length) editSteps = [{ cmd: '', output: '', imgs: [], imgOpen: false }];
    document.getElementById('f-title').value = current.title || '';
    document.getElementById('f-desc').value = current.desc || '';
    document.getElementById('f-tags').value = (current.tags || []).join(', ');
    document.getElementById('draft-indicator').style.display = 'none';
    _openEditMode();
    document.getElementById('f-title').focus();
  }
  startDraftTimer();
}

function newEntry() {
  isEditingNew = true;
  const eType = noteFilter || 'cmd';
  current = { id: uid(), title: '', type: eType, steps: [], desc: '', content: '', tags: [], ts: Date.now() };
  if (eType === 'note') {
    document.getElementById('f-title').value = '';
    document.getElementById('f-content').innerHTML = '';
    document.getElementById('f-tags').value = '';
  } else {
    editSteps = [{ cmd: '', output: '', imgs: [], imgOpen: false }];
    document.getElementById('f-title').value = '';
    document.getElementById('f-desc').value = '';
    document.getElementById('f-tags').value = '';
  }
  document.getElementById('draft-indicator').style.display = 'none';
  _openEditMode();
  document.getElementById('f-title').focus();
  startDraftTimer();
  renderList();
}

function cancelEdit() {
  stopDraftTimer();
  const eType = (current && current.type) || noteFilter || 'cmd';
  if (eType === 'cmd') _syncAllStepsFromDOM();
  saveDraft();
  document.getElementById('edit-mode').style.display = 'none';
  document.getElementById('draft-indicator').style.display = 'none';
  if (entries.length && current && !isEditingNew) showEntry(current.id);
  else showEmpty();
  toast(t().cbDraftSavedAs);
}

async function saveEntry() {
  const eType = (current && current.type) || noteFilter || 'cmd';

  if (eType === 'note') {
    // ── 保存随笔笔记 ──
    const rawContent = document.getElementById('f-content').innerHTML;
    // 空内容检测: 排除纯 <br>/<div> 的情况
    const check = rawContent.replace(/<\s*br\s*\/?\s*>/gi, '').replace(/<\s*div\s*>\s*<\s*\/div\s*>/gi, '').replace(/&nbsp;/gi, '').trim();
    if (!check) {
      toast(t().cbNeedContent);
      return;
    }
    current.title = document.getElementById('f-title').value.trim();
    current.type = 'note';
    current.content = rawContent;  // 存储完整 HTML
    current.desc = '';
    current.steps = [];
    current.tags = document.getElementById('f-tags').value
      .split(',').map(t => t.trim()).filter(Boolean);
    delete current.imgs;
    current.ts = current.ts || Date.now();

    const idx = entries.findIndex(e => e.id === current.id);
    if (idx >= 0) entries[idx] = current;
    else entries.unshift(current);

    entries.sort((a, b) => b.ts - a.ts);

    clearDraft();
    stopDraftTimer();
    isEditingNew = false;

    document.getElementById('edit-mode').style.display = 'none';
    showEntry(current.id);
    renderList();
    updateTagFilters();
    scheduleSave();
    toast(t().cbSaved);
  } else {
    // ── 保存命令笔记 (现有逻辑) ──
    _syncAllStepsFromDOM();
    const steps = editSteps
      .filter(s => s.cmd.trim())
      .map(s => ({ cmd: s.cmd.trim(), output: s.output, imgs: s.imgs || [], imgOpen: false }));
    if (!steps.length) {
      toast(t().cbNeedCmd);
      return;
    }

    current.title = document.getElementById('f-title').value.trim();
    current.type = 'cmd';
    current.steps = steps;
    current.desc = document.getElementById('f-desc').value.trim();
    current.content = '';
    current.tags = document.getElementById('f-tags').value
      .split(',').map(t => t.trim()).filter(Boolean);
    delete current.imgs;
    current.ts = current.ts || Date.now();

    const idx = entries.findIndex(e => e.id === current.id);
    if (idx >= 0) entries[idx] = current;
    else entries.unshift(current);

    entries.sort((a, b) => b.ts - a.ts);

    clearDraft();
    stopDraftTimer();
    isEditingNew = false;

    document.getElementById('edit-mode').style.display = 'none';
    showEntry(current.id);
    renderList();
    updateTagFilters();
    scheduleSave();
    toast(t().cbSaved);
  }
}

async function deleteEntry() {
  if (!current) return;
  const name = current.title || current.steps?.[0]?.cmd || '此条目';
  if (!confirm(t().cbDeleteConfirm(name))) return;

  entries = entries.filter(e => e.id !== current.id);
  current = null;
  renderList();
  updateTagFilters();
  if (entries.length) showEntry(entries[0].id);
  else showEmpty();
  scheduleSave();
  toast(t().cbDeleted);
}

// ═══════════════════════════════════════════════
// 导入 / 导出
// ═══════════════════════════════════════════════
function exportJSON() {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cmdbook_' + fmtDate(Date.now()) + '.json';
  a.click();
  toast(t().cbExported);
}

async function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('格式不正确');
    const ids = new Set(entries.map(e => e.id));
    let added = 0;
    for (const item of data) {
      if (!ids.has(item.id)) {
        entries.push(item);
        added++;
      }
    }
    entries.sort((a, b) => b.ts - a.ts);
    renderList();
    updateTagFilters();
    scheduleSave();
    toast(t().cbImported(added));
  } catch (err) {
    toast(t().cbImportFail + err.message);
  }
  e.target.value = '';
}

// ═══════════════════════════════════════════════
// 草稿管理
// ═══════════════════════════════════════════════
function collectEditState() {
  const eType = (current && current.type) || noteFilter || 'cmd';
  if (eType === 'note') {
    return {
      type: 'note',
      entryId: current?.id || null,
      isNew: isEditingNew,
      title: document.getElementById('f-title')?.value || '',
      content: document.getElementById('f-content')?.innerHTML || '',
      tags: document.getElementById('f-tags')?.value || '',
      savedAt: Date.now()
    };
  }
  // cmd draft
  const steps = [];
  document.querySelectorAll('.step-block').forEach((el, i) => {
    steps.push({
      cmd: el.querySelector('.step-cmd-input')?.value || '',
      output: el.querySelector('.step-out-input')?.value || '',
      imgs: editSteps[i]?.imgs || [],
      imgOpen: editSteps[i]?.imgOpen || false
    });
  });
  return {
    type: 'cmd',
    entryId: current?.id || null,
    isNew: isEditingNew,
    title: document.getElementById('f-title')?.value || '',
    steps,
    desc: document.getElementById('f-desc')?.value || '',
    tags: document.getElementById('f-tags')?.value || '',
    savedAt: Date.now()
  };
}

function saveDraft() {
  const d = collectEditState();
  const hasContent = d.title || d.tags
    || (d.type === 'note' ? d.content : (d.desc || d.steps?.some(s => s.cmd || s.output || s.imgs?.length)));
  if (hasContent) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    const el = document.getElementById('draft-indicator');
    if (el) {
      el.style.display = 'block';
      el.textContent = '⏳ 草稿已自动保存 '
        + new Date().toLocaleTimeString('zh-CN');
    }
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  document.getElementById('draft-indicator').style.display = 'none';
  document.getElementById('draft-banner').style.display = 'none';
}

function startDraftTimer() {
  clearInterval(draftTimer);
  draftTimer = setInterval(saveDraft, 30000);
}

function stopDraftTimer() {
  clearInterval(draftTimer);
  draftTimer = null;
}

function checkDraftOnLoad() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    const hasContent = d.title
      || (d.type === 'note' ? d.content : (d.desc || d.steps?.some(s => s.cmd || s.imgs?.length)));
    if (!hasContent) { clearDraft(); return; }
    const elapsed = Math.round((Date.now() - d.savedAt) / 60000);
    const ts = elapsed < 1 ? '刚刚'
      : elapsed < 60 ? elapsed + '分钟前'
      : Math.round(elapsed / 60) + '小时前';
    document.getElementById('draft-time').textContent = '（' + ts + '保存）';
    document.getElementById('draft-banner').style.display = 'flex';
  } catch {
    clearDraft();
  }
}

function restoreDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    current = d.isNew || !d.entryId
      ? { id: uid(), title: '', type: d.type || 'cmd', steps: [], desc: '', content: '', tags: [], ts: Date.now() }
      : (entries.find(e => e.id === d.entryId)
        || { id: d.entryId, title: '', type: d.type || 'cmd', steps: [], desc: '', content: '', tags: [], ts: Date.now() });
    isEditingNew = d.isNew || false;
    if (d.type === 'note') {
      document.getElementById('f-title').value = d.title || '';
      document.getElementById('f-content').innerHTML = d.content || '';
      document.getElementById('f-tags').value = d.tags || '';
    } else {
      editSteps = d.steps?.length
        ? d.steps
        : [{ cmd: '', output: '', imgs: [], imgOpen: false }];
      document.getElementById('f-title').value = d.title || '';
      document.getElementById('f-desc').value = d.desc || '';
      document.getElementById('f-tags').value = d.tags || '';
    }
    _openEditMode();
    document.getElementById('draft-banner').style.display = 'none';
    const el = document.getElementById('draft-indicator');
    if (el) {
      el.style.display = 'block';
      el.textContent = '✅ 草稿已恢复';
    }
    startDraftTimer();
    renderList();
    toast(t().cbDraftRestored);
  } catch {
    clearDraft();
    toast('草稿恢复失败');
  }
}

function discardDraft() {
  clearDraft();
  toast(t().cbDraftDiscarded);
}
