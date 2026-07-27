/* ═══════════════════════════════════════════════
   sect.js — 宗门模拟器
   文字模拟经营游戏，天星界九洲世界观
   ═══════════════════════════════════════════════ */

// ── 天星界九洲 ──────────────────────────────────
const SECT_CONTINENTS = [
  { id: 'west',   name: '极霞西洲', desc: '极光晚霞、御兽、以暴制暴', bonus: { adventure: 15, gather: -5 } },
  { id: 'south',  name: '落华南洲', desc: '山脉岛屿群聚', bonus: { adventure: 5, cultivate: 5 } },
  { id: 'east',   name: '琼川东洲', desc: '正道宗门自居', bonus: { reputation: 10 } },
  { id: 'north',  name: '荒溟北洲', desc: '寒川冰原', bonus: { physique: 8, gather: -5 } },
  { id: 'cloud',  name: '逍遥云洲', desc: '万族林立、炼丹圣地', bonus: { cultivate: 10, adventure: -5 } },
  { id: 'center', name: '耀神中洲', desc: '最强地域、遮天大阵', bonus: {} },
  { id: 'yao',    name: '千盛瑶洲', desc: '女修圣地', bonus: { recruit: 5 } },
  { id: 'emperor',name: '天曌帝洲', desc: '古国王朝', bonus: { market: 10 } },
  { id: 'glass',  name: '琉璃苍洲', desc: '锻造天堂', bonus: { gather: 10 } },
];

// ── 资质品阶 ──────────────────────────────────
const SECT_QUALITIES = [
  { key: 'mortal',   name: '凡品', tier: 1, prob: 0.60, color: 'var(--dim)',   statRange: [8, 25] },
  { key: 'fine',     name: '良品', tier: 2, prob: 0.28, color: 'var(--green)',  statRange: [20, 45] },
  { key: 'superior', name: '上品', tier: 3, prob: 0.09, color: 'var(--teal)',   statRange: [35, 65] },
  { key: 'elite',    name: '极品', tier: 4, prob: 0.025,color: 'var(--amber)',  statRange: [55, 85] },
  { key: 'celestial',name: '天品', tier: 5, prob: 0.005,color: 'var(--red)',    statRange: [75, 100] },
];

// ── 武道境界（天星界九洲体系） ──────────────────
// 突破条件: 修为值达到 cost 即可尝试突破
// cost=-1 表示已达当前版本上限
const SECT_REALMS = [
  { name: '武仆',     idx: 0, cost: 0,    atk: 2,  def: 1,  spd: 2,   desc: '入门淬体，武道之始' },
  { name: '武者',     idx: 1, cost: 100,  atk: 6,  def: 4,  spd: 4,   desc: '内劲初成，可称武者' },
  { name: '武师',     idx: 2, cost: 250,  atk: 14, def: 10, spd: 7,   desc: '劲力贯通，登堂入室' },
  { name: '大武师',   idx: 3, cost: 500,  atk: 30, def: 22, spd: 11,  desc: '内力外放，威压四方' },
  { name: '武宗',     idx: 4, cost: 1000, atk: 60, def: 45, spd: 17,  desc: '开宗立派之资' },
  { name: '大武宗',   idx: 5, cost: 2500, atk: 120,def: 90, spd: 25,  desc: '宗门支柱，一方豪强' },
  { name: '武王',     idx: 6, cost: 6000, atk: 250,def: 180,spd: 36,  desc: '劈山断水，脱离凡俗' },
  { name: '武君',     idx: 7, cost: -1,   atk: 500,def: 380,spd: 50,  desc: '君临一方，万民景仰（传说）' },
];

// ── 功法库 ────────────────────────────────────
const SECT_TECHNIQUES = [
  { id: 't_breathe',    name: '吐纳术',   grade: '人阶', gradeKey: 'mortal', cost: 0,   reqLv: 0,  reqBuilding: null,   effect: { cultivate: 10 } },
  { id: 't_tough',      name: '淬体诀',   grade: '人阶', gradeKey: 'mortal', cost: 50,  reqLv: 0,  reqBuilding: null,   effect: { physique: 5 } },
  { id: 't_sword',      name: '基础剑法', grade: '人阶', gradeKey: 'mortal', cost: 50,  reqLv: 0,  reqBuilding: null,   effect: { adventure: 8 } },
  { id: 't_gather',     name: '采气术',   grade: '人阶', gradeKey: 'mortal', cost: 80,  reqLv: 0,  reqBuilding: null,   effect: { gather: 12 } },
  { id: 't_charm',      name: '言辩之术', grade: '人阶', gradeKey: 'mortal', cost: 60,  reqLv: 0,  reqBuilding: null,   effect: { market: 10 } },
  { id: 't_meditate',   name: '静心诀',   grade: '黄阶', gradeKey: 'yellow', cost: 200, reqLv: 3,  reqBuilding: 'library', effect: { cultivate: 20 } },
  { id: 't_fire',       name: '烈焰掌',   grade: '黄阶', gradeKey: 'yellow', cost: 200, reqLv: 3,  reqBuilding: 'library', effect: { adventure: 18 } },
  { id: 't_iron',       name: '铁布衫',   grade: '黄阶', gradeKey: 'yellow', cost: 200, reqLv: 3,  reqBuilding: 'library', effect: { physique: 12 } },
  { id: 't_cloud',      name: '云游步',   grade: '黄阶', gradeKey: 'yellow', cost: 250, reqLv: 3,  reqBuilding: 'library', effect: { adventure: 12, cultivate: 5 } },
  { id: 't_trade',      name: '商贾经',   grade: '黄阶', gradeKey: 'yellow', cost: 250, reqLv: 3,  reqBuilding: 'library', effect: { market: 18 } },
];

// ── 建筑 ──────────────────────────────────────
const SECT_BUILDINGS = [
  { id: 'library',  name: '藏经阁',   cost: 500,  desc: '解锁黄阶功法购买',       maxLv: 3, effect: '解锁高阶功法' },
  { id: 'alchemy',  name: '炼丹房',   cost: 800,  desc: '提升弟子修炼速度 +15%',  maxLv: 3, effect: '修炼加成' },
  { id: 'arena',    name: '演武场',   cost: 600,  desc: '提升历练成功率',         maxLv: 3, effect: '历练加成' },
  { id: 'treasury', name: '藏灵阁',   cost: 400,  desc: '灵石存储上限+，每回合额外产出', maxLv: 5, effect: '灵石加成' },
  { id: 'formation',name: '护山大阵', cost: 1000, desc: '降低弟子叛离与伤亡概率',  maxLv: 3, effect: '安全加成' },
];

// ── 任务类型 ──────────────────────────────────
const SECT_TASKS = [
  { key: 'cultivate', name: '修炼',     icon: '🧘', desc: '提升修为，可能突破境界' },
  { key: 'gather',    name: '采集资源', icon: '⛏', desc: '产出灵石和材料' },
  { key: 'adventure', name: '历练',     icon: '⚔', desc: '获取功法/装备，伴随风险' },
  { key: 'market',    name: '坊市摆摊', icon: '🏪', desc: '稳定灵石收入+微增声望' },
];

// ── 随机名册 ──────────────────────────────────
const SECT_SURNAMES  = ['叶','林','萧','楚','苏','白','柳','沈','陆','慕容','上官','东方','南宫','欧阳','司徒','夏侯','令狐','端木','皇甫','尉迟','江','何','吕','施','张','孔','曹','严','华','金','魏','陶','姜','戚','谢','邹','柏','水','窦','章'];
const SECT_GIVEN_M   = ['凡','尘','云','风','逸','寒','轩','羽','天','无','子','一','青','山','道','玄','明','清','正','辰','阳','景','浩','然','千','羽','龙','霄','行','远','承','渊','川','岳','峰','绝','问','心','归','真'];
const SECT_GIVEN_F   = ['瑶','雪','灵','月','曦','霜','梦','若','婉','烟','碧','落','紫','凝','素','清','涟','漪','露','微','萤','裳','舞','云','锦','瑟','画','屏','幽','兰','静','影','沉','璧','浮','光','浅','草','映','寒'];
const SECT_SECT_WORDS = ['太虚','玄天','青云','紫霄','无极','苍龙','天罡','灵墟','万剑','丹霞','碧落','星辰','凌霄','混元','九霄','天元','真武','玄武','天道','问道','天枢','玉清','太华','流云','落星','归元','凌波','清风','明月','长虹'];

