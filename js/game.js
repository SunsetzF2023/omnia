/* ═══════════════════════════════════════════════
   game.js — 游戏中心
   2048 / 扫雷 / 数独 / 勇者牌局，支持多难度/尺寸
   ═══════════════════════════════════════════════ */

// ── 游戏注册表 ──────────────────────────────────
const GAMES = {
  '2048':        { name: '2048',        icon: '🟩', diffs: ['4×4','5×5','6×6'] },
  'minesweeper': { name: '扫雷', icon: '💣', diffs: ['简单','中等','困难'] },
  'sudoku':      { name: '数独', icon: '🧩', diffs: ['简单','中等','困难'] },
  'tetris':      { name: '俄罗斯方块', icon: '🧱', diffs: ['经典'] },
};
let gCurr = '2048', gDiff = 0;   // 当前游戏 & 难度索引
const APPSCRIPT = 'https://script.google.com/macros/s/AKfycbyDR6xKzyevIhi3e1zgWC8KvnWH2JaB7ni7Eo_Md7SKknRASUOtRt8Hj_02470Z-CmV3w/exec';

// ── 游戏中心：渲染 ──────────────────────────────
function renderGameCenter() {
  const listEl = document.getElementById('game-list');
  const diffEl = document.getElementById('game-diff');
  const viewEl = document.getElementById('game-view');
  if (!listEl || !diffEl || !viewEl) return;

  // 侧边栏游戏列表
  listEl.innerHTML = Object.entries(GAMES).map(([k, g]) =>
    '<div class="gm-item' + (k === gCurr ? ' active' : '') + '" onclick="switchGame(\'' + k + '\')">'
    + '<span class="gm-icon">' + g.icon + '</span>' + g.name + '</div>'
  ).join('');

  // 难度选择
  const game = GAMES[gCurr];
  diffEl.innerHTML = '<div class="gm-label">难度</div>'
    + game.diffs.map((d, i) =>
      '<button class="gm-diff-btn' + (i === gDiff ? ' active' : '') + '" onclick="setDiff(' + i + ')">' + d + '</button>'
    ).join('');

  viewEl.innerHTML = '';
  launchGame();
}

function switchGame(key) {
  if (gCurr === key) return;
  deactivateGame();  // 停用旧游戏
  gCurr = key;
  gDiff = 0;
  renderGameCenter();
}

function setDiff(i) {
  if (gDiff === i) return;
  gDiff = i;
  renderGameCenter();
}

function launchGame() {
  G24.init();
  MS.init();
  SD.init();
  TETRIS.init();
  window._activeGame = gCurr;
}

// ── 生命周期（由 app.js 调用） ──────────────────
function activateGame() {
  renderGameCenter();
}
function deactivateGame() {
  G24.deactivate();
  MS.deactivate();
  SD.deactivate();
  TETRIS.deactivate();
}

// ── 侧边栏折叠 ──────────────────────────────────
function toggleGameSidebar() {
  const body = document.getElementById('game-body')
  if (!body) return
  body.classList.toggle('sidebar-collapsed')
  const btn = document.getElementById('game-sidebar-toggle')
  const collapsed = body.classList.contains('sidebar-collapsed')
  if (btn) btn.textContent = collapsed ? '▶' : '◀'
  localStorage.setItem('game_sidebar_collapsed', collapsed ? '1' : '0')
  // 侧边栏折叠后触发 resize 重新计算网格
  setTimeout(() => { if (gCurr === '2048') G24._resize(); if (gCurr === 'minesweeper') MS._resize(); if (gCurr === 'sudoku') SD._resize(); }, 250)
}

function _initSidebarState() {
  const collapsed = localStorage.getItem('game_sidebar_collapsed') === '1'
  if (!collapsed) return
  const body = document.getElementById('game-body')
  if (body) body.classList.add('sidebar-collapsed')
  const btn = document.getElementById('game-sidebar-toggle')
  if (btn) btn.textContent = '▶'
}
function _fitCell(maxCell, cols, rows, padW, padH) {
  const main = document.getElementById('game-main');
  const availW = (main ? main.clientWidth : 600) - padW;
  const availH = (main ? main.clientHeight : 500) - padH;
  const cw = Math.floor(availW / cols);
  const ch = Math.floor(availH / rows);
  return Math.max(18, Math.min(maxCell, cw, ch));
}

// ══════════════════════════════════════════════════
//  2048 障碍模式 — 十字形障碍物生成
// ══════════════════════════════════════════════════
function _g24CrossObstacles(n) {
  const s = new Set();
  const mid = Math.floor(n / 2);
  const r0 = n % 2 === 1 ? mid : mid - 1;
  const r1 = n % 2 === 1 ? mid : mid;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if ((r < r0 || r > r1) && (c < r0 || c > r1)) s.add(r + ',' + c);
  return s;
}

