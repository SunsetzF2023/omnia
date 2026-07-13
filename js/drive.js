/* ═══════════════════════════════════════════════
   drive.js — Google Drive 读写 + 同步队列
   依赖: app.js (全局变量: token, driveFileId, ledgerFileId, entries, ldgRecords)
         auth.js (gfetch)
   提供: 所有 Drive 操作 + scheduleSave / forceSync / 同步状态显示
   ═══════════════════════════════════════════════
   ★ 核心修复: 用队列机制替代原 isSaving 锁，
     确保保存过程中的编辑不会被静默丢弃
   ═══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════
// CMD.BOOK — Google Drive 文件查找
// ═══════════════════════════════════════════════
async function findDriveFile() {
  const res = await gfetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${DRIVE_FILE}'&fields=files(id,name)`
  );
  if (res?.files?.length) {
    driveFileId = res.files[0].id;
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════
// CMD.BOOK — 从 Drive 加载
// ═══════════════════════════════════════════════
// ★ 安全策略: API 失败时绝不覆盖本地 entries 数据
async function loadFromDrive() {
  // 离线模式：跳过 Drive 同步
  if (token === '__offline__') {
    setSyncStatus('📴 离线模式');
    return;
  }
  setSyncStatus('同步中 ↺');
  showSaveStatus('saving', '正在从 Google Drive 同步...');
  try {
    const found = await findDriveFile();
    if (found) {
      const raw = await gfetch(
        `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`
      );

      // gfetch 在请求失败时返回 null
      if (raw === null) {
        setSyncStatus('⚠ 同步失败');
        showSaveStatus('error', '无法连接 Google Drive，本地数据已保留');
        setTimeout(() => hideSaveStatus(), 4000);
        return;
      }

      try {
        const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
        // ★ 只有拿到有效数组才覆盖，否则保留现有数据
        if (Array.isArray(p)) {
          entries = p;
        } else {
          setSyncStatus('⚠ 数据异常');
          showSaveStatus('error', '云端数据格式异常，本地数据已保留');
          setTimeout(() => hideSaveStatus(), 4000);
          return;
        }
      } catch {
        setSyncStatus('⚠ 数据解析失败');
        showSaveStatus('error', '云端数据解析失败，本地数据已保留');
        setTimeout(() => hideSaveStatus(), 4000);
        return;
      }
    } else {
      // 云端没找到文件
      if (entries.length > 0) {
        // 本地有数据 → 第一次同步？保留本地数据
        setSyncStatus('☁ 首次同步');
        showSaveStatus('saving', '本地数据尚未同步到云端，下次保存将自动创建');
        // 不覆盖 entries，继续显示本地数据
        if (typeof renderList === 'function') renderList();
        if (typeof updateTagFilters === 'function') updateTagFilters();
        setTimeout(() => hideSaveStatus(), 3000);
        return;
      } else {
        // 本地也没数据 → 真正的新用户
        entries = [];
      }
    }

    entries.sort((a, b) => b.ts - a.ts);
    if (typeof renderList === 'function') renderList();
    if (typeof updateTagFilters === 'function') updateTagFilters();
    if (entries.length) {
      if (typeof showEntry === 'function') showEntry(entries[0].id);
    } else {
      if (typeof showEmpty === 'function') showEmpty();
    }
    setSyncStatus('已同步 ✓');
    showSaveStatus('success', '同步完成 ✓');
    setTimeout(() => hideSaveStatus(), 2500);
  } catch (err) {
    setSyncStatus('⚠ 同步失败');
    showSaveStatus('error', '同步失败：' + err.message + '，本地数据已保留');
  }
}

// ═══════════════════════════════════════════════
// ★ CMD.BOOK — 同步队列（修复核心）
// ═══════════════════════════════════════════════
let _cbSavePending = false;
let _cbSaveInProgress = false;
let _cbSaveTimer = null;
let _saveGen = 0; // 用于跟踪"保存世代"，防止 setTimeout 误隐藏新保存

/**
 * 防抖调度保存：编辑完成后调用此函数。
 * 如果在等待防抖期间又有新的编辑，计时器重置。
 * 如果当前正在上传，标记"需要再次保存"，上传完成后自动重试。
 *
 * 对比原代码的 isSaving 锁：原代码在 isSaving=true 时静默丢弃请求，
 * 新机制用 _cbSavePending 标记后续需要再保存一次。
 */