// ── 随机事件库 ────────────────────────────────
const SECT_EVENTS = [
  { id: 'ev_wonder',    cat: 'disciple', weight: 12, cond: s => s.disciples.length > 0,
    text: '夜色深沉，宗门后山突然灵光冲天——一名弟子在修炼中出现了顿悟之兆，周身气劲翻涌，天地灵气疯狂向其汇聚。此等机缘，稍纵即逝。',
    choices: [
      { text: '倾注灵石为其护法 (-20灵石)', effect: s => { s.spiritStones -= 20; const d = _pickRandomDisc(s); if (d) { d.cultivation += _randInt(12, 25); d.loyalty += 3; s._addLog('good', d.name + ' 在你的护持下顿悟成功，修为大进！'); } } },
      { text: '远远观望，不打扰他', effect: s => { const d = _pickRandomDisc(s); if (d) { d.cultivation += _randInt(4, 12); s._addLog('info', d.name + ' 自行参悟，略有收获便渐渐平息。'); } } },
      { text: '命其压制修为，勿贪功冒进', effect: s => { const d = _pickRandomDisc(s); if (d) { d.cultivation += 2; d.innerDemon = Math.max(0, d.innerDemon - 10); d.loyalty += 8; s._addLog('info', d.name + ' 虽压制了突破欲望，但根基更加扎实，对你心怀感激。'); } } },
    ]},
  { id: 'ev_demon',     cat: 'disciple', weight: 8, cond: s => s.disciples.some(d => d.loyalty < 55),
    text: '深夜，一名弟子修炼时突然发出一声惨嚎——心魔趁虚而入，周身黑气缭绕，眼中一片赤红。若放任不管，轻则修为尽废，重则走火入魔、危及同门。',
    choices: [
      { text: '亲自出手镇压心魔', effect: s => { const d = _pickDiscByLoyalty(s, true); if (d) { d.loyalty += 15; d.innerDemon = Math.max(0, d.innerDemon - 25); s._addLog('good', '你以强横修为镇压了' + d.name + '的心魔，弟子感激涕零。'); } } },
      { text: '赐下清心丹一枚 (-15灵石)', effect: s => { s.spiritStones -= 15; const d = _pickDiscByLoyalty(s, true); if (d) { d.innerDemon = Math.max(0, d.innerDemon - 15); s._addLog('info', d.name + ' 服下丹药后渐渐平静。'); } } },
      { text: '任其自行挣扎', effect: s => { const d = _pickDiscByLoyalty(s, true); if (d) { d.innerDemon += 10; d.loyalty -= 12; if (d.innerDemon > 80) { d.cultivation = Math.max(0, d.cultivation - 20); s._addLog('bad', d.name + ' 心魔失控，修为大损！'); } else { s._addLog('bad', d.name + ' 心魔加深，对你心生怨恨...'); } } } },
    ]},
  { id: 'ev_merchant',  cat: 'sect', weight: 18, cond: s => true,
    text: '一支来自中洲的商队沿着山道迤逦而来，车马上满载着各洲奇珍——西洲的异兽材料、南洲的灵药、苍洲的兵刃。商队首领笑呵呵地拱手行礼，想与你做一笔买卖。',
    choices: [
      { text: '设宴款待，做大买卖 (-30灵石)', effect: s => { s.spiritStones -= 30; const gain = _randInt(55, 100); s.spiritStones += gain; s.reputation += 3; s._addLog('good', '宾主尽欢。商队留下了大量物资，净赚 ' + gain + ' 灵石，声名远播。'); } },
      { text: '以物易物，小做交易', effect: s => { const gain = _randInt(15, 45); s.spiritStones += gain; s._addLog('info', '与商队交易，获利 ' + gain + ' 灵石。'); } },
      { text: '婉拒交易，专注宗门事务', effect: s => { s._addLog('info', '商队并未强求，继续赶路。你省下了一笔开支。'); } },
    ]},
  { id: 'ev_spirit',    cat: 'sect', weight: 10, cond: s => s.disciples.length > 0,
    text: '轰——！宗门地底的灵脉突然剧烈震颤，一道乳白色的灵气柱破土而出，直冲天际！附近的飞禽走兽纷纷躁动不安。这是一次罕见的灵脉喷涌。',
    choices: [
      { text: '派所有空闲弟子全力开采', effect: s => { const gain = _randInt(40, 80); s.spiritStones += gain; s._addLog('good', '灵石大丰收！弟子们忙了一整天，获得 ' + gain + ' 灵石。'); } },
      { text: '设阵将灵气导入宗门（永久加成）', effect: s => { s.spiritStones -= 20; s.flags.spiritBuff = (s.flags.spiritBuff || 0) + 5; s._addLog('good', '灵脉被成功稳固！全宗弟子修炼速度永久 +5%。'); } },
      { text: '谨慎应对，只取地表灵石', effect: s => { const gain = _randInt(15, 30); s.spiritStones += gain; s._addLog('info', '安全第一。收获 ' + gain + ' 灵石，灵脉也未受损。'); } },
    ]},
  { id: 'ev_challenge', cat: 'diplomacy', weight: 7, cond: s => s.disciples.length >= 2 && s.turn > 6,
    text: '东洲「天煞宗」遣使送来一封战书。信中言语倨傲：久闻贵宗之名，不知门下弟子有几分真功夫？三日后，我宗将派人登门切磋——若不敢应战，就昭告九洲，贵宗不过是徒有虚名耳。',
    choices: [
      { text: '接下战书！命最强弟子应战', effect: s => { const d = _pickStrongestDisc(s); if (d && d.realmIdx >= 1) { s.reputation += 12; d.cultivation += 10; d.loyalty += 5; s._addLog('good', d.name + ' 三招之内击败来敌！天煞宗使者灰头土脸地离去。声望+12'); } else { s.reputation -= 8; d.loyalty -= 5; s._addLog('bad', '弟子修为不足，惨败而归。宗门颜面扫地...'); } } },
      { text: '婉拒切磋，称近期宗门闭关', effect: s => { s.reputation -= 2; s._addLog('bad', '江湖上开始流传贵宗怯战的闲话。声望-2'); } },
      { text: '在战书中回敬一封措辞强硬的信', effect: s => { if (s.reputation >= 15) { s.reputation += 3; s._addLog('info', '对方被你的气势震慑，未敢再来挑衅。声望+3'); } else { s.reputation -= 1; s._addLog('info', '对方嗤之以鼻，但暂时没有进一步行动。'); } } },
    ]},
  { id: 'ev_disciple',  cat: 'disciple', weight: 15, cond: s => s.disciples.length < s._maxDisc() && s.spiritStones >= 20,
    text: '清晨，一位身披斗篷的年轻人在宗门石阶前长跪不起。自称是散修之后，家族没落，一路乞讨至此。愿投身门下，为奴为仆在所不惜——只求一个修炼的机会。',
    choices: [
      { text: '收入门下为记名弟子 (-20灵石)', effect: s => { s.spiritStones -= 20; _createDisciple(s, _randInt(15, 55)); s._addLog('good', '年轻人含泪叩首。愿你不负宗门栽培之恩。'); } },
      { text: '赠些盘缠，请其离开', effect: s => { s.spiritStones -= 5; s.reputation += 1; s._addLog('info', '你取了些碎灵石递给他。年轻人沉默良久，转身离去。'); } },
      { text: '婉言谢绝', effect: s => { s._addLog('info', '宗门资源有限，不能来者不拒。年轻人黯然离去。'); } },
    ]},
  { id: 'ev_disaster',  cat: 'sect', weight: 7, cond: s => s.turn > 4,
    text: '暴雨连下七日，山洪裹挟着巨石冲入宗门驻地。四处一片狼藉，几处偏殿的墙壁已经开裂。弟子们望着满目疮痍，面色凝重。',
    choices: [
      { text: '拨出灵石全力抢修 (-40灵石)', effect: s => { s.spiritStones = Math.max(0, s.spiritStones - 40); s._addLog('info', '昼夜不休地抢修了三天。宗门恢复如初，根基稳固。'); } },
      { text: '组织弟子以劳力自救', effect: s => { s.disciples.forEach(d => { d.cultivation = Math.max(0, d.cultivation - 2); d.loyalty += 3; }); s._addLog('info', '全宗上下齐心协力。虽然修炼略有耽误，但凝聚力更强了。'); } },
    ]},
  { id: 'ev_hermit',    cat: 'disciple', weight: 4, cond: s => s.reputation >= 20,
    text: '一个寻常的晌午，一位白须老者不请自来，在宗门院中驻足良久。他自称是中洲游历至此的散修，看你宗门气象虽小却有一股难得的清正之气。临行前，他愿意指点一二。',
    choices: [
      { text: '恭请前辈为全宗讲道 (-50灵石)', effect: s => { s.spiritStones -= 50; s.disciples.forEach(d => { d.cultivation += _randInt(10, 30); d.loyalty += 8; }); s._addLog('good', '老者口若悬河讲了半日。弟子们如痴如醉，不少人当场盘膝参悟！'); } },
      { text: '仅请前辈指点宗主本人', effect: s => { s.flags.spiritBuff = (s.flags.spiritBuff || 0) + 3; s.reputation += 2; s._addLog('good', '老者临别时看了你一眼：不错。修为永久 +3%。'); } },
      { text: '恭敬送别，不敢多扰', effect: s => { s.reputation += 2; s._addLog('info', '老者含笑抚须：后生可畏。飘然而去。'); } },
    ]},
  { id: 'ev_traitor',   cat: 'disciple', weight: 5, cond: s => s.disciples.some(d => d.loyalty < 35),
    text: '月黑风高。一名弟子背着鼓鼓囊囊的包袱，蹑手蹑脚地溜出了偏殿——宗门库房的门锁被人撬开了。此人竟然趁夜盗取宗门物资，意图叛逃！',
    choices: [
      { text: '亲率弟子连夜追捕', effect: s => { const d = _pickDiscByLoyalty(s, true); if (d) { if (Math.random() < 0.55) { s.spiritStones += _randInt(15, 30); s._addLog('info', '在三十里外截住了' + d.name + '，追回了大部分失窃物资。'); } else { s._addLog('bad', '追出百里，仍被其逃脱。'); d.status = '叛离'; _removeDisc(s, d); } } } },
      { text: '记下名字，不再追究', effect: s => { const d = _pickDiscByLoyalty(s, true); if (d) { s.spiritStones = Math.max(0, s.spiritStones - _randInt(10, 20)); _removeDisc(s, d); s._addLog('info', '你让弟子取了些灵石赠予' + d.name + '：去吧，好自为之。'); } } },
    ]},
  { id: 'ev_treasure',  cat: 'sect', weight: 8, cond: s => s.turn > 5,
    text: '一位弟子在打扫藏经阁时，无意中碰落了一本积满灰尘的旧书。书页中夹着一张泛黄的兽皮地图，标注着宗门附近一处前人留下的洞府——不知真假，但值得一探。',
    choices: [
      { text: '派遣弟子前往探索', effect: s => { if (Math.random() < 0.6) { const gain = _randInt(40, 100); s.spiritStones += gain; s._addLog('good', '洞府虽已破败，但遗留下了价值 ' + gain + ' 灵石的资源！'); } else { const d = _pickRandomDisc(s); if (d) { d.cultivation = Math.max(0, d.cultivation - 5); s._addLog('bad', '洞府中机关仍在！弟子受了些轻伤。'); } } } },
      { text: '将地图收好，从长计议', effect: s => { s.flags.treasureMap = true; s._addLog('info', '你将地图藏入密室。或许将来修为更高时再去不迟。'); } },
    ]},
  { id: 'ev_celestial', cat: 'disciple', weight: 2, cond: s => s.reputation >= 30 && s.turn > 15,
    text: '那一夜，天际忽有流星破空，拖着长长的焰尾落入宗门后山。一道若有若无的气息在呼唤着你——传说中，天降异象往往意味着将有一位惊世之才即将出世...',
    choices: [
      { text: '循着气息，深入后山', effect: s => { if (Math.random() < 0.35) { _createDisciple(s, _randInt(75, 100)); s._addLog('good', '你在星光中抱起一个婴儿。天品资质，未来的绝世强者！！'); } else { s.flags.spiritBuff = (s.flags.spiritBuff || 0) + 3; s._addLog('info', '星星碎片散落一地，你虽未寻到预言之子，但带回了一缕浓郁的星辰灵气。'); } } },
      { text: '站在山巅，静静观望', effect: s => { s.reputation += 2; s._addLog('info', '流星缓缓隐没。天地归于沉寂，但你心中似乎多了些什么。'); } },
    ]},
  { id: 'ev_rival',     cat: 'diplomacy', weight: 6, cond: s => s.turn > 8 && s.disciples.length >= 2,
    text: '一名弟子急匆匆来报：附近山头上最近竖起了一面旗帜——一个新的宗门正在悄然建立。这处灵脉本是我宗势力范围的一部分，新宗门的选址显然有些过界了。',
    choices: [
      { text: '派弟子前去交涉，表明立场', effect: s => { if (s.reputation >= 15) { s.reputation += 5; s.spiritStones += 20; s._addLog('good', '你的态度不卑不亢。对方退让了部分领地，还送上赔礼。'); } else { s._addLog('info', '对方态度敷衍。看来需要先积累声望才能服人。'); } } },
      { text: '暂且观望，不打草惊蛇', effect: s => { s._addLog('info', '你让弟子暗中注意那面旗帜的动向。'); } },
    ]},
];

