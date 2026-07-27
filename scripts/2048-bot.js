#!/usr/bin/env node
/**
 * 2048 AI Bot — 自动游玩 https://sunsetzf2023.github.io/omnia/ 的 2048
 *
 * 使用 Puppeteer + Expectimax 搜索 AI，蛇形权重（左下角策略）。
 * Game Over 时轮换食物名提交分数，然后重开继续。
 *
 * 用法:
 *   node scripts/2048-bot.js
 *
 * 环境变量:
 *   DEPTH=6      搜索深度 (3-7，默认6)
 *                  深度 = AI 向前预判多少步。每层代表"我走一步 → 电脑随机出方块"。
 *                  深度3=快但弱(~5K分), 深度5=中等(~2W分), 深度6=强(~3W+), 深度7=很强但慢
 *   GAMES=0       游玩局数 (0=无限)
 *   HEADLESS=0    无头模式 (0=显示小窗, 1=完全隐藏)
 *   TARGET=100000  目标分数
 *   VW=520        窗口宽度 (默认520)
 *   VH=460        窗口高度 (默认460)
 */

const puppeteer = require('puppeteer');

// ── 配置 ─────────────────────────────────────────────
const URL    = 'https://sunsetzf2023.github.io/omnia/';
const DEPTH  = parseInt(process.env.DEPTH || '6', 10);
const GAMES  = parseInt(process.env.GAMES || '0', 10);
const HDLS   = process.env.HEADLESS === '1';
const TARGET = parseInt(process.env.TARGET || '100000', 10);
const VW     = parseInt(process.env.VW || '520', 10);
const VH     = parseInt(process.env.VH || '460', 10);

const FOOD_NAMES = [
  '咖喱薯仔粟米飯', '滑蛋叉燒粟米飯', '今日唔食三餸飯',
];

// ══════════════════════════════════════════════════════
//  2048 游戏模拟（匹配主应用 js/game.js 的 _slide()）
// ══════════════════════════════════════════════════════

function slideLine(line) {
  let f = line.filter(v => v !== 0);
  for (let i = 0; i < f.length - 1; i++) {
    if (f[i] === f[i + 1]) { f[i] *= 2; f[i + 1] = 0; }
  }
  f = f.filter(v => v !== 0);
  while (f.length < line.length) f.push(0);
  return f;
}

function simulateMove(grid, dir) {
  const n = grid.length;
  const ng = Array.from({ length: n }, () => new Array(n).fill(0));
  let moved = false;

  if (dir === 'left') {
    for (let r = 0; r < n; r++) {
      const sl = slideLine(grid[r]);
      for (let c = 0; c < n; c++) { ng[r][c] = sl[c]; if (sl[c] !== grid[r][c]) moved = true; }
    }
  } else if (dir === 'right') {
    for (let r = 0; r < n; r++) {
      const sl = slideLine([...grid[r]].reverse()).reverse();
      for (let c = 0; c < n; c++) { ng[r][c] = sl[c]; if (sl[c] !== grid[r][c]) moved = true; }
    }
  } else if (dir === 'up') {
    for (let c = 0; c < n; c++) {
      const col = grid.map(r => r[c]);
      const sl = slideLine(col);
      for (let r = 0; r < n; r++) { ng[r][c] = sl[r]; if (sl[r] !== grid[r][c]) moved = true; }
    }
  } else if (dir === 'down') {
    for (let c = 0; c < n; c++) {
      const col = grid.map(r => r[c]).reverse();
      const sl = slideLine(col).reverse();
      for (let r = 0; r < n; r++) { ng[r][c] = sl[r]; if (sl[r] !== grid[r][c]) moved = true; }
    }
  }
  return { grid: ng, moved };
}

function tilesToGrid(tiles, n) {
  const g = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const t of tiles) g[t.row][t.col] = t.val;
  return g;
}

function getEmptyCells(grid) {
  const cells = [];
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++)
      if (grid[r][c] === 0) cells.push({ r, c });
  return cells;
}

function cloneGrid(grid) {
  return grid.map(r => [...r]);
}

// 随机洗牌（用于随机采样空格）
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ══════════════════════════════════════════════════════
//  AI — Expectimax + 多维度启发式
// ══════════════════════════════════════════════════════

