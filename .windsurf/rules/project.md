---
description: Omnia 项目工作流规范（每次 session 自动加载）
---

# Omnia (cmdbook-desktop) 项目规则

详细项目背景、技术栈、发布流程、已知陷阱见 `CLAUDE.md`（同目录），每次处理本项目前应先读取该文件。

## 可用 Skills

`.claude/skills/` 下已有 superpowers 系列（`systematic-debugging`、`test-driven-development`、`writing-plans`、`verification-before-completion` 等，来自 https://github.com/obra/superpowers）及设计类技能。处理对应场景（调 bug、写计划、完成任务前验证等）前应先读取对应 `SKILL.md`。详细清单见 `CLAUDE.md`。

## 强制约定

1. **执行 `npm start` 前必须先检查是否有旧的 Electron / 本地服务进程在运行**（本地服务器占用端口 3000）。
   - 检测到旧进程时，先询问用户是否关闭，不要静默 kill。
   - 用户确认后再 `Stop-Process` 结束旧进程，然后重新执行 `npm start`。
2. 大范围代码审查：先用 `node --check` 做语法扫描，再对照 `git diff` 复核逻辑一致性（提示文案 vs 实际结算逻辑是否匹配）。
3. 修改 tab / 模块 id 命名时，必须同步核对 `index.html`、`js/app.js`、`js/i18n.js` 三处。
4. 发布相关操作（bump 版本号、exe 命名连字符等）严格按 `CLAUDE.md` 的"发布流程"章节执行。
5. 涉及密钥/Token 一律遵守 `CLAUDE.md` 的"安全规范"章节，绝不硬编码或打印敏感信息。
