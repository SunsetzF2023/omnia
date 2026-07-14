/* ═══════════════════════════════════════════════
   i18n.js — 多语言系统
   依赖: 无
   提供: I18N, t(), setLang(), applyLang(), safeText()
   ═══════════════════════════════════════════════ */

const I18N = {
  'zh-CN': {
    appTitle: 'Omnia',
    signInTitle: '⬛ Omnia',
    signInDesc: '个人效率工作台',
    signInDesc2: '登录 Google 账号，数据安全存储在你的 Google Drive',
    signInBtn: '使用 Google 账号登录',
    tabCmdbook: 'cmd.book',
    tabLedger: '账本',
    tabCalendar: '日历',
    tabStock: '股票',
    tabNews: '今日看点',
	    tabGame: '游戏',
    signOut: '退出',
    cbEdit: '✏ 编辑', cbDelete: '✕ 删除', cbSync: '↻ 同步', cbExport: '↓ 导出', cbImport: '↑ 导入',
    cbReady: '就绪', cbSyncing: '同步中 ↺', cbSynced: '已同步 ✓',
    cbModeCmd: '⌘ 命令', cbModeNote: '📄 随笔',
    cbDraftFound: '📝 发现未保存的草稿', cbRestoreDraft: '恢复草稿', cbDiscardDraft: '丢弃',
    cbSearch: '搜索标题或命令...', cbSearchNote: '搜索标题或正文...',
    cbNewEntry: '＋ 新建条目', cbNewCmd: '＋ 新建命令', cbNewNote: '＋ 新建随笔',
    cbEmptyBig: '$_', cbEmptyDesc: '点击左下角「新建条目」开始记录',
    cbTitleLabel: '▸ 标题', cbTitlePH: 'e.g. 替换 LVM 旧盘并更新 fstab',
    cbContentLabel: '▸ 正文', cbContentPH: '开始写笔记... 支持 **加粗**、__下划线__、* 列表',
    cbToolbarBold: '加粗', cbToolbarUnderline: '下划线', cbToolbarBullet: '列表',
    cbNeedContent: '请输入正文内容',
    cbStepsLabel: '▸ 命令步骤', cbAddStep: '＋ 在末尾添加步骤',
    cbDescLabel: '▸ 场景说明 / 备注', cbDescPH: '什么情况下用？有哪些注意事项？',
    cbTagsLabel: '▸ 标签（逗号分隔）', cbTagsPH: '网络, 日志, 调试',
    cbSave: '保存', cbCancel: '取消',
    cbNoTitle: '无标题', cbCopied: '命令已复制 ✓', cbScenario: '场景说明', cbRecordedAt: '记录于',
    cbStepN: (n) => `步骤 ${n}`,
    cbCmdPH: '输入命令...',
    cbOutputPH: '输出结果（可选，粘贴 terminal output）...',
    cbScreenshot: (n) => `📷 步骤截图${n ? ` (${n}张)` : ''}`,
    cbDropImg: '点击或拖拽截图到这里',
    cbInsertStep: '＋ 在此处插入步骤',
    cbDraftSaved: (t) => `⏳ 草稿已自动保存 ${t}`,
    cbDraftRestored: '✅ 草稿已恢复，检查内容后点保存',
    cbDraftSavedAs: '📝 内容已保存为草稿',
    cbDraftDiscarded: '草稿已丢弃',
    cbSaved: '✅ 已保存，同步中...',
    cbDeleted: '已删除',
    cbDeleteConfirm: (t) => `删除「${t}」？`,
    cbNeedCmd: '至少需要一条命令',
    cbExported: '导出完成 ✓',
    cbImported: (n) => `导入 ${n} 条新记录 ✓`,
    cbImportFail: '导入失败：',
    cbSyncPulled: '已从 Drive 拉取最新数据',
    ldgSubHome: '首页', ldgSubStats: '统计',
    ldgOvExp: '本月支出', ldgOvTotal: '总结余', ldgOvBal: '本月结余', ldgOvInc: '本月收入',
    ldgAddBtn: '＋ 添加一条新记账',
    ldgExpense: '支出', ldgIncome: '收入', ldgTransfer: '转账',
    ldgNotePH: '添加备注',
    ldgToday: '今天',
    ldgKeyConfirm: '确定', ldgKeyAgain: '再记',
    ldgDetailDate: '账单日期', ldgDetailCurrency: '货币', ldgDetailNote: '备注', ldgDetailType: '类型',
    ldgDetailNone: '无', ldgDetailDel: '删除', ldgDetailClose: '关闭',
    ldgDetailEdit: '编辑',
    ldgDeleteConfirm: '确定删除这条记录？',
    ldgDeleted: '已删除', ldgSaved: '✅ 已记录', ldgNoAmount: '请输入金额', ldgNoCat: '请选择分类',
    ldgEmptyMonth: '本月暂无记录', ldgEmptyHint: '点击上方按钮开始记账',
    ldgReportDate: '日期', ldgReportInc: '收入', ldgReportExp: '支出', ldgReportBal: '结余',
    ldgReportEmpty: '暂无数据',
    ldgDays: ['日','一','二','三','四','五','六'],
    ldgMonthFmt: (y,m) => `${y}年 ${m}月`,
    ldgDayFmt: (m,d,w) => `${m}月${d}日 周${w}`,
    cats: {
      expense: [
        {id:'food',name:'食品餐饮',icon:'🍜',subs:['早餐','午餐','晚餐','零食','外卖','聚餐']},
        {id:'transport',name:'出行交通',icon:'🚇',subs:['公共交通','打车','加油','停车','高铁','机票']},
        {id:'shopping',name:'购物消费',icon:'🛍',subs:['服装鞋帽','数码电器','日用品','化妆护肤','网购']},
        {id:'entertainment',name:'休闲娱乐',icon:'🎮',subs:['游戏','电影','旅游','运动健身','KTV']},
        {id:'home',name:'居家生活',icon:'🏠',subs:['家用','话费宽带','电费','水费','燃气费','物业费','房租还贷','车位费','家政清洁']},
        {id:'education',name:'文化教育',icon:'📚',subs:['学费','书报杂志','培训考试']},
        {id:'gift',name:'送礼人情',icon:'🎁',subs:['孝敬长辈','礼物','借出','红包','打赏']},
        {id:'health',name:'健康医疗',icon:'🏥',subs:['滋补保健','医院','买药']},
        {id:'other',name:'其他',icon:'📦',subs:['其他支出']},
      ],
      income: [
        {id:'salary',name:'工资',icon:'💼',subs:['基本工资','加班费']},
        {id:'bonus',name:'奖金',icon:'🏆',subs:['年终奖','绩效奖金']},
        {id:'parttime',name:'兼职外快',icon:'⚡',subs:['兼职','外快','接单']},
        {id:'invest',name:'理财盈利',icon:'📈',subs:['股票','基金','利息','分红']},
        {id:'redpacket',name:'红包',icon:'🧧',subs:['微信红包','收礼']},
        {id:'borrow',name:'借入',icon:'💰',subs:['借款']},
        {id:'prize',name:'中奖',icon:'🎯',subs:['彩票','抽奖']},
        {id:'gift_in',name:'礼金人情',icon:'🎀',subs:['亲友转账','礼金']},
        {id:'subsidy',name:'补贴',icon:'☀',subs:['政府补贴','报销']},
        {id:'secondhand',name:'二手闲置',icon:'♻',subs:['二手出售']},
        {id:'other_in',name:'其他',icon:'📦',subs:['其他收入']},
      ],
      transfer: [{id:'transfer',name:'转账',icon:'↔',subs:['银行转账','钱包转账']}],
    },
    typeNames: {expense:'支出',income:'收入',transfer:'转账'},
    phCalTitle:'日历', phCalDesc:'日程安排、事件提醒', phStockTitle:'股票行情', phStockDesc:'自选股实时报价',
    phNewsTitle:'今日看点', phNewsDesc:'科技资讯、RSS 订阅', phSoon:'即将上线',
    loginFail: '登录失败：',
  },
  'zh-TW': {
    appTitle: 'Omnia',
    signInTitle: '⬛ Omnia',
    signInDesc: '個人效率工作台',
    signInDesc2: '登入 Google 帳號，資料安全儲存在你的 Google Drive',
    signInBtn: '使用 Google 帳號登入',
    tabCmdbook: 'cmd.book',
    tabLedger: '帳本',
    tabCalendar: '日曆',
    tabStock: '股票',
    tabNews: '今日看點',
	    tabGame: '遊戲',
    signOut: '登出',
    cbEdit: '✏ 編輯', cbDelete: '✕ 刪除', cbSync: '↻ 同步', cbExport: '↓ 匯出', cbImport: '↑ 匯入',
    cbReady: '就緒', cbSyncing: '同步中 ↺', cbSynced: '已同步 ✓',
    cbModeCmd: '⌘ 指令', cbModeNote: '📄 隨筆',
    cbDraftFound: '📝 發現未儲存的草稿', cbRestoreDraft: '恢復草稿', cbDiscardDraft: '丟棄',
    cbSearch: '搜尋標題或指令...', cbSearchNote: '搜尋標題或正文...',
    cbNewEntry: '＋ 新建條目', cbNewCmd: '＋ 新建指令', cbNewNote: '＋ 新建隨筆',
    cbEmptyBig: '$_', cbEmptyDesc: '點擊左下角「新建條目」開始記錄',
    cbTitleLabel: '▸ 標題', cbTitlePH: 'e.g. 替換 LVM 舊碟並更新 fstab',
    cbContentLabel: '▸ 正文', cbContentPH: '開始寫筆記... 支援 **粗體**、__底線__、* 清單',
    cbToolbarBold: '粗體', cbToolbarUnderline: '底線', cbToolbarBullet: '清單',
    cbNeedContent: '請輸入正文內容',
    cbStepsLabel: '▸ 指令步驟', cbAddStep: '＋ 在末尾新增步驟',
    cbDescLabel: '▸ 情境說明 / 備註', cbDescPH: '什麼情況下用？有哪些注意事項？',
    cbTagsLabel: '▸ 標籤（逗號分隔）', cbTagsPH: '網路, 日誌, 除錯',
    cbSave: '儲存', cbCancel: '取消',
    cbNoTitle: '無標題', cbCopied: '指令已複製 ✓', cbScenario: '情境說明', cbRecordedAt: '記錄於',
    cbStepN: (n) => `步驟 ${n}`,
    cbCmdPH: '輸入指令...',
    cbOutputPH: '輸出結果（可選，貼上 terminal output）...',
    cbScreenshot: (n) => `📷 步驟截圖${n ? ` (${n}張)` : ''}`,
    cbDropImg: '點擊或拖曳截圖到這裡',
    cbInsertStep: '＋ 在此處插入步驟',
    cbDraftSaved: (t) => `⏳ 草稿已自動儲存 ${t}`,
    cbDraftRestored: '✅ 草稿已恢復，檢查內容後點儲存',
    cbDraftSavedAs: '📝 內容已儲存為草稿',
    cbDraftDiscarded: '草稿已丟棄',
    cbSaved: '✅ 已儲存，同步中...',
    cbDeleted: '已刪除',
    cbDeleteConfirm: (t) => `刪除「${t}」？`,
    cbNeedCmd: '至少需要一條指令',
    cbExported: '匯出完成 ✓',
    cbImported: (n) => `匯入 ${n} 條新記錄 ✓`,
    cbImportFail: '匯入失敗：',
    cbSyncPulled: '已從 Drive 拉取最新資料',
    ldgSubHome: '首頁', ldgSubStats: '統計',
    ldgOvExp: '本月支出', ldgOvTotal: '總結餘', ldgOvBal: '本月結餘', ldgOvInc: '本月收入',
    ldgAddBtn: '＋ 新增一筆記帳',
    ldgExpense: '支出', ldgIncome: '收入', ldgTransfer: '轉帳',
    ldgNotePH: '新增備註',
    ldgToday: '今天',
    ldgKeyConfirm: '確定', ldgKeyAgain: '再記',
    ldgDetailDate: '帳單日期', ldgDetailCurrency: '貨幣', ldgDetailNote: '備註', ldgDetailType: '類型',
    ldgDetailNone: '無', ldgDetailDel: '刪除', ldgDetailClose: '關閉',
    ldgDetailEdit: '編輯',
    ldgDeleteConfirm: '確定刪除這筆記錄？',
    ldgDeleted: '已刪除', ldgSaved: '✅ 已記錄', ldgNoAmount: '請輸入金額', ldgNoCat: '請選擇分類',
    ldgEmptyMonth: '本月暫無記錄', ldgEmptyHint: '點擊上方按鈕開始記帳',
    ldgReportDate: '日期', ldgReportInc: '收入', ldgReportExp: '支出', ldgReportBal: '結餘',
    ldgReportEmpty: '暫無資料',
    ldgDays: ['日','一','二','三','四','五','六'],
    ldgMonthFmt: (y,m) => `${y}年 ${m}月`,
    ldgDayFmt: (m,d,w) => `${m}月${d}日 週${w}`,
    cats: {
      expense: [
        {id:'food',name:'餐飲食品',icon:'🍜',subs:['早餐','午餐','晚餐','零食','外送','聚餐']},
        {id:'transport',name:'交通出行',icon:'🚇',subs:['大眾運輸','計程車','加油','停車','高鐵','機票']},
        {id:'shopping',name:'購物消費',icon:'🛍',subs:['服裝鞋帽','數位電器','日用品','美妝保養','網購']},
        {id:'entertainment',name:'休閒娛樂',icon:'🎮',subs:['遊戲','電影','旅遊','運動健身','KTV']},
        {id:'home',name:'居家生活',icon:'🏠',subs:['家用','電話網路','電費','水費','瓦斯費','管理費','房租貸款','停車費','清潔費']},
        {id:'education',name:'文化教育',icon:'📚',subs:['學費','書報雜誌','培訓考試']},
        {id:'gift',name:'送禮人情',icon:'🎁',subs:['孝敬長輩','禮物','借出','紅包','打賞']},
        {id:'health',name:'健康醫療',icon:'🏥',subs:['保健品','醫院','買藥']},
        {id:'other',name:'其他',icon:'📦',subs:['其他支出']},
      ],
      income: [
        {id:'salary',name:'薪資',icon:'💼',subs:['基本薪資','加班費']},
        {id:'bonus',name:'獎金',icon:'🏆',subs:['年終獎','績效獎金']},
        {id:'parttime',name:'兼職外快',icon:'⚡',subs:['兼職','外快','接案']},
        {id:'invest',name:'理財獲利',icon:'📈',subs:['股票','基金','利息','股息']},
        {id:'redpacket',name:'紅包',icon:'🧧',subs:['微信紅包','收禮']},
        {id:'borrow',name:'借入',icon:'💰',subs:['借款']},
        {id:'prize',name:'中獎',icon:'🎯',subs:['彩券','抽獎']},
        {id:'gift_in',name:'禮金人情',icon:'🎀',subs:['親友轉帳','禮金']},
        {id:'subsidy',name:'補貼',icon:'☀',subs:['政府補助','報銷']},
        {id:'secondhand',name:'二手閒置',icon:'♻',subs:['二手出售']},
        {id:'other_in',name:'其他',icon:'📦',subs:['其他收入']},
      ],
      transfer: [{id:'transfer',name:'轉帳',icon:'↔',subs:['銀行轉帳','電子錢包']}],
    },
    typeNames: {expense:'支出',income:'收入',transfer:'轉帳'},
    phCalTitle:'日曆', phCalDesc:'行程安排、事件提醒', phStockTitle:'股票行情', phStockDesc:'自選股即時報價',
    phNewsTitle:'今日看點', phNewsDesc:'科技資訊、RSS 訂閱', phSoon:'即將上線',
    loginFail: '登入失敗：',
  },
  'en': {
    appTitle: 'Omnia',
    signInTitle: '⬛ Omnia',
    signInDesc: 'Personal Productivity Hub',
    signInDesc2: 'Sign in with Google to sync data securely to your Google Drive',
    signInBtn: 'Sign in with Google',
    tabCmdbook: 'cmd.book',
    tabLedger: 'Ledger',
    tabCalendar: 'Calendar',
    tabStock: 'Stocks',
    tabNews: "Today's Feed",
	    tabGame: "Games",
    signOut: 'Sign out',
    cbEdit: '✏ Edit', cbDelete: '✕ Delete', cbSync: '↻ Sync', cbExport: '↓ Export', cbImport: '↑ Import',
    cbReady: 'Ready', cbSyncing: 'Syncing ↺', cbSynced: 'Synced ✓',
    cbModeCmd: '⌘ Cmd', cbModeNote: '📄 Note',
    cbDraftFound: '📝 Unsaved draft found', cbRestoreDraft: 'Restore', cbDiscardDraft: 'Discard',
    cbSearch: 'Search title or command...', cbSearchNote: 'Search title or content...',
    cbNewEntry: '＋ New Entry', cbNewCmd: '＋ New Cmd', cbNewNote: '＋ New Note',
    cbEmptyBig: '$_', cbEmptyDesc: 'Click "New Entry" to start',
    cbTitleLabel: '▸ Title', cbTitlePH: 'e.g. Extend LVM volume and update fstab',
    cbContentLabel: '▸ Content', cbContentPH: 'Start writing... Supports **bold**, __underline__, * bullet',
    cbToolbarBold: 'Bold', cbToolbarUnderline: 'Underline', cbToolbarBullet: 'List',
    cbNeedContent: 'Please enter some content',
    cbStepsLabel: '▸ Command Steps', cbAddStep: '＋ Add step at end',
    cbDescLabel: '▸ Notes / Description', cbDescPH: 'When to use? Any caveats?',
    cbTagsLabel: '▸ Tags (comma separated)', cbTagsPH: 'network, logs, debug',
    cbSave: 'Save', cbCancel: 'Cancel',
    cbNoTitle: 'Untitled', cbCopied: 'Copied ✓', cbScenario: 'Notes', cbRecordedAt: 'Recorded on',
    cbStepN: (n) => `Step ${n}`,
    cbCmdPH: 'Enter command...',
    cbOutputPH: 'Output (optional)...',
    cbScreenshot: (n) => `📷 Screenshots${n ? ` (${n})` : ''}`,
    cbDropImg: 'Click or drag image here',
    cbInsertStep: '＋ Insert step here',
    cbDraftSaved: (t) => `⏳ Draft autosaved at ${t}`,
    cbDraftRestored: '✅ Draft restored — save when ready',
    cbDraftSavedAs: '📝 Saved as draft',
    cbDraftDiscarded: 'Draft discarded',
    cbSaved: '✅ Saved, syncing...',
    cbDeleted: 'Deleted',
    cbDeleteConfirm: (t) => `Delete "${t}"?`,
    cbNeedCmd: 'At least one command is required',
    cbExported: 'Exported ✓',
    cbImported: (n) => `Imported ${n} new records ✓`,
    cbImportFail: 'Import failed: ',
    cbSyncPulled: 'Pulled latest data from Drive',
    ldgSubHome: 'Home', ldgSubStats: 'Stats',
    ldgOvExp: 'Monthly Expense', ldgOvTotal: 'Total Balance', ldgOvBal: 'Monthly Balance', ldgOvInc: 'Monthly Income',
    ldgAddBtn: '＋ Add New Record',
    ldgExpense: 'Expense', ldgIncome: 'Income', ldgTransfer: 'Transfer',
    ldgNotePH: 'Add note',
    ldgToday: 'Today',
    ldgKeyConfirm: 'Done', ldgKeyAgain: 'Add more',
    ldgDetailDate: 'Date', ldgDetailCurrency: 'Currency', ldgDetailNote: 'Note', ldgDetailType: 'Type',
    ldgDetailNone: 'None', ldgDetailDel: 'Delete', ldgDetailClose: 'Close',
    ldgDetailEdit: 'Edit',
    ldgDeleteConfirm: 'Delete this record?',
    ldgDeleted: 'Deleted', ldgSaved: '✅ Recorded', ldgNoAmount: 'Please enter amount', ldgNoCat: 'Please select category',
    ldgEmptyMonth: 'No records this month', ldgEmptyHint: 'Tap the button above to add',
    ldgReportDate: 'Date', ldgReportInc: 'Income', ldgReportExp: 'Expense', ldgReportBal: 'Balance',
    ldgReportEmpty: 'No data',
    ldgDays: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    ldgMonthFmt: (y,m) => {const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return `${months[m-1]} ${y}`;},
    ldgDayFmt: (m,d,w) => {const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];return `${months[m-1]} ${d}, ${days[w]}`;},
    cats: {
      expense: [
        {id:'food',name:'Food & Drink',icon:'🍜',subs:['Breakfast','Lunch','Dinner','Snacks','Takeaway','Dining out']},
        {id:'transport',name:'Transport',icon:'🚇',subs:['Public transit','Taxi','Fuel','Parking','Train','Flight']},
        {id:'shopping',name:'Shopping',icon:'🛍',subs:['Clothing','Electronics','Daily goods','Cosmetics','Online shopping']},
        {id:'entertainment',name:'Entertainment',icon:'🎮',subs:['Gaming','Movies','Travel','Fitness','KTV']},
        {id:'home',name:'Home & Living',icon:'🏠',subs:['Household','Phone & Internet','Electricity','Water','Gas','Management fee','Rent','Parking','Cleaning']},
        {id:'education',name:'Education',icon:'📚',subs:['Tuition','Books','Courses']},
        {id:'gift',name:'Gifts',icon:'🎁',subs:['Family','Gift','Loan out','Red packet','Tips']},
        {id:'health',name:'Health',icon:'🏥',subs:['Supplements','Hospital','Medicine']},
        {id:'other',name:'Other',icon:'📦',subs:['Miscellaneous']},
      ],
      income: [
        {id:'salary',name:'Salary',icon:'💼',subs:['Base pay','Overtime']},
        {id:'bonus',name:'Bonus',icon:'🏆',subs:['Annual bonus','Performance bonus']},
        {id:'parttime',name:'Freelance',icon:'⚡',subs:['Part-time','Side job','Gig work']},
        {id:'invest',name:'Investment',icon:'📈',subs:['Stocks','Funds','Interest','Dividends']},
        {id:'redpacket',name:'Red Packet',icon:'🧧',subs:['WeChat','Gift money']},
        {id:'borrow',name:'Borrowed',icon:'💰',subs:['Loan received']},
        {id:'prize',name:'Prize',icon:'🎯',subs:['Lottery','Lucky draw']},
        {id:'gift_in',name:'Gift Income',icon:'🎀',subs:['Transfer from friends','Gift money']},
        {id:'subsidy',name:'Subsidy',icon:'☀',subs:['Gov subsidy','Reimbursement']},
        {id:'secondhand',name:'Secondhand',icon:'♻',subs:['Sold items']},
        {id:'other_in',name:'Other',icon:'📦',subs:['Miscellaneous']},
      ],
      transfer: [{id:'transfer',name:'Transfer',icon:'↔',subs:['Bank transfer','E-wallet']}],
    },
    typeNames: {expense:'Expense',income:'Income',transfer:'Transfer'},
    phCalTitle:'Calendar', phCalDesc:'Schedule & reminders', phStockTitle:'Stock Market', phStockDesc:'Real-time quotes',
    phNewsTitle:"Today's Feed", phNewsDesc:'Tech news & RSS', phSoon:'Coming soon',
    loginFail: 'Login failed: ',
  }
};