/**
 * 蛇形权重矩阵 — 左下角策略
 *
 * 权重越高的格子，AI 越想把大数字放在那里。
 * 路径：[3][0]→[3][1]→[3][2]→[3][3]→[2][3]→[2][2]→...→[0][0]
 *        ↑ 左下角=最大方块          → 蛇形环绕              终点=右上角
 */
const WEIGHT = [
  [ 0,  1,  2,  3],
  [ 7,  6,  5,  4],
  [ 8,  9, 10, 11],
  [15, 14, 13, 12],
];

/**
 * 启发式评估函数。
 *
 * 四大维度（按重要性排序）：
 *   1. 蛇形权重和 — 引导方块沿蛇形从大到小排列
 *   2. 空格数量   — 空格越多越灵活，避免过早堵死
 *   3. 角落奖金   — 最大方块必须在左下角（权重最高点）
 *   4. 平滑度     — 相邻方块数值接近时加分（更容易合并）
 */
function evaluateGrid(grid) {
  const n = grid.length;
  let weightSum = 0, empty = 0;
  let maxVal = 0, maxR = -1, maxC = -1;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const v = grid[r][c];
      if (v === 0) { empty++; continue; }
      if (v > maxVal) { maxVal = v; maxR = r; maxC = c; }
      // 4×4 专用权重；更大网格用缩放
      weightSum += v * (WEIGHT[r] ? WEIGHT[r][c] : 0);
    }
  }

  let score = weightSum;

  // 空格：每空 +22000（最关键——有空格才有操作空间）
  score += empty * 22000;

  // 角落：最大方块在左下角(3,0)大幅加分，不在角落则扣分
  if (maxR === n - 1 && maxC === 0) {
    score += maxVal * 20;
  } else {
    // 不在最佳角落，检查是否在其他角落
    const atCorner = (maxR === 0 && maxC === 0) ||
                     (maxR === 0 && maxC === n - 1) ||
                     (maxR === n - 1 && maxC === n - 1);
    if (atCorner) {
      score += maxVal * 5; // 在其他角落也还行但不太理想
    } else {
      score -= maxVal * 15; // 不在任何角落，严重扣分
    }
  }

  // 平滑度（log2 尺度）：相邻方块的值越接近越好
  let smooth = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 0) continue;
      const lv = Math.log2(grid[r][c]);
      if (c < n - 1 && grid[r][c + 1] > 0) {
        smooth -= Math.abs(lv - Math.log2(grid[r][c + 1]));
      }
      if (r < n - 1 && grid[r + 1][c] > 0) {
        smooth -= Math.abs(lv - Math.log2(grid[r + 1][c]));
      }
    }
  }
  score += smooth * 1800;

  return score;
}

// ── Expectimax 搜索 ─────────────────────────────────
let nodeCount = 0;

/**
 * Expectimax 搜索。
 * @param {number[][]} grid     - n×n 网格
 * @param {number} depth        - 剩余深度
 * @param {boolean} isPlayer    - true=玩家回合(选最大), false=电脑回合(随机期望)
 */
function expectimax(grid, depth, isPlayer) {
  nodeCount++;
  const n = grid.length;

  if (depth === 0) return { score: evaluateGrid(grid) };

  if (isPlayer) {
    let bestScore = -Infinity, bestDir = null;
    for (const dir of ['up', 'down', 'left', 'right']) {
      const { grid: ng, moved } = simulateMove(grid, dir);
      if (!moved) continue;
      const r = expectimax(ng, depth - 1, false);
      if (r.score > bestScore) { bestScore = r.score; bestDir = dir; }
    }
    if (bestDir === null) return { score: evaluateGrid(grid) };
    return { score: bestScore, dir: bestDir };
  } else {
    const empty = getEmptyCells(grid);
    if (empty.length === 0) return { score: evaluateGrid(grid) };

    // 均匀采样 8 个空格（不足则全取），随机排序避免位置偏差
    const nSamp = Math.min(empty.length, 8);
    const sampled = nSamp >= empty.length ? empty : shuffle(empty).slice(0, nSamp);
    let total = 0;
    for (const { r, c } of sampled) {
      const g2 = cloneGrid(grid); g2[r][c] = 2;
      const s2 = expectimax(g2, depth - 1, true).score;
      const g4 = cloneGrid(grid); g4[r][c] = 4;
      const s4 = expectimax(g4, depth - 1, true).score;
      total += 0.9 * s2 + 0.1 * s4;
    }
    return { score: total / sampled.length };
  }
}

