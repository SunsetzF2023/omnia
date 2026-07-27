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

// ── 功法库（type: 攻击系/防御系/辅助系/隐匿系/逃遁系） ──
const SECT_TECHNIQUES = [
  { id: 't_breathe',  name: '吐纳术',   grade: '人阶', gradeKey: 'mortal', type: '辅助系', cost: 0,   reqLv: 0,  reqBuilding: null,   effect: { cultivate: 10 },                         combat: {} },
  { id: 't_tough',    name: '淬体诀',   grade: '人阶', gradeKey: 'mortal', type: '防御系', cost: 50,  reqLv: 0,  reqBuilding: null,   effect: { physique: 5 },                           combat: { def: 8, hp: 15 } },
  { id: 't_sword',    name: '基础剑法', grade: '人阶', gradeKey: 'mortal', type: '攻击系', cost: 50,  reqLv: 0,  reqBuilding: null,   effect: { adventure: 8 },                          combat: { atk: 10, critRate: 0.03 } },
  { id: 't_gather',   name: '采气术',   grade: '人阶', gradeKey: 'mortal', type: '辅助系', cost: 80,  reqLv: 0,  reqBuilding: null,   effect: { gather: 12 },                            combat: {} },
  { id: 't_charm',    name: '言辩之术', grade: '人阶', gradeKey: 'mortal', type: '辅助系', cost: 60,  reqLv: 0,  reqBuilding: null,   effect: { market: 10 },                            combat: {} },
  { id: 't_hide',     name: '敛息术',   grade: '人阶', gradeKey: 'mortal', type: '隐匿系', cost: 70,  reqLv: 0,  reqBuilding: null,   effect: { adventure: 6 },                          combat: { spd: 8, critRate: 0.05 } },
  { id: 't_escape',   name: '云踪步',   grade: '人阶', gradeKey: 'mortal', type: '逃遁系', cost: 70,  reqLv: 0,  reqBuilding: null,   effect: { adventure: 6 },                          combat: { spd: 12, def: 3 } },
  { id: 't_meditate', name: '静心诀',   grade: '黄阶', gradeKey: 'yellow', type: '辅助系', cost: 200, reqLv: 3,  reqBuilding: 'library', effect: { cultivate: 20 },                         combat: { def: 5, hp: 10 } },
  { id: 't_fire',     name: '烈焰掌',   grade: '黄阶', gradeKey: 'yellow', type: '攻击系', cost: 200, reqLv: 3,  reqBuilding: 'library', effect: { adventure: 18 },                         combat: { atk: 22, critRate: 0.06, critDmg: 0.3 } },
  { id: 't_iron',     name: '铁布衫',   grade: '黄阶', gradeKey: 'yellow', type: '防御系', cost: 200, reqLv: 3,  reqBuilding: 'library', effect: { physique: 12 },                          combat: { def: 18, hp: 35 } },
  { id: 't_cloud',    name: '云游步',   grade: '黄阶', gradeKey: 'yellow', type: '逃遁系', cost: 250, reqLv: 3,  reqBuilding: 'library', effect: { adventure: 12, cultivate: 5 },              combat: { spd: 20, def: 8 } },
  { id: 't_trade',    name: '商贾经',   grade: '黄阶', gradeKey: 'yellow', type: '辅助系', cost: 250, reqLv: 3,  reqBuilding: 'library', effect: { market: 18 },                            combat: {} },
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
      { text: '接下战书！命最强弟子应战', effect: s => { const d = _pickStrongestDisc(s); if (d && d.realmIdx >= 1) { s.reputation += 12; d.cultivation += 10; d.loyalty += 5; s._addCombatLog(d.name + ' 🏛 天煞宗使者 — 三招制敌！', 'win', 'diplomacy'); s._addLog('good', d.name + ' 三招之内击败来敌！天煞宗使者灰头土脸地离去。声望+12'); } else { s.reputation -= 8; if (d) d.loyalty -= 5; s._addCombatLog('应战弟子 🏛 天煞宗 — 惨败', 'lose', 'diplomacy'); s._addLog('bad', '弟子修为不足，惨败而归。宗门颜面扫地...'); } } },
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
  { name: '天煞宗',   style: '好战',  power: 3, hostility: 15, desc: '一个以霸道著称的中型宗门。' },
  { name: '青云门',   style: '正道',  power: 4, hostility: 0,  desc: '历史悠久的正道宗门，处事公正。' },
  { name: '灵墟阁',   style: '中立',  power: 2, hostility: 0,  desc: '以丹药和贸易为主的小宗门。' },
  { name: '飞星宗',   style: '隐世',  power: 3, hostility: 0,  desc: '不问世事的小宗门，弟子稀少。' },
  { name: '黑风寨',   style: '散修',  power: 1, hostility: 20, desc: '一群散修聚集的草台班子。' },
];

// ── 弟子背景 ────────────────────────────────
const SECT_BACKSTORIES = [
  { id: 'orphan',    name: '孤儿',    desc: '幼年失怙，独自求生至今', eff: { loyalty: 15 } },
  { id: 'fallen',    name: '没落世家', desc: '家族曾是望族，后被灭门', eff: { comprehension: 8, innerDemon: 10 } },
  { id: 'rogue',     name: '散修后代', desc: '父母是散修，自由自在长大', eff: { rootBone: 3, comprehension: 3, physique: 3, charm: 3 } },
  { id: 'refugee',   name: '逃难者',   desc: '从战乱之地逃出', eff: { physique: 5, loyalty: -5 } },
  { id: 'exiled',    name: '弃徒',     desc: '被前宗门逐出的弟子', eff: { rootBone: 5, innerDemon: 15 } },
  { id: 'villager',  name: '山村少年', desc: '在山野中长大，纯朴天真', eff: { physique: 8 } },
  { id: 'merchant',  name: '商贾之后', desc: '商人家族出身，精于算计', eff: { charm: 8 } },
  { id: 'swordsman', name: '流浪剑客', desc: '四海为家的剑修', eff: { rootBone: 6, comprehension: 4 } },
  { id: 'scholar',   name: '书香门第', desc: '读书人家，机缘巧合踏入武道', eff: { comprehension: 8, physique: -3 } },
  { id: 'mystic',    name: '异族后裔', desc: '身怀异族血脉，来历不明', eff: { rootBone: 5, charm: 3, innerDemon: 5 } },
];

// ── 性格标签 ────────────────────────────────
const SECT_TRAITS = [
  { id: 'diligent',   name: '勤勉',   desc: '修炼效率+15%', eff: s => s.cultivate },
  { id: 'warlike',    name: '好战',   desc: '历练成功率高，易与人冲突', eff: s => s.adventure },
  { id: 'loner',      name: '孤僻',   desc: '心魔抵抗高，不善交际', eff: s => s.cultivate },
  { id: 'generous',   name: '豪爽',   desc: '坊市收入+，人气高', eff: s => s.market },
  { id: 'gloomy',     name: '阴郁',   desc: '心魔易涨，身世成谜', eff: s => s.cultivate },
  { id: 'ambitious',  name: '野心勃勃', desc: '突破概率+，低忠易叛', eff: s => s.cultivate },
  { id: 'loyal',      name: '赤诚',   desc: '永不叛变，忠诚加成', eff: s => s.cultivate },
  { id: 'crafty',     name: '机敏',   desc: '坊市/采集不易被骗', eff: s => s.market },
  { id: 'brave',      name: '无畏',   desc: '历练不畏强敌', eff: s => s.adventure },
  { id: 'calm',       name: '沉着',   desc: '心魔不易滋生', eff: s => s.cultivate },
];

// ── 个人剧情链 ──────────────────────────────
const SECT_PERSONAL_CHAINS = {
  // 没落世家 → 复仇（_storyStage: 0→触发阶段1, 1→触发阶段2, 2→触发阶段3, 99→完成）
  fallen_revenge: {
    backstory: 'fallen', stages: [
      { stage: 1, cond: (s, d) => d.recruitedTurn + _randInt(8, 15) <= s.turn && d.status === '正常',
        title: '🔶 ' + '{name}的过去', text: '深夜，你路过练武场，发现{name}仍在独自挥剑。汗水浸透了衣袍，但他的眼神中燃烧着某种东西——不是修炼的热情，是恨意。\n\n你注意到他握剑的手腕上有一道旧伤疤，像是某种古老的家族烙印。',
        choices: [
          { text: '坐下来，问他那道伤疤的来历', effect: (s, d) => { d.loyalty += 8; d._storyStage = 1; s._addLog('good', d.name + '沉默良久，终于开口讲述了自己的身世——他的家族曾是南洲望族，十五年前被仇家一夜灭门。他是唯一幸存者。'); } },
          { text: '拍拍他的肩膀：过去的事就让它过去吧', effect: (s, d) => { d.loyalty += 2; d.innerDemon += 5; d._storyStage = 99; s._addLog('info', d.name + '低下了头，没有再说什么。但你看到他的手仍在微微颤抖。'); } },
        ]},
      { stage: 2, cond: (s, d) => d.realmIdx >= 1 && d.status === '正常',
        title: '🔶 ' + '{name}的抉择', text: '{name}跪在你面前，手中捧着一封已经泛黄的信。\n\n"宗主——当年灭我满门的凶手，有人在北洲看到了。"他的声音平静得可怕。"请准我下山。"',
        choices: [
          { text: '准他下山复仇（弟子临时离宗3~5回合）', effect: (s, d) => { d._storyStage = 2; d.status = '外出'; d._awayTurns = 3 + _randInt(0, 2); s._addLog('event', d.name + '背剑下山，踏上了复仇之路。宗门上下无不为其捏一把汗。'); } },
          { text: '拦下他：你不是他的对手，等更强再说', effect: (s, d) => { d.loyalty += 12; d.innerDemon += 8; d._storyStage = 1; s._addLog('info', d.name + '咬紧了牙，一言不发地退出了大殿。但你看到他的眼中燃起了更强的斗志。'); } },
          { text: '亲自带领弟子前去讨个公道！', effect: (s, d) => { if (s.disciples.filter(dd => dd.status === '正常' && dd.realmIdx >= 1).length >= 2) { s.reputation += 8; d.loyalty = 100; d._storyStage = 99; s._addLog('good', '你亲率数名弟子北上，一场恶战后仇敌伏诛。' + d.name + '跪地痛哭，大仇终于得报。'); } else { s._addLog('info', '宗门目前实力不足，还需从长计议。'); d._storyStage = 1; } } },
        ]},
      { stage: 3, cond: (s, d) => d.status === '正常',
        title: '🔶 ' + '{name}归来', text: '山门外，一个满身血迹的身影踉跄着走来。\n\n{name}回来了——他的剑上还滴着血，眼中却第一次有了释然。',
        choices: [
          { text: '迎接他回宗！', effect: (s, d) => { d.loyalty = 100; d.cultivation += _randInt(20, 40); d._storyStage = 99; s._addLog('good', d.name + '大仇得报，心结尽解。从此他眼中再无阴霾，唯有对宗门无尽的忠诚。'); } },
        ]},
    ]
  },
  // 弃徒 → 前宗门阴影
  exiled_past: {
    backstory: 'exiled', stages: [
      { stage: 1, cond: (s, d) => d.recruitedTurn + _randInt(10, 20) <= s.turn && d.status === '正常',
        title: '🔶 ' + '{name}的秘密', text: '一封匿名信送到了宗门。信中以威胁的口吻要求交出{name}——原来{name}在加入本宗之前，曾因"私闯禁地"被前宗门逐出，而那个宗门至今仍在追查他的下落。',
        choices: [
          { text: '叫来{name}，当面问清楚缘由', effect: (s, d) => { d.loyalty += 10; d._storyStage = 1; s._addLog('info', d.name + '讲述了真相：当年他并非"闯禁地"，而是发现前宗长老偷炼禁术，被灭口不成反被栽赃驱逐。'); } },
          { text: '无视这封信，不予理会', effect: (s, d) => { d._storyStage = 99; s._addLog('info', '你将信投入火盆。但纸包不住火，此事恐怕还未结束。'); } },
        ]},
      { stage: 2, cond: (s, d) => s.turn >= d.recruitedTurn + 25 && d.status === '正常',
        title: '🔶 前宗门来犯', text: '山门外，一队人马气势汹汹而来。领头者自称是{name}的前宗长老，要求本宗"交出叛徒"，否则便刀兵相见。\n\n{name}站在你身后，面色苍白。',
        choices: [
          { text: '据理力争，拒绝交人', effect: (s, d) => { if (s.reputation >= 15) { s.reputation += 10; d.loyalty += 20; d._storyStage = 99; s._addLog('good', '你当着所有人的面揭穿了那位长老的罪行。前宗门人狼狈而退，此事传遍江湖！声望+10'); } else { d.loyalty += 5; s.reputation -= 3; s._addLog('bad', '对方人多势众，你虽保住了' + d.name + '，但宗门声誉受到了打击。'); d._storyStage = 1; } } },
          { text: '设宴款待，以礼相待化解干戈 (-30灵石)', effect: (s, d) => { s.spiritStones -= 30; d._storyStage = 99; s._addLog('info', '一场酒宴过后，对方的态度松动了不少。刀兵之灾暂时化解了。'); } },
        ]},
    ]
  },
  // 异族后裔 → 血脉觉醒
  mystic_blood: {
    backstory: 'mystic', stages: [
      { stage: 1, cond: (s, d) => d.realmIdx >= 2 && d.status === '正常',
        title: '🔶 ' + '{name}的异变', text: '{name}在修炼时突然倒地，全身血管泛起诡异的银光！周围的灵气疯狂地向他体内涌去——这不是普通的走火入魔，更像是某种血脉在觉醒。',
        choices: [
          { text: '以自身灵力助其稳定血脉 (-20灵石)', effect: (s, d) => { s.spiritStones -= 20; d.cultivation += _randInt(20, 40); d.rootBone += 5; d._storyStage = 99; s._addLog('good', d.name + '的血脉初步觉醒！竟然是远古银月族的后裔——根骨永久+5，修为大增！'); } },
          { text: '先观察，不要贸然出手', effect: (s, d) => { if (Math.random() < 0.5) { d.cultivation += 10; d._storyStage = 99; s._addLog('info', d.name + '自行压制了血脉躁动，似乎获益了一些修为。'); } else { d.innerDemon += 20; d._storyStage = 0; s._addLog('bad', d.name + '的血脉暴走失控，留下了不轻的创伤。未来或许还有机会...'); } } },
        ]},
    ]
  },
};

