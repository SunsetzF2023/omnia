# Omnia — 个人效率工作台

> GitHub: https://github.com/SunsetzF2023/omnia

## 项目概述
Electron 桌面应用，包含 cmd.book（命令笔记）、账本（记账）、游戏中心（2048/扫雷/数独）。
Google OAuth 登录，数据存储于 Google Drive appDataFolder。

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

## 安全规范
- 绝不在代码中硬编码 API Key / Token / 密码，一律用环境变量读取
- 绝不把 .env 或任何密钥文件的内容打印到终端、日志或提交信息里
- 新建项目时首先检查 .gitignore 是否包含 .env、*.key、*.pem
- Google OAuth Client ID 存在 app.js 中（公开常量，非密钥）
- 用户 Token 仅存储于 localStorage，不写入文件
- 全局 `.gitignore` 须包含：`.env` `.env.*` `*.pem` `*.key` `credentials.json` `.claude/settings.local.json`