function bestMove(grid, depth) {
  nodeCount = 0;
  const t0 = Date.now();
  const r = expectimax(grid, depth, true);
  return { dir: r.dir, nodes: nodeCount, ms: Date.now() - t0 };
}

// ══════════════════════════════════════════════════════
//  Puppeteer 自动化
// ══════════════════════════════════════════════════════

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function enterApp(page) {
  const r = await page.evaluate(() => {
    // 尝试离线模式
    const off = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('离线使用'));
    if (off) { off.click(); return 'offline'; }
    // 也许已经在应用内
    if (document.querySelector('.tab')) return 'already';
    return null;
  });
  if (r === 'offline') await sleep(2500);
  return r;
}

async function switchToGame(page) {
  return page.evaluate(() => {
    if (typeof switchTab === 'function') { switchTab('game'); return true; }
    const t = Array.from(document.querySelectorAll('.tab')).find(el => el.textContent.trim() === '游戏');
    if (t) { t.click(); return true; }
    return false;
  });
}

async function ensure4x4Classic(page) {
  await page.evaluate(() => {
    // 难度
    if (typeof gDiff !== 'undefined' && gDiff !== 0) {
      const btns = document.querySelectorAll('#game-diff .gm-diff-btn');
      if (btns[0]) btns[0].click();
    }
    // 模式
    if (typeof G24 !== 'undefined' && G24.mode !== 'classic') {
      G24._switchMode('classic');
    }
  });
  await sleep(300);
}

async function initGame(page) {
  await page.evaluate(() => {
    if (typeof G24 === 'undefined') return;
    if (!G24.active || G24.tiles.length === 0) {
      // 确保4×4经典
      if (typeof gDiff !== 'undefined') {
        const btns = document.querySelectorAll('#game-diff .gm-diff-btn');
        if (btns[0]) { btns[0].click(); }
      }
      if (G24.mode !== 'classic') G24._switchMode('classic');
      G24.init();
    }
  });
  // 等待就绪
  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(() => ({
      ok: typeof G24 !== 'undefined' && G24.tiles && G24.tiles.length >= 2 && !G24.moving,
    }));
    if (s.ok) return;
    await sleep(300);
  }
  throw new Error('游戏初始化超时');
}

async function readState(page) {
  return page.evaluate(() => {
    if (typeof G24 === 'undefined') return { ok: false };
    const n = (G24.cfg && G24.cfg.n) || (typeof gDiff !== 'undefined' ? [4, 5, 6][gDiff] : 4);
    return {
      ok: true,
      tiles: (G24.tiles || []).map(t => ({ id: t.id, val: t.val, row: t.row, col: t.col })),
      score: G24.score || 0, best: G24.best || 0,
      over: !!G24.over, moving: !!G24.moving,
      scored: !!G24._scored, won: !!G24.won,
      n, mode: G24.mode || 'classic',
    };
  });
}