// ── NPC战斗模板 ──────────────────────────────
const SECT_NPC_TEMPLATES = {
  // 历练敌人
  bandit:    { name: '流寇小头目', hp: 30,  atk: 8,  def: 3,  spd: 4,  critRate: 0.02, lv: 1 },
  beast:     { name: '一阶妖兽',    hp: 45,  atk: 12, def: 4,  spd: 5,  critRate: 0.03, lv: 2 },
  rogue:     { name: '邪修散人',   hp: 55,  atk: 16, def: 6,  spd: 7,  critRate: 0.04, lv: 3 },
  serpent:   { name: '丛林毒蟒',   hp: 70,  atk: 18, def: 8,  spd: 6,  critRate: 0.05, lv: 3 },
  zombie:    { name: '古墓尸傀',   hp: 85,  atk: 20, def: 12, spd: 3,  critRate: 0.02, lv: 4 },
  sentinel:  { name: '秘境守卫',   hp: 100, atk: 25, def: 14, spd: 8,  critRate: 0.06, lv: 5 },
  // 外交战斗
  rivalDisc: { name: '敌对宗门弟子', hp: 50, atk: 14, def: 8, spd: 6, critRate: 0.04, lv: 2 },
  eliteDisc: { name: '精英内门弟子', hp: 80, atk: 22, def: 14, spd: 9, critRate: 0.06, lv: 4 },
  // 血刀门（武者起步）
  bloodBlade:  { name: '血刀门武者',   hp: 60,  atk: 16, def: 10, spd: 7,  critRate: 0.05, lv: 3 },
  bloodElite:  { name: '血刀门精英',   hp: 90,  atk: 24, def: 16, spd: 10, critRate: 0.08, lv: 5 },
  bloodMaster:  { name: '血刀门武师',  hp: 130, atk: 35, def: 22, spd: 12, critRate: 0.10, lv: 6 },
  bloodGrand:   { name: '血刀门大武师', hp: 200, atk: 55, def: 35, spd: 16, critRate: 0.12, lv: 8 },
};

// NPC随机名
const SECT_NPC_SURNAMES = ['赵','钱','孙','李','周','吴','郑','王','冯','陈','褚','卫','蒋','沈','韩','杨','朱','秦','许','何','吕','施','张','孔','曹','严','华','金','魏','陶','姜'];
const SECT_NPC_GIVEN = ['霸','烈','横','锋','煞','鬼','狂','刃','血','屠','煞','凶','戾','暴','狰','狞','枭','蟒','蝎','狼'];
function _randomNPCName() {
  return SECT_NPC_SURNAMES[Math.floor(Math.random() * SECT_NPC_SURNAMES.length)]
    + SECT_NPC_GIVEN[Math.floor(Math.random() * SECT_NPC_GIVEN.length)];
}

function _pickNPC(npcId) {
  const tmpl = SECT_NPC_TEMPLATES[npcId] || SECT_NPC_TEMPLATES.bandit;
  return { ...tmpl, maxHp: tmpl.hp, skills: ['普攻'], name: _randomNPCName() };
}

