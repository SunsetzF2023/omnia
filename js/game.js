/* ═══════════════════════════════════════════════
   game.js — 游戏中心
   2048 / 扫雷 / 数独，支持多难度/尺寸
   ═══════════════════════════════════════════════ */

// ── 游戏注册表 ──────────────────────────────────
const GAMES = {
  '2048':        { name: '2048',        icon: '🟩', diffs: ['4×4','5×5','6×6'] },
  'minesweeper': { name: '扫雷', icon: '💣', diffs: ['简单','中等','困难'] },
  'sudoku':      { name: '数独', icon: '🧩', diffs: ['简单','中等','困难'] },
};
let gCurr = '2048', gDiff = 0;   // 当前游戏 & 难度索引

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
//  2048
// ══════════════════════════════════════════════════
const G24 = {
  tiles: [], score: 0, best: 0, over: false, won: false,
  nextId: 1, moving: false, elMap: {}, active: false,
  leaderboard: [],

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

  init() {
    if (gCurr !== '2048') return;
    G24.deactivate();
    G24.active = true;
    G24.tiles = []; G24.score = 0; G24.over = false; G24.won = false;
    G24.nextId = 1; G24.moving = false; G24.elMap = {};
    G24.best = parseInt(localStorage.getItem('2048_best') || '0');
    G24._render();
    G24._initLeaderboard();
    G24._spawn(); G24._spawn();
    G24._syncDOM();
    G24._updateUI();
    document.addEventListener('keydown', G24._key);
    window.addEventListener('resize', G24._onResize);
  },

  deactivate() { document.removeEventListener('keydown', G24._key); window.removeEventListener('resize', G24._onResize); G24.active = false; },

  _at(r,c) { return G24.tiles.find(t => t.row===r && t.col===c); },

  _spawn(anim) {
    const cfg = G24.cfg;
    const empty = [];
    for (let r=0; r<cfg.n; r++) for (let c=0; c<cfg.n; c++) if (!G24._at(r,c)) empty.push({r,c});
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
    view.innerHTML =
      '<div class="g2048-header">'
      + '<div class="g2048-title">2<span style="color:var(--amber)">0</span>4<span style="color:var(--amber)">8</span></div>'
      + '<div class="g2048-stat"><div class="g2048-stat-label">分数</div><div class="g2048-stat-val" id="g24-score">0</div></div>'
      + '<div class="g2048-stat"><div class="g2048-stat-label">最佳</div><div class="g2048-stat-val" id="g24-best">0</div></div>'
      + '<button class="g2048-new-btn" onclick="G24.init()">新游戏</button></div>'
      + '<div class="g2048-body">'
      + '<div class="g2048-wrap"><div id="g24-particles"></div><div class="g2048-grid" id="g24-grid" style="grid-template-columns:repeat('+cfg.n+','+cfg.cell+'px);grid-template-rows:repeat('+cfg.n+','+cfg.cell+'px);gap:'+cfg.gap+'px;width:'+gw+'px;height:'+gw+'px;"></div>'
      + '<div class="g2048-msg" id="g24-msg"></div></div>'
      + '<div class="g2048-lb" id="g24-lb"></div></div>'
      + '<div class="gm-hint">↑↓←→ / WASD 方向键 | 合并到 2048 获胜</div>';
    // 背景格
    const grid = document.getElementById('g24-grid');
    for (let r=0; r<cfg.n; r++) for (let c=0; c<cfg.n; c++) {
      const cell = document.createElement('div'); cell.className='g2048-cell'; grid.appendChild(cell);
    }
  },

  _syncDOM() {
    if (!G24.active) return;
    const grid = document.getElementById('g24-grid');
    if (!grid) return;
    const cfg = G24.cfg;
    const ids = new Set(G24.tiles.map(t=>t.id));
    Object.keys(G24.elMap).forEach(id => { if (!ids.has(+id)) { G24.elMap[id].remove(); delete G24.elMap[id]; } });
    G24.tiles.forEach(t => {
      const tx = t.col * (cfg.cell+cfg.gap), ty = t.row * (cfg.cell+cfg.gap);
      let el = G24.elMap[t.id];
      if (!el) {
        el = document.createElement('div');
        el.className = 'g2048-tile t'+t.val;
        el.textContent = t.val;
        el.style.width = el.style.height = cfg.cell+'px';
        el.style.fontSize = t.val>=1024 ? Math.max(14,cfg.font-6)+'px' : cfg.font+'px';
        G24.elMap[t.id] = el; grid.appendChild(el);
        if (t.isNew) {
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
        el.className = 'g2048-tile t'+t.val;
        el.textContent = t.val;
        el.style.width = el.style.height = cfg.cell+'px';
        el.style.fontSize = t.val>=1024 ? Math.max(14,cfg.font-6)+'px' : cfg.font+'px';
        el.style.transition = 'transform .15s ease-in-out';
        el.style.transform = 'translate('+tx+'px,'+ty+'px) scale(1)';
      }
    });
    G24.tiles.forEach(t=>t.isNew=false);
  },

  _slide(arr) {
    let f = arr.filter(v=>v!==0);
    for (let i=0; i<f.length-1; i++) {
      if (f[i].val===f[i+1].val) { f[i]={val:f[i].val*2,id:f[i].id,mergedFrom:f[i+1].id}; G24.score+=f[i].val; f[i+1]=0; }
    }
    f=f.filter(v=>v!==0); while (f.length<G24.cfg.n) f.push(0); return f;
  },

  move(dir) {
    if (G24.over||G24.moving||!G24.active) return;
    const n=G24.cfg.n, oldPos={};
    G24.tiles.forEach(t=>{oldPos[t.id]={row:t.row,col:t.col};});
    let rows=[];
    if (dir==='left') { for (let r=0;r<n;r++) { const a=[]; for (let c=0;c<n;c++) { const t=G24._at(r,c); a.push(t?{val:t.val,id:t.id}:0); } rows.push({r,arr:G24._slide(a)}); } }
    else if (dir==='right') { for (let r=0;r<n;r++) { const a=[]; for (let c=n-1;c>=0;c--) { const t=G24._at(r,c); a.push(t?{val:t.val,id:t.id}:0); } rows.push({r,arr:G24._slide(a).reverse()}); } }
    else if (dir==='up') { for (let c=0;c<n;c++) { const a=[]; for (let r=0;r<n;r++) { const t=G24._at(r,c); a.push(t?{val:t.val,id:t.id}:0); } rows.push({c,arr:G24._slide(a)}); } }
    else if (dir==='down') { for (let c=0;c<n;c++) { const a=[]; for (let r=n-1;r>=0;r--) { const t=G24._at(r,c); a.push(t?{val:t.val,id:t.id}:0); } rows.push({c,arr:G24._slide(a).reverse()}); } }
    const nt=[], mg=new Set(), mergeEvents=[];
    rows.forEach(row=>{
      if (dir==='left'||dir==='right') { const r=row.r; row.arr.forEach((it,ci)=>{ if(it===0)return; const t={id:it.id,val:it.val,row:r,col:ci,isNew:false}; nt.push(t); if(it.mergedFrom){mg.add(it.mergedFrom);mergeEvents.push({val:it.val,row:r,col:ci});} if(oldPos[it.id]&&oldPos[it.id].row===r&&oldPos[it.id].col===ci) t.unmoved=true; }); }
      else { const c=row.c; row.arr.forEach((it,ri)=>{ if(it===0)return; const t={id:it.id,val:it.val,row:ri,col:c,isNew:false}; nt.push(t); if(it.mergedFrom){mg.add(it.mergedFrom);mergeEvents.push({val:it.val,row:ri,col:c});} if(oldPos[it.id]&&oldPos[it.id].row===ri&&oldPos[it.id].col===c) t.unmoved=true; }); }
    });
    if (nt.every(t=>t.unmoved)&&mg.size===0) return;
    nt.forEach(t=>delete t.unmoved);
    G24.tiles = G24.tiles.filter(t=>!mg.has(t.id));
    const staged = nt.map(t=>{ const o=oldPos[t.id]; return {...t, row:o?o.row:t.row, col:o?o.col:t.col}; });
    G24.tiles=staged; G24._syncDOM();
    void (document.getElementById('g24-grid')||{}).offsetHeight;
    G24.tiles=nt; G24.moving=true; G24._syncDOM();
    setTimeout(()=>{ G24._spawn(true); G24._syncDOM(); G24.moving=false; G24._check(); G24._updateUI(); mergeEvents.forEach(evt=>G24._spawnParticle(evt)); },170);
  },

  _check() {
    const n=G24.cfg.n;
    if (!G24.won && G24.tiles.some(t=>t.val===2048)) G24.won=true;
    if (G24.tiles.length < n*n) return;
    for (let r=0;r<n;r++) for (let c=0;c<n-1;c++) { const a=G24._at(r,c),b=G24._at(r,c+1); if(!a||!b||a.val===b.val) return; }
    for (let r=0;r<n-1;r++) for (let c=0;c<n;c++) { const a=G24._at(r,c),b=G24._at(r+1,c); if(!a||!b||a.val===b.val) return; }
    G24.over=true;
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
    if (G24.score>G24.best){G24.best=G24.score;localStorage.setItem('2048_best',G24.best);G24._generateAIScores();G24._renderLeaderboard();}
    const s=document.getElementById('g24-score'), b=document.getElementById('g24-best'), m=document.getElementById('g24-msg');
    if(s)s.textContent=G24.score; if(b)b.textContent=G24.best;
    if(m){ if(G24.won&&!G24.over){m.style.display='flex';m.innerHTML='<div class="g2048-win">🎉 2048！<br><span style="font-size:13px;color:var(--dim)">继续挑战更高分？</span></div>';}else if(G24.over){m.style.display='flex';m.innerHTML='<div class="g2048-over">Game Over</div>';}else{m.style.display='none';m.innerHTML='';} }
    if (G24.over) G24._renderLeaderboard();
  },

  // ── 排行榜 ──────────────────────────────────────
  _initLeaderboard() {
    const saved = localStorage.getItem('2048_lb');
    if (saved) { try { G24.leaderboard = JSON.parse(saved); } catch(_){} }
    G24._generateAIScores();
    G24._renderLeaderboard();
  },

  _generateAIScores() {
    const AI_POOL = ['AlphaGo','DeepMind','Neural-4K','SiliconBot','Pixel-256','GridMaster','TileWhisperer','BinaryBrain','QuantumTile','VectorX','CodeWeaver','LogicPulse','MatrixMind','DataGhost'];
    const entries = [];
    if (G24.best > 0) entries.push({ name: '我', score: G24.best, isMe: true });
    const shuffled = [...AI_POOL].sort(() => Math.random() - 0.5);
    const base = Math.max(G24.best, 1000);
    for (let i = 0; i < 9; i++) {
      const factor = 0.35 + Math.random() * 1.6;
      const score = Math.max(100, Math.round(base * factor / 50) * 50);
      entries.push({ name: shuffled[i] || AI_POOL[i], score, isMe: false });
    }
    entries.sort((a, b) => b.score - a.score);
    G24.leaderboard = entries.slice(0, 10);
    localStorage.setItem('2048_lb', JSON.stringify(G24.leaderboard));
  },

  _renderLeaderboard() {
    const lb = document.getElementById('g24-lb');
    if (!lb) return;
    if (!G24.leaderboard.length) { lb.innerHTML = ''; return; }
    const medals = ['🥇','🥈','🥉'];
    lb.innerHTML =
      '<div class="g2048-lb-title">🏆 排行榜</div>'
      + G24.leaderboard.map((e, i) => {
        const rankClass = i < 3 ? ' r' + (i + 1) : '';
        return '<div class="g2048-lb-row">'
          + '<span class="g2048-lb-rank' + rankClass + '">' + (medals[i] || (i + 1)) + '</span>'
          + '<span class="g2048-lb-name' + (e.isMe ? ' is-me' : '') + '">' + e.name + '</span>'
          + '<span class="g2048-lb-score' + (e.isMe ? ' is-me' : '') + '">' + e.score.toLocaleString() + '</span>'
          + '</div>';
      }).join('');
  },

  _key(e) { const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',A:'left',d:'right',D:'right',w:'up',W:'up',s:'down',S:'down'}; if(map[e.key]){e.preventDefault();G24.move(map[e.key]);} },
};

// ══════════════════════════════════════════════════
//  扫雷
// ══════════════════════════════════════════════════
const MS = {
  board:[], rows:0, cols:0, mines:0, revealed:0, flags:0, over:false, first:true, active:false,
  _cellS:0,

  get cfg() {
    const diffs = [
      { rows:9, cols:9, mines:10, cs:44, fs:16 },
      { rows:16, cols:16, mines:40, cs:32, fs:13 },
      { rows:30, cols:16, mines:99, cs:26, fs:11 },
    ];
    const d = diffs[gDiff] || diffs[0];
    const cell = _fitCell(d.cs, d.cols, d.rows, 30, 100);
    const ratio = cell / d.cs;
    return { rows: d.rows, cols: d.cols, mines: d.mines, cs: cell, fs: Math.max(9, Math.round(d.fs * ratio)) };
  },

  init() {
    if (gCurr !== 'minesweeper') return;
    MS.deactivate();
    MS.active = true;
    const c=MS.cfg; MS.rows=c.rows; MS.cols=c.cols; MS.mines=c.mines; MS._cellS=c.cs;
    MS.board=[]; MS.revealed=0; MS.flags=0; MS.over=false; MS.first=true;
    for (let r=0;r<MS.rows;r++) { MS.board[r]=[]; for (let co=0;co<MS.cols;co++) MS.board[r][co]={mine:false,revealed:false,flag:false,adj:0}; }
    MS._render();
    document.addEventListener('keydown', MS._key);
    document.addEventListener('contextmenu', MS._ctx);
    window.addEventListener('resize', MS._onResize);
  },

  deactivate() { document.removeEventListener('keydown',MS._key); document.removeEventListener('contextmenu',MS._ctx); window.removeEventListener('resize',MS._onResize); MS.active=false; },

  _render() {
    const view = document.getElementById('game-view');
    if (!view||!MS.active) return;
    const c=MS.cfg;
    view.innerHTML =
      '<div class="ms-topbar">'
      + '<div class="ms-counter" id="ms-mines">'+String(MS.mines-MS.flags).padStart(3,'0')+'</div>'
      + '<span class="ms-face" id="ms-face" onclick="MS.init()">😊</span>'
      + '<button class="ms-new-btn" onclick="MS.init()">新游戏</button></div>'
      + '<div class="ms-grid" id="ms-grid" style="grid-template-columns:repeat('+MS.cols+','+c.cs+'px);"></div>'
      + '<div class="gm-hint">左键翻开 | 右键 / F 插旗</div>';
    const grid = document.getElementById('ms-grid');
    for (let r=0;r<MS.rows;r++) for (let co=0;co<MS.cols;co++) {
      const cell = document.createElement('div');
      cell.className='ms-cell';
      cell.style.width=c.cs+'px'; cell.style.height=c.cs+'px'; cell.style.fontSize=c.fs+'px';
      cell.dataset.r=r; cell.dataset.c=co;
      cell.onclick = () => MS.reveal(r,co);
      cell.oncontextmenu = () => { MS.toggleFlag(r,co); return false; };
      grid.appendChild(cell);
    }
  },

  _placeMines(sr,sc) {
    const cand=[]; for (let r=0;r<MS.rows;r++) for (let co=0;co<MS.cols;co++) if (Math.abs(r-sr)>1||Math.abs(co-sc)>1) cand.push({r,co});
    for (let i=cand.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cand[i],cand[j]]=[cand[j],cand[i]];}
    for (let i=0;i<Math.min(MS.mines,cand.length);i++) MS.board[cand[i].r][cand[i].co].mine=true;
    for (let r=0;r<MS.rows;r++) for (let co=0;co<MS.cols;co++) {
      if (MS.board[r][co].mine) continue;
      let a=0; for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) { const nr=r+dr,nc=co+dc; if (nr>=0&&nr<MS.rows&&nc>=0&&nc<MS.cols&&MS.board[nr][nc].mine) a++; }
      MS.board[r][co].adj=a;
    }
  },

  _getCell(r,c) { const grid=document.getElementById('ms-grid'); return grid?grid.children[r*MS.cols+c]:null; },

  reveal(r,c) {
    if (MS.over||!MS.active||MS.board[r][c].revealed||MS.board[r][c].flag) return;
    if (MS.first) { MS._placeMines(r,c); MS.first=false; }
    const b=MS.board[r][c];
    if (b.mine) {
      b.revealed=true; MS.over=true;
      for (let rr=0;rr<MS.rows;rr++) for (let cc=0;cc<MS.cols;cc++) if (MS.board[rr][cc].mine) { const el=MS._getCell(rr,cc); if(el){el.classList.add('revealed','mine');el.textContent='💥';} }
      const face=document.getElementById('ms-face'); if(face)face.textContent='😵';
      return;
    }
    MS._flood(r,c);
    MS._checkWin();
  },

  _flood(r,c) {
    const b=MS.board[r][c]; if (b.revealed||b.flag||b.mine) return;
    b.revealed=true; MS.revealed++;
    const el=MS._getCell(r,c); if(!el) return;
    el.classList.add('revealed');
    if (b.adj>0) { const nc=['','n1','n2','n3','n4','n5','n6','n7','n8']; el.innerHTML='<span class="'+nc[b.adj]+'">'+b.adj+'</span>'; }
    else { if (r>0) MS._flood(r-1,c); if (r<MS.rows-1) MS._flood(r+1,c); if (c>0) MS._flood(r,c-1); if (c<MS.cols-1) MS._flood(r,c+1);
      if (r>0&&c>0) MS._flood(r-1,c-1); if (r>0&&c<MS.cols-1) MS._flood(r-1,c+1); if (r<MS.rows-1&&c>0) MS._flood(r+1,c-1); if (r<MS.rows-1&&c<MS.cols-1) MS._flood(r+1,c+1); }
  },

  toggleFlag(r,c) {
    if (MS.over||!MS.active||MS.board[r][c].revealed) return;
    const b=MS.board[r][c]; b.flag=!b.flag; MS.flags+=b.flag?1:-1;
    const el=MS._getCell(r,c); if(el){el.textContent=b.flag?'🚩':''; if(b.flag)el.classList.add('flag');else el.classList.remove('flag');}
    const mc=document.getElementById('ms-mines'); if(mc)mc.textContent=String(Math.max(0,MS.mines-MS.flags)).padStart(3,'0');
  },

  _hasConflict(r,c) {
    const v=SD.board[r][c]; if (v===0) return false;
    for (let i=0;i<9;i++) { if (i!==c&&SD.board[r][i]===v) return true; if (i!==r&&SD.board[i][c]===v) return true; }
    const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
    for (let rr=br;rr<br+3;rr++) for (let cc=bc;cc<bc+3;cc++) if ((rr!==r||cc!==c)&&SD.board[rr][cc]===v) return true;
    return false;
  },

  _checkWin() {
    let unrevealed=0; for (let r=0;r<MS.rows;r++) for (let c=0;c<MS.cols;c++) if (!MS.board[r][c].revealed) unrevealed++;
    if (unrevealed===MS.mines) { MS.over=true; const face=document.getElementById('ms-face'); if(face)face.textContent='😎';
      for (let r=0;r<MS.rows;r++) for (let c=0;c<MS.cols;c++) if (MS.board[r][c].mine&&!MS.board[r][c].flag) { MS.board[r][c].flag=true; const el=MS._getCell(r,c); if(el)el.textContent='🚩'; } }
  },

  _key(e) { if (e.key==='f'||e.key==='F') { e.preventDefault(); /* handled by context menu or direct */ } },
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

// ── init2048 兼容旧引用 ─────────────────────────
function init2048() { G24.init(); }