function scheduleSave() {
  // 离线模式：写 localStorage + 自动备份 JSON 到磁盘
  if (token === '__offline__') {
    const data = JSON.stringify(entries);
    localStorage.setItem('omnia_offline_entries', data);
    // 桌面端：自动写备份文件到 %APPDATA%/Omnia/backups/
    if (window.electronAPI && window.electronAPI.saveOfflineBackup) {
      window.electronAPI.saveOfflineBackup(data);
    }
    setSyncStatus('💾 已本地保存 + 备份');
    if (typeof inboxAdd === 'function') inboxAdd('backup', '💾 数据已备份', '离线模式下自动保存并备份 JSON 到本地磁盘');
    return;
  }
  _cbSavePending = true;
  clearTimeout(_cbSaveTimer);
  setSyncStatus('⏳ 待保存');
  showSaveStatus('saving', '待保存...');
  _cbSaveTimer = setTimeout(() => _executeCmdbookSave(), 1500);
}

/**
 * 真正的保存逻辑（执行 HTTP 上传）
 */
async function _executeCmdbookSave() {
  // 如果正在保存中，保留 _cbSavePending 标记，稍后自动重试
  if (_cbSaveInProgress) return;

  _cbSavePending = false;
  _cbSaveInProgress = true;
  const myGen = ++_saveGen;

  setSyncStatus('<span class="spin">↺</span> 保存中...');
  showSaveStatus('saving', '正在保存到 Google Drive...');

  try {
    const body = JSON.stringify(entries);

    if (driveFileId) {
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body
        }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } else {
      const meta = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=id',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: DRIVE_FILE, parents: ['appDataFolder'] })
        }
      ).then(r => r.json());
      driveFileId = meta.id;
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body
        }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
    }

    setSyncStatus('已同步 ✓');
    showSaveStatus('success', '已保存到 Google Drive ✓');
    // 只有在这"代"保存没有被更新的保存打断时才自动隐藏
    setTimeout(() => hideSaveStatus(myGen), 3000);
  } catch (err) {
    setSyncStatus('⚠ 保存失败');
    showSaveStatus('error', '保存失败：' + err.message + ' — 请检查网络后重试');
    setTimeout(() => hideSaveStatus(myGen), 5000);
  } finally {
    _cbSaveInProgress = false;
    // ★ 核心修复：如果保存期间又有新编辑请求，自动再次保存
    if (_cbSavePending) {
      _cbSaveTimer = setTimeout(() => _executeCmdbookSave(), 300);
    }
  }
}

/**
 * 等待所有待处理的保存完成
 * 用于 forceSync 和应用关闭前确保数据已上传
 */
async function waitForSaveCompletion() {
  clearTimeout(_cbSaveTimer);
  // 如果有待处理但未开始的保存，立即执行
  if (_cbSavePending && !_cbSaveInProgress) {
    _cbSavePending = false;
    await _executeCmdbookSave();
  }
  // 如果正在保存，等待完成
  while (_cbSaveInProgress) {
    await new Promise(r => setTimeout(r, 100));
  }
  // 如果等待期间又有新请求，递归处理
  if (_cbSavePending) {
    await waitForSaveCompletion();
  }
}

// ═══════════════════════════════════════════════
// 强制同步
// ═══════════════════════════════════════════════
async function forceSync() {
  if (_cbSaveInProgress) {
    toast('⏳ 等待当前保存完成...');
  }
  // 先将本地待处理数据上传到 Drive
  try {
    await waitForSaveCompletion();
  } catch (e) {
    // 保存失败不影响加载，继续尝试拉取
    console.error('预保存失败，仍尝试加载:', e);
  }
  // 再从 Drive 拉取 — loadFromDrive 已内置安全策略，不会覆盖本地数据
  await loadFromDrive();
  toast(t().cbSyncPulled);
}

// ═══════════════════════════════════════════════
// 保存状态显示
// ═══════════════════════════════════════════════
function showSaveStatus(type, msg) {
  const bar = document.getElementById('save-status-bar');
  const dot = document.getElementById('save-status-dot');
  const text = document.getElementById('save-status-text');
  const time = document.getElementById('save-status-time');
  if (!bar || !dot || !text || !time) return;

  bar.className = '';
  bar.classList.add(type);
  dot.className = 'save-status-dot' + (type === 'saving' ? ' spin-dot' : '');
  text.textContent = msg;
  time.textContent = type !== 'saving'
    ? new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';
}