// ══════════════════════════════════════════════════════
//  主程序
// ══════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════╗');
  console.log('║  2048 AI Bot — 自动挑战        ║');
  console.log('║  目标: ' + String(TARGET).padStart(7) + '  | 深度: ' + DEPTH + '            ║');
  console.log('║  窗口: ' + VW + 'x' + VH + '               ║');
  console.log('╚══════════════════════════════════╝\n');

  // 启动浏览器 — 小窗口，放右下角
  const browser = await puppeteer.launch({
    headless: HDLS,
    args: [
      `--window-size=${VW},${VH}`,
      `--window-position=900,500`,
      '--no-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: VW, height: VH });

  page.on('pageerror', e => { /* 静默 */ });

  // 1. 导航
  console.log('🌐 连接 Omnia...');
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  // 2. 进入应用
  const mode = await enterApp(page);
  if (!mode) { console.log('❌ 无法进入应用'); await browser.close(); return; }
  console.log('  ✓ ' + (mode === 'offline' ? '离线模式' : '已在应用内'));

  // 3. 等待脚本加载
  await page.waitForFunction(
    () => typeof G24 !== 'undefined' && typeof switchTab === 'function',
    { timeout: 20000 }
  );

  // 4. 切换到游戏 tab
  console.log('🎮 切换游戏...');
  await switchToGame(page);
  await sleep(2000);

  // 5. 确保 4×4 经典模式 + 初始化
  await ensure4x4Classic(page);
  await initGame(page);

  const s0 = await readState(page);
  console.log('  ✓ ' + s0.n + '×' + s0.n + ' ' + s0.mode + ' 就绪\n');

  // ── 主循环 ──────────────────────────────────────
  let nameIdx = 0, games = 0, bestEver = s0.best || 0;
  let totalMoves = 0, gameMoves = 0;

  console.log('🤖 AI 开始（深度=' + DEPTH + '）...\n');

  while (true) {
    const s = await readState(page);
    if (!s.ok) { await sleep(2000); continue; }

    // Game Over
    if (s.over) {
      games++;
      if (s.score > bestEver) bestEver = s.score;

      const name = FOOD_NAMES[nameIdx % FOOD_NAMES.length];
      nameIdx++;

      console.log(
        '\n┌──────────────────────────────────┐\n' +
        '│  💀 GAME OVER  #' + String(games).padStart(2) +
        '  得分 ' + String(s.score).padStart(6) + '          │\n' +
        '│  🏆 最佳 ' + String(bestEver).padStart(7) +
        '  步数 ' + String(gameMoves).padStart(5) + '          │\n' +
        '│  📝 → ' + name + '        │\n' +
        '└──────────────────────────────────┘\n'
      );

      if (!s.scored) {
        await page.evaluate(n => {
          const inp = document.getElementById('g24-name-input');
          if (inp) { inp.value = n; inp.dispatchEvent(new Event('input', { bubbles: true })); }
          if (typeof G24 !== 'undefined') G24._saveScore();
        }, name);
        await sleep(600);
      }

      if (s.score >= TARGET) {
        console.log('🎉 达成 ' + TARGET.toLocaleString() + ' 分！\n');
        break;
      }
      if (GAMES > 0 && games >= GAMES) { console.log('🏁 ' + GAMES + ' 局完成\n'); break; }

      console.log('🔄 新游戏...\n');
      await page.evaluate(() => { if (typeof G24 !== 'undefined') G24.init(); });
      await sleep(600);
      await initGame(page);
      gameMoves = 0;
      continue;
    }

    if (s.moving) { await sleep(40); continue; }

    // AI — 残局加深搜索
    const grid = tilesToGrid(s.tiles, s.n);
    const emptyCount = grid.flat().filter(v => v === 0).length;
    const useDepth = emptyCount <= 5 ? DEPTH + 1 : DEPTH;  // 残局加深
    const { dir, nodes, ms } = bestMove(grid, useDepth);
    if (!dir) { await sleep(200); continue; }

    totalMoves++; gameMoves++;
    await page.evaluate(d => { if (typeof G24 !== 'undefined') G24.move(d); }, dir);

    // 每 10 步或新纪录时打印
    if (totalMoves % 10 === 0 || s.score > bestEver || ms > 300) {
      const sc = String(s.score).padStart(7);
      const flag = s.score > bestEver ? ' 🔥' : (ms > 300 ? ' 🐌' : '');
      console.log('  [' + String(games + 1).padStart(2) + '/' +
        String(totalMoves).padStart(5) + '] 🎯' + sc +
        ' ⚡' + String(dir).padEnd(5) +
        ' 🧠' + String(nodes).padStart(6) + 'n ' + String(ms).padStart(4) + 'ms' + flag);
    }

    await sleep(70);
  }

  // 统计
  console.log(
    '╔══════════════════════════════════╗\n' +
    '║  总局 ' + String(games).padStart(3) +
    ' | 总步 ' + String(totalMoves).padStart(6) +
    ' | 最佳 ' + String(bestEver).padStart(7) + ' ║\n' +
    '╚══════════════════════════════════╝'
  );
  console.log('\n✅ 浏览器保持打开，Ctrl+C 退出\n');
  await new Promise(() => {});
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