// ── 世界据点模板 ──────────────────────────────
const SECT_LOCATION_POOL = {
  sect:    { type: 'sect',    icon: '🏛', actions: ['befriend','challenge','scout'], desc: '其他宗门' },
  bandit:  { type: 'bandit',  icon: '💀', actions: ['attack','scout'],              desc: '贼寇营地' },
  village: { type: 'village', icon: '🏘', actions: ['trade','befriend','recruit'],  desc: '附近村庄' },
  cave:    { type: 'cave',    icon: '🕳', actions: ['explore','scout'],             desc: '秘境洞穴' },
  market:  { type: 'market',  icon: '🏪', actions: ['trade'],                       desc: '坊市' },
  noble:   { type: 'noble',   icon: '🏚', actions: ['befriend','trade','scout','ally'], desc: '本地世家' },
  spirit:  { type: 'spirit',  icon: '🌿', actions: ['harvest','scout'],             desc: '灵脉' },
};
const SECT_LOC_NAMES = {
  sect:    ['青云门分舵','天煞宗外门','灵墟阁哨站','飞星宗别院','血刀门外围'],
  bandit:  ['黑风寨','野狼坡','断魂岭','黑水寨','乱石岗'],
  village: ['柳溪村','青石镇','落雁村','桃花坞','枫林渡'],
  cave:    ['幽冥洞','灵猿谷','寒潭深处','古修洞府','地火窟'],
  market:  ['四方坊市','落霞集市','聚宝商行','天星交易会'],
  noble:   ['韩氏庄园','柳家堡','百里世家','萧氏商会'],
  spirit:  ['翠微灵脉','碧波潭','紫竹林','云栖谷'],
};
const SECT_LOC_ACTIONS = {
  scout:    { name: '探查',   turns: 1, desc: '侦查情报，风险低' },
  befriend: { name: '交好',   turns: 2, desc: '送礼拉拢关系' },
  challenge:{ name: '挑战',   turns: 2, desc: '切磋比武，胜则扬威' },
  attack:   { name: '袭击',   turns: 2, desc: '武力清剿，有风险' },
  trade:    { name: '贸易',   turns: 1, desc: '互通有无' },
  explore:  { name: '探索',   turns: 2, desc: '深入秘境，高风险高回报' },
  recruit:  { name: '招募',   turns: 2, desc: '从村庄招募新人' },
  harvest:  { name: '采集',   turns: 1, desc: '采集灵脉资源' },
  ally:     { name: '投靠',   turns: 3, desc: '寻求庇护，需定期上供' },
};

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
  // 随机背景和性格
  const backstory = SECT_BACKSTORIES[Math.floor(Math.random() * SECT_BACKSTORIES.length)];
  const trait = SECT_TRAITS[Math.floor(Math.random() * SECT_TRAITS.length)];
  // 避免矛盾：赤诚+野心勃勃不能共存
  let trait2 = SECT_TRAITS[Math.floor(Math.random() * SECT_TRAITS.length)];
  if ((trait.id === 'loyal' && trait2.id === 'ambitious') || (trait.id === 'ambitious' && trait2.id === 'loyal')) {
    trait2 = SECT_TRAITS.find(tt => tt.id !== 'loyal' && tt.id !== 'ambitious') || trait2;
  }
  if (trait2.id === trait.id) trait2 = null;
  const traits = trait2 ? [trait, trait2] : [trait];
  const disc = {
    id: _uid(), name, gender, quality: q.key, qualityTier: q.tier, qualityName: q.name,
    rootBone: _randInt(r[0], r[1]) + (backstory.eff.rootBone || 0),
    comprehension: _randInt(r[0], r[1]) + (backstory.eff.comprehension || 0),
    physique: _randInt(r[0], r[1]) + (backstory.eff.physique || 0),
    charm: _randInt(r[0], r[1]) + (backstory.eff.charm || 0),
    realm: SECT_REALMS[0], realmIdx: 0, cultivation: 0,
    loyalty: Math.min(100, Math.max(10, _randInt(50, 85) + (backstory.eff.loyalty || 0))),
    innerDemon: Math.max(0, _randInt(0, 15) + (backstory.eff.innerDemon || 0)),
    backstory: backstory.id, backstoryName: backstory.name, traits, task: null,
    techniques: ['t_breathe'], // 个人功法（初始吐纳术人人都会）
    status: '正常', recruitedTurn: s.turn,
    _storyStage: 0, _awayTurns: 0,
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
  pendingEvents: [],         // [{ id, type, title, text, choices, expires, discipleId? }]
  combatLog: [],             // [{ turn, attacker, defender, winner, dmg, type }]
  worldLocations: [],        // [{ id, type, name, state, x, y?, dispatchedDisc?, returnTurn? }]
  bloodBlade: {              // 血刀门敌对势力
    intel: 0,                // 情报 0-100
    hostility: 20,           // 敌意 0-100
    members: [],             // 成员列表（情报100%后揭露）
    lastActionTurn: 0,       // 上次行动回合
    revealed: false,         // 是否已揭露成员
  },
  selectedContinent: '',
  selectedDiscId: null,      // 当前选中的弟子（分配任务用）
  saveKey: 'sect_save',

  // ── 辅助 ──────────────────────────────────
  _maxDisc() { return 5 + (this.level >= 6 ? 1 : 0) + (this.level >= 10 ? 1 : 0) + (this.level >= 15 ? 1 : 0) + (this.level >= 20 ? 1 : 0); },
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
      pendingEvents: this.pendingEvents,
      combatLog: this.combatLog,
      worldLocations: this.worldLocations,
      bloodBlade: this.bloodBlade,
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
    this.pendingEvents = [];
    this.combatLog = [];
    this.worldLocations = [];
    this.bloodBlade = { intel: 0, hostility: 20, members: [], lastActionTurn: 0, revealed: false };
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
    if (se) se.textContent = this.spiritStones;
    if (re) re.textContent = this.reputation;
    if (te) te.textContent = this.turn + ' (' + this._year() + '年)';
    const ape = document.getElementById('sct-ap');
    if (ape) { ape.textContent = this.actionPoints + '/' + this._maxAP(); ape.style.color = this.actionPoints === 0 ? 'var(--red)' : ''; }

    // Left: sect stats
    this._renderSectStats();
    // Left: disciples
    this._renderDisciples();
    // Center: locations
    this._renderLocations();
    // Right: pending events
    this._renderPendingEvents();
    // Right: combat log
    this._renderCombatLog();
    // Right: event log
    this._renderLog();
  },

  _renderSectStats() {
    const el = document.getElementById('sct-sect-stats');
    if (!el) return;
    const cont = SECT_CONTINENTS.find(c => c.id === this.continent);
    el.innerHTML = '<span>🏛 <b>' + this.sectName + '</b></span>'
      + '<span>📍 <b>' + (cont?.name || '') + '</b></span>'
      + '<span>⭐ 声望 <b>' + this.reputation + '</b></span>'
      + '<span>📅 回合 <b>' + this.turn + '</b></span>'
      + '<span>👥 弟子 <b>' + this.disciples.filter(d=>d.status==='正常').length + '/' + this._maxDisc() + '</b></span>'
      + '<span>📋 招募 <b>' + this.recruitment.used + '/' + this._recruitLimit() + '</b></span>';
  },

  _renderPendingEvents() {
    const panel = document.getElementById('sct-event-panel');
    if (!panel) return;
    if (this.pendingEvents.length === 0) {
      panel.innerHTML = '';
      return;
    }
    panel.innerHTML = '<div style="font-size:10px;color:var(--amber);padding:4px 12px;border-bottom:1px solid var(--border)">📋 待处理事件 (' + this.pendingEvents.length + ')</div>'
      + this.pendingEvents.map(e => {
        const typeIcon = e.type === 'personal' ? '🔶' : e.type === 'diplomacy' ? '🏛' : '⚡';
        const urgency = e.expires - this.turn <= 2 ? ' style="border-left:2px solid var(--red)"' : '';
        return '<div class="sct-event-item"' + urgency + ' onclick="SECT._openPendingEvent(\'' + e.id + '\')">'
          + '<span>' + typeIcon + '</span>'
          + '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + e.title + '</span>'
          + '<span style="font-size:9px;color:' + (e.expires - this.turn <= 2 ? 'var(--red)' : 'var(--dim)') + '">' + (e.expires - this.turn) + '回</span>'
          + '</div>';
      }).join('');
  },

  _renderDisciples() {
    const list = document.getElementById('sct-disciple-list');
    if (!list) return;

    if (this.disciples.length === 0) {
      list.innerHTML = '<div class="sct-empty-hint">尚无弟子<br>点击右侧「招募弟子」</div>';
      return;
    }

    list.innerHTML = this.disciples.map(d => {
      const q = SECT_QUALITIES.find(qq => qq.key === d.quality) || SECT_QUALITIES[0];
      const r = d.realm;
      const nextR = d.realmIdx < SECT_REALMS.length - 1 ? SECT_REALMS[d.realmIdx + 1] : null;
      const cultPct = nextR && nextR.cost > 0 ? Math.min(100, Math.round(d.cultivation / nextR.cost * 100)) : 100;
      const realmCls = d.loyalty >= 80 ? 'fine' : d.loyalty >= 50 ? 'superior' : d.loyalty >= 25 ? 'elite' : 'mortal';
      const statusMark = d.status !== '正常' ? ' ⚠' + d.status : '';

      return '<div class="sct-disc-card q-' + q.key + '" onclick="SECT._selectDisciple(\'' + d.id + '\')">'
        + '<div class="dc-realm ' + realmCls + '">' + r.name + '</div>'
        + '<div class="dc-name-row">'
        + '<span class="dc-name">' + d.name + statusMark + '</span>'
        + '<span class="dc-quality" style="color:' + q.color + '">' + d.qualityName + '</span>'
        + '<span style="font-size:7px;color:var(--dim)">' + cultPct + '%</span>'
        + '</div>'
        + '<div class="dc-stats-row">'
        + '<span class="dc-stat">根<b>' + d.rootBone + '</b></span>'
        + '<span class="dc-stat">悟<b>' + d.comprehension + '</b></span>'
        + '<span class="dc-stat">体<b>' + d.physique + '</b></span>'
        + '<span class="dc-stat">魅<b>' + d.charm + '</b></span>'
        + '</div>'
        + '<div class="dc-task-row">'
        + '<span class="dc-bg">' + (d.backstoryName || '') + '</span>'
        + '<select class="sct-task-select" onclick="event.stopPropagation()" onchange="SECT._assignTask(\'' + d.id + '\', this.value)">'
        + '<option value=""' + (d.task ? '' : ' selected') + '>--</option>'
        + SECT_TASKS.map(t => '<option value="' + t.key + '"' + (d.task === t.key ? ' selected' : '') + '>' + t.name + '</option>').join('')
        + '</select>'
        + '</div>'
        + '</div>';
    }).join('');
  },

  _selectDisciple(id) {
    this._showDiscDetail(id);
  },

  // ── 弟子详情面板 ──────────────────────────
  _showDiscDetail(discId) {
    const d = this.disciples.find(dd => dd.id === discId);
    if (!d) return;
    const q = SECT_QUALITIES.find(qq => qq.key === d.quality) || SECT_QUALITIES[0];
    const realm = d.realm;
    const nextR = d.realmIdx < SECT_REALMS.length - 1 ? SECT_REALMS[d.realmIdx + 1] : null;
    const cultPct = nextR && nextR.cost > 0 ? Math.min(100, Math.round(d.cultivation / nextR.cost * 100)) : 100;

    // 战力计算（GDD §12.2）
    const cs = this._deriveCombatStats(d);

    let html = '<h2>' + d.name + '</h2>';

    // 基础信息
    html += '<div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap">';
    html += '<div style="flex:1;min-width:180px">';
    html += '<div style="font-size:12px;color:var(--dim);margin-bottom:4px">'
      + '<span style="color:' + q.color + ';font-weight:600">' + d.qualityName + '</span> · '
      + '<span style="color:var(--amber)">' + d.backstoryName + '</span></div>';
    html += '<div style="font-size:14px;color:var(--text);margin-bottom:2px">' + realm.name
      + (nextR && nextR.cost > 0 ? ' → ' + cultPct + '%' : '') + '</div>';
    html += '<div style="font-size:10px;color:var(--dim)">' + realm.desc + '</div>';
    html += '<div style="font-size:10px;color:var(--amber);margin-top:4px">' + d.traits.map(tt => tt.name + ': ' + tt.desc).join(' · ') + '</div>';
    html += '</div>';

    // 基础属性
    html += '<div style="flex:1;min-width:140px;font-size:11px;line-height:1.8">';
    html += '<div>根骨 <b style="color:var(--green-t)">' + d.rootBone + '</b> | 悟性 <b style="color:var(--teal-t)">' + d.comprehension + '</b></div>';
    html += '<div>体魄 <b style="color:var(--amber)">' + d.physique + '</b> | 魅力 <b style="color:var(--text)">' + d.charm + '</b></div>';
    html += '<div>忠诚 <b>' + d.loyalty + '</b> | 心魔 <b style="color:' + (d.innerDemon > 50 ? 'var(--red)' : 'var(--dim)') + '">' + d.innerDemon + '</b></div>';
    html += '<div>当前任务: <b>' + (d.task ? SECT_TASKS.find(t => t.key === d.task)?.name || '无' : '未分配') + '</b></div>';
    html += '</div>';
    html += '</div>';

    // 战力面板（GDD §12.2）
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px;margin-bottom:12px">';
    html += '<div style="font-size:11px;color:var(--amber);margin-bottom:6px">⚔ 战斗属性</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:11px">';
    html += '<span>气血 <b style="color:var(--red)">' + cs.maxHp + '</b></span>';
    html += '<span>攻击 <b style="color:var(--red)">' + cs.atk + '</b></span>';
    html += '<span>防御 <b style="color:var(--teal-t)">' + cs.def + '</b></span>';
    html += '<span>速度 <b style="color:var(--green-t)">' + cs.spd + '</b></span>';
    html += '<span>暴击率 <b>' + Math.round(cs.critRate * 100) + '%</b></span>';
    html += '<span>暴伤 <b>' + Math.round(cs.critDmg * 100) + '%</b></span>';
    html += '<span>命中 <b>' + Math.round(cs.hitRate * 100) + '%</b></span>';
    html += '<span>闪避 <b>' + Math.round(cs.evadeRate * 100) + '%</b></span>';
    html += '</div>';
    html += '<div style="font-size:13px;color:var(--amber);margin-top:8px;font-weight:700">综合战力 CP: ' + cs.cp + '</div>';
    html += '</div>';

    // 已学功法
    html += '<div style="margin-bottom:12px">';
    html += '<div style="font-size:11px;color:var(--dim);margin-bottom:4px">📜 已学功法:</div>';
    if (!d.techniques || d.techniques.length === 0) {
      html += '<span style="font-size:11px;color:var(--dim);opacity:.5">无</span>';
    } else {
      html += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
      d.techniques.forEach(tid => {
        const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
        if (t) {
          const effText = Object.entries(t.effect).map(([k, v]) => k + '+' + v + '%').join(' ');
          html += '<span style="font-size:10px;padding:2px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:3px;color:var(--green-t)" title="' + effText + '">' + t.name + ' <span style="color:var(--dim);font-size:9px">' + t.grade + '</span></span>';
        }
      });
      html += '</div>';
    }
    html += '</div>';

    // 个人剧情进度
    if (d._storyStage !== undefined && d._storyStage !== 99 && d._storyStage > 0) {
      html += '<div style="font-size:10px;color:var(--amber);margin-bottom:12px">🔶 个人剧情进行中（阶段 ' + d._storyStage + '）</div>';
    } else if (d._storyStage === 99) {
      html += '<div style="font-size:10px;color:var(--green-t);margin-bottom:12px">✅ 个人剧情已完成</div>';
    }

    // 操作按钮
    html += '<div style="display:flex;gap:8px;justify-content:center">';
    html += '<button class="t-btn" onclick="SECT._closeModal()">关闭</button>';
    html += '<button class="t-btn danger" onclick="SECT._dismissDisciple(\'' + d.id + '\')">驱逐弟子</button>';
    html += '</div>';

    this._showModal(null, html, null);
  },

  // ═══════════════════════════════════════════
  //  战斗系统（GDD §12 对齐）
  // ═══════════════════════════════════════════

  // 派生战斗属性（GDD §12.2）
  _deriveCombatStats(d) {
    const realm = d.realm || SECT_REALMS[0];
    let hp  = 30 + d.physique * 2 + realm.def * 2;
    let atk = 5 + Math.floor((d.rootBone + d.comprehension) * 0.4) + realm.atk;
    let def = 3 + Math.floor(d.physique * 0.5) + realm.def;
    let spd = 3 + Math.floor((d.comprehension + d.rootBone) * 0.25) + realm.spd;
    let critRate = 0.05, critDmg = 0.5, hitRate = 0.9, evadeRate = 0.05;
    const skills = []; // 战斗可用技能名

    (d.techniques || []).forEach(tid => {
      const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
      if (!t) return;
      // 收集战斗技能名（攻击系、防御系、隐匿系、逃遁系都有战斗技能）
      if (t.type !== '辅助系' && t.combat && Object.keys(t.combat).length > 0) {
        skills.push(t.name);
      }
      if (!t.combat) return;
      const c = t.combat;
      if (c.atk)  atk += c.atk;
      if (c.def)  def += c.def;
      if (c.spd)  spd += c.spd;
      if (c.hp)   hp += c.hp;
      if (c.critRate) critRate += c.critRate;
      if (c.critDmg)  critDmg += c.critDmg;
      if (t.type === '隐匿系') { hitRate += 0.05; evadeRate += 0.03; }
      if (t.type === '逃遁系') { evadeRate += 0.05; spd += 3; }
    });

    const cp = atk + def + spd + Math.floor(hp * 0.3);
    return { hp, maxHp: hp, atk, def, spd, critRate, critDmg, hitRate, evadeRate, cp, name: d.name, skills };
  },

  // 多回合战斗模拟（GDD §12.3）— 返回结构化日志
  _battleSimulate(teamA, teamB) {
    const log = []; let round = 0;
    const all = [...teamA.map(s => ({ ...s, side: 'A' })), ...teamB.map(s => ({ ...s, side: 'B' }))];
    const DEF_COEFF = 0.55;

    while (round < 20) {
      round++;
      // SPD排序行动队列
      all.sort((a, b) => b.spd - a.spd || Math.random() - 0.5);
      for (const actor of all) {
        if (actor.hp <= 0) continue; // 已倒地
        // 选目标：对方阵营随机（优先最低血量）
        const enemies = all.filter(u => u.side !== actor.side && u.hp > 0);
        if (enemies.length === 0) {
          // 一方全灭
          const aAlive = all.some(u => u.side === 'A' && u.hp > 0);
          const bAlive = all.some(u => u.side === 'B' && u.hp > 0);
          log.push({ round, result: aAlive && !bAlive ? 'A' : (!aAlive && bAlive ? 'B' : 'draw'), aAlive, bAlive, end: true,
            summary: aAlive && !bAlive ? '我方胜利！' : (!aAlive && bAlive ? '敌方胜利！' : '双方平手！') });
          return log;
        }
        enemies.sort((a, b) => a.hp - b.hp); // 优先打残血
        const target = enemies[0];

        // 选择技能（优先使用功法技能）
        const skillName = actor.skills && actor.skills.length > 0
          ? actor.skills[Math.floor(Math.random() * actor.skills.length)]
          : '普攻';

        // 命中判定
        if (Math.random() > actor.hitRate - target.evadeRate) {
          log.push({ round, actor: actor.name, skill: skillName, target: target.name, hit: false, dmg: 0, crit: false, targetHp: target.hp, targetMaxHp: target.maxHp });
          continue;
        }

        // 暴击判定
        const isCrit = Math.random() < actor.critRate;
        // 伤害公式（GDD §12.3）
        let dmg = Math.max(1, actor.atk - target.def * DEF_COEFF);
        if (isCrit) dmg = Math.floor(dmg * (1 + actor.critDmg));
        dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));
        target.hp = Math.max(0, target.hp - dmg);

        log.push({
          round, actor: actor.name, skill: skillName,
          target: target.name, hit: true, dmg, crit: isCrit,
          targetHp: target.hp, targetMaxHp: target.maxHp,
        });
      }
      // 检查是否一方全灭
      const aAlive = all.some(u => u.side === 'A' && u.hp > 0);
      const bAlive = all.some(u => u.side === 'B' && u.hp > 0);
      if (!aAlive || !bAlive) {
        log.push({ round, result: aAlive && !bAlive ? 'A' : 'B', aAlive, bAlive, end: true,
          summary: aAlive && !bAlive ? '我方胜利！' : '敌方胜利！' });
        return log;
      }
    }
    // 超过20回合 → 平局
    const aAlive = all.filter(u => u.side === 'A' && u.hp > 0).length;
    const bAlive = all.filter(u => u.side === 'B' && u.hp > 0).length;
    log.push({ round, result: 'draw', end: true,
      summary: aAlive > bAlive ? '我方优势平局' : (bAlive > aAlive ? '敌方优势平局' : '势均力敌的平局！') });
    return log;
  },

  // 战斗结算 + 日志（GDD §12.4 渲染模板）
  _executeCombat(myTeam, enemyTeam, combatType, enemyLabel) {
    const log = this._battleSimulate(myTeam, enemyTeam);
    const last = log[log.length - 1];
    const myWon = last.result === 'A';

    // 渲染战斗日志
    this.combatLog.push({ turn: this.turn, type: combatType, myWon, log, enemyLabel,
      summary: last.summary || (myWon ? '我方胜利！' : '敌方胜利！') });

    // 限制日志数量
    if (this.combatLog.length > 25) this.combatLog.shift();

    // 结果影响弟子
    if (combatType === 'spar' || combatType === 'duel') {
      myTeam.forEach(s => {
        const d = this.disciples.find(dd => dd.name === s.name);
        if (!d) return;
        if (myWon) { d.cultivation += _randInt(1, 3); d.loyalty = Math.min(100, d.loyalty + 1); }
        else { d.loyalty = Math.max(0, d.loyalty - _randInt(1, 3)); }
      });
    }

    return { myWon, log, last };
  },

  // 战斗日志渲染（GDD §12.4 模板格式）
  _renderCombatLog() {
    const el = document.getElementById('sct-combat-log');
    if (!el) return;
    if (this.combatLog.length === 0) {
      el.innerHTML = '<div class="sct-combat-empty">暂无战斗记录</div>';
      return;
    }
    const recent = this.combatLog.slice(-12).reverse();
    let html = '';
    recent.forEach(entry => {
      const icon = entry.type === 'spar' ? '🤼' : entry.type === 'adventure' ? '⚔' : entry.type === 'duel' ? '👊' : '🏛';
      const cls = entry.myWon ? 'win' : 'lose';
      html += '<div class="sct-combat-msg ' + cls + '"><b>' + icon + ' 第' + entry.turn + '回合 · ' + (entry.enemyLabel || '战斗') + '</b> — '
        + '<span style="color:' + (entry.myWon ? 'var(--green-t)' : 'var(--red)') + '">' + entry.summary + '</span><br>';
      // GDD §12.4 渲染模板
      entry.log.forEach(l => {
        if (l.end) return;
        if (!l.hit) {
          html += '<span style="font-size:9px;opacity:.5">  第' + l.round + '回合：' + l.actor + '使用【' + l.skill + '】，未命中</span><br>';
        } else {
          const hpInfo = (l.targetHp !== undefined && l.targetMaxHp !== undefined)
            ? '，剩余气血 ' + l.targetHp + '/' + l.targetMaxHp : '';
          html += '<span style="font-size:9px;opacity:.8">  第' + l.round + '回合：<b>' + l.actor + '</b>使用【' + l.skill + '】，对' + l.target + '造成 <b style="color:' + (l.crit ? 'var(--red)' : 'var(--amber)') + '">' + l.dmg + '</b> 点伤害' + (l.crit ? '（暴击！）' : '') + hpInfo + '</span><br>';
        }
      });
      html += '</div>';
    });
    el.innerHTML = html;
  },

  // 出战人数（GDD §12.5）
  _battleTeamSize() {
    if (this.level >= 15) return 7;
    if (this.level >= 10) return 5;
    if (this.level >= 5)  return 3;
    return 1;
  },

  // 每回合生成战斗事件
  _generateCombats() {
    const normal = this.disciples.filter(d => d.status === '正常');
    if (normal.length < 2) return;

    // ── 切磋：好战弟子主动挑战 ──
    const warlike = normal.filter(d => d.traits.some(tt => tt.id === 'warlike'));
    if (warlike.length > 0 && Math.random() < 0.35) {
      const a = warlike[Math.floor(Math.random() * warlike.length)];
      const others = normal.filter(d => d.id !== a.id);
      if (others.length) {
        const b = others[Math.floor(Math.random() * others.length)];
        const aStats = this._deriveCombatStats(a);
        const bStats = this._deriveCombatStats(b);
        const result = this._executeCombat([aStats], [bStats], 'spar', b.name);
        if (result.myWon) {
          this._addLog('info', '🤼 ' + a.name + '在切磋中战胜了' + b.name + '！');
        }
      }
    }

    // ── 内斗：野心勃勃+低忠诚 vs 其他弟子 ──
    const ambitious = normal.filter(d => d.traits.some(tt => tt.id === 'ambitious') && d.loyalty < 40);
    if (ambitious.length > 0 && Math.random() < 0.2) {
      const a = ambitious[Math.floor(Math.random() * ambitious.length)];
      const others = normal.filter(d => d.id !== a.id);
      if (others.length) {
        const b = others[Math.floor(Math.random() * others.length)];
        this._executeCombat([this._deriveCombatStats(a)], [this._deriveCombatStats(b)], 'duel', b.name);
        this._addLog('bad', '👊 ' + a.name + '与' + b.name + '因积怨爆发冲突！');
      }
    }

    // ── 随机对练 ──
    if (Math.random() < 0.2) {
      const a = normal[Math.floor(Math.random() * normal.length)];
      const others = normal.filter(d => d.id !== a.id);
      if (others.length) {
        const b = others[Math.floor(Math.random() * others.length)];
        this._executeCombat([this._deriveCombatStats(a)], [this._deriveCombatStats(b)], 'spar', b.name);
      }
    }
  },

  // ═══════════════════════════════════════════
  //  世界据点系统
  // ═══════════════════════════════════════════

  // 生成/刷新据点
  _refreshLocations() {
    // 清除已清理的据点、过期据点
    this.worldLocations = this.worldLocations.filter(l => l.state !== 'cleared');
    // 每隔几回合刷新一批
    const maxLocs = 3 + Math.floor(this.level / 3);
    while (this.worldLocations.length < maxLocs) {
      const types = Object.keys(SECT_LOCATION_POOL);
      const type = types[Math.floor(Math.random() * types.length)];
      const pool = SECT_LOCATION_POOL[type];
      const names = SECT_LOC_NAMES[type] || ['未知地点'];
      const name = names[Math.floor(Math.random() * names.length)];
      // 避免重名
      if (this.worldLocations.some(l => l.name === name)) continue;
      this.worldLocations.push({
        id: 'loc_' + _uid(), type, icon: pool.icon, name,
        state: type === 'bandit' ? 'hostile' : 'neutral',
        actions: [...pool.actions],
        dispatchedDisc: null, returnTurn: 0,
        _createdTurn: this.turn,
      });
    }
  },

  // 派遣弟子
  _dispatchToLocation(locId, discId, action) {
    const loc = this.worldLocations.find(l => l.id === locId);
    const d = this.disciples.find(dd => dd.id === discId);
    if (!loc || !d || d.status !== '正常') return;
    const actDef = SECT_LOC_ACTIONS[action];
    if (!actDef || !loc.actions.includes(action)) return;
    if (loc.dispatchedDisc) return; // 已有人前往

    const turns = actDef.turns;
    d.status = '外出';
    d._awayTurns = turns;
    d._dispatchLoc = locId;
    d._dispatchAction = action;
    loc.dispatchedDisc = d.name;
    loc.returnTurn = this.turn + turns;
    this._addLog('info', '📨 ' + d.name + ' 前往' + loc.icon + ' ' + loc.name + '（' + actDef.name + '），预计' + turns + '回合后返回。');
    this._renderLocations();
    this.save();
  },

  // 结算派遣结果
  _resolveDispatch(d, lines) {
    const loc = this.worldLocations.find(l => l.id === d._dispatchLoc);
    if (!loc) return;
    const action = d._dispatchAction;
    loc.dispatchedDisc = null;

    switch (action) {
      case 'scout': {
        // 探查：安全，获得情报+少量资源
        const gain = _randInt(5, 20);
        this.spiritStones += gain;
        lines.push('good|' + d.name + ' 探查' + loc.name + '归来，带回情报和' + gain + '灵石');
        // 可能发现新据点
        if (Math.random() < 0.3) this._refreshLocations();
        break;
      }
      case 'befriend': {
        const cost = _randInt(15, 35);
        this.spiritStones = Math.max(0, this.spiritStones - cost);
        if (Math.random() < 0.6) {
          loc.state = 'friendly';
          this.reputation += 3;
          lines.push('good|' + d.name + ' 成功与' + loc.name + '建立了友好关系！声望+3');
        } else {
          lines.push('info|' + d.name + ' 拜访了' + loc.name + '，但对方态度冷淡。花费' + cost + '灵石');
        }
        break;
      }
      case 'challenge': {
        const npc = _pickNPC('rivalDisc');
        const result = this._executeCombat([this._deriveCombatStats(d)], [npc], 'diplomacy', loc.name + '弟子');
        if (result.myWon) {
          this.reputation += 5;
          lines.push('good|' + d.name + ' 在' + loc.name + '切磋中大胜对手！声望+5');
        } else {
          d.loyalty -= _randInt(2, 5);
          lines.push('bad|' + d.name + ' 在' + loc.name + '切磋落败...');
        }
        break;
      }
      case 'attack': {
        const npcPool = loc.type === 'bandit' ? ['bandit','beast','rogue'] : ['rogue','serpent'];
        const npc = _pickNPC(npcPool[Math.floor(Math.random() * npcPool.length)]);
        const result = this._executeCombat([this._deriveCombatStats(d)], [npc], 'adventure', loc.name);
        if (result.myWon) {
          const loot = _randInt(20, 60);
          this.spiritStones += loot;
          loc.state = 'cleared';
          lines.push('good|' + d.name + ' 成功剿灭' + loc.name + '！获得' + loot + '灵石');
          if (Math.random() < 0.15) {
            const avail = SECT_TECHNIQUES.filter(t => t.reqLv <= this.level && !this.techniques.includes(t.id));
            if (avail.length) { const t = avail[Math.floor(Math.random() * avail.length)]; this.techniques.push(t.id); lines.push('good|在' + loc.name + '中发现了功法「' + t.name + '」！'); }
          }
        } else {
          d.cultivation = Math.max(0, d.cultivation - _randInt(5, 15));
          d.loyalty -= _randInt(3, 8);
          lines.push('bad|' + d.name + ' 袭击' + loc.name + '失败，重伤归来！');
        }
        break;
      }
      case 'trade': {
        const gain = _randInt(10, 30);
        this.spiritStones += gain;
        if (loc.state === 'friendly') { const bonus = _randInt(5, 15); this.spiritStones += bonus; }
        lines.push('info|' + d.name + ' 从' + loc.name + '贸易归来，获利' + gain + '灵石');
        break;
      }
      case 'explore': {
        if (Math.random() < 0.55) {
          const gain = _randInt(25, 70);
          this.spiritStones += gain;
          lines.push('good|' + d.name + ' 深入' + loc.name + '，发现了' + gain + '灵石和稀有材料！');
          if (Math.random() < 0.2) {
            const avail = SECT_TECHNIQUES.filter(t => t.reqLv <= this.level && !this.techniques.includes(t.id));
            if (avail.length) { const t = avail[Math.floor(Math.random() * avail.length)]; this.techniques.push(t.id); lines.push('good|在' + loc.name + '深处获得了功法「' + t.name + '」！'); }
          }
        } else {
          d.cultivation = Math.max(0, d.cultivation - _randInt(3, 10));
          lines.push('bad|' + d.name + ' 在' + loc.name + '中遭遇机关陷阱，受了些伤。');
        }
        loc.state = 'cleared';
        break;
      }
      case 'recruit': {
        if (this.disciples.length < this._maxDisc() && Math.random() < 0.4) {
          _createDisciple(this, _randInt(15, 50));
          lines.push('good|' + d.name + ' 从' + loc.name + '带回了一位有潜力的年轻人！');
        } else {
          this.spiritStones += _randInt(5, 15);
          lines.push('info|' + d.name + ' 在' + loc.name + '未能招募到合适的人，但带回了些特产。');
        }
        break;
      }
      case 'ally': {
        const tribute = _randInt(20, 50);
        this.spiritStones = Math.max(0, this.spiritStones - tribute);
        if (Math.random() < 0.5) {
          loc.state = 'friendly';
          this.flags.nobleAlly = (this.flags.nobleAlly || 0) + 1;
          this.bloodBlade.hostility = Math.max(0, this.bloodBlade.hostility - 10);
          lines.push('good|' + d.name + ' 成功与' + loc.name + '缔结盟约！血刀门有所忌惮，敌意-10。每回合需上供' + tribute + '灵石。');
        } else {
          this.spiritStones = Math.max(0, this.spiritStones - tribute);
          lines.push('info|' + d.name + ' 拜见了' + loc.name + '，但对方暂未答应庇护。花费' + tribute + '灵石。');
        }
        break;
      }
      case 'harvest': {
        const gain = _randInt(15, 35);
        this.spiritStones += gain;
        d.cultivation += _randInt(1, 3);
        lines.push('info|' + d.name + ' 从' + loc.name + '采集归来，获得' + gain + '灵石');
        break;
      }
    }
    d._dispatchLoc = null;
    d._dispatchAction = null;
    loc.returnTurn = 0;
    // 清除已清理据点
    if (loc.state === 'cleared') {
      this.worldLocations = this.worldLocations.filter(l => l.id !== loc.id);
    }
    this._renderLocations();
  },

  // 渲染据点面板
  _renderLocations() {
    const panel = document.getElementById('sct-location-panel');
    if (!panel) return;

    let html = '';

    // 血刀门 — 始终显示
    const bb = this.bloodBlade;
    html += '<div class="sct-loc-item" onclick="SECT._openBloodBladeDetail()" style="border-bottom:1px solid rgba(248,81,73,.3)">'
      + '<span>💀</span>'
      + '<span style="flex:1;font-weight:600;color:var(--red)">血刀门</span>'
      + '<span style="font-size:9px;color:' + (bb.hostility >= 80 ? 'var(--red)' : bb.hostility >= 50 ? 'var(--amber)' : 'var(--dim)') + '">敌意' + bb.hostility + '</span>'
      + '</div>';

    // 标题行
    html += '<div style="font-size:10px;color:var(--amber);padding:4px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between">'
      + '<span>🌍 周边据点 (' + this.worldLocations.filter(l => l.state !== 'cleared').length + ')</span>'
      + '<span style="cursor:pointer;color:var(--dim)" onclick="SECT._refreshLocations();SECT._renderLocations()" title="刷新据点">↻</span></div>';

    if (this.worldLocations.length === 0) {
      html += '<div class="sct-combat-empty">周边暂无据点<br><span style="font-size:9px">点击 ↻ 探索新的据点</span></div>';
    } else {
      this.worldLocations.forEach(loc => {
        const stateCls = loc.state === 'friendly' ? 'color:var(--green-t)' : loc.state === 'hostile' ? 'color:var(--red)' : 'color:var(--dim)';
        const stateName = loc.state === 'friendly' ? '友好' : loc.state === 'hostile' ? '敌对' : '中立';
        const dispatched = loc.dispatchedDisc
          ? '<span style="font-size:9px;color:var(--amber)">⏳ ' + loc.dispatchedDisc + '（' + (loc.returnTurn - this.turn) + '回后归）</span>'
          : '';
        html += '<div class="sct-loc-item" onclick="SECT._openLocationDispatch(\'' + loc.id + '\')">'
          + '<span>' + loc.icon + '</span>'
          + '<span style="flex:1;font-weight:600">' + loc.name + '</span>'
          + '<span style="font-size:9px;' + stateCls + '">' + stateName + '</span>'
          + '</div>'
          + (dispatched ? '<div style="font-size:9px;padding:1px 12px 2px 28px">' + dispatched + '</div>' : '');
      });
    }
    panel.innerHTML = html;
  },

  // 打开派遣对话框
  _openLocationDispatch(locId) {
    const loc = this.worldLocations.find(l => l.id === locId);
    if (!loc || loc.dispatchedDisc) return;
    const normal = this.disciples.filter(d => d.status === '正常');
    if (normal.length === 0) { alert('没有空闲的弟子可以派遣。'); return; }

    let html = '<h2>' + loc.icon + ' ' + loc.name + '</h2>';
    html += '<div style="font-size:11px;color:var(--dim);margin-bottom:12px">'
      + SECT_LOCATION_POOL[loc.type]?.desc + ' · 状态: ' + loc.state + '</div>';

    html += '<div style="font-size:11px;color:var(--amber);margin-bottom:6px">选择行动:</div>';
    html += '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">';
    loc.actions.forEach(act => {
      const def = SECT_LOC_ACTIONS[act];
      if (!def) return;
      html += '<label class="sct-loc-action" style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:11px">'
        + '<input type="radio" name="loc-action" value="' + act + '" style="accent-color:var(--amber)">'
        + '<b>' + def.name + '</b> <span style="color:var(--dim);font-size:10px">' + def.desc + '（' + def.turns + '回合）</span>'
        + '</label>';
    });
    html += '</div>';

    html += '<div style="font-size:11px;color:var(--amber);margin-bottom:6px">选择弟子:</div>';
    html += '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">';
    normal.forEach(d => {
      html += '<label class="sct-loc-action" style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:11px">'
        + '<input type="radio" name="loc-disc" value="' + d.id + '" style="accent-color:var(--teal)">'
        + d.name + ' <span style="color:var(--dim)">' + d.realm.name + ' · CP' + this._deriveCombatStats(d).cp + '</span>'
        + '</label>';
    });
    html += '</div>';

    html += '<div style="text-align:center">'
      + '<button class="sct-btn-primary" onclick="SECT._doDispatch(\'' + locId + '\')" style="width:auto;display:inline">派遣！</button> '
      + '<button class="t-btn" onclick="SECT._closeModal()" style="display:inline">取消</button></div>';

    this._showModal(null, html, null);
  },

  _doDispatch(locId) {
    const actionEl = document.querySelector('input[name="loc-action"]:checked');
    const discEl = document.querySelector('input[name="loc-disc"]:checked');
    if (!actionEl || !discEl) { alert('请选择行动和弟子'); return; }
    this._dispatchToLocation(locId, discEl.value, actionEl.value);
    this._closeModal();
    this.save();
    this._render();
  },

  // ═══════════════════════════════════════════
  //  血刀门敌对系统
  // ═══════════════════════════════════════════

  // 生成血刀门成员（情报达到100%时揭露）
  _revealBloodBlade() {
    if (this.bloodBlade.revealed) return;
    this.bloodBlade.revealed = true;
    const members = [];
    // 门主：95%武师，5%大武师
    const isGrand = Math.random() < 0.05;
    members.push({
      name: '血刀门主·段厉',
      realm: isGrand ? '大武师' : '武师',
      realmIdx: isGrand ? 3 : 2,
      npcKey: isGrand ? 'bloodGrand' : 'bloodMaster',
      role: '门主',
    });
    // 精英 2~3人（武者5~9星）
    const eliteCount = _randInt(2, 3);
    const eliteNames = ['血刀左使·鬼面', '血刀右使·残剑', '血刀护法·赤蟒', '血刀堂主·冷锋'];
    for (let i = 0; i < eliteCount; i++) {
      members.push({
        name: eliteNames[i] || ('血刀精英' + (i + 1)),
        realm: '武者 ' + _randInt(5, 9) + '星',
        realmIdx: 1,
        npcKey: 'bloodElite',
        role: '精英',
      });
    }
    // 喽啰 3~5人（武者1~4星）
    const gruntCount = _randInt(3, 5);
    const gruntNames = ['血刀喽啰·疤脸', '血刀喽啰·独眼', '血刀喽啰·铁手', '血刀喽啰·毒牙', '血刀喽啰·飞腿'];
    for (let i = 0; i < gruntCount; i++) {
      members.push({
        name: gruntNames[i] || ('血刀喽啰' + (i + 1)),
        realm: '武者 ' + _randInt(1, 4) + '星',
        realmIdx: 1,
        npcKey: 'bloodBlade',
        role: '喽啰',
      });
    }
    this.bloodBlade.members = members;
    this._addLog('event', '🔍 情报收集完毕！血刀门实力一览：门主' + (isGrand ? '大武师' : '武师') + '，' + eliteCount + '名精英，' + gruntCount + '名喽啰。');
    this._renderBloodBladeDetail();

    // 揭露后中栏显示详情
    const detail = document.getElementById('sct-loc-detail');
    if (detail) {
      detail.innerHTML = '<div style="font-size:11px;line-height:1.8">'
        + '<div style="color:var(--red);font-weight:700;margin-bottom:8px">💀 血刀门 — 成员情报</div>'
        + members.map(m => '<div style="padding:3px 0;border-bottom:1px solid rgba(48,54,61,.3)">'
          + '<b>' + m.name + '</b> <span style="color:var(--dim)">' + m.role + '</span> '
          + '<span style="color:' + (m.role === '门主' ? 'var(--red)' : 'var(--amber)') + '">' + m.realm + '</span>'
          + '</div>').join('')
        + '</div>';
    }
  },

  _renderBloodBladeDetail() {
    const el = document.getElementById('sct-bloodblade-status');
    if (!el) return;
    const bb = this.bloodBlade;
    const intelPct = bb.intel;
    const hostilityClr = bb.hostility >= 80 ? 'var(--red)' : bb.hostility >= 50 ? 'var(--amber)' : 'var(--dim)';
    el.innerHTML = '<div style="font-size:10px;line-height:1.6">'
      + '<div>敌意: <b style="color:' + hostilityClr + '">' + bb.hostility + '/100</b></div>'
      + '<div>情报: <b style="color:var(--teal-t)">' + intelPct + '%</b></div>'
      + (bb.revealed ? '<div style="color:var(--red)">⚠ 已揭露 · ' + bb.members.length + '名成员</div>'
        : '<div style="color:var(--dim)">??? 未知势力</div>')
      + '</div>';
  },

  // 每回合血刀门行动
  _bloodBladeAction() {
    const bb = this.bloodBlade;
    // 每3~8回合行动一次
    if (this.turn - bb.lastActionTurn < _randInt(3, 8)) return;
    bb.lastActionTurn = this.turn;

    // 根据hostility决定行动
    const roll = Math.random();
    if (bb.hostility >= 80 && roll < 0.4) {
      // 大规模劫掠
      this._bloodBladeRaid(2 + (bb.hostility >= 95 ? 1 : 0));
    } else if (bb.hostility >= 50 && roll < 0.5) {
      // 中等威胁
      this._bloodBladeRaid(1);
    } else if (roll < 0.6) {
      // 口头威胁
      this._addLog('bad', '💀 血刀门遣使传来口信：若不按期缴纳供奉，后果自负。');
      bb.hostility += 3;
    } else {
      // 劫掠资源
      const lost = _randInt(10, 30);
      this.spiritStones = Math.max(0, this.spiritStones - lost);
      this._addLog('bad', '💀 血刀门喽啰趁夜劫掠了我宗外围灵田，损失' + lost + '灵石。');
      bb.hostility += 2;
    }
    this._renderBloodBladeDetail();
  },

  // 血刀门劫掠战斗
  _bloodBladeRaid(count) {
    const bb = this.bloodBlade;
    const normalDisc = this.disciples.filter(d => d.status === '正常');
    if (normalDisc.length === 0) {
      this._bloodBladeGameOver();
      return;
    }

    // 组建劫掠队伍
    const raiders = [];
    for (let i = 0; i < count; i++) {
      const npcKey = Math.random() < 0.3 ? 'bloodElite' : 'bloodBlade';
      const npc = _pickNPC(npcKey);
      npc.name = '血刀门' + (npcKey === 'bloodElite' ? '精英' : '武者') + (i + 1);
      raiders.push(npc);
    }

    // 如果hostility极高（95+），门主亲自出马
    if (bb.hostility >= 95 && Math.random() < 0.3) {
      const master = _pickNPC(bb.members.length > 0 && bb.members[0].npcKey === 'bloodGrand' ? 'bloodGrand' : 'bloodMaster');
      master.name = '血刀门主·段厉';
      raiders.push(master);
    }

    // 我方自动出战：选择最强弟子
    const defenders = normalDisc.sort((a, b) => this._deriveCombatStats(b).cp - this._deriveCombatStats(a).cp).slice(0, Math.min(count, normalDisc.length));
    const myTeam = defenders.map(d => this._deriveCombatStats(d));
    const result = this._executeCombat(myTeam, raiders, 'diplomacy', '血刀门劫掠队');

    if (result.myWon) {
      this._addLog('good', '⚔ 成功击退血刀门的劫掠！宗门上下士气大振。');
      bb.hostility = Math.max(0, bb.hostility - 15);
      this.reputation += 3;
    } else {
      this._addLog('bad', '💀 血刀门劫掠得手！宗门遭受重创...');
      bb.hostility = Math.min(100, bb.hostility + 20);
      this.spiritStones = Math.max(0, this.spiritStones - _randInt(30, 80));
      // 受伤惩罚
      defenders.forEach(d => {
        const disc = this.disciples.find(dd => dd.name === d.name);
        if (disc) { disc.cultivation = Math.max(0, disc.cultivation - _randInt(5, 15)); disc.loyalty -= _randInt(5, 15); }
      });

      // hostility 100 → 灭宗
      if (bb.hostility >= 100) {
        this._bloodBladeGameOver();
      }
    }
    this._renderBloodBladeDetail();
  },

  // 灭宗
  _bloodBladeGameOver() {
    this._addLog('bad', '💀 血刀门倾巢而出，宗门覆灭...');
    this._addLog('bad', '世间再无「' + this.sectName + '」这个名字。');
    // 清除存档
    localStorage.removeItem(this.saveKey);
    // 延迟重置
    setTimeout(() => {
      this.sectName = ''; this.continent = ''; this.view = 'create';
      this.disciples = []; this._render();
      alert('💀 宗门已被血刀门覆灭。\n\n请重新开始。');
    }, 500);
    this.save();
  },

  // ═══ 玩家应对血刀门 ═══

  // 探查情报
  _scoutBloodBlade() {
    if (this.actionPoints < 1) { alert('行动点不足'); return; }
    const normalDisc = this.disciples.filter(d => d.status === '正常');
    if (normalDisc.length === 0) { alert('没有空闲弟子'); return; }
    this.actionPoints -= 1;
    const gain = _randInt(5, 12);
    this.bloodBlade.intel = Math.min(100, this.bloodBlade.intel + gain);
    this._addLog('info', '🔍 探查血刀门情报 +' + gain + '%（当前 ' + this.bloodBlade.intel + '%）');

    if (this.bloodBlade.intel >= 100 && !this.bloodBlade.revealed) {
      this._revealBloodBlade();
    }
    this._renderBloodBladeDetail();
    this.save();
    this._render();
  },

  // 缴纳灵石
  _payBloodBlade() {
    const cost = _randInt(50, 150);
    if (this.spiritStones < cost) { alert('灵石不足（需要' + cost + '）'); return; }
    this.spiritStones -= cost;
    this.bloodBlade.hostility = Math.max(0, this.bloodBlade.hostility - _randInt(5, 15));
    this._addLog('info', '💰 向血刀门缴纳了' + cost + '灵石作为供奉。敌意-' + _randInt(5, 15));
    this._renderBloodBladeDetail();
    this.save();
    this._render();
  },

  // 供奉血食（献祭弟子）
  _sacrificeToBloodBlade() {
    const normalDisc = this.disciples.filter(d => d.status === '正常');
    if (normalDisc.length <= 1) { alert('至少需要2名弟子（宗门不能无人）'); return; }
    // 打开选择框
    let html = '<h2>💀 供奉血食</h2>';
    html += '<div style="font-size:11px;color:var(--dim);margin-bottom:12px">选择一名弟子送往血刀门作为"血食"。该弟子将永久失去。</div>';
    html += '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">';
    normalDisc.forEach(d => {
      html += '<button class="sct-event-choice" onclick="SECT._doSacrifice(\'' + d.id + '\')" style="text-align:left">'
        + d.name + ' <span style="color:var(--dim)">' + d.qualityName + ' · ' + d.realm.name + '</span></button>';
    });
    html += '</div>';
    html += '<div style="text-align:center"><button class="t-btn" onclick="SECT._closeModal()">取消</button></div>';
    this._showModal('💀 血刀门索要血食', html, null);
  },

  _openBloodBladeDetail() {
    const detail = document.getElementById('sct-loc-detail');
    if (!detail) return;
    const bb = this.bloodBlade;
    const hostilityLvl = bb.hostility >= 80 ? '极度危险' : bb.hostility >= 50 ? '虎视眈眈' : bb.hostility >= 25 ? '暗中觊觎' : '试探观望';
    let html = '<div style="font-size:12px;line-height:1.8">'
      + '<div style="color:var(--red);font-weight:700;margin-bottom:8px">💀 血刀门</div>'
      + '<div>威胁等级: <b style="color:' + (bb.hostility >= 80 ? 'var(--red)' : 'var(--amber)') + '">' + hostilityLvl + '</b></div>'
      + '<div>敌意值: <b>' + bb.hostility + '/100</b></div>'
      + '<div>情报: <b style="color:var(--teal-t)">' + bb.intel + '%</b></div>'
      + '<div style="margin-top:8px;font-size:10px;color:var(--dim)">一个以活人精血修炼的邪道宗门。<br>最低武者起步，有武师坐镇。<br>若敌意达到100，他们将倾巢而出覆灭本宗。</div>';

    if (bb.revealed && bb.members.length > 0) {
      html += '<div style="margin-top:10px;color:var(--amber);font-weight:600">已知成员:</div>';
      bb.members.forEach(m => {
        html += '<div style="padding:3px 0;border-bottom:1px solid rgba(48,54,61,.3);font-size:10px">'
          + '<b>' + m.name + '</b> <span style="color:var(--dim)">' + m.role + '</span> '
          + '<span style="color:' + (m.role === '门主' ? 'var(--red)' : 'var(--amber)') + '">' + m.realm + '</span>'
          + '</div>';
      });
    } else if (bb.intel > 0) {
      html += '<div style="margin-top:10px;color:var(--dim);font-size:10px">情报不足，尚未揭露具体成员。<br>继续探查以获取更多信息。</div>';
    } else {
      html += '<div style="margin-top:10px;color:var(--dim);font-size:10px">你对这个势力几乎一无所知。<br>派遣弟子探查以获取情报。</div>';
    }

    // 操作按钮
    html += '<div style="margin-top:12px;display:flex;gap:4px;flex-wrap:wrap">'
      + '<button class="t-btn" style="font-size:10px" onclick="SECT._scoutBloodBlade()">🔍 探查 1⚡</button>'
      + '<button class="t-btn" style="font-size:10px" onclick="SECT._payBloodBlade()">💰 供奉灵石</button>'
      + '<button class="t-btn danger" style="font-size:10px" onclick="SECT._sacrificeToBloodBlade()">💀 供奉血食</button>'
      + '</div>';
    html += '</div>';
    detail.innerHTML = html;
  },

  _doSacrifice(discId) {
    const d = this.disciples.find(dd => dd.id === discId);
    if (!d) return;
    this.disciples = this.disciples.filter(dd => dd.id !== discId);
    this.bloodBlade.hostility = Math.max(0, this.bloodBlade.hostility - 30);
    this._addLog('bad', '💀 ' + d.name + '被送往血刀门作为血食...宗门上下无不心寒。敌意-30');
    this._closeModal();
    this._renderBloodBladeDetail();
    this.save();
    this._render();
  },

  _dismissDisciple(discId) {
    const d = this.disciples.find(dd => dd.id === discId);
    if (!d) return;
    if (this.disciples.length <= 1) {
      this._closeModal();
      alert('宗门至少需要1名弟子。');
      return;
    }
    if (!confirm('确定要驱逐「' + d.name + '（' + d.qualityName + '）」吗？\n\n此操作不可撤销。')) return;
    this.disciples = this.disciples.filter(dd => dd.id !== discId);
    this._addLog('bad', '你亲手将' + d.name + '逐出了宗门。江湖路远，各自珍重。');
    this._closeModal();
    this.save();
    this._render();
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
    const backstory = SECT_BACKSTORIES[Math.floor(Math.random() * SECT_BACKSTORIES.length)];
    const trait = SECT_TRAITS[Math.floor(Math.random() * SECT_TRAITS.length)];
    let trait2 = SECT_TRAITS[Math.floor(Math.random() * SECT_TRAITS.length)];
    if ((trait.id === 'loyal' && trait2.id === 'ambitious') || (trait.id === 'ambitious' && trait2.id === 'loyal')) {
      trait2 = SECT_TRAITS.find(tt => tt.id !== 'loyal' && tt.id !== 'ambitious') || trait2;
    }
    if (trait2.id === trait.id) trait2 = null;
    const traits = trait2 ? [trait, trait2] : [trait];
    const disc = {
      id: _uid(), name: d.name, gender: d.gender,
      quality: d.quality, qualityTier: d.qualityTier, qualityName: d.qualityName,
      rootBone: d.rootBone + (backstory.eff.rootBone || 0),
      comprehension: d.comprehension + (backstory.eff.comprehension || 0),
      physique: d.physique + (backstory.eff.physique || 0),
      charm: d.charm + (backstory.eff.charm || 0),
      realm: SECT_REALMS[0], realmIdx: 0, cultivation: 0,
      loyalty: Math.min(100, Math.max(10, _randInt(60, 90) + (backstory.eff.loyalty || 0))),
      innerDemon: Math.max(0, _randInt(0, 10) + (backstory.eff.innerDemon || 0)),
      backstory: backstory.id, backstoryName: backstory.name, traits, task: null,
      techniques: ['t_breathe'],
      status: '正常', recruitedTurn: this.turn,
      _storyStage: 0, _awayTurns: 0,
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

    // 外出弟子归期倒计时 + 派遣结算
    this.disciples.forEach(d => {
      if (d.status === '外出') {
        d._awayTurns--;
        if (d._awayTurns <= 0) {
          d.status = '正常';
          if (d._dispatchLoc) {
            this._resolveDispatch(d, lines);
          } else {
            lines.push('good|' + d.name + ' 风尘仆仆地归来，看样子经历了不少。');
          }
        }
      }
    });

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
          (d.techniques || []).forEach(tid => {
            const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
            if (t?.effect.cultivate) bonus += t.effect.cultivate;
          });
          if (this.flags.spiritBuff) bonus += this.flags.spiritBuff;
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
          (d.techniques || []).forEach(tid => {
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
          (d.techniques || []).forEach(tid => {
            const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
            if (t?.effect.adventure) bonus += t.effect.adventure;
          });
          if (this.buildings.find(b => b.id === 'arena')) danger = 2;
          if (this.buildings.find(b => b.id === 'formation')) danger = Math.max(1, danger - 1);

          // 历练 = PVE战斗（GDD §12.7）。难度越高越容易遇到强敌
          const npcPoolEasy = ['bandit','beast'];
          const npcPoolHard = ['rogue','serpent','zombie','sentinel'];
          const npcKey = Math.random() * 100 < danger
            ? npcPoolHard[Math.floor(Math.random() * npcPoolHard.length)]
            : npcPoolEasy[Math.floor(Math.random() * npcPoolEasy.length)];
          const npc = _pickNPC(npcKey);
          const myStats = this._deriveCombatStats(d);
          const result = this._executeCombat([myStats], [npc], 'adventure', npc.name);

          if (result.myWon) {
            const stoneGain = _randInt(15, 40);
            const repGain = _randInt(1, 4);
            const cultGain = _randInt(3, 10);
            turnStones += Math.round(stoneGain * (1 + bonus / 100));
            turnRep += repGain;
            d.cultivation += Math.round(cultGain * (1 + bonus / 100));
            lines.push('good|' + d.name + ' 击败' + npc.name + '！灵石+' + stoneGain + ' 声望+' + repGain);
          } else {
            const injury = _randInt(3, 10);
            d.cultivation = Math.max(0, d.cultivation - injury);
            d.loyalty -= _randInt(1, 5);
            lines.push('bad|' + d.name + ' 遭遇' + npc.name + '不敌败退，修为-' + injury);
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
          (d.techniques || []).forEach(tid => {
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

    // ── 江湖消息（30%概率）─ 关联玩家所在洲 ──
    if (Math.random() < 0.3) {
      const contName = cont?.name || '此洲';
      const news = SECT_WORLD_NEWS[Math.floor(Math.random() * SECT_WORLD_NEWS.length)];
      const localNews = news.replace(/九洲|江湖/g, contName + '一带');
      this._addLog('event', '📰 ' + contName + '消息: ' + localNews.replace(contName + '一带' + contName + '一带', contName + '一带'));
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
        actions.push({ text: nb.name + '突然派人到我宗门口挑衅，声称要「比划比划」！', eff: s => { const champ = s.disciples.filter(d => d.status === '正常').sort((a, b) => s._deriveCombatStats(b).cp - s._deriveCombatStats(a).cp)[0]; if (champ) { const npc = _pickNPC(nb.power >= 4 ? 'eliteDisc' : 'rivalDisc'); const result = s._executeCombat([s._deriveCombatStats(champ)], [npc], 'diplomacy', nb.name + '弟子'); if (result.myWon) { s.reputation += 5; s._addLog('good', champ.name + '代表宗门出战，击败' + nb.name + '弟子！声望+5'); } else { s.reputation -= 3; s._addLog('bad', champ.name + '不敌对手，宗门颜面受损...'); } } else { s.reputation -= 2; s._addLog('bad', '宗门无人应战，只得忍气吞声。声望-2'); } } });
      }
      if (nb.style === '邪道' && Math.random() < 0.3) {
        actions.push({ text: nb.name + '深夜派人偷袭我宗药圃！巡夜弟子奋起反击。', eff: s => { const guard = s.disciples.filter(d => d.status === '正常').sort((a, b) => s._deriveCombatStats(b).cp - s._deriveCombatStats(a).cp)[0]; if (guard) { const npc = _pickNPC('bandit'); npc.name = nb.name + '偷袭者'; const result = s._executeCombat([s._deriveCombatStats(guard)], [npc], 'diplomacy', nb.name + '偷袭者'); if (result.myWon) { s.reputation += 3; s._addLog('good', guard.name + '击退了偷袭者，保住了药圃！声望+3'); } else { s.spiritStones = Math.max(0, s.spiritStones - _randInt(10, 30)); s._addLog('bad', '药圃被毁了一角，损失灵石。与' + nb.name + '的关系恶化。'); } } } });
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

    // ── 据点刷新（每5~8回合） ──
    this._bloodBladeAction();
    if (this.turn % _randInt(5, 8) === 0 || this.worldLocations.length === 0) this._refreshLocations();

    // ── 战斗事件生成 ──
    this._generateCombats(lines);

    // ── 生成待处理事件（加入队列而非强制弹窗） ──
    this._generateEvents();

    // ── 清理过期事件 ──
    this.pendingEvents = this.pendingEvents.filter(e => {
      if (e.expires <= this.turn) {
        this._addLog('info', '⏰ 事件「' + e.title + '」已过期。');
        return false;
      }
      return true;
    });

    // 事件上限（最多同时存在6个）
    if (this.pendingEvents.length > 6) {
      const removed = this.pendingEvents.splice(0, this.pendingEvents.length - 6);
      removed.forEach(e => this._addLog('info', '⏰ 事件过多，「' + e.title + '」已过期。'));
    }

    this.save();
    this._render();
  },

  _generateEvents() {
    // ── 通用世界事件（40%概率生成1个） ──
    if (Math.random() < 0.4) {
      const eligible = SECT_EVENTS.filter(e => e.cond(this));
      if (eligible.length) {
        const event = _weightedRandom(eligible, e => e.weight);
        this.pendingEvents.push({
          id: 'ev_' + _uid(), type: 'world',
          title: '⚡ ' + event.text.slice(0, 25) + '…',
          text: event.text, choices: event.choices,
          expires: this.turn + _randInt(3, 6),
        });
      }
    }

    // ── 个人剧情事件（检查每个弟子） ──
    this.disciples.forEach(d => {
      if (d.status !== '正常') return;
      // 查找匹配的个人剧情链
      Object.values(SECT_PERSONAL_CHAINS).forEach(chain => {
        if (chain.backstory !== d.backstory) return;
        // _storyStage: 0=待触发阶段1, N=待触发阶段N, 99=已完成
        const nextStage = chain.stages.find(st => {
          if (d._storyStage === 99) return false;        // chain complete
          if (st.stage !== d._storyStage + 1) return false; // only trigger next unplayed stage
          // 检查此事件是否已在队列中
          if (this.pendingEvents.some(e => e._chainId === chain.backstory + '_' + st.stage && e.discId === d.id)) return false;
          return st.cond(this, d);
        });
        if (nextStage) {
          this.pendingEvents.push({
            id: 'pev_' + _uid(), type: 'personal',
            title: nextStage.title.replace('{name}', d.name),
            text: nextStage.text.replace(/\{name\}/g, d.name),
            choices: nextStage.choices,
            expires: this.turn + _randInt(5, 8),
            discId: d.id, _chainId: chain.backstory + '_' + nextStage.stage,
            _stage: nextStage.stage, _chain: chain,
          });
        }
      });
    });
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
  //  事件系统（队列模式）
  // ═══════════════════════════════════════════

  // 从队列中打开事件
  _openPendingEvent(evId) {
    const ev = this.pendingEvents.find(e => e.id === evId);
    if (!ev) return;
    let html = '<h2>' + ev.title + '</h2>';
    html += '<div style="font-size:10px;color:var(--dim);margin-bottom:8px">'
      + (ev.type === 'personal' ? '🔶 个人剧情' : ev.type === 'diplomacy' ? '🏛 外交' : '⚡ 宗门事件')
      + ' · 剩余 ' + (ev.expires - this.turn) + ' 回合</div>';
    html += '<div class="sct-event-text">' + ev.text + '</div>';
    html += '<div class="sct-event-choices">';
    ev.choices.forEach((c, i) => {
      html += '<button class="sct-event-choice" onclick="SECT._resolvePendingEvent(\'' + ev.id + '\',' + i + ')">' + c.text + '</button>';
    });
    html += '</div>';
    this._showModal(null, html, null);
  },

  // 处理事件选择
  _resolvePendingEvent(evId, choiceIdx) {
    const idx = this.pendingEvents.findIndex(e => e.id === evId);
    if (idx < 0) return;
    const ev = this.pendingEvents[idx];
    if (choiceIdx >= ev.choices.length) return;

    // 个人事件：传入弟子对象（effect内部自行设置_storyStage）
    if (ev.discId) {
      const d = this.disciples.find(dd => dd.id === ev.discId);
      if (d) {
        ev.choices[choiceIdx].effect(this, d);
      }
    } else {
      ev.choices[choiceIdx].effect(this);
    }

    // 从队列移除
    this.pendingEvents.splice(idx, 1);
    this._closeModal();
    this.save();
    this._render();
  },

  // ═══════════════════════════════════════════
  //  藏经阁
  // ═══════════════════════════════════════════
  _openTechniques() {
    const libraryBld = this.buildings.find(b => b.id === 'library');
    const normalDiscs = this.disciples.filter(d => d.status === '正常');
    let html = '<h2>📜 藏经阁</h2>';

    // 已解锁功法（宗门知识库）
    html += '<div style="font-size:11px;color:var(--dim);margin-bottom:8px">宗门已解锁: ';
    if (this.techniques.length === 0) {
      html += '<span style="opacity:.5">无</span>';
    } else {
      html += this.techniques.map(tid => {
        const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
        return t ? '<span style="color:var(--green-t)">' + t.name + '</span>' : '';
      }).filter(Boolean).join('、');
    }
    html += '</div>';

    // 已解锁的功法 → 可以传授给弟子（免费，消耗1AP）
    html += '<div style="font-size:11px;color:var(--amber);margin-bottom:12px">📖 传授已解锁功法给弟子（1⚡/次）</div>';
    if (this.techniques.length <= 1) {
      html += '<div style="text-align:center;color:var(--dim);padding:8px;font-size:11px">暂无已解锁功法可传授<br><span style="opacity:.6">先购买新功法或等待解锁更多</span></div>';
    } else if (normalDiscs.length === 0) {
      html += '<div style="text-align:center;color:var(--dim);padding:8px;font-size:11px">没有可传授的弟子</div>';
    } else {
      html += '<div class="sct-tech-list">';
      this.techniques.forEach(tid => {
        const t = SECT_TECHNIQUES.find(tt => tt.id === tid);
        if (!t || t.cost <= 0) return; // 跳过免费的吐纳术（人人都会）
        const gk = t.gradeKey || 'mortal';
        // 检查哪些弟子还没学这个
        const needIt = normalDiscs.filter(d => !d.techniques.includes(tid));
        if (needIt.length === 0) return;
        html += '<div class="sct-tech-card">'
          + '<div><div class="tch-name">' + t.name + '</div>'
          + '<div class="tch-info">' + Object.entries(t.effect).map(([k, v]) => k + ' +' + v + '%').join(' | ') + '</div>'
          + '<div style="font-size:9px;color:var(--dim)">未学: ' + needIt.map(d => d.name).join('、') + '</div></div>'
          + '<div style="text-align:right">'
          + '<span class="tch-grade ' + gk + '">' + t.grade + '</span>'
          + '<div style="margin-top:4px"><select id="sct-tech-disc-' + t.id + '" class="sct-task-select" style="font-size:10px">'
          + needIt.map(d => '<option value="' + d.id + '">' + d.name + '</option>').join('')
          + '</select>'
          + '<button class="t-btn" style="margin-top:2px" onclick="SECT._teachTechnique(\'' + t.id + '\')">传授 1⚡</button>'
          + '</div></div></div>';
      });
      html += '</div>';
    }

    // 可购买的新功法
    html += '<div style="font-size:11px;color:var(--amber);margin:12px 0 8px">🛒 购买新功法（解锁+传授选定的弟子）</div>';
    const available = SECT_TECHNIQUES.filter(t => {
      if (this.techniques.includes(t.id)) return false;
      if (t.reqLv > this.level) return false;
      if (t.reqBuilding === 'library' && (!libraryBld || libraryBld.lv < 1)) return false;
      if (t.cost <= 0) return false;
      return true;
    });

    if (available.length === 0) {
      html += '<div style="text-align:center;color:var(--dim);padding:8px;font-size:11px">暂无可购买的新功法<br><span style="opacity:.6">Lv.1-2: 人阶 | Lv.3+: 黄阶 | 需藏经阁</span></div>';
    } else if (normalDiscs.length === 0) {
      html += '<div style="text-align:center;color:var(--dim);padding:8px;font-size:11px">没有弟子可学习新功法</div>';
    } else {
      html += '<div class="sct-tech-list">';
      available.forEach(t => {
        const gk = t.gradeKey || 'mortal';
        const canAfford = this.spiritStones >= t.cost && this.actionPoints >= 1;
        html += '<div class="sct-tech-card">'
          + '<div><div class="tch-name">' + t.name + '</div>'
          + '<div class="tch-info">' + Object.entries(t.effect).map(([k, v]) => k + ' +' + v + '%').join(' | ') + '</div></div>'
          + '<div style="text-align:right">'
          + '<span class="tch-grade ' + gk + '">' + t.grade + '</span>'
          + '<div style="margin-top:4px"><select id="sct-tech-disc-' + t.id + '" class="sct-task-select" style="font-size:10px">'
          + normalDiscs.map(d => '<option value="' + d.id + '">' + d.name + '</option>').join('')
          + '</select>'
          + '<button class="t-btn" style="margin-top:2px" ' + (canAfford ? '' : 'disabled') + ' onclick="SECT._learnTechnique(\'' + t.id + '\')">'
          + t.cost + '💎 1⚡</button></div></div></div>';
      });
      html += '</div>';
    }
    html += '<div style="text-align:center;margin-top:12px"><button class="t-btn" onclick="SECT._closeModal()">关闭</button></div>';

    this._showModal(null, html, null);
  },

  _teachTechnique(techId) {
    const sel = document.getElementById('sct-tech-disc-' + techId);
    const discId = sel?.value;
    if (!discId) return;
    const d = this.disciples.find(dd => dd.id === discId);
    if (!d) return;
    if (d.techniques.includes(techId)) return;
    if (this.actionPoints < 1) return;
    this.actionPoints -= 1;
    d.techniques.push(techId);
    this._addLog('good', d.name + ' 习得功法「' + (SECT_TECHNIQUES.find(tt => tt.id === techId)?.name || '') + '」！');
    this._closeModal();
    this.save();
    this._render();
  },

  _learnTechnique(techId) {
    const t = SECT_TECHNIQUES.find(tt => tt.id === techId);
    if (!t || this.techniques.includes(t.id)) return;
    if (this.spiritStones < t.cost) return;
    if (this.actionPoints < 1) return;
    const sel = document.getElementById('sct-tech-disc-' + techId);
    const discId = sel?.value;
    if (!discId) return;
    const d = this.disciples.find(dd => dd.id === discId);
    if (!d) return;

    this.spiritStones -= t.cost;
    this.actionPoints -= 1;
    this.techniques.push(t.id);      // 宗门解锁
    d.techniques.push(t.id);         // 弟子习得
    this._addLog('good', '解锁功法「' + t.name + '」！' + d.name + ' 已习得。');
    this.save();
    this._closeModal();
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
