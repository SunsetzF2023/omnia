# Omnia — 个人效率工作台

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

## 发布流程
1. `npm run build:win`
2. `git tag vX.Y.Z && git push origin vX.Y.Z`
3. GitHub Release 上传 `dist/Omnia Setup X.Y.Z.exe` + `dist/latest.yml`

## 安全规范
- 绝不在代码中硬编码 API Key / Token / 密码，一律用环境变量读取
- 绝不把 .env 或任何密钥文件的内容打印到终端、日志或提交信息里
- 新建项目时首先检查 .gitignore 是否包含 .env、*.key、*.pem
- Google OAuth Client ID 存在 app.js 中（公开常量，非密钥）
- 用户 Token 仅存储于 localStorage，不写入文件