// ══════════════════════════════════════════════════
//  2048
// ══════════════════════════════════════════════════
const G24 = {
  tiles: [], score: 0, best: 0, over: false, won: false,
  nextId: 1, moving: false, elMap: {}, active: false,
  leaderboard: [], playerName: '', _history: [], _undoLeft: 5,
  mode: 'classic', _obstacles: new Set(),

  get cfg() {
    const designs = [
      { n:4, cell:80, gap:7, font:28 },
      { n:5, cell:64, gap:6, font:22 },
      { n:6, cell:52, gap:5, font:18 },
    ];
    const d = designs[gDiff] || designs[0];
    // 小窗口自动隐藏排行榜（game-main 宽度 < 500 时）
    const main = document.getElementById('game-main');
    const mainW = main ? main.clientWidth : 600;
    const lbEl = document.getElementById('g24-lb');
    if (lbEl) lbEl.style.display = mainW < 500 ? 'none' : '';
    const hasLb = lbEl && lbEl.style.display !== 'none';
    // 动态 padW：排行榜可见时多留空间，隐藏时只用基本边距
    const padW = hasLb ? 240 : 50;
    const cell = _fitCell(d.cell, d.n, d.n, padW, 130);
    const ratio = cell / d.cell;
    return { n: d.n, cell, gap: Math.max(3, Math.round(d.gap * ratio)), font: Math.round(d.font * ratio) };
  },

  // ── 障碍模式辅助 ────────────────────────────
  _isObstacle(r, c) { return G24.mode === 'test' && G24._obstacles.has(r + ',' + c); },
  _obstacleCount() { return G24._obstacles.size; },

  _lbKey() {
    if (G24.mode === 'test') return '2048_test_lb_' + G24.cfg.n;
    if (G24.mode === 'memory') return '2048_memory_lb_' + G24.cfg.n;
    return '2048_lb_' + G24.cfg.n;
  },
  _bestKey() {
    if (G24.mode === 'test') return '2048_test_best_' + G24.cfg.n;
    if (G24.mode === 'memory') return '2048_memory_best_' + G24.cfg.n;
    return '2048_best';
  },

  init() {
    if (gCurr !== '2048') return;
    G24.deactivate();
    G24.active = true;
    G24.tiles = []; G24.score = 0; G24.over = false; G24.won = false;
    G24.nextId = 1; G24.moving = false; G24.elMap = {}; G24._history = []; G24._undoLeft = 5;
    G24.playerName = ''; // 重置，等游戏结束再取名
    G24._scored = false;  // 防止重复弹框
    G24.best = parseInt(localStorage.getItem(G24._bestKey()) || '0');
    if (G24.mode === 'test') G24._obstacles = _g24CrossObstacles(G24.cfg.n);
    else G24._obstacles = new Set();
    G24._render();
    G24._initLeaderboard();
    G24._spawn(); G24._spawn();
    G24._syncDOM(false);
    G24._updateUI();
    document.addEventListener('keydown', G24._key);
    window.addEventListener('resize', G24._onResize);
    // 触屏滑动支持
    const grid = document.getElementById('g24-grid');
    if (grid) {
      grid.addEventListener('touchstart', G24._touchStart, { passive: false });
      grid.addEventListener('touchend', G24._touchEnd, { passive: false });
      grid.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });
    }
  },

  // ★ 随机名字生成（英文风格）
  _randomName() {
    const adj = ['Swift','Storm','Shadow','Nova','Blaze','Frost','Rogue','Ace','Echo','Neon','Zen','Flux','Void','Hawk','Lynx'];
    const noun = ['Tile','Grid','Merge','Pixel','Slide','Block','Shift','Spin','Dash','Wave','Core','Link','Path','Rush','Edge'];
    return adj[Math.floor(Math.random()*adj.length)] + noun[Math.floor(Math.random()*noun.length)];
  },

  // ★ 保存分数（从内联输入框读取名字）
  _saveScore() {
    const input = document.getElementById('g24-name-input');
    G24.playerName = (input?.value || '').trim() || G24._randomName();
    G24._saveToLeaderboard();
    G24._renderLeaderboard();
    // 隐藏输入框，显示已保存
    const wrap = document.getElementById('g24-name-wrap');
    if (wrap) wrap.innerHTML = '<span style="color:var(--amber);font-size:13px">✅ ' + G24.playerName + ' · ' + G24.score.toLocaleString() + ' 分 已上榜</span>';
  },

  // ★ 投降：随机名 + 当前分数，直接结束，不弹框
  _surrender() {
    if (G24.over) return;
    G24.over = true;
    G24._scored = true;
    G24.playerName = G24._randomName();
    G24._saveToLeaderboard();
    G24._renderLeaderboard();
    G24._updateUI();
  },

  _switchMode(mode) { if (G24.mode === mode) return; G24.mode = mode; G24.init(); },

  deactivate() { document.removeEventListener('keydown', G24._key); window.removeEventListener('resize', G24._onResize); const g = document.getElementById('g24-grid'); if (g) { g.removeEventListener('touchstart', G24._touchStart); g.removeEventListener('touchend', G24._touchEnd); } G24.active = false; },

  _at(r,c) { return G24.tiles.find(t => t.row===r && t.col===c); },

  _spawn(anim) {
    const cfg = G24.cfg;
    const empty = [];
    for (let r=0; r<cfg.n; r++) for (let c=0; c<cfg.n; c++) if (!G24._at(r,c) && !G24._isObstacle(r,c)) empty.push({r,c});
    if (!empty.length) return null;
    const {r,c} = empty[Math.floor(Math.random()*empty.length)];
    const t = { id: G24.nextId++, val: Math.random()<0.9?2:4, row:r, col:c, isNew:!!anim };
    G24.tiles.push(t);
    return t;
  },

  _render() {
    const view = document.getElementById('game-view');
    if (!view || !G24.active) return;
    const cfg = G24.cfg;
    const gw = cfg.n * cfg.cell + (cfg.n-1) * cfg.gap + 14;
    const hintText = G24.mode === 'test'
      ? '🧱 障碍模式：十字形障碍物 | 四个角为灰色石块，无法移动'
      : (G24.mode === 'memory'
      ? '🧠 记忆模式：仅最左列真实，其余为乱码 | 移到左列验货！'
      : '↑↓←→ / WASD / 触屏滑动 | 合并到 2048 获胜');
    view.innerHTML =
      '<div class="g2048-header">'
      + '<div class="g2048-title">2<span style="color:var(--amber)">0</span>4<span style="color:var(--amber)">8</span></div>'
      + '<div class="g2048-mode-btns">'
      + '<button class="g2048-mode-btn'+(G24.mode==='classic'?' active':'')+'" onclick="G24._switchMode(\'classic\')">经典</button>'
      + '<button class="g2048-mode-btn'+(G24.mode==='test'?' active':'')+'" onclick="G24._switchMode(\'test\')">障碍</button>'
      + '<button class="g2048-mode-btn'+(G24.mode==='memory'?' active':'')+'" onclick="G24._switchMode(\'memory\')">记忆</button>'
      + '</div>'
      + '<div class="g2048-stat"><div class="g2048-stat-label">分数</div><div class="g2048-stat-val" id="g24-score">0</div></div>'
      + '<div class="g2048-stat"><div class="g2048-stat-label">最佳</div><div class="g2048-stat-val" id="g24-best">0</div></div>'
      + '<button class="g2048-new-btn" onclick="G24.init()">新游戏</button>'
      + '<button class="g2048-new-btn" id="g24-undo-btn" style="margin-left:6px" onclick="G24._undo()">↩ 撤销</button>'
      + '<button class="g2048-new-btn" style="background:var(--red-dim);border-color:var(--red);color:var(--red);margin-left:6px" onclick="G24._surrender()">投降</button></div>'
      + '<div class="g2048-body">'
      + '<div class="g2048-wrap"><div id="g24-particles"></div><div class="g2048-grid" id="g24-grid" style="grid-template-columns:repeat('+cfg.n+','+cfg.cell+'px);grid-template-rows:repeat('+cfg.n+','+cfg.cell+'px);gap:'+cfg.gap+'px;width:'+gw+'px;height:'+gw+'px;"></div>'
      + '<div class="g2048-msg" id="g24-msg"></div></div>'
      + '<div class="g2048-lb" id="g24-lb"></div></div>'
      + '<div class="gm-hint">'+hintText+'</div>';
    // 背景格：测试模式下障碍格子加特殊 class
    const grid = document.getElementById('g24-grid');
    for (let r=0; r<cfg.n; r++) for (let c=0; c<cfg.n; c++) {
      const cell = document.createElement('div');
      cell.className = 'g2048-cell' + (G24._isObstacle(r,c) ? ' g2048-obstacle' : '');
      grid.appendChild(cell);
    }
  },

  // 记忆模式：显示用的虚假值（col>0 时乱码）
  _displayVal(t) {
    if (G24.mode !== 'memory' || t.col === 0) return t.val;
    // 基于 tile id 的确定性乱码——同一方块每次渲染显示相同假数字
    const fake = ((t.id * 173 + t.val * 97) % 13);
    const vals = [2,4,8,16,32,64,128,256,512,1024,2048,4096,8192];
    return vals[fake];
  },

  _syncDOM(anim) {
    if (!G24.active) return;
    const grid = document.getElementById('g24-grid');
    if (!grid) return;
    const cfg = G24.cfg;
    const ids = new Set(G24.tiles.map(t=>t.id));
    Object.keys(G24.elMap).forEach(id => { if (!ids.has(+id)) { G24.elMap[id].remove(); delete G24.elMap[id]; } });
    G24.tiles.forEach(t => {
      const tx = t.col * (cfg.cell+cfg.gap), ty = t.row * (cfg.cell+cfg.gap);
      const dv = G24._displayVal(t); // 记忆模式可能显示假值
      const isFake = G24.mode === 'memory' && t.col > 0;
      let el = G24.elMap[t.id];
      if (!el) {
        el = document.createElement('div');
        el.className = 'g2048-tile t'+dv + (isFake ? ' obfuscated' : '');
        el.textContent = dv;
        el.style.width = el.style.height = cfg.cell+'px';
        el.style.fontSize = dv>=1024 ? Math.max(14,cfg.font-6)+'px' : cfg.font+'px';
        G24.elMap[t.id] = el; grid.appendChild(el);
        if (t.isNew && anim) {
          el.style.transform = 'translate('+tx+'px,'+ty+'px) scale(0)';
          el.style.transition = 'none';
          void el.offsetHeight;
          el.style.transition = 'transform .15s ease-in-out';
          el.style.transform = 'translate('+tx+'px,'+ty+'px) scale(1)';
        } else {
          el.style.transform = 'translate('+tx+'px,'+ty+'px) scale(1)';
          el.style.transition = 'none';
        }
      } else {
        if (!t._freeze) {
          el.className = 'g2048-tile t'+dv + (isFake ? ' obfuscated' : '');
          el.textContent = dv;
        }
        el.style.width = el.style.height = cfg.cell+'px';
        el.style.fontSize = dv>=1024 ? Math.max(14,cfg.font-6)+'px' : cfg.font+'px';
        el.style.transition = anim ? 'transform .15s ease-in-out' : 'none';
        el.style.transform = 'translate('+tx+'px,'+ty+'px) scale(1)';
        if (t._pop && anim) {
          el.style.transform = 'translate('+tx+'px,'+ty+'px) scale(1.25)';
          setTimeout(function(elRef,tx,ty){ elRef.style.transition='transform .12s ease-out'; elRef.style.transform='translate('+tx+'px,'+ty+'px) scale(1)'; },120,el,tx,ty);
        }
      }
    });
    G24.tiles.forEach(t=>{t.isNew=false;});
  },

  _slide(arr, segLen) {
    let f = arr.filter(v=>v!==0);
    for (let i=0; i<f.length-1; i++) {
      if (f[i].val===f[i+1].val) { f[i]={val:f[i].val*2,id:f[i].id,mergedFrom:f[i+1].id}; G24.score+=f[i].val; f[i+1]=0; }
    }
    f=f.filter(v=>v!==0); const len=segLen!==undefined?segLen:G24.cfg.n; while (f.length<len) f.push(0); return f;
  },

  // ── 障碍模式：障碍物感知的行列提取 ──────────
  _lineExtract(fixed, axis, dir) {
    const n = G24.cfg.n, arr = [];
    for (let i = 0; i < n; i++) {
      const r = (axis === 'row') ? fixed : (dir === 'fwd' ? i : n - 1 - i);
      const c = (axis === 'col') ? fixed : (dir === 'fwd' ? i : n - 1 - i);
      if (G24._isObstacle(r, c)) { arr.push(null); }
      else { const t = G24._at(r, c); arr.push(t ? {val: t.val, id: t.id} : 0); }
    }
    return arr;
  },

  _slideLine(arr) {
    const n = arr.length, result = new Array(n).fill(0);
    let segStart = 0;
    for (let i = 0; i <= n; i++) {
      if (i < n && arr[i] !== null) continue;
      if (i > segStart) {
        const seg = []; for (let j = segStart; j < i; j++) seg.push(arr[j]);
        const slid = G24._slide(seg, i - segStart);
        for (let j = 0; j < slid.length; j++) result[segStart + j] = slid[j];
      }
      if (i < n) result[i] = null;
      segStart = i + 1;
    }
    return result;
  },

  move(dir) {
    if (G24.over||G24.moving||!G24.active) return;
    const n=G24.cfg.n, oldPos={}, oldVal={};
    G24.tiles.forEach(t=>{oldPos[t.id]={row:t.row,col:t.col};oldVal[t.id]=t.val;});
    let rows=[], isTest=G24.mode==='test';
    if (!isTest) {
      // 经典/记忆模式：无障碍物
      if (dir==='left') { for (let r=0;r<n;r++) { const a=[]; for (let c=0;c<n;c++) { const t=G24._at(r,c); a.push(t?{val:t.val,id:t.id}:0); } rows.push({r,arr:G24._slide(a)}); } }
      else if (dir==='right') { for (let r=0;r<n;r++) { const a=[]; for (let c=n-1;c>=0;c--) { const t=G24._at(r,c); a.push(t?{val:t.val,id:t.id}:0); } rows.push({r,arr:G24._slide(a).reverse()}); } }
      else if (dir==='up') { for (let c=0;c<n;c++) { const a=[]; for (let r=0;r<n;r++) { const t=G24._at(r,c); a.push(t?{val:t.val,id:t.id}:0); } rows.push({c,arr:G24._slide(a)}); } }
      else if (dir==='down') { for (let c=0;c<n;c++) { const a=[]; for (let r=n-1;r>=0;r--) { const t=G24._at(r,c); a.push(t?{val:t.val,id:t.id}:0); } rows.push({c,arr:G24._slide(a).reverse()}); } }
    } else {
      // 测试模式：障碍物感知滑动
      if (dir==='left') { for (let r=0;r<n;r++) { const line=G24._lineExtract(r,'row','fwd'); rows.push({r,arr:G24._slideLine(line)}); } }
      else if (dir==='right') { for (let r=0;r<n;r++) { const line=G24._lineExtract(r,'row','rev'); const slid=G24._slideLine(line); const mapped=new Array(n).fill(0); for(let i=0;i<n;i++) mapped[n-1-i]=slid[i]; rows.push({r,arr:mapped}); } }
      else if (dir==='up') { for (let c=0;c<n;c++) { const line=G24._lineExtract(c,'col','fwd'); rows.push({c,arr:G24._slideLine(line)}); } }
      else if (dir==='down') { for (let c=0;c<n;c++) { const line=G24._lineExtract(c,'col','rev'); const slid=G24._slideLine(line); const mapped=new Array(n).fill(0); for(let i=0;i<n;i++) mapped[n-1-i]=slid[i]; rows.push({c,arr:mapped}); } }
    }
    const nt=[], mg=new Set(), mergeEvents=[], mergedSet=new Set(), mergeTarget={};
    rows.forEach(row=>{
      if (dir==='left'||dir==='right') { const r=row.r; row.arr.forEach((it,ci)=>{ if(it===0||it===null)return; const t={id:it.id,val:it.val,row:r,col:ci,isNew:false}; nt.push(t); if(it.mergedFrom){mg.add(it.mergedFrom);mergeEvents.push({val:it.val,row:r,col:ci});mergeTarget[it.mergedFrom]={row:r,col:ci};mergedSet.add(it.id);} if(oldPos[it.id]&&oldPos[it.id].row===r&&oldPos[it.id].col===ci) t.unmoved=true; }); }
      else { const c=row.c; row.arr.forEach((it,ri)=>{ if(it===0||it===null)return; const t={id:it.id,val:it.val,row:ri,col:c,isNew:false}; nt.push(t); if(it.mergedFrom){mg.add(it.mergedFrom);mergeEvents.push({val:it.val,row:ri,col:c});mergeTarget[it.mergedFrom]={row:ri,col:c};mergedSet.add(it.id);} if(oldPos[it.id]&&oldPos[it.id].row===ri&&oldPos[it.id].col===c) t.unmoved=true; }); }
    });
    if (nt.every(t=>t.unmoved)&&mg.size===0) return;
    // ★ 撤销：保存移动前状态
    G24._saveState();
    nt.forEach(t=>delete t.unmoved);
    // ghost: 被合并方块 — 保留DOM，让它滑向目标位置
    const ghosts=[];
    G24.tiles.forEach(t=>{ if(mg.has(t.id)){ const target=mergeTarget[t.id]||{row:t.row,col:t.col}; ghosts.push({id:t.id,val:t.val,row:t.row,col:t.col,_g:true,tRow:target.row,tCol:target.col}); } });
    G24.tiles = G24.tiles.filter(t=>!mg.has(t.id));
    // staged: 非合并→旧位置, 合并幸存→新位置+冻结旧值, ghost→旧位置
    const staged = nt.map(t=>{
      if (mergedSet.has(t.id)) return {...t, _freeze:true, _oldVal:oldVal[t.id]};
      const o=oldPos[t.id]; return {...t, row:o?o.row:t.row, col:o?o.col:t.col};
    });
    ghosts.forEach(g=>staged.push({id:g.id,val:g.val,row:g.row,col:g.col,_g:true}));
    G24.tiles=staged; G24._syncDOM(false);
    void (document.getElementById('g24-grid')||{}).offsetHeight;
    // 动画: 非合并→新位置, 合并幸存→保持冻结, ghost→滑向目标
    const animTiles = nt.map(t=> mergedSet.has(t.id) ? {...t, _freeze:true, _oldVal:oldVal[t.id]} : t);
    ghosts.forEach(g=>animTiles.push({id:g.id,val:g.val,row:g.tRow,col:g.tCol,_g:true}));
    G24.tiles=animTiles; G24.moving=true; G24._syncDOM(true);
    // 动画结束: 移除ghost, 幸存者更新值+弹跳, 生成新方块
    G24._animCleanup = {nt, mergeEvents, mergedSet};
    setTimeout(()=>{
      G24.tiles = G24._animCleanup.nt.map(t=> G24._animCleanup.mergedSet.has(t.id) ? {...t, _pop:true} : t);
      G24._spawn(true); G24._syncDOM(true);
      G24.moving=false; G24._check(); G24._updateUI();
      G24._animCleanup.mergeEvents.forEach(evt=>G24._spawnParticle(evt));
      G24._animCleanup = null;
    },170);
  },

  _check() {
    const n=G24.cfg.n;
    if (!G24.won && G24.tiles.some(t=>t.val===2048)) G24.won=true;
    const isTest=G24.mode==='test';
    const capacity=isTest ? n*n - G24._obstacleCount() : n*n;
    if (G24.tiles.length < capacity) return;
    for (let r=0;r<n;r++) for (let c=0;c<n-1;c++) {
      if (isTest && (G24._isObstacle(r,c)||G24._isObstacle(r,c+1))) continue;
      const a=G24._at(r,c),b=G24._at(r,c+1); if(!a||!b||a.val===b.val) return;
    }
    for (let r=0;r<n-1;r++) for (let c=0;c<n;c++) {
      if (isTest && (G24._isObstacle(r,c)||G24._isObstacle(r+1,c))) continue;
      const a=G24._at(r,c),b=G24._at(r+1,c); if(!a||!b||a.val===b.val) return;
    }
    G24.over=true; G24._history=[]; G24._undoLeft=0;  // Game Over 后清空撤销历史
  },

  _spawnParticle(evt) {
    const container = document.getElementById('g24-particles');
    if (!container || !G24.active) return;
    const cfg = G24.cfg;
    const x = evt.col * (cfg.cell + cfg.gap) + cfg.cell / 2;
    const y = evt.row * (cfg.cell + cfg.gap) + cfg.cell / 2;
    const el = document.createElement('div');
    el.className = 'g2048-particle';
    el.textContent = '+' + evt.val;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.fontSize = (evt.val >= 256 ? Math.max(12, cfg.font - 6) : cfg.font) + 'px';
    container.appendChild(el);
    setTimeout(() => el.remove(), 750);
  },

  // ★ 撤销：保存状态快照（最多5步）
  _saveState() {
    G24._history.push({
      tiles: G24.tiles.map(t => ({ id: t.id, val: t.val, row: t.row, col: t.col, isNew: !!t.isNew })),
      score: G24.score,
      over: G24.over,
      won: G24.won,
      nextId: G24.nextId,
    });
  },

  // ★ 撤销：恢复到上一步
  _undo() {
    if (!G24.active || G24.moving || G24._history.length === 0 || G24._undoLeft <= 0) return;
    G24._undoLeft--;
    const state = G24._history.pop();
    if (G24._animCleanup) G24._animCleanup = null;
    G24.tiles = state.tiles.map(t => ({ ...t }));
    G24.score = state.score;
    G24.over = state.over;
    G24.won = state.won;
    G24.nextId = state.nextId;
    G24.elMap = {};
    G24._scored = G24.over;
    G24._render();
    G24._syncDOM(false);
    G24._renderLeaderboard();
    G24._updateUI();
  },

  _resize() {
    if (!G24.active) return;
    const grid = document.getElementById('g24-grid');
    if (!grid) return;
    const cfg = G24.cfg;
    const gw = cfg.n * cfg.cell + (cfg.n - 1) * cfg.gap + 14;
    grid.style.gridTemplateColumns = 'repeat(' + cfg.n + ',' + cfg.cell + 'px)';
    grid.style.gridTemplateRows = 'repeat(' + cfg.n + ',' + cfg.cell + 'px)';
    grid.style.gap = cfg.gap + 'px';
    grid.style.width = gw + 'px';
    grid.style.height = gw + 'px';
    G24.tiles.forEach(t => {
      const el = G24.elMap[t.id];
      if (!el) return;
      el.style.width = el.style.height = cfg.cell + 'px';
      el.style.fontSize = (t.val >= 1024 ? Math.max(14, cfg.font - 6) : cfg.font) + 'px';
      el.className = 'g2048-tile t' + t.val;
      const tx = t.col * (cfg.cell + cfg.gap);
      const ty = t.row * (cfg.cell + cfg.gap);
      el.style.transition = 'none';
      el.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(1)';
    });
  },

  _onResize() { clearTimeout(G24._rt); G24._rt = setTimeout(() => G24._resize(), 120); },

  _updateUI() {
    if (G24.score>G24.best){G24.best=G24.score;localStorage.setItem(G24._bestKey(),G24.best);}
    const s=document.getElementById('g24-score'), b=document.getElementById('g24-best'), m=document.getElementById('g24-msg');
    if(s)s.textContent=G24.score; if(b)b.textContent=G24.best;
    // ── Game Over / Win 遮罩 ──
    if (m) {
      if (G24.over) {
        m.style.display = 'flex';
        m.style.flexDirection = 'column';
        m.style.pointerEvents = 'auto';
        m.style.background = '';
        m.innerHTML = '<div class="g2048-over">Game Over</div>';
      } else {
        m.style.display = 'none';
        m.innerHTML = '';
      }
    }
    // Game Over 名字 + 保存
    if (G24.over && !G24._scored) {
      G24._scored = true;
      const rnd = G24._randomName();
      if (m) {
        m.innerHTML += '<div id="g24-name-wrap" style="margin-top:12px;display:flex;gap:6px;justify-content:center;align-items:center">'
          + '<input id="g24-name-input" value="' + rnd + '" style="width:120px;padding:4px 8px;background:var(--bg);border:1px solid var(--amber);border-radius:4px;color:var(--fg);font-size:13px;text-align:center" maxlength="16">'
          + '<button onclick="G24._saveScore()" style="padding:4px 12px;background:var(--amber-dim);border:1px solid var(--amber);color:var(--amber);border-radius:4px;cursor:pointer;font-size:12px">保存分数</button>'
          + '</div>';
        setTimeout(() => { const inp = document.getElementById('g24-name-input'); if (inp) { inp.focus(); inp.select(); } }, 50);
      }
    }
    // 获胜时在 grid 上方显示小横幅，不遮挡游戏
    if (G24.won && !G24.over) {
      const wrap = document.querySelector('#game-view .g2048-wrap');
      if (wrap) {
        const existing = document.getElementById('g24-won-badge');
        if (!existing) {
          const badge = document.createElement('div');
          badge.id = 'g24-won-badge';
          badge.style.cssText = 'font-size:13px;color:var(--amber);font-weight:700;text-align:center;padding:4px 0;margin-bottom:8px';
          badge.textContent = '🏆 2048 达成！继续挑战更高分';
          wrap.parentNode.insertBefore(badge, wrap);
        }
      }
    } else {
      const existing = document.getElementById('g24-won-badge');
      if (existing) existing.remove();
    }
    // 撤销按钮状态
    const undoBtn = document.getElementById('g24-undo-btn');
    if (undoBtn) {
      undoBtn.textContent = '↩ 撤销 (' + G24._undoLeft + ')';
      if (G24._history.length === 0 || G24.moving || G24._undoLeft <= 0) {
        undoBtn.style.opacity = '0.4'; undoBtn.style.pointerEvents = 'none';
      } else {
        undoBtn.style.opacity = '1'; undoBtn.style.pointerEvents = 'auto';
      }
    }
  },

  // ── 排行榜 ──────────────────────────────────────
  _initLeaderboard() {
    G24.leaderboard = [];
    const key = G24._lbKey();
    const saved = localStorage.getItem(key);
    if (saved) { try { G24.leaderboard = JSON.parse(saved); } catch(_){} }
    // ★ 清除旧版 AI 假数据
    if (G24.leaderboard.length > 0 && G24.leaderboard.some(e => 'isMe' in e)) {
      G24.leaderboard = [];
      localStorage.removeItem(key);
    }
    G24._renderLeaderboard();
    // 异步拉取全球排行榜
    G24._fetchRemoteLB();
  },

  _remoteSize() {
    const n = G24.cfg.n;
    if (G24.mode === 'test') return 'test_' + n;
    if (G24.mode === 'memory') return 'memory_' + n;
    return '' + n;
  },

  _fetchRemoteLB() {
    const size = G24._remoteSize(), mode = G24.mode;
    fetch(APPSCRIPT + '?action=lb_get&size=' + size)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data) || !data.length) return;
        if (G24._remoteSize() !== size || G24.mode !== mode) return;
        G24._mergeLB(data);
        G24._renderLeaderboard();
      })
      .catch(() => {});
  },

  _mergeLB(remote) {
    const map = new Map();
    // 先放本地数据（保留 name/score/ts）
    (G24.leaderboard || []).forEach(e => map.set(e.name, { score: e.score, ts: e.ts }));
    // 远程数据覆盖（保留更高分，同时更新时间）
    remote.forEach(e => {
      const cur = map.get(e.name);
      if (!cur || e.score > cur.score) map.set(e.name, { score: e.score, ts: e.ts });
    });
    G24.leaderboard = [...map.entries()]
      .map(([name, obj]) => ({ name, score: obj.score, ts: obj.ts }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    const key = G24._lbKey();
    localStorage.setItem(key, JSON.stringify(G24.leaderboard));
  },

  _saveToLeaderboard() {
    if (G24.score <= 0) return;
    const lb = G24.leaderboard || [];
    const now = new Date().toISOString();
    const idx = lb.findIndex(e => e.name === G24.playerName);
    const entry = { name: G24.playerName, score: G24.score, ts: now };
    if (idx >= 0) {
      if (G24.score > lb[idx].score) lb[idx] = entry;
    } else {
      lb.push(entry);
    }
    lb.sort((a, b) => b.score - a.score);
    G24.leaderboard = lb.slice(0, 10);
    const key = G24._lbKey();
    localStorage.setItem(key, JSON.stringify(G24.leaderboard));
    // ★ 提交到全球排行榜
    G24._submitRemote(G24.playerName, G24.score, now);
  },

  _submitRemote(name, score, ts) {
    // 用 Image beacon 替代 fetch no-cors，永不阻塞主线程
    try {
      const img = new Image();
      img.src = APPSCRIPT + '?action=lb_submit&name=' + encodeURIComponent(name) + '&score=' + score + '&size=' + G24._remoteSize() + '&ts=' + encodeURIComponent(ts || '');
    } catch(e) {}
  },

  _renderLeaderboard() {
    const lb = document.getElementById('g24-lb');
    if (!lb) return;
    const modeLabel = G24.mode === 'test' ? ' · 障碍' : (G24.mode === 'memory' ? ' · 记忆' : '');
    if (!G24.leaderboard.length) {
      lb.innerHTML = '<div class="g2048-lb-title">🏆 ' + G24.cfg.n + '×' + G24.cfg.n + modeLabel + ' 排行榜</div>'
        + '<div style="color:var(--dim);font-size:12px;text-align:center;padding:20px 0;">暂无数据</div>';
      return;
    }
    const medals = ['🥇','🥈','🥉'];
    let html = '<div class="g2048-lb-title">🏆 TOP10 ' + G24.cfg.n + '×' + G24.cfg.n + modeLabel + ' 排行榜</div>';
    html += G24.leaderboard.slice(0, 10).map((e, i) => {
      const rankClass = i < 3 ? ' r' + (i + 1) : '';
      const isMe = e.name === G24.playerName;
      const hasTs = !!e.ts;
      const click = hasTs ? ' onclick="G24._lbTooltip(event,\'' + e.ts + '\')"' : '';
      const cursor = hasTs ? ' style="cursor:pointer"' : '';
      return '<div class="g2048-lb-row">'
        + '<span class="g2048-lb-rank' + rankClass + '">' + (medals[i] || (i + 1)) + '</span>'
        + '<span class="g2048-lb-name' + (isMe ? ' is-me' : '') + '"' + cursor + click + '>' + e.name + '</span>'
        + '<span class="g2048-lb-score' + (isMe ? ' is-me' : '') + '">' + e.score.toLocaleString() + '</span>'
        + '</div>';
    }).join('');
    lb.innerHTML = html;
  },

  _lbTooltip(e, ts) {
    const old = document.getElementById('g24-lb-tip');
    if (old) old.remove();
    const d = new Date(ts);
    const str = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
      + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    const tip = document.createElement('div');
    tip.id = 'g24-lb-tip';
    tip.textContent = '🕐 ' + str;
    tip.style.cssText = 'position:fixed;background:var(--bg);border:1px solid var(--amber);border-radius:6px;padding:6px 12px;font-size:12px;color:var(--fg);z-index:9999;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.5);white-space:nowrap';
    tip.style.left = e.clientX + 'px';
    tip.style.top = (e.clientY - 34) + 'px';
    document.body.appendChild(tip);
    setTimeout(function() { var t = document.getElementById('g24-lb-tip'); if (t) t.remove(); }, 4000);
  },

  _touchStart(e) { var t = e.touches[0]; G24._tsX = t.clientX; G24._tsY = t.clientY; },
  _touchEnd(e) {
    if (G24.over || G24.moving) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - G24._tsX, dy = t.clientY - G24._tsY;
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
    e.preventDefault();
    if (Math.abs(dx) > Math.abs(dy)) { G24.move(dx > 0 ? 'right' : 'left'); }
    else { G24.move(dy > 0 ? 'down' : 'up'); }
  },

  _key(e) { if (e.target.id === 'g24-name-input') return; const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',A:'left',d:'right',D:'right',w:'up',W:'up',s:'down',S:'down'}; if(map[e.key]){e.preventDefault();G24.move(map[e.key]);} },
};

// ══════════════════════════════════════════════════
//  扫雷
// ══════════════════════════════════════════════════
const MS = {
  board:[], rows:0, cols:0, mines:0, revealed:0, flags:0, over:false, first:true, active:false,
  _cellS:0, _timer:0, _timerId:null, _playerName:'', _leaderboard:[], _lbPage:0,

  get cfg() {
    const diffs = [
      { rows:9, cols:9, mines:10, cs:44, fs:16 },
      { rows:16, cols:16, mines:40, cs:32, fs:13 },
      { rows:30, cols:16, mines:99, cs:26, fs:11 },
    ];
    const d = diffs[gDiff] || diffs[0];
    const cell = _fitCell(d.cs, d.cols, d.rows, 30, 110);
    const ratio = cell / d.cs;
    return { rows: d.rows, cols: d.cols, mines: d.mines, cs: cell, fs: Math.max(9, Math.round(d.fs * ratio)) };
  },

  init() {
    if (gCurr !== 'minesweeper') return;
    MS.deactivate();
    MS.active = true;
    const c=MS.cfg; MS.rows=c.rows; MS.cols=c.cols; MS.mines=c.mines; MS._cellS=c.cs;
    MS.board=[]; MS.revealed=0; MS.flags=0; MS.over=false; MS.first=true;
    MS._timer=0; MS._timerId=null; MS._playerName='';
    for (let r=0;r<MS.rows;r++) { MS.board[r]=[]; for (let co=0;co<MS.cols;co++) MS.board[r][co]={mine:false,revealed:false,flag:false,adj:0}; }
    MS._render();
    MS._fetchLB();
    document.addEventListener('keydown', MS._key);
    document.addEventListener('contextmenu', MS._ctx);
    window.addEventListener('resize', MS._onResize);
  },

  deactivate() { MS._stopTimer(); document.removeEventListener('keydown',MS._key); document.removeEventListener('contextmenu',MS._ctx); window.removeEventListener('resize',MS._onResize); MS.active=false; },

  _startTimer() {
    if (MS._timerId) return;
    MS._timerId = setInterval(() => { MS._timer++; MS._updateTimer(); }, 1000);
  },
  _stopTimer() { clearInterval(MS._timerId); MS._timerId = null; },
  _updateTimer() {
    const el = document.getElementById('ms-timer');
    if (el) el.textContent = String(Math.min(999, MS._timer)).padStart(3, '0');
  },

  _randName() {
    const a=['Swift','Storm','Shadow','Nova','Blaze','Frost','Ace','Neon','Zen','Hawk'];
    const n=['Sweep','Clear','Flag','Mine','Grid','Cell','Click','Scan','Edge','Path'];
    return a[Math.floor(Math.random()*a.length)]+n[Math.floor(Math.random()*n.length)];
  },

  // ── 渲染 ──
  _render() {
    const view = document.getElementById('game-view');
    if (!view||!MS.active) return;
    const c=MS.cfg;
    view.innerHTML =
      '<div class="ms-topbar">'
      + '<div class="ms-counter" id="ms-mines">'+String(MS.mines-MS.flags).padStart(3,'0')+'</div>'
      + '<span class="ms-face" id="ms-face" onclick="MS.init()">😊</span>'
      + '<div class="ms-counter" id="ms-timer">000</div>'
      + '<button class="ms-new-btn" onclick="MS.init()" style="margin-left:8px">新游戏</button></div>'
      + '<div class="ms-grid" id="ms-grid" style="grid-template-columns:repeat('+MS.cols+','+c.cs+'px);"></div>'
      + '<div class="ms-lb-panel" id="ms-lb"></div>'
      + '<div class="gm-hint">左键翻开 | 右键/F 插旗 | 双击数字自动翻开</div>';
    const grid = document.getElementById('ms-grid');
    for (let r=0;r<MS.rows;r++) for (let co=0;co<MS.cols;co++) {
      const cell = document.createElement('div');
      cell.className='ms-cell';
      cell.style.width=c.cs+'px'; cell.style.height=c.cs+'px'; cell.style.fontSize=c.fs+'px';
      cell.dataset.r=r; cell.dataset.c=co;
      cell.onclick = () => MS.reveal(r,co);
      cell.ondblclick = () => MS._chord(r,co);
      cell.oncontextmenu = () => { MS.toggleFlag(r,co); return false; };
      grid.appendChild(cell);
    }
    MS._renderLB();
  },

  // ── 布雷（首次点击安全区 3×3，周围不放雷） ──
  _placeMines(sr,sc) {
    const safe = new Set();
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const nr=sr+dr, nc=sc+dc;
      if (nr>=0&&nr<MS.rows&&nc>=0&&nc<MS.cols) safe.add(nr*MS.cols+nc);
    }
    // 收集所有不在安全区的格子
    const cand=[];
    for (let r=0;r<MS.rows;r++) for (let co=0;co<MS.cols;co++) {
      if (!safe.has(r*MS.cols+co)) cand.push(r*MS.cols+co);
    }
    // Fisher-Yates 洗牌
    for (let i=cand.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [cand[i],cand[j]]=[cand[j],cand[i]];
    }
    // 放置地雷
    const toPlace = Math.min(MS.mines, cand.length);
    for (let i=0;i<toPlace;i++) {
      const idx = cand[i];
      const r = Math.floor(idx / MS.cols), co = idx % MS.cols;
      MS.board[r][co].mine = true;
    }
    // 计算邻雷数
    for (let r=0;r<MS.rows;r++) for (let co=0;co<MS.cols;co++) {
      if (MS.board[r][co].mine) { MS.board[r][co].adj = -1; continue; }
      let a=0;
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        if (dr===0&&dc===0) continue;
        const nr=r+dr, nc=co+dc;
        if (nr>=0&&nr<MS.rows&&nc>=0&&nc<MS.cols&&MS.board[nr][nc].mine) a++;
      }
      MS.board[r][co].adj=a;
    }
  },

  _getCell(r,c) { const grid=document.getElementById('ms-grid'); return grid?grid.children[r*MS.cols+c]:null; },

  // ── 左键翻开 ──
  reveal(r,c) {
    if (MS.over||!MS.active) return;
    const b=MS.board[r][c];
    if (!b||b.revealed||b.flag) return;
    if (MS.first) { MS._placeMines(r,c); MS.first=false; MS._startTimer(); }
    if (b.mine) {
      b.revealed=true; MS.over=true; MS._stopTimer();
      // 显示所有地雷
      for (let rr=0;rr<MS.rows;rr++) for (let cc=0;cc<MS.cols;cc++) {
        if (!MS.board[rr][cc].mine) continue;
        const el=MS._getCell(rr,cc); if(!el) continue;
        if (rr===r&&cc===c) { el.classList.add('revealed','mine-hit'); el.textContent='💥'; }
        else if (!MS.board[rr][cc].flag) { el.classList.add('revealed','mine'); el.textContent='💣'; }
      }
      // 错误标记
      for (let rr=0;rr<MS.rows;rr++) for (let cc=0;cc<MS.cols;cc++) {
        if (MS.board[rr][cc].flag && !MS.board[rr][cc].mine) {
          const el=MS._getCell(rr,cc); if(el){el.textContent='❌';el.classList.add('revealed','wrong');}
        }
      }
      const face=document.getElementById('ms-face'); if(face)face.textContent='😵';
      MS._showGameOver();
      return;
    }
    MS._flood(r,c);
    MS._checkWin();
  },

  // ── 泛洪展开 ──
  _flood(r,c) {
    if (r<0||r>=MS.rows||c<0||c>=MS.cols) return;
    const b=MS.board[r][c];
    if (!b||b.revealed||b.flag||b.mine) return;
    b.revealed=true; MS.revealed++;
    const el=MS._getCell(r,c); if(!el) return;
    el.classList.add('revealed');
    if (b.adj>0) {
      const nc=['','n1','n2','n3','n4','n5','n6','n7','n8'];
      el.innerHTML='<span class="'+nc[b.adj]+'">'+b.adj+'</span>';
    } else {
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        if (dr===0&&dc===0) continue;
        MS._flood(r+dr,c+dc);
      }
    }
  },

  // ── 右键标旗 ──
  toggleFlag(r,c) {
    if (MS.over||!MS.active) return;
    const b=MS.board[r][c]; if (!b||b.revealed) return;
    b.flag=!b.flag; MS.flags+=b.flag?1:-1;
    const el=MS._getCell(r,c); if(el){el.textContent=b.flag?'🚩':''; if(b.flag)el.classList.add('flag');else el.classList.remove('flag');}
    const mc=document.getElementById('ms-mines'); if(mc)mc.textContent=String(Math.max(0,MS.mines-MS.flags)).padStart(3,'0');
    if (!MS.first) MS._checkWin();
  },

  // ── 双击数字自动翻开（和弦 Chord） ──
  _chord(r,c) {
    if (MS.over||!MS.active) return;
    const b=MS.board[r][c]; if (!b||!b.revealed||b.adj<=0) return;
    // 数周围旗子
    let flagCount=0;
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      if (dr===0&&dc===0) continue;
      const nr=r+dr, nc=c+dc;
      if (nr>=0&&nr<MS.rows&&nc>=0&&nc<MS.cols&&MS.board[nr][nc].flag) flagCount++;
    }
    if (flagCount!==b.adj) return; // 旗数不匹配，不操作
    // 翻开周围未标记的格子
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      if (dr===0&&dc===0) continue;
      const nr=r+dr, nc=c+dc;
      if (nr>=0&&nr<MS.rows&&nc>=0&&nc<MS.cols) MS.reveal(nr,nc);
    }
  },

  // ── 胜利判定 ──
  _checkWin() {
    let unrevealed=0;
    for (let r=0;r<MS.rows;r++) for (let c=0;c<MS.cols;c++) if (!MS.board[r][c].revealed) unrevealed++;
    if (unrevealed!==MS.mines) return;
    MS.over=true; MS._stopTimer();
    const face=document.getElementById('ms-face'); if(face)face.textContent='😎';
    // 自动标旗剩余地雷
    for (let r=0;r<MS.rows;r++) for (let c=0;c<MS.cols;c++) {
      if (MS.board[r][c].mine&&!MS.board[r][c].flag) {
        MS.board[r][c].flag=true;
        const el=MS._getCell(r,c); if(el)el.textContent='🚩';
      }
    }
    MS._showGameOver();
  },

  // ── 游戏结束弹框 ──
  _showGameOver() {
    setTimeout(() => {
      const wrapper = document.getElementById('ms-lb');
      if (!wrapper) return;
      const won = !MS.board.some(row => row.some(c => c.mine && c.revealed && !c.flag));
      const timeStr = MS._timer + 's';
      let html = '<div class="ms-go-wrap">';
      html += '<div class="ms-go-title">' + (won ? '😎 恭喜通关！' : '😵 Game Over') + '</div>';
      html += '<div class="ms-go-time">⏱ ' + timeStr + ' | 🚩 ' + MS.mines + ' 雷 | ' + MS.rows + '×' + MS.cols + '</div>';
      if (won) {
        html += '<input id="ms-name-input" style="margin:6px 0;padding:4px 8px;background:var(--bg);border:1px solid var(--amber);border-radius:4px;color:var(--fg);font-size:12px;text-align:center;font-family:var(--mono)" value="' + MS._randName() + '" maxlength="16">';
        html += '<button onclick="MS._saveLB()" style="padding:4px 12px;background:var(--amber-dim);border:1px solid var(--amber);color:var(--amber);border-radius:4px;cursor:pointer;font-size:12px;font-family:var(--mono)">📋 提交成绩</button>';
      }
      html += '<button onclick="MS.init()" style="margin-left:6px;padding:4px 12px;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:4px;cursor:pointer;font-size:12px;font-family:var(--mono)">新游戏</button>';
      html += '</div>';
      wrapper.innerHTML = html;
    }, 400);
  },

  // ── 排行榜（按时间，越短越好） ──
  _fetchLB() {
    const key = 'ms_lb_' + gDiff;
    MS._leaderboard = JSON.parse(localStorage.getItem(key) || '[]');
    MS._renderLB();
  },
  _saveLB() {
    const input = document.getElementById('ms-name-input');
    const name = (input?.value||'').trim() || MS._randName();
    const key = 'ms_lb_' + gDiff;
    const lb = JSON.parse(localStorage.getItem(key) || '[]');
    // 同名保留最佳成绩
    const exist = lb.findIndex(e => e.name === name);
    const entry = { name, time: MS._timer, rows: MS.rows, cols: MS.cols, ts: Date.now() };
    if (exist>=0) { if (MS._timer < lb[exist].time) lb[exist] = entry; }
    else lb.push(entry);
    lb.sort((a,b) => a.time - b.time);
    MS._leaderboard = lb.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(MS._leaderboard));
    // 提交远程
    try { new Image().src = APPSCRIPT + '?action=lb_submit&size=ms' + gDiff + '&name=' + encodeURIComponent(name) + '&score=' + MS._timer; } catch(e){}
    MS._renderLB();
  },
  _renderLB() {
    const el = document.getElementById('ms-lb');
    if (!el) return;
    const lb = MS._leaderboard;
    if (!lb.length) { el.innerHTML = '<div style="color:var(--dim);font-size:11px;margin-top:8px">🏅 暂无记录</div>'; return; }
    const diffs = ['简单','中等','困难'];
    let html = '<div style="font-size:12px;font-weight:700;color:var(--teal-t);margin:8px 0 4px">🏅 ' + diffs[gDiff] + ' 排行榜 · 最快通关</div>';
    lb.slice(0, 10).forEach((e,i) => {
      const m = ['🥇','🥈','🥉'][i] || (i+1);
      html += '<div style="font-size:11px;color:var(--dim);display:flex;justify-content:space-between;padding:1px 0;border-bottom:1px solid var(--border)"><span>' + m + ' ' + esc(e.name) + '</span><span style="color:var(--green);font-family:var(--mono)">' + e.time + 's</span></div>';
    });
    el.innerHTML = html;
  },

  // ── 键盘 / 右键 ──
  _key(e) { if (e.key==='f'||e.key==='F') { e.preventDefault(); } },
  _ctx(e) { e.preventDefault(); },

  _resize() {
    if (!MS.active) return;
    const grid = document.getElementById('ms-grid');
    if (!grid) return;
    const c = MS.cfg; MS._cellS = c.cs;
    grid.style.gridTemplateColumns = 'repeat(' + MS.cols + ',' + c.cs + 'px)';
    grid.querySelectorAll('.ms-cell').forEach(cell => {
      cell.style.width = c.cs + 'px'; cell.style.height = c.cs + 'px'; cell.style.fontSize = c.fs + 'px';
    });
  },
  _onResize() { clearTimeout(MS._rt); MS._rt = setTimeout(() => MS._resize(), 120); },
};