// ── 弟子对话池 ────────────────────────────────
const SECT_DIALOGUES = [
  // 切磋比试
  ['{A}在练武场向{B}讨教了两招，{B}笑着指点了一番。', 'good'],
  ['{A}与{B}在竹林中对练，剑气惊起了一群飞鸟。', 'info'],
  ['{A}不服{B}的排名，提出切磋。三招之后{A}心服口服。', 'info'],
  ['晨光熹微，{A}已经在演武场挥汗如雨。{B}路过时驻足观看了许久。', 'info'],
  // 修炼交流
  ['{A}打坐时遇到瓶颈，{B}将自己突破的心得倾囊相授。', 'good'],
  ['月下，{A}和{B}对坐论道，直到东方泛白。两人的修为都有所感悟。', 'good'],
  ['{A}在山崖边冥想，{B}默默在不远处为其护法。', 'info'],
  ['藏经阁内，{A}捧着一本残破的功法向{B}请教。两人研读至深夜。', 'good'],
  // 日常琐事
  ['{A}从山下带回了一壶好酒，与{B}对饮至深夜。', 'info'],
  ['{A}在药圃里发现了一株异草，兴冲冲地拿给{B}看。', 'info'],
  ['下雨了。{A}和{B}一起在廊檐下躲雨，聊起了各自的故鄉。', 'info'],
  ['{A}在厨房里捣鼓了一锅药膳，{B}尝了一口后表情微妙。', 'info'],
  // 冲突摩擦
  ['{A}与{B}因为分配修炼资源产生了争执，最终不欢而散。', 'bad'],
  ['{A}无意中撞翻了{B}的丹炉，两人大吵了一架。', 'bad'],
  ['{A}认为{B}修炼方式太过激进，{B}反唇相讥说{A}太过保守。', 'bad'],
  ['{A}的灵兽跑进了{B}的房间，弄乱了{B}的经书。', 'bad'],
  // 师徒情谊
  ['{A}恭敬地向{B}行了一礼，请教修炼上的疑惑。', 'good'],
  ['{A}受伤后，{B}连夜上山采药，直到天亮才跌跌撞撞地回来。', 'good'],
  ['{A}突破了一个小境界，第一个告诉了{B}。', 'good'],
  ['{A}悄悄在{B}的蒲团下放了一颗聚灵丹。', 'good'],
  // 嫉妒竞争
  ['{A}见{B}又突破了一层，心中不太是滋味。', 'bad'],
  ['{A}在背后议论{B}得到的资源比自己多。', 'bad'],
  ['{A}主动提出和{B}比武，想证明自己不输于人。', 'info'],
  // 意外事件
  ['{A}在山中采药时迷了路，{B}找了大半夜才把人带回来。', 'info'],
  ['{A}养的那只灵鹤飞走了，{B}陪着他找了三天。', 'info'],
  ['一道惊雷劈中了后山古树，{A}和{B}同时冲出去查看。', 'info'],
  ['{A}捡到了一块奇怪的玉佩，来找{B}一起参详。', 'info'],
];

