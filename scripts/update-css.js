const fs = require('fs');
const path = 'C:/Users/jefffan/Desktop/Omnia/cmdbook-desktop/index.html';
let html = fs.readFileSync(path, 'utf8');

const startMarker = '/* ═══════════════ 宗门模拟器 ═══════════════ */';
const endMarker = '/* Modal */';

const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker, start);

if (start < 0 || end < 0) { console.log('Markers not found', start, end); process.exit(1); }

const newCSS = `/* ═══════════════ 宗门模拟器 ═══════════════ */
/* 创建界面 */
.sct-create{display:flex;align-items:center;justify-content:center;height:100%;padding:20px;}
.sct-create-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:32px 40px;max-width:580px;width:100%;}
.sct-create-title{text-align:center;font-size:22px;color:var(--amber);letter-spacing:.1em;margin-bottom:24px;font-weight:700;}
.sct-create-field{margin-bottom:16px;}
.sct-create-label{font-size:12px;color:var(--dim);margin-bottom:8px;letter-spacing:.06em;}
.sct-input{flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:6px;font-family:var(--mono);font-size:14px;outline:none;user-select:text;}
.sct-input:focus{border-color:var(--amber);}
.sct-continent-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.sct-continent-card{padding:10px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;cursor:pointer;text-align:center;transition:all .15s;font-size:11px;color:var(--dim);}
.sct-continent-card:hover{border-color:var(--teal);color:var(--teal-t);}
.sct-continent-card.selected{background:var(--teal-dim);border-color:var(--teal);color:var(--teal-t);}
.sct-continent-card .cc-name{font-weight:600;margin-bottom:2px;font-size:13px;}
.sct-continent-card .cc-desc{font-size:10px;opacity:.7;}
.sct-continent-card .cc-bonus{font-size:10px;color:var(--green-t);margin-top:2px;}

/* ═══ 三栏工作台 ═══ */
.sct-main{display:none;flex:1;flex-direction:column;overflow:hidden;}
.sct-topbar{display:flex;align-items:center;justify-content:space-between;padding:5px 14px;background:var(--bg2);border-bottom:1px solid var(--border);flex-shrink:0;gap:8px;}
.sct-topbar-left{display:flex;align-items:center;gap:8px;}
.sct-sect-name{font-size:14px;color:var(--amber);font-weight:700;letter-spacing:.05em;}
.sct-continent-tag{padding:1px 6px;background:var(--bg3);border:1px solid var(--border);border-radius:2px;font-size:9px;color:var(--dim);}
.sct-lv{font-size:10px;color:var(--teal-t);}
.sct-topbar-resources{display:flex;gap:14px;font-size:11px;color:var(--text);}
.sct-res b{font-weight:600;}

/* ── 三栏网格 ── */
.sct-body{display:grid;grid-template-columns:320px 1fr 360px;flex:1;overflow:hidden;gap:0;background:var(--bg);}
.sct-body>div{border-right:1px solid var(--border);overflow:hidden;display:flex;flex-direction:column;}
.sct-body>div:last-child{border-right:none;}

/* 面板通用 */
.sct-panel{display:flex;flex-direction:column;overflow:hidden;border-bottom:1px solid var(--border);}
.sct-panel:last-child{border-bottom:none;flex:1;}
.sct-panel-head{padding:5px 10px;font-size:10px;color:var(--dim);letter-spacing:.05em;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;}
.sct-recruit-limit{font-size:9px;color:var(--amber);}
.sct-empty-hint{text-align:center;padding:24px 16px;color:var(--dim);font-size:11px;line-height:1.8;opacity:.4;}

/* ── 左栏 ── */
.sct-left{background:var(--bg2);}
.sct-sect-stats{padding:6px 10px;font-size:10px;line-height:1.9;color:var(--dim);display:grid;grid-template-columns:1fr 1fr;gap:1px 6px;}
.sct-sect-stats b{color:var(--text);}
.sct-sect-panel{flex:0 0 auto;}

.sct-disciple-list{flex:1;overflow-y:auto;padding:4px 6px;}
.sct-disciple-list::-webkit-scrollbar{width:3px;}
.sct-disciple-list::-webkit-scrollbar-thumb{background:var(--border);}

/* 弟子卡片 */
.sct-disc-card{background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:6px 8px;margin-bottom:5px;cursor:pointer;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto auto;gap:1px 8px;align-items:center;transition:all .1s;}
.sct-disc-card:hover{border-color:var(--teal);}
.sct-disc-card .dc-realm{grid-row:1/4;grid-column:1;width:32px;height:32px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;text-align:center;line-height:1.2;border:1px solid var(--border);background:var(--bg3);color:var(--dim);}
.sct-disc-card .dc-realm.fine{background:var(--green-dim);color:var(--green-t);border-color:var(--green);}
.sct-disc-card .dc-realm.superior{background:var(--teal-dim);color:var(--teal-t);border-color:var(--teal);}
.sct-disc-card .dc-realm.elite{background:var(--amber-dim);color:var(--amber);border-color:var(--amber);}
.sct-disc-card .dc-realm.celestial{background:rgba(248,81,73,.15);color:var(--red);border-color:var(--red);}
.sct-disc-card .dc-name-row{grid-column:2;display:flex;align-items:center;gap:4px;}
.sct-disc-card .dc-name{font-size:12px;font-weight:700;}
.sct-disc-card .dc-quality{padding:0 4px;border-radius:2px;font-size:8px;font-weight:600;}
.sct-disc-card .dc-stats-row{grid-column:2;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:2px;font-size:8px;color:var(--dim);}
.sct-disc-card .dc-stat b{color:var(--text);}
.sct-disc-card .dc-task-row{grid-column:2;display:flex;align-items:center;gap:4px;font-size:9px;}
.sct-disc-card .dc-bg{font-size:7px;color:var(--amber);}
.sct-disc-card.q-mortal{border-left:2px solid var(--dim);}
.sct-disc-card.q-fine{border-left:2px solid var(--green);}
.sct-disc-card.q-superior{border-left:2px solid var(--teal);}
.sct-disc-card.q-elite{border-left:2px solid var(--amber);}
.sct-disc-card.q-celestial{border-left:2px solid var(--red);}

.sct-task-select{background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:8px;padding:1px 4px;border-radius:2px;outline:none;cursor:pointer;max-width:90px;}
.sct-task-select:focus{border-color:var(--teal);}

/* ── 中栏 ── */
.sct-center{background:var(--bg);}
.sct-loc-list{flex:0 0 auto;max-height:200px;overflow-y:auto;font-size:10px;}
.sct-loc-list::-webkit-scrollbar{width:2px;}
.sct-loc-list::-webkit-scrollbar-thumb{background:var(--border);}
.sct-loc-item{display:flex;align-items:center;gap:8px;padding:5px 10px;cursor:pointer;color:var(--text);border-bottom:1px solid rgba(48,54,61,.25);transition:background .1s;}
.sct-loc-item:hover{background:var(--bg3);}
.sct-loc-detail{flex:1;overflow-y:auto;padding:10px 12px;font-size:11px;line-height:1.7;}
.sct-loc-detail::-webkit-scrollbar{width:3px;}
.sct-loc-detail::-webkit-scrollbar-thumb{background:var(--border);}

/* ── 右栏 ── */
.sct-right{background:var(--bg2);}
.sct-act-panel{flex:0 0 auto;}
.sct-actions{padding:6px 10px;display:flex;flex-direction:column;gap:4px;}
.sct-btn{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:var(--mono);font-size:11px;cursor:pointer;transition:all .1s;}
.sct-btn:hover{border-color:var(--green);color:var(--green-t);}
.sct-btn:disabled{opacity:.4;cursor:not-allowed;}
.sct-btn span{font-size:9px;color:var(--dim);}
.sct-btn-turn{width:100%;padding:9px;margin-top:4px;background:var(--green-dim);border:1px solid var(--green);border-radius:4px;color:var(--green-t);font-family:var(--mono);font-size:14px;cursor:pointer;font-weight:700;letter-spacing:.06em;transition:all .1s;}
.sct-btn-turn:hover{background:#1d5a27;}
.sct-btn-turn:disabled{opacity:.4;cursor:not-allowed;}

.sct-combat-log{flex:1;overflow-y:auto;padding:3px 0;font-size:9px;color:var(--dim);min-height:0;}
.sct-combat-log::-webkit-scrollbar{width:2px;}
.sct-combat-log::-webkit-scrollbar-thumb{background:var(--border);}
.sct-combat-msg{padding:3px 10px;border-bottom:1px solid rgba(48,54,61,.2);line-height:1.5;}
.sct-combat-msg.win{color:var(--green-t);}
.sct-combat-msg.lose{color:var(--red);}
.sct-combat-msg.draw{color:var(--amber);}
.sct-combat-empty{text-align:center;padding:10px;color:var(--dim);font-size:9px;opacity:.4;}

.sct-log{flex:1;overflow-y:auto;padding:3px 0;font-size:9px;color:var(--dim);line-height:1.6;min-height:0;}
.sct-log::-webkit-scrollbar{width:2px;}
.sct-log::-webkit-scrollbar-thumb{background:var(--border);}
.sct-log-msg{padding:3px 10px;border-bottom:1px solid rgba(48,54,61,.2);}
.sct-log-msg.good{color:var(--green-t);}
.sct-log-msg.bad{color:var(--red);}
.sct-log-msg.info{color:var(--teal-t);}
.sct-log-msg.event{color:var(--amber);}

#sct-event-panel{max-height:110px;overflow-y:auto;font-size:9px;}
#sct-event-panel::-webkit-scrollbar{width:2px;}
#sct-event-panel::-webkit-scrollbar-thumb{background:var(--border);}
.sct-event-item{display:flex;align-items:center;gap:6px;padding:4px 10px;cursor:pointer;color:var(--text);font-size:9px;border-bottom:1px solid rgba(48,54,61,.2);transition:background .1s;}
.sct-event-item:hover{background:var(--bg3);}
.sct-loc-action:hover{background:var(--bg2)!important;}
.sct-loc-action input[type=radio]{margin:0;}

/* Modal */
.sct-btn-primary{width:100%;padding:10px 14px;background:var(--green-dim);border:1px solid var(--green);border-radius:6px;color:var(--green-t);font-family:var(--mono);font-size:14px;cursor:pointer;font-weight:600;letter-spacing:.04em;transition:all .12s;}
.sct-btn-primary:hover{background:#1e5c28;}
.sct-btn-primary:disabled{opacity:.4;cursor:not-allowed;}`;

html = html.slice(0, start) + newCSS + html.slice(end);
fs.writeFileSync(path, html);
console.log('OK - CSS replaced successfully');
