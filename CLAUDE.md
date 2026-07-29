# Omnia — 个人效率工作台

> GitHub: https://github.com/SunsetzF2023/omnia

## 项目概述
Electron 桌面应用，包含 cmd.book（命令笔记）、账本（记账）、游戏中心（2048/扫雷/数独）。
Google OAuth 登录，数据存储于 Google Drive appDataFolder。

**此外包含 `world/` 目录** — 天星界玄幻世界观 wiki。修改 world/ 内容后必须立即同步到 GitHub。
详见 → `world/WORKFLOW.md`

## 技术栈
- Electron 31 + vanilla JS（无框架）
- 内联 CSS（Omnia 暗色主题设计系统）
- Chart.js 4.4（CDN）
- electron-builder（NSIS 安装包）
- electron-updater（自动更新，GitHub Releases）

## 项目结构
```
cmdbook-desktop/
├── main.js          # Electron 主进程 + 本地 HTTP 服务器(端口3000) + OAuth 回调
├── preload.js       # IPC 桥接 (保存前通知 + 自动更新)
├── index.html       # 所有 UI + 所有 CSS（单文件）
├── js/
│   ├── app.js       # 全局状态、工具函数、tab 切换、更新事件
│   ├── auth.js      # Google OAuth + token 持久化
│   ├── drive.js     # Google Drive CRUD + 队列保存
│   ├── cmdbook.js   # cmd.book 模块
│   ├── ledger.js    # 账本模块
│   ├── game.js      # 游戏中心 (2048/扫雷/数独)
│   └── i18n.js      # 多语言 (zh-CN/zh-TW/en)
└── game/            # 旧 Roguelike 代码（未加载，保留参考）
```

## 开发命令
```bash
npm start           # 开发模式运行
npm run build:win   # 打包 NSIS 安装包
```

## 发布流程（每次修改后必须执行）

```bash
# 1. 修改代码后，先 bump package.json 版本号
# 2. 提交并推送
git add -A
git commit -m "vX.Y.Z — 简短描述"
git push origin master

# 3. 打 tag 并推送
git tag vX.Y.Z
git push origin vX.Y.Z

# 4. 打包
npm run build:win

# 5. 创建 GitHub Release（gh CLI 自动上传 dist/ 下的 .exe + latest.yml）
gh release create vX.Y.Z "dist/Omnia Setup X.Y.Z.exe" dist/latest.yml --title "vX.Y.Z" --notes "发布说明"
```

此后用户端启动 App 后会自动检测到更新并下载安装。

**发布时注意：** `gh release create` 上传 exe 文件名带空格会被转成点号，与 `latest.yml` 不一致导致更新失败。必须先复制 exe 为连字符命名：
```bash
Copy-Item "dist\Omnia Setup X.Y.Z.exe" "dist\Omnia-Setup-X.Y.Z.exe"
gh release create vX.Y.Z "dist/Omnia-Setup-X.Y.Z.exe" dist/latest.yml ...
```

## 当前版本: v2.3.6

## 反馈后端
- Google Apps Script URL: `https://script.google.com/macros/s/AKfycbyDR6xKzyevIhi3e1zgWC8KvnWH2JaB7ni7Eo_Md7SKknRASUOtRt8Hj_02470Z-CmV3w/exec`
- 开发者邮箱: `2867440557ftt@gmail.com` `2867440557@qq.com`
- 反馈流程: 用户写反馈 → POST Apps Script → 开发者 Gmail 收到邮件（无需用户有邮箱）

## 新增模块
- `js/inbox.js` — 通知中心（备份通知 / 同步状态 / 更新提示 / 反馈 / GitHub 链接）
- 离线模式: token=`__offline__`, 数据存 localStorage + 自动备份 JSON 到 `%APPDATA%/Omnia/backups/`
- 桌面端自动备份: 每次离线保存时通过 IPC → main.js 写 JSON 文件，保留最近 10 份

## 关键 URL
| 用途 | 地址 |
|------|------|
| 桌面端更新 | https://github.com/SunsetzF2023/omnia/releases |
| Web 版 | https://sunsetzf2023.github.io/omnia/ |
| GitHub 仓库 | https://github.com/SunsetzF2023/omnia |
| Google Cloud Console (OAuth) | https://console.cloud.google.com/apis/credentials |
| Google Apps Script | https://script.google.com/ (项目名: Omnia反馈) |
| GitHub Pages 设置 | https://github.com/SunsetzF2023/omnia/settings/pages |

## 架构决策（为什么这样做）

- **不用框架** — 保持 vanilla JS，降低依赖复杂度。项目规模可控，DOM 操作直截了当。
- **单文件 index.html** — CSS 内联避免 Electron 打包遗漏静态文件（v2.0.1 教训）。
- **Google Drive 做后端** — 无需自建服务器，用户数据自有。appDataFolder 对用户不可见，数据隔离。
- **electron-updater + GitHub Releases** — 比自建更新服务器简单，免费，与 electron-builder 深度集成。

## 核心编码模式

### 游戏 DOM 持久化（动画关键）
2048 方块移动动画不能删除/重建 DOM，必须用 `elMap` 追踪 tileId→DOM 元素。
移动时只更新 `transform` 属性，配合 CSS `transition` 才能产生平滑滑动：
```js
// 步骤 1: 无过渡瞬间移到旧位置
el.style.transition = 'none';
el.style.transform = 'translate(' + oldTx + 'px, ' + oldTy + 'px)';
// 步骤 2: 强制回流
void grid.offsetHeight;
// 步骤 3: 开启动画移到新位置
el.style.transition = 'transform .15s ease-in-out';
el.style.transform = 'translate(' + newTx + 'px, ' + newTy + 'px)';
```

