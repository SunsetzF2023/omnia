---
name: restart
description: 重启 Omnia 应用（先杀旧进程再启动）
---

先执行 `Stop-Process -Name Omnia -Force -ErrorAction SilentlyContinue` 关闭旧进程，然后执行 `npm start` 启动应用。启动后检查输出确认 "Local server running on http://localhost:3000" 出现。

**必须按顺序执行，不可跳过杀进程步骤。**
