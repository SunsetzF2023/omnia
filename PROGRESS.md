# Omnia 开发进度

> 最后更新: 2026-07-13

## 当前版本: v2.3.0

---

## 已完成

### Bug 修复
- [x] **Tab 切换失效** — `js/i18n.js` 的 `applyLang()` 用 `innerHTML = ''` 清空 tab 时销毁了 `onclick` 属性。修复：重建后用 `setAttribute('onclick', ...)` 恢复。
- [x] **tabKeys 数组错位** — i18n 定义了 5 个 key（含 `tabStock`），HTML 只有 4 个 tab，导致 News 被标为"股票"。修复：移除 `tabStock`，对齐为 4 个 tab。
- [x] **占位符索引错位** — `phTitles[1]` 指向 `phStockTitle` 而非 `phNewsTitle`。修复：索引从 `[0]=日历 [1]=股票 [2]=新闻` 改为 `[0]=日历 [1]=新闻`。
- [x] **Google 头像不显示** — 添加 `onerror` fallback：图片加载失败 → 显示用户名首字母（青色圆形）。
- [x] **游戏 init() 顺序 bug** — `active = true` → `deactivate()` → `active = false`，导致 `_render()` 跳过。修复：先 `deactivate()` 再 `active = true`。
- [x] **窗口最小尺寸过大** — `minWidth: 900, minHeight: 600` → `640, 420`。
- [x] **游戏网格不自适应** — 2048/扫雷/数独的格子尺寸固定为 px。修复：新增 `_fitCell()` 函数，根据 `#game-main` 可用空间动态计算格子大小（下限 18px）。

### 新功能
- [x] **2048 游戏** — 平滑滑动动画（DOM 持久化 + CSS transition），新方块弹出，合并缩放。
- [x] **游戏中心** — 左侧栏选游戏，右侧主区域渲染。三款游戏：2048 (4/5/6×6)、扫雷（简单/中等/困难）、数独（简单/中等/困难）。
- [x] **扫雷** — 完整实现：左键翻开、右键/F 插旗、首次点击安全、洪水填充、胜利检测。
- [x] **数独** — 完整实现：回溯生成完整解 + 随机变换 + 挖空、数字键/按钮输入、错误高亮、行列宫联动高亮。
- [x] **登录持久化** — Token + 用户信息存 `localStorage`，启动时自动恢复会话（Token 1h 有效）。
- [x] **自动更新** — `electron-updater` + GitHub Releases。启动 3 秒后自动检查，右上角状态图标显示进度。

### 安全加固
- [x] `~/.claude/settings.json` — 添加 `permissions.deny`（14 条文件/Bash 规则）+ `PreToolUse` Bash 拦截 hook
- [x] `~/.claude/hooks/block-secrets.ps1` — PowerShell 脚本，拦截 15 种危险命令模式
- [x] `gitleaks` v8.30.1 — 安装到 `~/bin/gitleaks.exe`
- [x] 全部 16 个项目的 `.gitignore` — 均包含 `.env .env.* *.pem *.key credentials.json .claude/settings.local.json`
- [x] `CLAUDE.md` — 项目概述、开发命令、发布流程、安全规范

### DevOps
- [x] Git 仓库初始化 + 推送至 `github.com/SunsetzF2023/omnia`
- [x] GitHub Release `v2.3.0` — 上传 `Omnia Setup 2.3.0.exe` + `latest.yml`
- [x] 自动更新链路打通：`npm run build:win` → GitHub Release → 用户端自动检测

---

## 待完成 / 后续

### 功能
- [ ] **日历模块** — 当前为占位页
- [ ] **今日看点模块** — 当前为占位页
- [ ] **数独唯一解验证** — 当前仅靠挖空数量保证，未做严格回溯验证
- [ ] **扫雷：弦外点击** — 同时按下左右键快速翻开周围的优化操作
- [ ] **2048：合并粒子效果** — 目前只有 scale 动画，无粒子
- [ ] **游戏音效** — 全无

### 技术
- [ ] **`game.js` 过大** — 当前单文件 ~450 行，可拆分为 `game-center.js` + `g2048.js` + `minesweeper.js` + `sudoku.js`
- [ ] **CSS 内联** — 全部 CSS 在 `index.html` 中（~350 行），可提取为独立文件
- [ ] **Token 刷新** — 当前用 implicit flow（无 refresh_token），过期需重登。可升级为 PKCE 流程

---

## 关键文件路径

| 文件 | 职责 |
|------|------|
| `main.js` | Electron 主进程 + HTTP 服务器(3000) + OAuth 回调 + 自动更新 |
| `preload.js` | IPC 桥接（保存通知 + 更新状态） |
| `index.html` | 全部 UI 结构 + 全部 CSS（单文件） |
| `js/app.js` | 全局状态、工具函数、tab 切换、更新事件监听 |
| `js/auth.js` | Google OAuth + Token 持久化 + 会话恢复 |
| `js/drive.js` | Google Drive CRUD + 队列保存 |
| `js/cmdbook.js` | cmd.book 模块（条目 CRUD / 列表 / 视图 / 编辑 / 草稿 / 灯箱） |
| `js/ledger.js` | 账本模块（记账 CRUD / 月视图 / 统计图表 / 日期选择器） |
| `js/game.js` | 游戏中心 + 2048 + 扫雷 + 数独 |
| `js/i18n.js` | 多语言（zh-CN / zh-TW / en） |
| `game/` | 旧 Roguelike 卡牌游戏代码（未加载，保留参考） |

---

## 版本历史

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v1.0.0 | 07-06 | 初始版 (cmd.book) |
| v2.0.0 | 07-10 | 重命名 Omnia、拆 6 模块、内联编辑、队列保存 |
| v2.0.1 | 07-10 | 修复打包缺少静态文件 |
| v2.0.2 | 07-10 | CSS 缓存修复 |
| v2.0.3 | 07-10 | 统一游戏 CSS 设计系统 |
| v2.1.0 | 07-10 | 回到单文件架构、移除游戏 tab、CSS 完全内联 |
| v2.1.1 | 07-13 | 修复 tab 切换 bug + 头像 fallback |
| v2.2.0 | 07-13 | 游戏中心 (2048/扫雷/数独) + 登录持久化 |
| v2.3.0 | 07-13 | 自动更新 (electron-updater) + 安全加固 + 响应式游戏网格 |

## 决策记录

- **不用框架** — 保持 vanilla JS，降低依赖复杂度。项目规模可控，DOM 操作直截了当。
- **单文件 index.html** — CSS 内联避免 Electron 打包遗漏静态文件（v2.0.1 教训）。
- **Google Drive 做后端** — 无需自建服务器，用户数据自有。appDataFolder 对用户不可见，数据隔离。
- **electron-updater + GitHub Releases** — 比自建更新服务器简单，免费，且与 electron-builder 深度集成。
- **游戏 DOM 持久化** — 2048 方块用 `elMap` 追踪 tileId→DOM，移动时只更新 `transform` 而非重建元素，CSS transition 才能生效。