// ══════════════════════════════════════════════════
//  数独
// ══════════════════════════════════════════════════
const SD = {
  board:[], solution:[], given:[], selR:-1, selC:-1, errs:0, active:false,

  get cfg() {
    const diffs = [38, 30, 24];
    const cell = _fitCell(48, 9, 9, 30, 150);
    const fs = Math.max(12, Math.round(20 * cell / 48));
    return { givens: diffs[gDiff]||38, cell, fs };
  },

  init() {
    if (gCurr !== 'sudoku') return;
    SD.deactivate();
    SD.active = true;
    SD.board=[]; SD.solution=[]; SD.given=[]; SD.selR=-1; SD.selC=-1; SD.errs=0; SD.conflicts=0;
    SD._generate();
    SD._render();
    document.addEventListener('keydown', SD._key);
    window.addEventListener('resize', SD._onResize);
  },

  deactivate() { document.removeEventListener('keydown',SD._key); window.removeEventListener('resize',SD._onResize); SD.active=false; },

  _generate() {
    // 生成完整解
    const sol = Array.from({length:9},()=>Array(9).fill(0));
    const fill = (r,c) => {
      if (r===9) return true;
      if (c===9) return fill(r+1,0);
      const nums=[1,2,3,4,5,6,7,8,9]; for (let i=nums.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[nums[i],nums[j]]=[nums[j],nums[i]];}
      for (const n of nums) { if (SD._valid(sol,r,c,n)) { sol[r][c]=n; if (fill(r,c+1)) return true; } }
      sol[r][c]=0; return false;
    };
    fill(0,0);
    // 合法变换增加随机性（仅限保持数独有效的操作）
    for (let i=0;i<5;i++) {
      const op=Math.floor(Math.random()*4);
      if (op===0){
        const band=Math.floor(Math.random()*3)*3;
        let r1=band+Math.floor(Math.random()*3), r2=band+Math.floor(Math.random()*3);
        for(let c=0;c<9;c++){[sol[r1][c],sol[r2][c]]=[sol[r2][c],sol[r1][c]];}
      } else if(op===1){
        const stack=Math.floor(Math.random()*3)*3;
        let c1=stack+Math.floor(Math.random()*3), c2=stack+Math.floor(Math.random()*3);
        for(let r=0;r<9;r++){[sol[r][c1],sol[r][c2]]=[sol[r][c2],sol[r][c1]];}
      } else if(op===2){
        const a=1+Math.floor(Math.random()*9), b=1+Math.floor(Math.random()*9);
        for(let r=0;r<9;r++)for(let c=0;c<9;c++){if(sol[r][c]===a)sol[r][c]=b;else if(sol[r][c]===b)sol[r][c]=a;}
      } else {
        for(let r=0;r<9;r++)for(let c=r+1;c<9;c++){[sol[r][c],sol[c][r]]=[sol[c][r],sol[r][c]];}
      }
    }
    SD.solution = sol.map(r=>[...r]);
    // 挖空 — 逐个验证唯一解
    SD.given = Array.from({length:9},()=>Array(9).fill(true));
    SD.board = sol.map(r=>[...r]);
    const cells=[]; for (let r=0;r<9;r++) for (let c=0;c<9;c++) cells.push({r,c});
    for (let i=cells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
    let removed=0; const target=81-SD.cfg.givens;
    for (const {r,c} of cells) {
      if (removed>=target) break;
      const backup=SD.board[r][c];
      SD.board[r][c]=0; SD.given[r][c]=false;
      if (SD._countSolutions(SD.board.map(row=>[...row]), 2)===1) {
        removed++;
      } else {
        SD.board[r][c]=backup; SD.given[r][c]=true;
      }
    }
    SD.errs=0; SD.conflicts=0;
  },

  // 计数解的数量（MRV启发式，达到limit即停止）
  _countSolutions(board, limit) {
    let bestR=-1, bestC=-1, bestOpts=10;
    for (let r=0;r<9;r++) {
      for (let c=0;c<9;c++) {
        if (board[r][c]===0) {
          let opts=0;
          for (let n=1;n<=9;n++) { if (SD._valid(board,r,c,n)) opts++; }
          if (opts===0) return 0;
          if (opts<bestOpts) { bestOpts=opts; bestR=r; bestC=c; if (opts===1) break; }
        }
      }
    }
    if (bestR===-1) return 1;
    let count=0;
    for (let n=1;n<=9;n++) {
      if (SD._valid(board,bestR,bestC,n)) {
        board[bestR][bestC]=n;
        count+=SD._countSolutions(board, limit-count);
        board[bestR][bestC]=0;
        if (count>=limit) return count;
      }
    }
    return count;
  },

  _valid(board,r,c,n) {
    for (let i=0;i<9;i++) { if (board[r][i]===n) return false; if (board[i][c]===n) return false; }
    const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
    for (let rr=br;rr<br+3;rr++) for (let cc=bc;cc<bc+3;cc++) if (board[rr][cc]===n) return false;
    return true;
  },

  _render() {
    const view = document.getElementById('game-view');
    if (!view||!SD.active) return;
    view.innerHTML =
      '<div class="sd-topbar">'
      + '<button class="sd-new-btn" onclick="SD.init()">新游戏</button>'
	      + (SD.errs>0||SD.conflicts>0?'<span class="sd-err">⚠ '+(SD.conflicts>0?SD.conflicts+'处冲突':'')+(SD.conflicts>0&&SD.errs>0?' ':'')+(SD.errs>0?SD.errs+'处错误':'')+'</span>':'') +
      + '</div>'
      + '<div class="sd-grid" id="sd-grid"></div>'
      + '<div class="sd-num-pad" id="sd-numpad"></div>'
      + '<div class="gm-hint">点击格子 → 按数字键 / 点下方按钮 | ← Backspace 擦除</div>';
    const grid=document.getElementById('sd-grid');
    for (let r=0;r<9;r++) for (let c=0;c<9;c++) {
      const cell=document.createElement('div');
      cell.className='sd-cell'; cell.style.width=SD.cfg.cell+'px'; cell.style.height=SD.cfg.cell+'px'; cell.style.fontSize=SD.cfg.fs+'px';
      if (SD.given[r][c]) cell.classList.add('given');
      if (SD.board[r][c]!==0) cell.textContent=SD.board[r][c];
      if (SD.board[r][c]!==0&&!SD.given[r][c]&&SD.board[r][c]!==SD.solution[r][c]) cell.classList.add('error');
	      if (SD.board[r][c]!==0&&SD._hasConflict(r,c)) cell.classList.add('conflict');
      if (r===SD.selR&&c===SD.selC) cell.classList.add('selected');
      // 高亮同行同列同宫
      if (SD.selR>=0&&(r===SD.selR||c===SD.selC||(Math.floor(r/3)===Math.floor(SD.selR/3)&&Math.floor(c/3)===Math.floor(SD.selC/3)))) cell.classList.add('hint');
      if (r%3===0) cell.style.borderTop='2px solid var(--text)';
      if (c%3===0) cell.style.borderLeft='2px solid var(--text)';
      cell.onclick=()=>SD.select(r,c);
      grid.appendChild(cell);
    }
    // 数字按键
    const pad=document.getElementById('sd-numpad');
    const used=new Set();
    for (let r=0;r<9;r++) for (let c=0;c<9;c++) if (SD.board[r][c]!==0) { const cnt=SD._countNum(SD.board[r][c]); if(cnt>=9) used.add(SD.board[r][c]); }
    for (let n=1;n<=9;n++) {
      const btn=document.createElement('button');
      btn.className='sd-num-btn'+(used.has(n)?' used':'');
      btn.textContent=n; btn.onclick=()=>SD.place(n); pad.appendChild(btn);
    }
    const erase=document.createElement('button');
    erase.className='sd-erase-btn'; erase.textContent='⌫'; erase.onclick=()=>SD.place(0); pad.appendChild(erase);
  },

  _countNum(n) { let c=0; for (let r=0;r<9;r++) for (let cc=0;cc<9;cc++) if (SD.board[r][cc]===n) c++; return c; },

  select(r,c) {
    if (SD.given[r][c]) return;
    SD.selR=r; SD.selC=c; SD._render();
  },

  place(n) {
    if (SD.selR<0||SD.selC<0||SD.given[SD.selR][SD.selC]) return;
    SD.board[SD.selR][SD.selC]=n;
	    SD.errs=0; SD.conflicts=0;
	    for (let r=0;r<9;r++) for (let c=0;c<9;c++) {
	      if (SD.board[r][c]!==0&&!SD.given[r][c]&&SD.board[r][c]!==SD.solution[r][c]) SD.errs++;
	      if (SD.board[r][c]!==0&&SD._hasConflict(r,c)) SD.conflicts++;
	    }
    SD._render();
    SD._checkWin();
  },

  _hasConflict(r,c) {
    const v=SD.board[r][c]; if (v===0) return false;
    for (let i=0;i<9;i++) { if (i!==c&&SD.board[r][i]===v) return true; if (i!==r&&SD.board[i][c]===v) return true; }
    const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
    for (let rr=br;rr<br+3;rr++) for (let cc=bc;cc<bc+3;cc++) if ((rr!==r||cc!==c)&&SD.board[rr][cc]===v) return true;
    return false;
  },

  _checkWin() {
    for (let r=0;r<9;r++) for (let c=0;c<9;c++) if (SD.board[r][c]===0||(!SD.given[r][c]&&SD.board[r][c]!==SD.solution[r][c])) return;
    const view=document.getElementById('game-view');
    if (view) { const win=document.createElement('div'); win.className='sd-win'; win.textContent='🎉 恭喜完成！'; view.appendChild(win); }
  },

  _key(e) {
    if (!SD.active||gCurr!=='sudoku') return;
    if (e.key>='1'&&e.key<='9') { e.preventDefault(); SD.place(parseInt(e.key)); }
    else if (e.key==='Backspace'||e.key==='Delete') { e.preventDefault(); SD.place(0); }
    else if (e.key==='ArrowUp'&&SD.selR>0) { e.preventDefault(); SD.select(SD.selR-1,SD.selC); }
    else if (e.key==='ArrowDown'&&SD.selR<8) { e.preventDefault(); SD.select(SD.selR+1,SD.selC); }
    else if (e.key==='ArrowLeft'&&SD.selC>0) { e.preventDefault(); SD.select(SD.selR,SD.selC-1); }
    else if (e.key==='ArrowRight'&&SD.selC<8) { e.preventDefault(); SD.select(SD.selR,SD.selC+1); }
  },

  _resize() {
    if (!SD.active) return;
    const grid = document.getElementById('sd-grid');
    if (!grid) return;
    const c = SD.cfg;
    grid.querySelectorAll('.sd-cell').forEach((cell, i) => {
      cell.style.width = c.cell + 'px'; cell.style.height = c.cell + 'px'; cell.style.fontSize = c.fs + 'px';
    });
  },
  _onResize() { clearTimeout(SD._rt); SD._rt = setTimeout(() => SD._resize(), 120); },
};

// ══════════════════════════════════════════════════
//  俄罗斯方块 (Tetris)
// ══════════════════════════════════════════════════
const SHAPES = {
  I: { shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  O: { shape:[[1,1],[1,1]] },
  T: { shape:[[0,1,0],[1,1,1],[0,0,0]] },
  S: { shape:[[0,1,1],[1,1,0],[0,0,0]] },
  Z: { shape:[[1,1,0],[0,1,1],[0,0,0]] },
  J: { shape:[[1,0,0],[1,1,1],[0,0,0]] },
  L: { shape:[[0,0,1],[1,1,1],[0,0,0]] },
};
const TETRIS_KEYS = 'IJOTSZL';

const TETRIS = {
  active: false, grid:[], piece:null, next:null, score:0, level:1, lines:0,
  px:0, py:0, timer:null, playerName:'', leaderboard:[], _rt:null,
  _lastPiece:null, _lastPx:-1, _lastPy:-1,
  _rafId:null, _paused:false,

  get cfg() {
    const cell = _fitCell(24, 10, 22, 220, 80);
    return { cell, gap:1, cols:10, rows:20 };
  },

  init() {
    if (gCurr !== 'tetris') return;
    TETRIS.deactivate();
    TETRIS.active = true;
    TETRIS.score = 0; TETRIS.level = 1; TETRIS.lines = 0;
    TETRIS.playerName = ''; TETRIS._over = false;
    TETRIS._reset();        // 先初始化 grid + piece
    TETRIS._render();       // 再渲染（确保 grid 非空）
    TETRIS._syncDOM();      // 画上活动方块
    TETRIS._fetchLB();
    document.addEventListener('keydown', TETRIS._key);
    window.addEventListener('resize', TETRIS._onResize);
  },

  deactivate() {
    clearInterval(TETRIS.timer); TETRIS.timer = null;
    document.removeEventListener('keydown', TETRIS._key);
    window.removeEventListener('resize', TETRIS._onResize);
    TETRIS.active = false;
  },

  _reset() {
    TETRIS.grid = Array.from({length:20}, ()=>Array(10).fill(0));
    TETRIS._spawn();
    TETRIS._spawn();
    TETRIS._startTick();
  },

  _spawn() {
    if (TETRIS.next) {
      TETRIS.piece = TETRIS.next;
    } else {
      const keys = TETRIS_KEYS;
      TETRIS.piece = keys[Math.floor(Math.random()*7)];
    }
    TETRIS.next = TETRIS_KEYS[Math.floor(Math.random()*7)];
    TETRIS.px = 3; TETRIS.py = 0;
    // check collision
    if (TETRIS._collision(TETRIS.piece, TETRIS.px, TETRIS.py)) {
      TETRIS._over = true;
      clearInterval(TETRIS.timer);
      TETRIS._endGame();
    }
  },

  _collision(key, px, py) {
    const s = SHAPES[key].shape;
    for (let r=0; r<s.length; r++) {
      for (let c=0; c<s[r].length; c++) {
        if (!s[r][c]) continue;
        const nx = px + c, ny = py + r;
        if (nx < 0 || nx >= 10 || ny >= 20) return true;
        if (ny >= 0 && TETRIS.grid[ny][nx]) return true;
      }
    }
    return false;
  },

  _lock() {
    const s = SHAPES[TETRIS.piece].shape;
    for (let r=0; r<s.length; r++) {
      for (let c=0; c<s[r].length; c++) {
        if (!s[r][c]) continue;
        const nx = TETRIS.px + c, ny = TETRIS.py + r;
        if (ny < 0) { TETRIS._over = true; return; }
        TETRIS.grid[ny][nx] = 1;
      }
    }
    // clear lines
    const clearedRows = [];
    for (let r = 19; r >= 0; r--) {
      if (TETRIS.grid[r].every(cell => cell !== 0)) {
        clearedRows.push(r);
      }
    }
    if (clearedRows.length > 0) {
      TETRIS._paused = true; // 暂停下落，播动画
      TETRIS._burstParticles(clearedRows);
      setTimeout(() => {
        TETRIS._paused = false;
        for (let i = clearedRows.length - 1; i >= 0; i--) {
          TETRIS.grid.splice(clearedRows[i] + (clearedRows.length - 1 - i), 1);
          TETRIS.grid.unshift(Array(10).fill(0));
        }
        const pts = [0, 100, 300, 500, 800];
        TETRIS.score += (pts[clearedRows.length] || 800) * TETRIS.level;
        TETRIS.lines += clearedRows.length;
        TETRIS.level = Math.floor(TETRIS.lines / 10) + 1;
        TETRIS._syncDOM();
        TETRIS._startTick(); // 更新速度
      }, 150);
    }
    TETRIS._spawn();
  },

  _startTick() {
    clearInterval(TETRIS.timer);
    cancelAnimationFrame(TETRIS._rafId);
    const speed = Math.max(60, 600 - (TETRIS.level - 1) * 50);
    TETRIS.timer = setInterval(() => {
      if (!TETRIS.active || TETRIS._over || TETRIS._paused) return;
      if (!TETRIS._collision(TETRIS.piece, TETRIS.px, TETRIS.py + 1)) {
        TETRIS.py++;
        TETRIS._syncPiecePos(false);
      } else {
        TETRIS._lock();
        TETRIS._syncDOM();
      }
    }, speed);
    // raf 仅用于保持 overlay 响应（处理 resize 等）
    TETRIS._rafId = null;
  },

  _key(e) {
    if (!TETRIS.active || TETRIS._over) return;
    if (gCurr !== 'tetris') return;
    let moved = false;
    switch (e.key) {
      case 'a': case 'A':
        if (!TETRIS._collision(TETRIS.piece, TETRIS.px - 1, TETRIS.py)) { TETRIS.px--; moved = true; }
        break;
      case 'd': case 'D':
        if (!TETRIS._collision(TETRIS.piece, TETRIS.px + 1, TETRIS.py)) { TETRIS.px++; moved = true; }
        break;
      case 'w': case 'W':
        TETRIS._rotate(); moved = true;
        break;
      case 's': case 'S':
        if (!TETRIS._collision(TETRIS.piece, TETRIS.px, TETRIS.py + 1)) { TETRIS.py++; moved = true; }
        break;
      case ' ':
        e.preventDefault();
        while (!TETRIS._collision(TETRIS.piece, TETRIS.px, TETRIS.py + 1)) TETRIS.py++;
        TETRIS._lock();
        moved = true;
        break;
    }
    if (moved) { e.preventDefault(); TETRIS._syncPiecePos(false); TETRIS._syncDOM(); }
  },

  _rotate() {
    const s = SHAPES[TETRIS.piece].shape;
    const n = s.length;
    // rotate clockwise
    const rotated = Array.from({length:n}, (_,r) =>
      Array.from({length:n}, (_,c) => s[n-1-c][r])
    );
    // try 0, then wall kicks
    const kicks = [0, -1, 1, -2, 2];
    for (const dx of kicks) {
      const tmp = SHAPES[TETRIS.piece].shape;
      SHAPES[TETRIS.piece].shape = rotated;
      if (!TETRIS._collision(TETRIS.piece, TETRIS.px + dx, TETRIS.py)) {
        TETRIS.px += dx;
        return;
      }
      SHAPES[TETRIS.piece].shape = tmp; // restore
    }
  },

  _endGame() {
    clearInterval(TETRIS.timer);
    const input = document.getElementById('tetris-name');
    TETRIS.playerName = (input?.value || '').trim() || TETRIS._randName();
    TETRIS._submitLB();
  },

  _randName() {
    const adj = ['Swift','Storm','Shadow','Nova','Blaze','Frost','Ace','Neon','Zen','Hawk'];
    const noun = ['Block','Line','Drop','Stack','Clear','Spin','Grid','Rush','Fall','Edge'];
    return adj[Math.floor(Math.random()*adj.length)] + noun[Math.floor(Math.random()*noun.length)];
  },

  async _fetchLB() {
    try {
      const resp = await fetch(APPSCRIPT + '?action=lb_get&size=tetris', { mode:'no-cors' });
    } catch(e){}
    const local = JSON.parse(localStorage.getItem('tetris_lb')||'[]');
    TETRIS.leaderboard = local.slice(0,15);
  },

  async _submitLB() {
    const name = TETRIS.playerName;
    const score = TETRIS.score;
    try {
      await fetch(APPSCRIPT + '?action=lb_submit&size=tetris&name=' + encodeURIComponent(name) + '&score=' + score, { mode:'no-cors' });
    } catch(e){}
    const lb = JSON.parse(localStorage.getItem('tetris_lb')||'[]');
    lb.push({ name, score, lines: TETRIS.lines, level: TETRIS.level, ts: Date.now() });
    lb.sort((a,b)=>b.score-a.score);
    localStorage.setItem('tetris_lb', JSON.stringify(lb.slice(0,50)));
    TETRIS.leaderboard = lb.slice(0,15);
    TETRIS._render();
  },

  _render() {
    const view = document.getElementById('game-view');
    if (!view) return;
    const c = TETRIS.cfg;
    const cellPx = c.cell + c.gap;
    const gridW = cellPx * 10 + 4;

    let html = '<div class="tetris-wrap">';
    // 主游戏区
    html += '<div class="tetris-main">';
    html += '<div class="tetris-grid" id="tetris-grid" style="width:' + gridW + 'px;grid-template-columns:repeat(10,' + cellPx + 'px);grid-template-rows:repeat(20,' + cellPx + 'px)">';
    for (let r = 0; r < 20; r++) {
      for (let col = 0; col < 10; col++) {
        const filled = TETRIS.grid[r] && TETRIS.grid[r][col];
        html += '<div class="tetris-cell' + (filled ? ' tetris-filled' : '') + '"></div>';
      }
    }
    // 活动方块覆盖层
    html += '<div id="tetris-piece"></div>';
    html += '</div></div>';

    // 侧边栏
    const nextW = c.cell * 4 + 20;
    html += '<div class="tetris-side" style="width:' + nextW + 'px">';
    html += '<div class="tetris-score">' + TETRIS.score.toLocaleString() + '</div>';
    html += '<div class="tetris-info">LV.' + TETRIS.level + ' | ' + TETRIS.lines + ' ⬜</div>';
    // 预览
    html += '<div class="tetris-next-label">NEXT</div>';
    html += '<div class="tetris-next" id="tetris-next">';
    if (TETRIS.next) {
      const ns = SHAPES[TETRIS.next].shape;
      const n = ns.length;
      for (let r=0; r<n; r++) {
        for (let c2=0; c2<ns[r].length; c2++) {
          html += '<div class="tetris-mini' + (ns[r][c2] ? ' tetris-filled' : '') + '"></div>';
        }
        html += '<br>';
      }
    }
    html += '</div>';

    // 排行榜 top 15
    html += '<div class="tetris-lb-title">🏅 TOP 15</div>';
    html += '<div class="tetris-lb-list">';
    if (TETRIS.leaderboard.length === 0) {
      html += '<div class="tetris-lb-empty">暂无数据</div>';
    } else {
      TETRIS.leaderboard.forEach((e, i) => {
        html += '<div class="tetris-lb-row"><span>' + (i+1) + '. ' + esc(e.name) + '</span><span>' + e.score.toLocaleString() + '</span></div>';
      });
    }
    html += '</div>';

    // Game Over 名字输入
    if (TETRIS._over) {
      html += '<div class="tetris-go">GAME OVER</div>';
      html += '<input id="tetris-name" class="tetris-name-input" placeholder="输入名字" value="' + TETRIS._randName() + '">';
      html += '<button class="tetris-submit" onclick="TETRIS._endGame()">📋 提交分数</button>';
      html += '<button class="tetris-restart" onclick="TETRIS.init()">🔄 重新开始</button>';
    }

    html += '</div></div>'; // tetris-side, tetris-wrap
    view.innerHTML = html;
  },

  // 更新方块位置（2048 动画模式：无过渡→设位→回流→开过渡）
  _syncPiecePos(isSpawn) {
    const pieceEl = document.getElementById('tetris-piece');
    if (!pieceEl || !TETRIS.piece) return;
    const c = TETRIS.cfg;
    const cellPx = c.cell + c.gap;
    const nx = TETRIS.px * cellPx;
    const ny = TETRIS.py * cellPx;
    if (isSpawn) {
      pieceEl.style.transition = 'none';
      pieceEl.style.left = nx + 'px';
      pieceEl.style.top = ny + 'px';
      void pieceEl.offsetHeight; // 强制回流
      pieceEl.style.transition = '';
    } else {
      pieceEl.style.left = nx + 'px';
      pieceEl.style.top = ny + 'px';
    }
  },

  _syncDOM() {
    if (TETRIS._over) return;
    const c = TETRIS.cfg;
    const cellPx = c.cell + c.gap;
    // 更新已锁定的格子
    const cells = document.querySelectorAll('#tetris-grid > .tetris-cell');
    for (let r = 0; r < 20; r++) {
      for (let col = 0; col < 10; col++) {
        const idx = r * 10 + col;
        if (cells[idx]) {
          cells[idx].classList.toggle('tetris-filled', !!(TETRIS.grid[r] && TETRIS.grid[r][col]));
        }
      }
    }
    // 更新活动方块覆盖层
    const pieceEl = document.getElementById('tetris-piece');
    if (!pieceEl || !TETRIS.piece) return;
    const changed = (TETRIS._lastPiece !== TETRIS.piece || TETRIS._lastPx !== TETRIS.px || TETRIS._lastPy !== TETRIS.py);
    const spawned = (TETRIS._lastPiece !== TETRIS.piece);
    if (changed) {
      if (spawned) {
        // 新方块：瞬间跳顶（无过渡）
        TETRIS._syncPiecePos(true);
      } else {
        // 旋转/平移：正常过渡
        TETRIS._syncPiecePos(false);
      }
      // 重建方块内部 HTML
      const s = SHAPES[TETRIS.piece].shape;
      const n = s.length;
      let pieceHtml = '';
      for (let r=0; r<n; r++) {
        for (let c2=0; c2<s[r].length; c2++) {
          if (s[r][c2]) {
            pieceHtml += '<div class="tetris-cell tetris-filled" style="position:absolute;left:' + (c2*cellPx) + 'px;top:' + (r*cellPx) + 'px;width:' + cellPx + 'px;height:' + cellPx + 'px"></div>';
          }
        }
      }
      pieceEl.innerHTML = pieceHtml;
    }
    TETRIS._lastPiece = TETRIS.piece;
    TETRIS._lastPx = TETRIS.px;
    TETRIS._lastPy = TETRIS.py;
    // 更新 NEXT 预览
    TETRIS._updateNext();
  },

  _updateNext() {
    const el = document.getElementById('tetris-next');
    if (!el || !TETRIS.next) return;
    const ns = SHAPES[TETRIS.next].shape;
    const n = ns.length;
    let h = '';
    for (let r=0; r<n; r++) {
      for (let c2=0; c2<ns[r].length; c2++) {
        h += '<div class="tetris-mini' + (ns[r][c2] ? ' tetris-filled' : '') + '"></div>';
      }
      h += '<br>';
    }
    el.innerHTML = h;
  },

  // ── 消行粒子 ──
  _burstParticles(rows) {
    const gridEl = document.getElementById('tetris-grid');
    if (!gridEl) return;
    const c = TETRIS.cfg;
    const cellPx = c.cell + c.gap;
    rows.forEach(r => {
      for (let col = 0; col < 10; col++) {
        const cx = col * cellPx + cellPx / 2;
        const cy = r * cellPx + cellPx / 2;
        for (let i = 0; i < 8; i++) {
          const p = document.createElement('div');
          p.className = 'tetris-particle';
          const angle = (Math.PI * 2 * i / 8) + Math.random() * 0.5;
          const dist = 20 + Math.random() * 30;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist;
          p.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;'
            + '--dx:' + dx + 'px;--dy:' + dy + 'px;'
            + '--rot:' + (Math.random()*360) + 'deg;'
            + '--delay:' + (Math.random()*0.1) + 's;'
            + 'width:' + (4+Math.random()*4) + 'px;height:' + (4+Math.random()*4) + 'px;';
          gridEl.appendChild(p);
          setTimeout(() => p.remove(), 600);
        }
      }
    });
  },

  _resize() {
    TETRIS._render();
    TETRIS._syncDOM();
  },
  _onResize() { clearTimeout(TETRIS._rt); TETRIS._rt = setTimeout(() => { TETRIS._resize(); TETRIS._syncDOM(); }, 120); },
};

// ── init2048 兼容旧引用 ─────────────────────────
function init2048() { G24.init(); }