// ── 江湖消息池 ────────────────────────────────
const SECT_WORLD_NEWS = [
  '东洲「琼川剑派」大弟子突破武王境，方圆百里灵气翻涌三日不息。',
  '南洲「落华商会」的商路被不明势力截断，正在重金悬赏线索。',
  '西洲一头远古妖兽苏醒，数个宗门紧急结盟应对。',
  '北洲「荒溟冰宫」对外开放，广邀天下修士前往交流。',
  '中洲「耀神书院」今年的招生名额已放出，九洲天才蜂拥而至。',
  '云洲「逍遥拍卖行」即将举办季度拍卖，据说有地阶功法压轴。',
  '瑶洲一位女修独自横扫了黑风寨，江湖人称「千盛仙子」。',
  '帝洲「天曌神国」边境出现异动，朝廷派出武王强者巡边。',
  '苍洲「琉璃锻器坊」出了一把九品灵兵，引得各方势力争夺。',
  '东洲与南洲交界处发现了一处上古遗迹，已有三宗之人前往探路。',
  '逍遥云洲再现武君踪迹——一位鹤发老者在坊市下棋，无人能敌。',
  '天煞宗近日动作频繁，疑似在图谋西洲的一座未开发灵矿。',
  '北洲极寒之地有异宝出世的光芒闪现，但暴风雪阻断了去路。',
  '中洲两大世家因一桩婚事起了冲突，波及周边数个中小宗门。',
  '落华南洲海域出现了百年难遇的「潮汐灵潮」，修士们争相入海修炼。',
  '帝洲朝廷发布悬赏令：缉拿一名叛逃的武王供奉，赏金五十万灵石。',
  '苍洲矿脉深处挖出一块古碑，上面记载了一种失传的锻造秘术。',
  '瑶洲「百花谷」今年的灵花大典即将举办，九洲爱花之人纷纷前往。',
  '最近江湖上出现了一个神秘组织，到处收购低品阶宗门的情报。',
  '云洲「炼丹师公会」宣布研制出一种新丹方，可大幅降低心魔风险。',
  '某处无名山谷中，有樵夫声称看到了一位御剑飞行的白发剑仙。',
  '中洲有人见过一位少年，十岁便已是武师境界——疑为某隐世家族子弟。',
];

// ── 附近宗门列表 ──────────────────────────────
const SECT_NEARBY = [
  { name: '天煞宗',   style: '好战',  power: 3, desc: '一个以霸道著称的中型宗门，经常挑衅周边势力。' },
  { name: '青云门',   style: '正道',  power: 4, desc: '历史悠久的正道宗门，处事公正但眼界颇高。' },
  { name: '血刀门',   style: '邪道',  power: 5, desc: '魔道分支，行事狠辣不择手段。' },
  { name: '灵墟阁',   style: '中立',  power: 2, desc: '以丹药和贸易为主的小宗门，与各方关系不错。' },
  { name: '飞星宗',   style: '隐世',  power: 3, desc: '不问世事的小宗门，弟子稀少但各个精锐。' },
  { name: '黑风寨',   style: '散修',  power: 1, desc: '一群散修聚集的草台班子，偶尔干些劫掠勾当。' },
];

