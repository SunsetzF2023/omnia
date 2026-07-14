const { app, BrowserWindow, shell, session, ipcMain } = require('electron')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const { autoUpdater } = require('electron-updater')

const PORT = 3000
let mainWindow = null
let forceQuit = false

// ═══ 自动更新配置 ═══
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function sendUpdateStatus(data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', data)
  }
}

autoUpdater.on('checking-for-update', () => {
  sendUpdateStatus({ type: 'checking' })
})
autoUpdater.on('update-available', (info) => {
  sendUpdateStatus({ type: 'available', version: info.version })
})
autoUpdater.on('update-not-available', () => {
  sendUpdateStatus({ type: 'up-to-date' })
})
autoUpdater.on('download-progress', (p) => {
  sendUpdateStatus({ type: 'progress', percent: Math.floor(p.percent) })
})
autoUpdater.on('update-downloaded', () => {
  sendUpdateStatus({ type: 'downloaded' })
})
autoUpdater.on('error', (err) => {
  sendUpdateStatus({ type: 'error', message: err ? err.message : '未知错误' })
})

// IPC：手动检查更新
ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates().catch(err => {
    sendUpdateStatus({ type: 'error', message: err.message })
  })
})

// IPC：立即安装更新
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

function startLocalServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url, `http://localhost:${PORT}`)

      if (reqUrl.pathname === '/callback') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>body{background:#0d1117;color:#7ee787;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-size:14px;}</style>
</head>
<body>
<div>授权成功，正在返回...</div>
<script>
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get('access_token');
  if (token) {
    fetch('/token?t=' + encodeURIComponent(token)).finally(() => window.close());
  } else {
    document.querySelector('div').textContent = '授权失败，请关闭重试';
  }
<\/script>
</body></html>`)
        return
      }

      if (reqUrl.pathname === '/token') {
        const token = reqUrl.searchParams.get('t')
        if (token && mainWindow) {
          mainWindow.webContents.executeJavaScript(
            `window.__electronToken && window.__electronToken(${JSON.stringify(token)})`
          )
        }
        res.writeHead(200); res.end('ok')
        return
      }

      // Serve static files: index.html, styles.css, js/*.js
      const requestedPath = reqUrl.pathname === '/'
        ? '/index.html'
        : reqUrl.pathname

      const filePath = path.join(__dirname, requestedPath)

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // Fallback to index.html (SPA-like behavior)
          fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
            if (err2) { res.writeHead(404); res.end('Not found'); return }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(data2)
          })
          return
        }

        const ext = path.extname(filePath).toLowerCase()
        const contentType = MIME_TYPES[ext] || 'application/octet-stream'
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        })
        res.end(data)
      })
    })

    server.listen(PORT, '127.0.0.1', () => resolve(server))
    console.log(`Local server running on http://localhost:${PORT}`)
  })
}

function createAuthWindow(authUrl) {
  const authWin = new BrowserWindow({
    width: 480,
    height: 620,
    title: '登录 Google 账号',
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#0d1117',
    autoHideMenuBar: true,
  })

  authWin.loadURL(authUrl)

  function safeCloseAuthWin() {
    setTimeout(() => {
      try {
        if (authWin && !authWin.isDestroyed()) authWin.close()
      } catch (_) {
        // 窗口已被销毁，忽略
      }
    }, 1500)
  }

  authWin.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http://localhost:3000/callback')) {
      safeCloseAuthWin()
    }
  })

  authWin.webContents.on('did-navigate', (event, url) => {
    if (url.startsWith('http://localhost:3000/callback')) {
      safeCloseAuthWin()
    }
  })

  return authWin
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 640,
    minHeight: 420,
    title: 'Omnia',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#0d1117',
    show: false,
  })

  mainWindow.loadURL(`http://localhost:${PORT}`)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // 启动 3 秒后自动检查更新
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(() => {})
    }, 3000)
  })

  // ★ 关闭前先让渲染进程完成保存
  mainWindow.on('close', (e) => {
    if (!forceQuit) {
      e.preventDefault()
      mainWindow.webContents.send('save-before-quit')
      // 安全超时：5秒后强制退出
      setTimeout(() => {
        if (!forceQuit) {
          forceQuit = true
          mainWindow.destroy()
        }
      }, 5000)
    }
  })

  // 拦截 window.open，用登录小窗口替代系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('accounts.google.com')) {
      createAuthWindow(url)
      return { action: 'deny' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsed = new URL(url)
    if (!['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      event.preventDefault()
    }
  })
}

// ★ IPC: 离线模式自动备份
ipcMain.on('save-offline-backup', (event, data) => {
  try {
    const backupDir = path.join(app.getPath('userData'), 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filePath = path.join(backupDir, `omnia_${ts}.json`);
    fs.writeFileSync(filePath, data, 'utf-8');
    // 保留最近 10 份备份
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
    const deleted = files.slice(10);
    deleted.forEach(f => {
      try { fs.unlinkSync(path.join(backupDir, f)); } catch (_) {}
    });
    if (deleted.length > 0 && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('inbox-msg', {
        type: 'backup',
        title: '🗑 自动清理旧备份',
        body: '已删除 ' + deleted.length + ' 份旧备份文件，保留最近 10 份。备份目录：' + backupDir,
      });
    }
  } catch (_) { /* 备份失败不影响主流程 */ }
});

// ★ IPC: 窗口缩放（Ctrl+滚轮）
ipcMain.on('set-zoom', (event, factor) => {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.setZoomFactor(factor)
})

// ★ IPC: 窗口分辨率切换
ipcMain.on('set-window-size', (event, data) => {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.setSize(data.width, data.height)
  mainWindow.center()
})

// ★ IPC: 收到渲染进程"保存完成"信号后真正退出
ipcMain.on('quit-ready', () => {
  forceQuit = true
  try {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.destroy()
  } catch (_) {
    app.quit()
  }
})

app.whenReady().then(async () => {
  await startLocalServer()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