let currentLang = localStorage.getItem('app_lang') || 'zh-CN';

function t() {
  return I18N[currentLang] || I18N['zh-CN'];
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('app_lang', lang);
  applyLang();
  // re-render ledger if active
  if (typeof ldgRenderList === 'function') ldgRenderList();
  if (typeof ldgRenderOverview === 'function') ldgRenderOverview();
  if (typeof ldgRenderMonthLabel === 'function') ldgRenderMonthLabel();
}

function safeText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function applyLang() {
  const L = t();
  document.title = L.appTitle;

  const aTitle = document.getElementById('auth-title');
  const aDesc1 = document.getElementById('auth-desc1');
  const aDesc2 = document.getElementById('auth-desc2');
  const aBtn = document.getElementById('auth-btn-text');
  if(aTitle) aTitle.textContent = L.signInTitle;
  if(aDesc1) aDesc1.textContent = L.signInDesc;
  if(aDesc2) aDesc2.textContent = L.signInDesc2;
  if(aBtn) aBtn.textContent = L.signInBtn;

  // tabs — preserve onclick handlers (innerHTML would destroy them)
  const tabEls = document.querySelectorAll('.tab');
  const tabKeys = ['tabCmdbook','tabLedger','tabCalendar','tabNews','tabGame'];
  const tabIds  = ['cmdbook','ledger','calendar','news','game'];
  tabEls.forEach((el,i) => {
    if(tabKeys[i]) {
      const wasActive = el.classList.contains('active');
      // 只清空文本节点，保留 dot 元素和属性
      const dot = el.querySelector('.dot');
      el.innerHTML = '';
      if (dot) el.appendChild(dot);
      el.appendChild(document.createTextNode(' ' + L[tabKeys[i]]));
      // 恢复 onclick 处理器
      el.setAttribute('onclick', "switchTab('" + tabIds[i] + "')");
      if (wasActive) el.classList.add('active');
    }
  });

  const so = document.getElementById('sign-out');
  if(so) so.textContent = L.signOut;

  // cmdbook toolbar
  safeText('cb-btn-edit', L.cbEdit);
  safeText('cb-btn-delete', L.cbDelete);
  safeText('cb-btn-sync', L.cbSync);
  safeText('cb-btn-export', L.cbExport);
  safeText('cb-btn-import', L.cbImport);

  const searchEl = document.getElementById('search');
  if(searchEl) searchEl.placeholder = (typeof noteFilter !== 'undefined' && noteFilter === 'note') ? L.cbSearchNote : L.cbSearch;
  // 根据当前模式设置新建按钮文字
  const addBtn = document.getElementById('add-btn');
  if (addBtn) addBtn.textContent = (typeof noteFilter !== 'undefined' && noteFilter === 'note') ? L.cbNewNote : L.cbNewCmd;

  // mode tabs
  safeText('mode-tab-cmd', L.cbModeCmd);
  safeText('mode-tab-note', L.cbModeNote);

  // essay editor
  safeText('f-content-label', L.cbContentLabel);
  const fcontent = document.getElementById('f-content');
  if(fcontent) fcontent.setAttribute('data-placeholder', L.cbContentPH);

  // toolbar buttons
  const tbBold = document.getElementById('tb-bold');
  const tbUnder = document.getElementById('tb-underline');
  const tbBullet = document.getElementById('tb-bullet');
  if(tbBold) tbBold.title = L.cbToolbarBold;
  if(tbUnder) tbUnder.title = L.cbToolbarUnderline;
  if(tbBullet) tbBullet.title = L.cbToolbarBullet;

  const emBig = document.querySelector('#empty .big');
  const emDesc = document.querySelector('#empty div:last-child');
  if(emBig) emBig.textContent = L.cbEmptyBig;
  if(emDesc) emDesc.textContent = L.cbEmptyDesc;

  safeText('cb-draft-restore', L.cbRestoreDraft);
  safeText('cb-draft-discard', L.cbDiscardDraft);

  safeText('f-title-label', L.cbTitleLabel);
  safeText('f-steps-label', L.cbStepsLabel);
  safeText('f-desc-label', L.cbDescLabel);
  safeText('f-tags-label', L.cbTagsLabel);
  const ftitle = document.getElementById('f-title'); if(ftitle) ftitle.placeholder = L.cbTitlePH;
  const fdesc = document.getElementById('f-desc'); if(fdesc) fdesc.placeholder = L.cbDescPH;
  const ftags = document.getElementById('f-tags'); if(ftags) ftags.placeholder = L.cbTagsPH;
  safeText('f-save-btn', L.cbSave);
  safeText('f-cancel-btn', L.cbCancel);
  safeText('add-step-btn', L.cbAddStep);

  // ledger subnav
  const ldgBtns = document.querySelectorAll('.ldg-subnav-btn');
  if(ldgBtns[0]) ldgBtns[0].textContent = L.ldgSubHome;
  if(ldgBtns[1]) ldgBtns[1].textContent = L.ldgSubStats;

  safeText('ldg-ov-label-exp', L.ldgOvExp);
  safeText('ldg-ov-label-total', L.ldgOvTotal);
  safeText('ldg-ov-label-bal', L.ldgOvBal);
  safeText('ldg-ov-label-inc', L.ldgOvInc);
  safeText('ldg-add-btn-text', L.ldgAddBtn);

  const typeBtns = document.querySelectorAll('.ldg-type-btn');
  const typeKeys = ['ldgExpense','ldgIncome','ldgTransfer'];
  typeBtns.forEach((b,i) => { if(typeKeys[i]) b.textContent = L[typeKeys[i]]; });

  const noteEl = document.getElementById('ldg-note'); if(noteEl) noteEl.placeholder = L.ldgNotePH;

  // placeholders — 目前只有 2 个：日历、今日看点
  const phTitles = document.querySelectorAll('.ph-title');
  const phDescs = document.querySelectorAll('.ph-desc');
  if(phTitles[0]) phTitles[0].textContent = L.phCalTitle;
  if(phDescs[0]) phDescs[0].textContent = L.phCalDesc;
  if(phTitles[1]) phTitles[1].textContent = L.phNewsTitle;
  if(phDescs[1]) phDescs[1].textContent = L.phNewsDesc;
  document.querySelectorAll('.ph-badge').forEach(el => el.textContent = L.phSoon);

  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === currentLang)
  );

  const cancelBtnEl = document.getElementById('app-confirm-cancel');
  if(cancelBtnEl) cancelBtnEl.textContent = L.ldgDetailClose || '取消';
}

// Apply language on load
applyLang();