// ── 辅助函数（模块级） ────────────────────────
function _randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function _uid() { return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function _pickRandomDisc(s) { const arr = s.disciples.filter(d => d.status === '正常'); return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }
function _pickStrongestDisc(s) { const arr = s.disciples.filter(d => d.status === '正常'); return arr.length ? arr.reduce((a, b) => a.cultivation >= b.cultivation ? a : b) : null; }
function _pickDiscByLoyalty(s, low) { const arr = s.disciples.filter(d => d.status === '正常' && (low ? d.loyalty < 50 : d.loyalty >= 50)); return arr.length ? arr[Math.floor(Math.random() * arr.length)] : _pickRandomDisc(s); }
function _removeDisc(s, d) { const idx = s.disciples.indexOf(d); if (idx >= 0) s.disciples.splice(idx, 1); }

function _createDisciple(s, talentOverride) {
  const q = SECT._rollQuality();
  const gender = Math.random() < 0.5 ? 'm' : 'f';
  const surnames = SECT_SURNAMES;
  const givens = gender === 'm' ? SECT_GIVEN_M : SECT_GIVEN_F;
  const name = surnames[Math.floor(Math.random() * surnames.length)]
    + givens[Math.floor(Math.random() * givens.length)];
  const r = q.statRange;
  const talent = talentOverride || _randInt(r[0], r[1]);
  const disc = {
    id: _uid(), name, gender, quality: q.key, qualityTier: q.tier, qualityName: q.name,
    rootBone: _randInt(r[0], r[1]), comprehension: _randInt(r[0], r[1]),
    physique: _randInt(r[0], r[1]), charm: _randInt(r[0], r[1]),
    realm: SECT_REALMS[0], realmIdx: 0, cultivation: 0,
    loyalty: _randInt(50, 85), innerDemon: _randInt(0, 15),
    traits: [], task: null, status: '正常', recruitedTurn: s.turn,
  };
  s.disciples.push(disc);
  return disc;
}

function _weightedRandom(items, weightFn) {
  const total = items.reduce((sum, item) => sum + weightFn(item), 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= weightFn(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// ═══════════════════════════════════════════════
//  SECT 主对象
// ═══════════════════════════════════════════════
const SECT = {
  active: false,
  view: 'create', // 'create' | 'main' | 'recruit'
  sectName: '',
  continent: '',
  spiritStones: 100,
  reputation: 0,
  turn: 1,
  level: 1,
  disciples: [],
  techniques: ['t_breathe'], // 初始自带吐纳术
  buildings: [],             // [{ id: 'library', lv: 1 }]
  recruitment: { used: 0, pity: 0 },
  actionPoints: 3,
  eventLog: [],
  flags: {},
  pendingRecruits: [],       // 五连抽临时结果
  selectedContinent: '',
  selectedDiscId: null,      // 当前选中的弟子（分配任务用）
  saveKey: 'sect_save',

  // ── 辅助 ──────────────────────────────────
  _maxDisc() { return 6 + this.level * 2; },
  _maxAP() { return 3 + this.level; },
  _year() { return Math.floor((this.turn - 1) / 12) + 1; },
  _recruitLimit() { return 3; },

  // ── 品质抽卡 ──────────────────────────────
  _rollQuality() {
    this.recruitment.pity++;
    let r = Math.random();
    // 保底：连续15次未出上品以上，强制上品
    if (this.recruitment.pity >= 15) {
      this.recruitment.pity = 0;
      return SECT_QUALITIES.find(q => q.key === 'superior');
    }
    let cumulative = 0;
    for (const q of SECT_QUALITIES) {
      cumulative += q.prob;
      if (r <= cumulative) {
        if (q.tier >= 3) this.recruitment.pity = 0;
        return q;
      }
    }
    return SECT_QUALITIES[0];
  },

  // ═══════════════════════════════════════════
  //  生命周期
  // ═══════════════════════════════════════════
  init() {
    const saved = this.load();
    if (saved) {
      this._restoreState(saved);
      this._render();
    } else {
      this._render();
    }
  },

  activate() {
    if (!this.sectName && !this.load()) {
      this.view = 'create';
    }
    this._render();
  },

  deactivate() {
    this.save();
    this.active = false;
  },

  // ═══════════════════════════════════════════
  //  存档
  // ═══════════════════════════════════════════
  save() {
    const data = {
      sectName: this.sectName, continent: this.continent,
      spiritStones: this.spiritStones, reputation: this.reputation,
      turn: this.turn, level: this.level,
      disciples: this.disciples, techniques: this.techniques,
      buildings: this.buildings, recruitment: this.recruitment,
      actionPoints: this.actionPoints,
      eventLog: this.eventLog, flags: this.flags,
    };
    try { localStorage.setItem(this.saveKey, JSON.stringify(data)); } catch (e) {}
  },

  load() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data.sectName) return null;
      // 恢复 realm 对象引用
      if (data.disciples) {
        data.disciples.forEach(d => {
          if (typeof d.realmIdx === 'number') d.realm = SECT_REALMS[d.realmIdx] || SECT_REALMS[0];
        });
      }
      return data;
    } catch (e) { return null; }
  },

  _restoreState(data) {
    Object.assign(this, data);
    this.view = 'main';
    this.selectedDiscId = null;
    this.pendingRecruits = [];
  },

  // ═══════════════════════════════════════════
  //  主渲染入口
  // ═══════════════════════════════════════════
  _render() {
    const app = document.getElementById('sect-app');
    if (app) app.style.display = 'none'; // no longer used, cleanup

    const createScr = document.getElementById('sct-create-screen');
    const mainScr = document.getElementById('sct-main-screen');

    if (this.view === 'create') {
      if (createScr) createScr.style.display = 'flex';
      if (mainScr) mainScr.style.display = 'none';
      this._renderCreate();
    } else {
      if (createScr) createScr.style.display = 'none';
      if (mainScr) mainScr.style.display = 'flex';
      this._renderMain();
    }
    this.active = true;
  },

  // ═══════════════════════════════════════════
  //  创建界面
  // ═══════════════════════════════════════════
  _renderCreate() {
    const grid = document.getElementById('sct-continent-grid');
    if (!grid) return;
    grid.innerHTML = SECT_CONTINENTS.map(c => {
      const sel = this.selectedContinent === c.id ? ' selected' : '';
      let bonusText = '';
      if (c.bonus.adventure) bonusText += '历练+' + c.bonus.adventure + '% ';
      if (c.bonus.gather) bonusText += '采集+' + c.bonus.gather + '% ';
      if (c.bonus.cultivate) bonusText += '修炼+' + c.bonus.cultivate + '% ';
      if (c.bonus.market) bonusText += '坊市+' + c.bonus.market + '% ';
      if (c.bonus.reputation) bonusText += '声望+' + c.bonus.reputation + '% ';
      if (c.bonus.physique) bonusText += '体魄+' + c.bonus.physique + '% ';
      if (c.bonus.recruit) bonusText += '招募+' + c.bonus.recruit + '% ';
      if (!bonusText) bonusText = '均衡发展';
      return '<div class="sct-continent-card' + sel + '" onclick="SECT._selectContinent(\'' + c.id + '\')">'
        + '<div class="cc-name">' + c.name + '</div>'
        + '<div class="cc-desc">' + c.desc + '</div>'
        + '<div class="cc-bonus">' + bonusText + '</div></div>';
    }).join('');
  },

  _selectContinent(id) {
    this.selectedContinent = id;
    this._renderCreate();
  },

  _randomSectName() {
    const input = document.getElementById('sct-name-input');
    if (!input) return;
    const w1 = SECT_SECT_WORDS[Math.floor(Math.random() * SECT_SECT_WORDS.length)];
    const suffixes = ['宗', '门', '阁', '殿', '宫', '派'];
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
    input.value = w1 + suf;
  },

  _startGame() {
    const input = document.getElementById('sct-name-input');
    const name = (input?.value || '').trim();
    if (!name) { alert('请输入宗门名称'); return; }
    if (!this.selectedContinent) { alert('请选择所在洲'); return; }
    const cont = SECT_CONTINENTS.find(c => c.id === this.selectedContinent);
    if (!cont) return;

    this.sectName = name;
    this.continent = cont.id;
    this.spiritStones = 100;
    this.reputation = 0;
    this.turn = 1;
    this.level = 1;
    this.disciples = [];
    this.techniques = ['t_breathe'];
    this.buildings = [];
    this.recruitment = { used: 0, pity: 0 };
    this.actionPoints = this._maxAP();
    this.eventLog = [];
    this.flags = {};
    this.selectedDiscId = null;
    this.pendingRecruits = [];
    this.view = 'main';

    // 创建起始弟子 (1-2名)
    _createDisciple(this, _randInt(25, 55));
    if (Math.random() < 0.6) _createDisciple(this, _randInt(20, 50));

    this._addLog('info', '⛩ 「' + name + '」于' + cont.name + '正式创立！');
    this.save();
    this._render();
  },

  // ═══════════════════════════════════════════
  //  主界面
  // ═══════════════════════════════════════════
  _renderMain() {
    // Topbar
    const cont = SECT_CONTINENTS.find(c => c.id === this.continent);
    const nd = document.getElementById('sct-name-display');
    const cd = document.getElementById('sct-continent-display');
    const ld = document.getElementById('sct-level-display');
    if (nd) nd.textContent = '⛩ ' + this.sectName;
    if (cd) cd.textContent = cont ? cont.name : '';
    if (ld) ld.textContent = 'Lv.' + this.level;

    const se = document.getElementById('sct-stones');
    const re = document.getElementById('sct-rep');
    const te = document.getElementById('sct-turn');
    const ye = document.getElementById('sct-year');
    if (se) se.textContent = this.spiritStones;
    if (re) re.textContent = this.reputation;
    if (te) te.textContent = this.turn;
    if (ye) ye.textContent = this._year();
    const ape = document.getElementById('sct-ap');
    if (ape) { ape.textContent = this.actionPoints; ape.style.color = this.actionPoints === 0 ? 'var(--red)' : ''; }

    const rl = document.getElementById('sct-recruit-limit');
    if (rl) rl.textContent = '本年已招募: ' + this.recruitment.used + '/' + this._recruitLimit();

    // Disciple grid
    this._renderDisciples();
    // Log
    this._renderLog();
  },

  _renderDisciples() {
    const grid = document.getElementById('sct-disciple-grid');
    if (!grid) return;
    const maxD = this._maxDisc();

    if (this.disciples.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--dim);font-size:13px">尚无弟子<br><span style="font-size:11px;opacity:.6">点击右侧「招募弟子」或等待事件触发</span></div>';
      return;
    }

    grid.innerHTML = this.disciples.map(d => {
      const q = SECT_QUALITIES.find(qq => qq.key === d.quality) || SECT_QUALITIES[0];
      const sel = this.selectedDiscId === d.id ? ' selected' : '';
      const taskCls = d.task || 'none';
      const taskName = d.task ? SECT_TASKS.find(t => t.key === d.task)?.name || '未分配' : '未分配';
      const r = d.realm;
      const nextR = d.realmIdx < SECT_REALMS.length - 1 ? SECT_REALMS[d.realmIdx + 1] : null;
      const cultPct = nextR && nextR.cost > 0 ? Math.min(100, Math.round(d.cultivation / nextR.cost * 100)) : 100;
      const statusMark = d.status !== '正常' ? ' ⚠' + d.status : '';

      return '<div class="sct-disciple-card q-' + q.key + sel + '" onclick="SECT._selectDisciple(\'' + d.id + '\')">'
        + '<div class="dc-header">'
        + '<span class="dc-name">' + d.name + statusMark + '</span>'
        + '<span class="dc-quality" style="color:' + q.color + '">' + d.qualityName + '</span>'
        + '</div>'
        + '<div class="dc-cultivation">' + r.name + ' ' + cultPct + '%</div>'
        + '<div class="dc-stats">'
        + '<span>根' + d.rootBone + '</span>'
        + '<span>悟' + d.comprehension + '</span>'
        + '<span>体' + d.physique + '</span>'
        + '<span>魅' + d.charm + '</span>'
        + '</div>'
        + '<div class="dc-loyalty">忠' + d.loyalty + ' | 心魔' + d.innerDemon + '</div>'
        + '<select class="sct-task-select" onclick="event.stopPropagation()" onchange="SECT._assignTask(\'' + d.id + '\', this.value)">'
        + '<option value=""' + (d.task ? '' : ' selected') + '>-- 选择任务 --</option>'
        + SECT_TASKS.map(t => '<option value="' + t.key + '"' + (d.task === t.key ? ' selected' : '') + '>' + t.icon + ' ' + t.name + '</option>').join('')
        + '</select>'
        + '</div>';
    }).join('');
  },

  _selectDisciple(id) {
    this.selectedDiscId = this.selectedDiscId === id ? null : id;
    this._renderDisciples();
    this._renderMain();
  },

  _assignTask(discId, taskKey) {
    const d = this.disciples.find(dd => dd.id === discId);
    if (!d) return;
    d.task = taskKey || null;
    this._renderDisciples();
    this.save();
  },

  _renderLog() {
    const logEl = document.getElementById('sct-log');
    if (!logEl) return;
    if (this.eventLog.length === 0) {
      logEl.innerHTML = '<div class="sct-log-empty">暂无事件记录<br><span style="font-size:10px">分配任务后点击「下一回合」开始</span></div>';
      return;
    }
    // 显示最近 30 条，倒序
    const recent = this.eventLog.slice(-30).reverse();
    logEl.innerHTML = recent.map(e =>
      '<div class="sct-log-msg ' + e.type + '">'
      + '<span style="font-size:10px;opacity:.5">第' + e.turn + '回合: </span>'
      + e.text + '</div>'
    ).join('');
  },

  _addLog(type, text) {
    this.eventLog.push({ turn: this.turn, type, text });
    if (this.eventLog.length > 100) this.eventLog.shift();
  },

  // ═══════════════════════════════════════════
  //  弟子招募
  // ═══════════════════════════════════════════
  _openRecruit() {
    if (this.spiritStones < 80) {
      this._showModal('灵石不足', '<p style="text-align:center;color:var(--dim)">招募需要 80 灵石</p>', null);
      return;
    }
    if (this.actionPoints < 2) {
      this._showModal('行动点不足', '<p style="text-align:center;color:var(--dim)">招募需要消耗 2 行动点（当前: ' + this.actionPoints + '）<br>请推进回合以恢复行动点</p>', null);
      return;
    }
    if (this.recruitment.used >= this._recruitLimit()) {
      this._showModal('名额已满', '<p style="text-align:center;color:var(--dim)">本年招募名额已用完（' + this._recruitLimit() + '人/年）<br>请等待下一年</p>', null);
      return;
    }
    if (this.disciples.length >= this._maxDisc()) {
      this._showModal('弟子已满', '<p style="text-align:center;color:var(--dim)">弟子数量已达上限（' + this._maxDisc() + '人）<br>请升级宗门或遣散弟子</p>', null);
      return;
    }

    this.spiritStones -= 80;
    this.actionPoints -= 2;
    this.recruitment.used++;
    this.pendingRecruits = [];

    // 五连抽
    for (let i = 0; i < 5; i++) {
      const q = this._rollQuality();
      const r = q.statRange;
      const disc = {
        id: _uid(),
        name: (SECT_SURNAMES[Math.floor(Math.random() * SECT_SURNAMES.length)]
          + (Math.random() < 0.5 ? SECT_GIVEN_M : SECT_GIVEN_F)[Math.floor(Math.random() * 40)]),
        gender: Math.random() < 0.5 ? 'm' : 'f',
        quality: q.key, qualityTier: q.tier, qualityName: q.name,
        rootBone: _randInt(r[0], r[1]),
        comprehension: _randInt(r[0], r[1]),
        physique: _randInt(r[0], r[1]),
        charm: _randInt(r[0], r[1]),
        accepted: false, rejected: false,
      };
      this.pendingRecruits.push(disc);
    }

    const remaining = this._recruitLimit() - this.recruitment.used;
    const pityPct = Math.round(this.recruitment.pity / 10 * 100);

    let html = '<h2>🔍 弟子招募 · 五连抽</h2>';
    html += '<div style="text-align:center;font-size:11px;color:var(--dim);margin-bottom:12px">'
      + '本年剩余名额: <b style="color:var(--amber)">' + remaining + '</b> | 保底进度:</div>';
    html += '<div class="sct-pity-wrap">0<div class="sct-pity-bar"><div class="sct-pity-fill" style="width:' + pityPct + '%"></div></div>10</div>';
    html += '<div class="sct-recruit-results">';
    this.pendingRecruits.forEach((d, i) => {
      const q = SECT_QUALITIES.find(qq => qq.key === d.quality) || SECT_QUALITIES[0];
      html += '<div class="sct-recruit-card">'
        + '<div class="rr-name">' + d.name + '</div>'
        + '<div class="rr-quality" style="color:' + q.color + '">' + d.qualityName + '</div>'
        + '<div class="rr-stats">根' + d.rootBone + ' 悟' + d.comprehension + '<br>体' + d.physique + ' 魅' + d.charm + '</div>'
        + '<div id="sct-rr-btn-' + i + '">'
        + '<button class="rr-btn" onclick="SECT._acceptRecruit(' + i + ')">收徒</button> '
        + '<button class="rr-btn reject" onclick="SECT._rejectRecruit(' + i + ')">驱离</button>'
        + '</div></div>';
    });
    html += '</div>';
    html += '<div style="text-align:center"><button class="t-btn" onclick="SECT._closeModal()">关闭</button></div>';

    this._showModal(null, html, null);
    this.save();
  },

  _acceptRecruit(idx) {
    const d = this.pendingRecruits[idx];
    if (!d || d.accepted || d.rejected) return;
    if (this.disciples.length >= this._maxDisc()) return;

    d.accepted = true;
    const disc = {
      id: _uid(), name: d.name, gender: d.gender,
      quality: d.quality, qualityTier: d.qualityTier, qualityName: d.qualityName,
      rootBone: d.rootBone, comprehension: d.comprehension,
      physique: d.physique, charm: d.charm,
      realm: SECT_REALMS[0], realmIdx: 0, cultivation: 0,
      loyalty: _randInt(60, 90), innerDemon: _randInt(0, 10),
      traits: [], task: null, status: '正常', recruitedTurn: this.turn,
    };
    this.disciples.push(disc);
    this._addLog('good', '新弟子 ' + d.name + '（' + d.qualityName + '）入门！');

    // Update recruit card button
    const btnEl = document.getElementById('sct-rr-btn-' + idx);
    if (btnEl) btnEl.innerHTML = '<span class="rr-done">✅ 已收徒</span>';

    this.save();
  },

  _rejectRecruit(idx) {
    const d = this.pendingRecruits[idx];
    if (!d || d.accepted || d.rejected) return;
    d.rejected = true;
    const btnEl = document.getElementById('sct-rr-btn-' + idx);
    if (btnEl) btnEl.innerHTML = '<span class="rr-done" style="color:var(--red)">✕ 已驱离</span>';
  },

  // ═══════════════════════════════════════════
  //  回合结算
  // ═══════════════════════════════════════════
  _nextTurn() {
    // 结算所有弟子任务
    const cont = SECT_CONTINENTS.find(c => c.id === this.continent);
    let turnStones = 0, turnRep = 0;
    const lines = [];

    this.disciples.forEach(d => {
      if (d.status !== '正常') return;
      if (!d.task) {
        // 未分配任务：微量自然修炼
        const gain = _randInt(0, 2);
        d.cultivation += gain;
        return;
      }

      switch (d.task) {
        case 'cultivate': {
          let bonus = 0;
          if (cont?.bonus.cultivate) bonus += cont.bonus.cultivate;
          this.techniques.forEach(tid => {
            const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
            if (t?.effect.cultivate) bonus += t.effect.cultivate;
          });
          if (this.flags.spiritBuff) bonus += this.flags.spiritBuff;
          // 有炼丹房加成
          const alchemyBld = this.buildings.find(b => b.id === 'alchemy');
          if (alchemyBld) bonus += alchemyBld.lv * 15;

          const base = _randInt(1, 4);
          const gain = Math.round(base * (1 + bonus / 100));
          d.cultivation += gain;
          lines.push('info|' + d.name + ' 潜心修炼，修为+' + gain);
          // 修炼风险：小概率心魔滋生
          if (Math.random() < 0.04) { d.innerDemon += _randInt(3, 10); lines.push('bad|' + d.name + ' 修炼中杂念丛生，心魔微涨...'); }
          break;
        }
        case 'gather': {
          let bonus = 0;
          if (cont?.bonus.gather) bonus += cont.bonus.gather;
          this.techniques.forEach(tid => {
            const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
            if (t?.effect.gather) bonus += t.effect.gather;
          });
          const treasuryBld = this.buildings.find(b => b.id === 'treasury');
          if (treasuryBld) bonus += treasuryBld.lv * 10;

          const base = _randInt(4, 10);
          const gain = Math.round(base * (1 + bonus / 100));
          turnStones += gain;
          lines.push('info|' + d.name + ' 采集资源，灵石+' + gain);
          // 采集也有风险：小概率受伤
          if (Math.random() < 0.06) { d.cultivation = Math.max(0, d.cultivation - _randInt(2, 6)); lines.push('bad|' + d.name + ' 采集时被妖兽袭击，受了轻伤！'); }
          break;
        }
        case 'adventure': {
          let bonus = 0, danger = 5;
          if (cont?.bonus.adventure) bonus += cont.bonus.adventure;
          this.techniques.forEach(tid => {
            const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
            if (t?.effect.adventure) bonus += t.effect.adventure;
          });
          if (this.buildings.find(b => b.id === 'arena')) danger = 2;
          if (this.buildings.find(b => b.id === 'formation')) danger = Math.max(1, danger - 1);

          if (Math.random() * 100 < danger) {
            const injury = _randInt(3, 10);
            d.cultivation = Math.max(0, d.cultivation - injury);
            d.loyalty -= _randInt(1, 5);
            lines.push('bad|' + d.name + ' 历练受伤，修为-' + injury);
          } else {
            const stoneGain = _randInt(15, 40);
            const repGain = _randInt(1, 4);
            const cultGain = _randInt(3, 10);
            turnStones += Math.round(stoneGain * (1 + bonus / 100));
            turnRep += repGain;
            d.cultivation += Math.round(cultGain * (1 + bonus / 100));
            lines.push('good|' + d.name + ' 历练成功！灵石+' + stoneGain + ' 声望+' + repGain);
            // 小概率获得功法
            if (Math.random() < 0.15) {
              const avail = SECT_TECHNIQUES.filter(t => t.reqLv > 0 && !this.techniques.includes(t.id));
              if (avail.length) {
                const t = avail[Math.floor(Math.random() * avail.length)];
                if (!this.techniques.includes(t.id)) {
                  this.techniques.push(t.id);
                  lines.push('good|' + d.name + ' 在历练中获得功法「' + t.name + '」！');
                }
              }
            }
          }
          break;
        }
        case 'market': {
          let bonus = 0;
          if (cont?.bonus.market) bonus += cont.bonus.market;
          this.techniques.forEach(tid => {
            const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
            if (t?.effect.market) bonus += t.effect.market;
          });
          const base = _randInt(3, 10);
          const gain = Math.round(base * (1 + bonus / 100));
          turnStones += gain;
          const repGain = _randInt(0, 1);
          turnRep += repGain;
          lines.push('info|' + d.name + ' 坊市摆摊，灵石+' + gain + (repGain ? ' 声望+' + repGain : ''));
          // 极低概率淘到功法残卷
          if (Math.random() < 0.03 && this.techniques.length < SECT_TECHNIQUES.length) {
            const avail = SECT_TECHNIQUES.filter(t => !this.techniques.includes(t.id) && t.reqLv <= this.level);
            if (avail.length) { const t = avail[Math.floor(Math.random() * avail.length)]; this.techniques.push(t.id); lines.push('good|' + d.name + ' 在坊市淘到功法「' + t.name + '」！'); }
          }
          // 坊市也有风险：可能被骗
          if (Math.random() < 0.05) { const lost = _randInt(5, 15); turnStones = Math.max(0, turnStones - lost); lines.push('bad|' + d.name + ' 在坊市被人以假灵石骗了' + lost + '灵石！'); }
          break;
        }
      }

      // 检查突破
      this._checkBreakthrough(d);
    });

    // 应用资源变化
    this.spiritStones += turnStones;
    this.reputation += turnRep;

    // 宗门基础产出（灵石矿脉/香火钱）— 量少
    const passiveStones = _randInt(2, 5) + this.level;
    this.spiritStones += passiveStones;

    // 记录任务日志
    lines.forEach(l => {
      const [type, text] = l.split('|');
      this._addLog(type, text);
    });

    // ── 弟子忠诚度/叛逃检查 ──
    this.disciples.forEach(d => {
      if (d.status !== '正常') return;
      // 极低忠诚 → 叛逃风险
      if (d.loyalty < 25 && Math.random() < 0.15) {
        d.status = '叛离'; this._addLog('bad', '💔 ' + d.name + ' 不满宗门已久，趁夜叛逃而去！');
        _removeDisc(this, d);
      }
      // 忠诚度自然衰减（无特殊事件时缓慢下降）
      if (Math.random() < 0.08) { d.loyalty = Math.max(0, d.loyalty - _randInt(1, 3)); }
      // 心魔过高 → 有概率走火入魔
      if (d.innerDemon > 70 && Math.random() < 0.1) {
        d.cultivation = Math.max(0, d.cultivation - _randInt(10, 25));
        d.loyalty -= 5;
        this._addLog('bad', '🔥 ' + d.name + ' 心魔发作，修为大损！');
      }
      // 心魔极高 → 境界跌落
      if (d.innerDemon > 90 && d.realmIdx > 0 && Math.random() < 0.08) {
        d.realmIdx--; d.realm = SECT_REALMS[d.realmIdx]; d.cultivation = 0;
        this._addLog('bad', '💀 ' + d.name + ' 走火入魔，境界跌落至【' + d.realm.name + '】！');
      }
    });

    // ── 弟子日常对话（1-2条） ──
    const normalDiscs = this.disciples.filter(d => d.status === '正常');
    if (normalDiscs.length >= 2) {
      const dialogsToShow = Math.random() < 0.6 ? 1 : (Math.random() < 0.3 ? 2 : 0);
      for (let i = 0; i < dialogsToShow; i++) {
        const pool = SECT_DIALOGUES;
        const [template, type] = pool[Math.floor(Math.random() * pool.length)];
        let a = normalDiscs[Math.floor(Math.random() * normalDiscs.length)];
        let b = normalDiscs[Math.floor(Math.random() * normalDiscs.length)];
        if (a.id === b.id) { const others = normalDiscs.filter(dd => dd.id !== a.id); if (others.length) b = others[Math.floor(Math.random() * others.length)]; else continue; }
        const text = template.replace(/\{A\}/g, a.name).replace(/\{B\}/g, b.name);
        this._addLog(type, '💬 ' + text);
      }
    }

    // ── 江湖消息（30%概率） ──
    if (Math.random() < 0.3) {
      const news = SECT_WORLD_NEWS[Math.floor(Math.random() * SECT_WORLD_NEWS.length)];
      this._addLog('event', '📰 江湖消息: ' + news);
    }

    // ── 附近宗门互动（25%概率） ──
    if (Math.random() < 0.25) {
      const nb = SECT_NEARBY[Math.floor(Math.random() * SECT_NEARBY.length)];
      const actions = [
        { text: nb.name + '遣使来访，送上了一些薄礼表示善意。', eff: s => { s.spiritStones += _randInt(5, 20); s.reputation += 1; } },
        { text: nb.name + '的弟子在我宗地界内采药，被巡山弟子拦下。双方正在交涉。', eff: s => {} },
        { text: nb.name + '放出话来：这一带的灵矿开采权应该归他们所有。', eff: s => { s.reputation -= 1; } },
        { text: '据传' + nb.name + '最近在招募散修，似乎在为某件大事做准备。', eff: s => {} },
        { text: nb.name + '的一名叛逃弟子逃到了我宗附近。' + nb.name + '要求我们交人。', eff: s => { s.reputation += 1; } },
        { text: nb.name + '与我宗之间的山路上，发生了一起不明身份者的劫掠事件。', eff: s => {} },
      ];
      if (nb.style === '好战' && Math.random() < 0.4) {
        actions.push({ text: nb.name + '突然派人到我宗门口挑衅，声称要「比划比划」！', eff: s => { if (s.disciples.some(d => d.realmIdx >= 1)) { s.reputation += 3; s._addLog('good', '弟子们沉着应对，' + nb.name + '的人悻悻而去。声望+3'); } else { s.reputation -= 2; s._addLog('bad', '宗门尚无得力弟子，只得忍气吞声。声望-2'); } } });
      }
      if (nb.style === '邪道' && Math.random() < 0.3) {
        actions.push({ text: nb.name + '深夜派人偷袭我宗药圃！所幸巡夜弟子及时发现。', eff: s => { s.spiritStones = Math.max(0, s.spiritStones - _randInt(10, 30)); s._addLog('bad', '药圃被毁了一角，损失灵石。与' + nb.name + '的关系进一步恶化。'); } });
      }
      const action = actions[Math.floor(Math.random() * actions.length)];
      this._addLog('info', '🏛 ' + action.text);
      action.eff(this);
    }

    // ── 拍卖会（每15~25回合一次） ──
    if (!this.flags.nextAuction) this.flags.nextAuction = this.turn + _randInt(15, 25);
    if (this.turn >= this.flags.nextAuction) {
      this.flags.nextAuction = this.turn + _randInt(15, 25);
      this._addLog('event', '🔨 九洲拍卖大会在本地区举办！各方势力云集，宝物琳琅满目——但起拍价都高得惊人。');
      if (this.spiritStones >= 200) {
        this._addLog('info', '你掂量了一下灵石袋……或许可以碰碰运气。');
        // 给玩家一个选项：拍下随机物品
        if (Math.random() < 0.4 && this.spiritStones >= 300) {
          const cost = _randInt(200, 500);
          if (this.spiritStones >= cost) {
            this.spiritStones -= cost;
            if (Math.random() < 0.5) {
              _createDisciple(this, _randInt(50, 85));
              this._addLog('good', '你花 ' + cost + ' 灵石拍下了一卷古法——竟是一份上等资质的卖身契！新弟子入门。');
            } else {
              const avail = SECT_TECHNIQUES.filter(t => t.gradeKey === 'yellow' && !this.techniques.includes(t.id));
              if (avail.length) {
                const t = avail[Math.floor(Math.random() * avail.length)];
                this.techniques.push(t.id);
                this._addLog('good', '你花 ' + cost + ' 灵石拍下功法「' + t.name + '」！');
              } else {
                this.spiritStones += cost;
                this._addLog('info', '拍卖太激烈了，你最终没有拍到任何东西。灵石退回。');
              }
            }
          }
        }
      } else {
        this._addLog('info', '你看着那些天价宝物，默默盘算着需要攒多久灵石。或许下次吧。');
      }
    }

    // 检查宗门升级
    this._checkLevelUp();

    // 推进回合
    this.turn++;
    // 重置行动点
    this.actionPoints = this._maxAP();
    // 新年重置招募计数
    if ((this.turn - 1) % 12 === 0 && this.turn > 1) {
      this.recruitment.used = 0;
      this._addLog('info', '── 新的一年来临！招募名额已重置 ──');
    }

    // 触发随机事件 (35%概率)
    if (Math.random() < 0.35) {
      this._rollEvent();
    }

    this.save();
    this._render();
  },

  _checkBreakthrough(d) {
    if (d.realmIdx >= SECT_REALMS.length - 1) return;
    const nextRealm = SECT_REALMS[d.realmIdx + 1];
    if (nextRealm.cost <= 0) return;
    if (d.cultivation >= nextRealm.cost) {
      const successRate = 0.5 + (d.rootBone + d.comprehension) / 200 - d.innerDemon / 200;
      if (Math.random() < successRate) {
        d.realmIdx++;
        d.realm = SECT_REALMS[d.realmIdx];
        d.cultivation = 0;
        d.loyalty += 5;
        this._addLog('good', '🎉 ' + d.name + ' 突破至【' + d.realm.name + '】！');
      } else {
        d.cultivation = Math.floor(nextRealm.cost * 0.5);
        d.innerDemon += _randInt(5, 15);
        this._addLog('bad', d.name + ' 突破失败，心魔滋生...');
      }
    }
  },

  _checkLevelUp() {
    // 声望阈值越来越高：Lv1→2:80, Lv2→3:210, Lv3→4:340, Lv4→5:470...
    const threshold = this.level * 80 + (this.level - 1) * 50;
    if (this.reputation >= threshold) {
      this.level++;
      this.reputation -= threshold;
      const newMax = this._maxDisc();
      this._addLog('good', '🏆 宗门晋升至 Lv.' + this.level + '！弟子上限 ' + newMax + ' 人，行动点上限 ' + this._maxAP());
    }
  },

  // ═══════════════════════════════════════════
  //  事件系统
  // ═══════════════════════════════════════════
  _rollEvent() {
    const eligible = SECT_EVENTS.filter(e => e.cond(this));
    if (!eligible.length) return;
    const event = _weightedRandom(eligible, e => e.weight);
    this._renderEvent(event);
  },

  _renderEvent(event) {
    let html = '<h2>⚡ 宗门事件</h2>';
    html += '<div class="sct-event-text">' + event.text + '</div>';
    html += '<div class="sct-event-choices">';
    event.choices.forEach((c, i) => {
      html += '<button class="sct-event-choice" onclick="SECT._resolveEvent(\'' + event.id + '\',' + i + ')">' + c.text + '</button>';
    });
    html += '</div>';
    this._showModal(null, html, null);
  },

  _resolveEvent(eventId, choiceIdx) {
    const event = SECT_EVENTS.find(e => e.id === eventId);
    if (!event || choiceIdx >= event.choices.length) return;
    event.choices[choiceIdx].effect(this);
    this._closeModal();
    this.save();
    this._render();
  },

  // ═══════════════════════════════════════════
  //  藏经阁
  // ═══════════════════════════════════════════
  _openTechniques() {
    const libraryBld = this.buildings.find(b => b.id === 'library');
    let html = '<h2>📜 藏经阁</h2>';

    // 已学功法
    html += '<div style="font-size:11px;color:var(--dim);margin-bottom:8px">已学功法: ';
    if (this.techniques.length === 0) {
      html += '<span style="opacity:.5">无</span>';
    } else {
      html += this.techniques.map(tid => {
        const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
        return t ? '<span style="color:var(--green-t)">' + t.name + '</span>' : '';
      }).filter(Boolean).join('、');
    }
    html += '</div>';

    // 可购买功法
    html += '<div class="sct-tech-list">';
    const available = SECT_TECHNIQUES.filter(t => {
      if (this.techniques.includes(t.id)) return false;
      if (t.reqLv > this.level) return false;
      if (t.reqBuilding === 'library' && (!libraryBld || libraryBld.lv < 1)) return false;
      if (t.cost <= 0) return false; // 免费的已在初始中
      return true;
    });

    if (available.length === 0) {
      html += '<div style="text-align:center;color:var(--dim);padding:20px;font-size:11px">暂无可购买的功法<br><span style="opacity:.6">提升宗门等级（当前 Lv.' + this.level + '）或建造藏经阁以解锁更多</span><br><span style="opacity:.4;font-size:10px">Lv.1-2: 人阶 | Lv.3+: 黄阶</span></div>';
    } else {
      available.forEach(t => {
        const gk = t.gradeKey || 'mortal';
        const canAfford = this.spiritStones >= t.cost;
        html += '<div class="sct-tech-card">'
          + '<div><div class="tch-name">' + t.name + '</div>'
          + '<div class="tch-info">' + Object.entries(t.effect).map(([k, v]) => k + ' +' + v + '%').join(' | ') + '</div></div>'
          + '<div style="text-align:right">'
          + '<span class="tch-grade ' + gk + '">' + t.grade + '</span>'
          + '<div style="margin-top:4px">'
          + '<button class="t-btn" ' + (canAfford ? '' : 'disabled') + ' onclick="SECT._learnTechnique(\'' + t.id + '\')">'
          + t.cost + '💎 1⚡</button></div></div></div>';
      });
    }
    html += '</div>';
    html += '<div style="text-align:center;margin-top:12px"><button class="t-btn" onclick="SECT._closeModal()">关闭</button></div>';

    this._showModal(null, html, null);
  },

  _learnTechnique(techId) {
    const t = SECT_TECHNIQUES.find(tt => tt.id === techId);
    if (!t || this.techniques.includes(t.id)) return;
    if (this.spiritStones < t.cost) return;
    if (this.actionPoints < 1) return;
    this.spiritStones -= t.cost;
    this.actionPoints -= 1;
    this.techniques.push(t.id);
    this._addLog('good', '习得功法「' + t.name + '」！');
    this.save();
    this._openTechniques(); // 刷新藏经阁界面
    this._render();
  },

  // ═══════════════════════════════════════════
  //  宗门建设
  // ═══════════════════════════════════════════
  _openBuildings() {
    let html = '<h2>🏗 宗门建设</h2>';
    html += '<div class="sct-build-list">';

    SECT_BUILDINGS.forEach(b => {
      const existing = this.buildings.find(bb => bb.id === b.id);
      const lv = existing ? existing.lv : 0;
      const maxed = lv >= b.maxLv;
      const nextCost = b.cost * (lv + 1);
      const canAfford = this.spiritStones >= nextCost;

      html += '<div class="sct-build-card">'
        + '<div><div class="tb-name">' + b.name + '</div>'
        + '<div class="tb-info">' + b.desc + '</div></div>'
        + '<div style="text-align:right">';
      if (maxed) {
        html += '<span class="tb-lv">已满级 Lv.' + lv + '</span>';
      } else {
        html += '<span class="tb-lv">Lv.' + lv + (lv > 0 ? '' : ' (未建)') + '</span>';
        html += '<div style="margin-top:4px"><button class="t-btn" ' + (canAfford ? '' : 'disabled') + ' onclick="SECT._buildBuilding(\'' + b.id + '\')">'
          + '升级 ' + nextCost + '💎 2⚡</button></div>';
      }
      html += '</div></div>';
    });

    html += '</div>';
    html += '<div style="text-align:center;margin-top:12px"><button class="t-btn" onclick="SECT._closeModal()">关闭</button></div>';
    this._showModal(null, html, null);
  },

  _buildBuilding(buildingId) {
    const b = SECT_BUILDINGS.find(bb => bb.id === buildingId);
    if (!b) return;
    const existing = this.buildings.find(bb => bb.id === buildingId);
    const lv = existing ? existing.lv : 0;
    if (lv >= b.maxLv) return;
    const cost = b.cost * (lv + 1);
    if (this.spiritStones < cost) return;
    if (this.actionPoints < 2) return;
    this.spiritStones -= cost;
    this.actionPoints -= 2;
    if (existing) {
      existing.lv++;
    } else {
      this.buildings.push({ id: buildingId, lv: 1 });
    }
    this._addLog('good', b.name + ' 升级至 Lv.' + (lv + 1) + '！');
    this.save();
    this._openBuildings();
    this._render();
  },

  // ═══════════════════════════════════════════
  //  Modal
  // ═══════════════════════════════════════════
  _showModal(title, content, onClose) {
    const overlay = document.getElementById('sct-modal');
    const box = document.getElementById('sct-modal-box');
    if (!overlay || !box) return;
    box.innerHTML = (title ? '<h2>' + title + '</h2>' : '') + content;
    overlay.classList.add('open');
  },

  _closeModal() {
    const overlay = document.getElementById('sct-modal');
    if (overlay) overlay.classList.remove('open');
    // 刷新主界面
    this._render();
  },

  _modalBgClick(e) {
    if (e.target === e.currentTarget) this._closeModal();
  },
};

// ── 初始化 ────────────────────────────────────
// 页面加载后，如果当前 tab 是 calendar 就初始化
document.addEventListener('DOMContentLoaded', () => {
  // 延迟检查：等 app.js 完成初始化后再判断
  setTimeout(() => {
    const mod = document.getElementById('mod-calendar');
    if (mod && mod.classList.contains('active')) {
      SECT.activate();
    }
  }, 100);
});