/**
 * 隐藏保存状态条
 * @param {number} gen - 调用时的保存世代，只有当前世代匹配时才隐藏
 */
function hideSaveStatus(gen) {
  if (gen !== undefined && gen < _saveGen) return; // 更新的保存已开始，不隐藏
  const bar = document.getElementById('save-status-bar');
  if (bar) {
    bar.style.display = 'none';
    bar.className = '';
  }
}

// ═══════════════════════════════════════════════
// 账本 — Google Drive 操作
// ═══════════════════════════════════════════════
async function ldgFindFile() {
  const res = await gfetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${LEDGER_FILE}'&fields=files(id,name)`
  );
  if (res?.files?.length) {
    ledgerFileId = res.files[0].id;
    return true;
  }
  return false;
}

// ★ 安全策略: API 失败时不覆盖本地 ldgRecords
async function ldgLoadFromDrive() {
  if (token === '__offline__') return;
  const found = await ldgFindFile();
  if (found) {
    const raw = await gfetch(
      `https://www.googleapis.com/drive/v3/files/${ledgerFileId}?alt=media`
    );
    if (raw === null) {
      // API 请求失败，保留本地数据
      return;
    }
    try {
      const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(p)) {
        ldgRecords = p;
      }
      // 非数组：保留现有 ldgRecords，不覆盖
    } catch {
      // 解析失败：保留现有 ldgRecords
    }
  } else {
    // 云端没有文件 — 如果本地已有数据，保留
    if (ldgRecords.length === 0) {
      ldgRecords = [];
    }
  }
  if (typeof ldgRenderList === 'function') ldgRenderList();
  if (typeof ldgRenderOverview === 'function') ldgRenderOverview();
}

// ═══════════════════════════════════════════════
// 账本 — 同步队列
// ═══════════════════════════════════════════════
let _ldgSavePending = false;
let _ldgSaveInProgress = false;
let _ldgSaveTimer = null;
let _ldgSaveGen = 0;

/**
 * 账本保存：带防抖和队列，防止快速操作导致数据丢失或重复请求
 */
function ldgScheduleSave() {
  if (token === '__offline__') {
    localStorage.setItem('omnia_offline_ledger', JSON.stringify(ldgRecords));
    return;
  }
  _ldgSavePending = true;
  clearTimeout(_ldgSaveTimer);
  _ldgSaveTimer = setTimeout(() => _executeLedgerSave(), 500);
}

async function _executeLedgerSave() {
  if (_ldgSaveInProgress) return;

  _ldgSavePending = false;
  _ldgSaveInProgress = true;
  const myGen = ++_ldgSaveGen;

  try {
    const body = JSON.stringify(ldgRecords);
    if (ledgerFileId) {
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${ledgerFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body
        }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
    } else {
      const meta = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=id',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: LEDGER_FILE, parents: ['appDataFolder'] })
        }
      ).then(r => r.json());
      ledgerFileId = meta.id;
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${ledgerFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body
        }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
    }
  } catch (err) {
    console.error('账本保存失败:', err);
    if (typeof toast === 'function') toast('⚠ 账本保存失败：' + err.message);
  } finally {
    _ldgSaveInProgress = false;
    if (_ldgSavePending) {
      _ldgSaveTimer = setTimeout(() => _executeLedgerSave(), 300);
    }
  }
}

/**
 * 账本保存的便捷包装（向下兼容旧代码直接调用 ldgSaveToDrive）
 */
function ldgSaveToDrive() {
  ldgScheduleSave();
}

/**
 * 等待账本保存完成
 */
async function ldgWaitForSaveCompletion() {
  clearTimeout(_ldgSaveTimer);
  if (_ldgSavePending && !_ldgSaveInProgress) {
    _ldgSavePending = false;
    await _executeLedgerSave();
  }
  while (_ldgSaveInProgress) {
    await new Promise(r => setTimeout(r, 100));
  }
  if (_ldgSavePending) {
    await ldgWaitForSaveCompletion();
  }
}