### 响应式网格（_fitCell 模式）
游戏格子大小必须根据 `#game-main` 容器动态计算，不能写死 px：
```js
function _fitCell(maxCell, cols, rows, padW, padH) {
  const main = document.getElementById('game-main');
  const availW = (main ? main.clientWidth : 600) - padW;
  const availH = (main ? main.clientHeight : 500) - padH;
  const cw = Math.floor(availW / cols);
  const ch = Math.floor(availH / rows);
  return Math.max(18, Math.min(maxCell, cw, ch)); // 18px 下限
}
```

### Tab 切换生命周期
每个模块必须实现 `activate()` / `deactivate()` 方法。`switchTab()` 调用时先 deactivate 当前模块，再 activate 新模块。游戏中心的 `init()` 必须**先** `deactivate()` **后**设置 `active = true`，否则 `_render()` 会因 active 状态错误而跳过。

## 已知陷阱（踩过的坑）

### i18n 的 `applyLang()` 会销毁 DOM 事件
`applyLang()` 用 `innerHTML = ''` 重建 tab 按钮时，原有 `onclick` 属性会丢失。
**修改 i18n 的 tab 相关代码后，必须验证 `applyLang()` 重建的按钮上 `onclick` 是否恢复正确。**
修复方式：重建后用 `el.setAttribute('onclick', "switchTab('...')")` 显式恢复。

### 2048 右/下方向遍历顺序
右移和下移时对行/列做 reverse 后，索引计算要直接用 `ci`/`ri`，不能再做 `s-1-ci` 换算，因为数组已经是正确顺序。

### 打包后安装不生效
若 `package.json` 版本号未更新，electron-builder 生成的 `latest.yml` 版本不变，`electron-updater` 不会下载新版本。**每次发版必须 bump 版本号。**

### 自动更新文件名不匹配
`electron-builder` 生成的 `latest.yml` 中文件名为连字符格式（`Omnia-Setup-X.Y.Z.exe`），但磁盘上的 exe 文件名带空格（`Omnia Setup X.Y.Z.exe`）。`gh release create` 上传带空格文件名时会自动转成点号（`Omnia.Setup.X.Y.Z.exe`），导致与 `latest.yml` 不一致，更新失败。
**解决：上传前先将 exe 复制为连字符命名，或打包时在 `package.json` 的 `build` 中指定 `artifactName`。**

### 文件被占用无法删除
Omnia 进程可能仍在运行。先 `Stop-Process -Name Omnia -Force` 再操作文件。

## AI 协作 / 工作流建议（每次新 session 请优先阅读）

### 可用 Skills（`.claude/skills/`）
本项目 `.claude/skills/` 下已包含两类技能，处理对应场景时应先查阅对应 `SKILL.md`：

**Superpowers 系列**（来自 https://github.com/obra/superpowers ，流程/工程方法论）：
- `using-superpowers` — 技能使用总纲，任何任务开始前先看这个判断是否有适用技能
- `brainstorming` — 需求不清晰/开始新功能前先头脑风暴
- `writing-plans` / `executing-plans` — 制定与执行开发计划
- `systematic-debugging` — **修 bug 前必读**，避免头痛医头
- `test-driven-development` — 先写测试再实现
- `requesting-code-review` / `receiving-code-review` — code review 流程
- `subagent-driven-development` / `dispatching-parallel-agents` — 拆解任务给子任务/并行执行
- `using-git-worktrees` — 多分支并行开发
- `finishing-a-development-branch` — 收尾合并分支
- `verification-before-completion` — **任何"完成"声明前必须验证**（跑测试/实际运行确认，而非假设代码正确）
- `writing-skills` — 如何编写新技能文档

**设计/UI 系列**：`design`、`design-system`、`banner-design`、`brand`、`slides`、`ui-styling`、`ui-ux-pro-max`、`world-building.md`（天星界世界观协作规范）。

若本地找不到某个 skill，可从 https://github.com/obra/superpowers 重新获取（也已缓存于 `C:\Users\<user>\.claude\plugins\cache\claude-plugins-official\superpowers\`）。

### 运行与测试
- **执行 `npm start` 前必须先检查是否有旧的 Electron/本地服务进程在运行**（占用端口 3000 会导致启动报错，如 "port already in use" 或残留 `electron.exe` 进程）。检测到旧进程时，先向用户确认是否关闭，再 `Stop-Process` 结束旧进程，然后重新 `npm start`。
- 不要在用户不知情的情况下静默 kill 进程或重启服务。

### 代码检查习惯
- 大范围审查代码时，优先用 `node --check` 做语法快速扫描，再针对最近改动（`git diff`）重点复核逻辑一致性（例如：新功能提示文案 vs 实际是否有对应结算逻辑）。
- 修改 tab / 模块 id 命名时（如 `calendar` → `sect`），必须搜索确认 `index.html`、`app.js`、`i18n.js` 三处的 id 全部同步更新。

### 发布注意
- 详见下方"发布流程"与"已知陷阱"章节，尤其是版本号 bump、exe 命名连字符问题。

## 安全规范
- 绝不在代码中硬编码 API Key / Token / 密码，一律用环境变量读取
- 绝不把 .env 或任何密钥文件的内容打印到终端、日志或提交信息里
- 新建项目时首先检查 .gitignore 是否包含 .env、*.key、*.pem
- Google OAuth Client ID 存在 app.js 中（公开常量，非密钥）
- 用户 Token 仅存储于 localStorage，不写入文件
- 全局 `.gitignore` 须包含：`.env` `.env.*` `*.pem` `*.key` `credentials.json` `.claude/settings.local.json`
