// preload.js
// 安全隔离层：渲染进程（index.html）无法直接访问 Node.js
// 通过 contextBridge 安全暴露需要的功能

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  version: process.versions.electron,
  platform: process.platform,

  // ★ 应用关闭前保存: 主进程通知 → 渲染进程保存 → 确认退出
  onSaveBeforeQuit: (callback) => {
    ipcRenderer.on('save-before-quit', async () => {
      try {
        await callback()
      } catch (e) {
        console.error('Final save failed:', e)
      }
      ipcRenderer.send('quit-ready')
    })
  },

  // ★ 自动更新
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (event, data) => callback(data))
  },
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  installUpdate: () => ipcRenderer.send('install-update'),

  // ★ 离线备份
  saveOfflineBackup: (data) => ipcRenderer.send('save-offline-backup', data),

  // ★ 收件箱消息（主进程 → 渲染进程）
  onInboxMsg: (callback) => {
    ipcRenderer.on('inbox-msg', (event, data) => callback(data))
  },
})
