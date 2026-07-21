/* ═══════════════════════════════════════════════
   cardgame.js — 勇者牌局
   月圆之夜风格 回合制卡牌 Roguelike（战士首发）
   数据驱动：卡牌效果 = JSON 原子操作序列
   ═══════════════════════════════════════════════ */

// ═══════════════ 1. 常量 ═══════════════
const CR_APPSCRIPT = 'https://script.google.com/macros/s/AKfycbyDR6xKzyevIhi3e1zgWC8KvnWH2JaB7ni7Eo_Md7SKknRASUOtRt8Hj_02470Z-CmV3w/exec';
const CR_SAVE_KEY   = 'cardrogue_save';

// ═══════════════ 2. 卡牌数据 ═══════════════
// 效果语法：{op, target?, value?, status?, condition?, then?, else?,
//            effect?, collection?, times?, piercing?, trigger?, turns?, options?}

const WX_CARDS = {

// ── 初始牌组（战士基础卡，数值固定） ──────────────────
starter_strike: {
  id:'starter_strike', name:'斩击', type:'attack', cost:{ap:1},
  desc:'造成 6 点伤害',
  effects:[{op:'damage', target:'enemy', value:6}],
  keywords:['伤害']
},
starter_defend: {
  id:'starter_defend', name:'格挡', type:'action', cost:{ap:1},
  desc:'获得 5 点护甲',
  effects:[{op:'gain_armor', value:5}],
  keywords:['护甲']
},
starter_heavy: {
  id:'starter_heavy', name:'重击', type:'attack', cost:{ap:2},
  desc:'造成 10 点伤害',
  effects:[{op:'damage', target:'enemy', value:10}],
  keywords:['伤害']
},

// ── 战士卡池（女骑士 48 张精选 ~35 张核心卡） ──────────────────

// === 攻击牌 ===
slash: {
  id:'slash', name:'迅捷攻击', type:'attack', cost:{ap:1},
  desc:'造成 5 点伤害，抽 1 张牌',
  effects:[{op:'damage', target:'enemy', value:5}, {op:'draw', value:1}],
  keywords:['伤害','抽牌']
},
double_strike: {
  id:'double_strike', name:'二次打击', type:'attack', cost:{ap:1},
  desc:'造成 2 点伤害，抽 2 张牌',
  effects:[{op:'damage', target:'enemy', value:2}, {op:'draw', value:2}],
  keywords:['伤害','抽牌']
},
shatter: {
  id:'shatter', name:'粉碎', type:'attack', cost:{ap:3},
  desc:'造成 15 点伤害',
  effects:[{op:'damage', target:'enemy', value:15}],
  keywords:['伤害','高费']
},
deadly_weapon: {
  id:'deadly_weapon', name:'致命武器', type:'attack', cost:{ap:2},
  desc:'每有 1 件装备，造成 1 次 2 点伤害',
  effects:[{op:'repeat', times:{scaled_by:'equipment_count'}, effect:[{op:'damage', target:'enemy', value:2}]}],
  keywords:['伤害','装备']
},
holy_strike: {
  id:'holy_strike', name:'神圣攻击', type:'attack', cost:{ap:2},
  desc:'造成 4 点伤害，恢复等量生命',
  effects:[{op:'damage', target:'enemy', value:4}, {op:'heal', value:4}],
  keywords:['伤害','恢复']
},
reckless_blow: {
  id:'reckless_blow', name:'舍命相搏', type:'attack', cost:{ap:2},
  desc:'造成 9 点伤害，对自己造成 1 点穿刺伤害',
  effects:[{op:'damage', target:'enemy', value:9}, {op:'damage', target:'self', value:1, piercing:true}],
  keywords:['伤害','自伤']
},
fury_strike: {
  id:'fury_strike', name:'怒火攻击', type:'attack', cost:{ap:1},
  desc:'造成 5 点伤害，已损失生命每有 5 点伤害 +1',
  effects:[{op:'damage', target:'enemy', value:5, scaling:'lost_hp_div5'}],
  keywords:['伤害','生命']
},
spike_shield: {
  id:'spike_shield', name:'尖刺盾牌', type:'attack', cost:{ap:1},
  desc:'造成 5 点伤害，直到下回合自己受到伤害 -1',
  effects:[{op:'damage', target:'enemy', value:5}, {op:'gain_armor', value:1}],
  keywords:['伤害','护甲']
},
storm_strike: {
  id:'storm_strike', name:'风暴攻击', type:'attack', cost:{ap:2},
  desc:'造成 6 点伤害，本回合造成伤害 +1',
  effects:[{op:'damage', target:'enemy', value:6}, {op:'add_strength', value:1}],
  keywords:['伤害','力量']
},
boxing: {
  id:'boxing', name:'拳击', type:'attack', cost:{ap:1},
  desc:'移除。造成 5 点伤害，获得 1 张普通攻击',
  effects:[{op:'damage', target:'enemy', value:5}, {op:'add_card', card_id:'starter_strike', location:'hand'}],
  keywords:['伤害','移除','生成'],
  exhaust:true
},
soul_strike: {
  id:'soul_strike', name:'灵魂打击', type:'attack', cost:{ap:2},
  desc:'造成 5 点伤害，击杀敌方永久获得 +2 最大生命',
  effects:[{op:'damage', target:'enemy', value:5}, {op:'if_kill', effect:[{op:'gain_max_hp', value:2}]}],
  keywords:['伤害','生命']
},
fearless: {
  id:'fearless', name:'无畏', type:'attack', cost:{ap:0},
  desc:'抽 3 张牌，下回合少抽 1 张牌',
  effects:[{op:'draw', value:3}, {op:'next_draw_mod', value:-1}],
  keywords:['抽牌','负面']
},

// === 行动牌 ===
shield_bash: {
  id:'shield_bash', name:'绝对防御', type:'action', cost:{ap:1},
  desc:'获得 6 点护甲，抽 1 张牌',
  effects:[{op:'gain_armor', value:6}, {op:'draw', value:1}],
  keywords:['护甲','抽牌']
},
stone_skin: {
  id:'stone_skin', name:'石化皮肤', type:'action', cost:{ap:1},
  desc:'移除。获得 4 点护甲，直到下回合受到伤害 -2',
  effects:[{op:'gain_armor', value:4}, {op:'damage_reduction', value:2}],
  keywords:['护甲','移除'],
  exhaust:true
},
preparation: {
  id:'preparation', name:'筹谋', type:'action', cost:{ap:1},
  desc:'抽 1 张牌，本回合下次攻击伤害翻倍',
  effects:[{op:'draw', value:1}, {op:'next_attack_doubled'}],
  keywords:['抽牌','增伤']
},
weakness_scout: {
  id:'weakness_scout', name:'弱点侦查', type:'action', cost:{ap:1},
  desc:'本回合下次攻击伤害翻倍',
  effects:[{op:'next_attack_doubled'}],
  keywords:['增伤']
},
greed: {
  id:'greed', name:'贪婪', type:'action', cost:{ap:1},
  desc:'抽 5 张牌，丢弃所有非攻击牌',
  effects:[{op:'draw', value:5}, {op:'discard_type', type:'non_attack'}],
  keywords:['抽牌','弃牌']
},
loyalty: {
  id:'loyalty', name:'忠诚', type:'action', cost:{ap:0},
  desc:'移除。获得 1 点行动力，受到 1 点穿刺伤害，抽 1 张牌',
  effects:[{op:'gain_ap', value:1}, {op:'damage', target:'self', value:1, piercing:true}, {op:'draw', value:1}],
  keywords:['行动力','自伤','移除'],
  exhaust:true
},
raid: {
  id:'raid', name:'突袭', type:'action', cost:{ap:0},
  desc:'移除。抽 3 张牌',
  effects:[{op:'draw', value:3}],
  keywords:['抽牌','移除'],
  exhaust:true
},
power_blessing: {
  id:'power_blessing', name:'力量祝福', type:'action', cost:{ap:1},
  desc:'本回合造成伤害 +3',
  effects:[{op:'add_strength', value:3}],
  keywords:['力量']
},
death_guard: {
  id:'death_guard', name:'死守', type:'action', cost:{ap:1},
  desc:'丢弃所有手牌，每丢弃 1 张获得 6 点护甲',
  effects:[{op:'discard_all'}, {op:'per_discard', effect:[{op:'gain_armor', value:6}]}],
  keywords:['弃牌','护甲']
},
pain_endure: {
  id:'pain_endure', name:'苦守', type:'action', cost:{ap:1},
  desc:'受到 1 点穿刺伤害，获得 10 点护甲，抽 1 张牌',
  effects:[{op:'damage', target:'self', value:1, piercing:true}, {op:'gain_armor', value:10}, {op:'draw', value:1}],
  keywords:['自伤','护甲','抽牌']
},
angel_protection: {
  id:'angel_protection', name:'天使庇护', type:'action', cost:{ap:2},
  desc:'获得 10 点护甲',
  effects:[{op:'gain_armor', value:10}],
  keywords:['护甲']
},
crash: {
  id:'crash', name:'撞击', type:'action', cost:{ap:2},
  desc:'造成当前生命 30% 的伤害',
  effects:[{op:'damage', target:'enemy', value:0, scaling:'hp_30pct'}],
  keywords:['伤害','生命']
},
brave_heart: {
  id:'brave_heart', name:'勇敢的心', type:'action', cost:{ap:1},
  desc:'抽 1 张牌，获得 1 张随机攻击牌',
  effects:[{op:'draw', value:1}, {op:'add_random_card', type:'attack', location:'hand'}],
  keywords:['抽牌','生成']
},
battle_horn: {
  id:'battle_horn', name:'战斗号角', type:'action', cost:{ap:1},
  desc:'移除。本回合每使用 1 张攻击牌，抽 1 张牌',
  effects:[{op:'set_flag', flag:'draw_on_attack'}],
  keywords:['移除','抽牌'],
  exhaust:true
},
superb_collection: {
  id:'superb_collection', name:'绝妙收藏', type:'action', cost:{ap:1},
  desc:'移除。获得 6 点护甲，获得 1 张随机装备牌',
  effects:[{op:'gain_armor', value:6}, {op:'add_random_card', type:'equipment', location:'hand'}],
  keywords:['护甲','装备','移除'],
  exhaust:true
},
short_combat: {
  id:'short_combat', name:'短兵相接', type:'action', cost:{ap:1},
  desc:'移除。装备 1 把短剑和 1 个圆盾',
  effects:[{op:'add_card', card_id:'short_sword', location:'hand'}, {op:'add_card', card_id:'round_shield', location:'hand'}],
  keywords:['装备','移除'],
  exhaust:true
},

// === 装备牌 ===
toxic_dagger: {
  id:'toxic_dagger', name:'剧毒匕首', type:'equipment', cost:{ap:2},
  desc:'每使用 2 张攻击牌，敌方获得 1 点中毒',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'on_attack_played', every:2, effects:[{op:'apply_status', target:'enemy', status:'poison', value:1}]},
  keywords:['装备','中毒']
},
angel_mirror: {
  id:'angel_mirror', name:'天使手镜', type:'equipment', cost:{ap:2},
  desc:'回合开始时复制 1 张牌组中非装备牌到手牌',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'start_of_turn', effects:[{op:'copy_random_card', not_type:'equipment', location:'hand'}]},
  keywords:['装备','复制']
},
dragon_scale: {
  id:'dragon_scale', name:'龙鳞铠甲', type:'equipment', cost:{ap:2},
  desc:'受到的所有伤害 -1',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'on_damage_taken', effects:[{op:'damage_reduction', value:1}]},
  keywords:['装备','减伤']
},
round_shield: {
  id:'round_shield', name:'圆盾', type:'equipment', cost:{ap:1},
  desc:'回合开始时获得 4 点护甲',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'start_of_turn', effects:[{op:'gain_armor', value:4}]},
  keywords:['装备','护甲']
},
martyr_armor: {
  id:'martyr_armor', name:'殉道铠甲', type:'equipment', cost:{ap:1},
  desc:'回合开始时受到 1 点穿刺伤害，获得 5 点护甲',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'start_of_turn', effects:[{op:'damage', target:'self', value:1, piercing:true}, {op:'gain_armor', value:5}]},
  keywords:['装备','自伤','护甲']
},
horseshoe: {
  id:'horseshoe', name:'马蹄铁', type:'equipment', cost:{ap:1},
  desc:'回合开始时每有 1 件装备获得 1 点护甲',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'start_of_turn', effects:[{op:'gain_armor_per_equipment', value:1}]},
  keywords:['装备','护甲']
},
thunder_blade: {
  id:'thunder_blade', name:'雷刃', type:'equipment', cost:{ap:2},
  desc:'每使用 1 张攻击牌，造成 1 点伤害',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'on_attack_played', every:1, effects:[{op:'damage', target:'enemy', value:1}]},
  keywords:['装备','伤害']
},
flying_axe: {
  id:'flying_axe', name:'飞斧', type:'equipment', cost:{ap:2},
  desc:'每回合第 1 张攻击牌效果翻倍',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'on_first_attack', effects:[{op:'double_effect'}]},
  keywords:['装备','增伤']
},
short_sword: {
  id:'short_sword', name:'短剑', type:'equipment', cost:{ap:1},
  desc:'每使用 2 张攻击牌，造成 1 点伤害',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'on_attack_played', every:2, effects:[{op:'damage', target:'enemy', value:1}]},
  keywords:['装备','伤害']
},
vampire_sword: {
  id:'vampire_sword', name:'吸血鬼剑', type:'equipment', cost:{ap:2},
  desc:'每累计造成 4 点伤害，获得 1 点生命',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'on_damage_dealt', per_damage:4, effects:[{op:'heal', value:1}]},
  keywords:['装备','恢复']
},
spike_armor: {
  id:'spike_armor', name:'尖刺壁垒', type:'equipment', cost:{ap:2},
  desc:'回合结束时每有 4 点护甲，造成 1 点伤害',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'end_of_turn', effects:[{op:'damage_per_armor', value:4}]},
  keywords:['装备','伤害','护甲']
},
strange_rune: {
  id:'strange_rune', name:'古怪符文', type:'equipment', cost:{ap:2},
  desc:'敌方回合受到的伤害 +3',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'enemy_turn_damage', effects:[{op:'bonus_damage', value:3}]},
  keywords:['装备','增伤']
},

// ── 通用/中立卡（13 张） ──────────────────
backstab: {
  id:'backstab', name:'背刺', type:'attack', cost:{ap:0},
  desc:'造成 2 点伤害。本回合每使用 1 张行动牌，此牌伤害 +1',
  effects:[{op:'damage', target:'enemy', value:2, scaling:'actions_this_turn'}],
  keywords:['伤害','行动']
},
faith_nature: {
  id:'faith_nature', name:'信仰自然', type:'action', cost:{ap:1},
  desc:'抽 1 张牌，使其伤害翻倍',
  effects:[{op:'draw', value:1}, {op:'boost_drawn_card'}],
  keywords:['抽牌','增伤']
},
mana_potion: {
  id:'mana_potion', name:'法力', type:'mana', cost:{ap:0},
  desc:'获得 3 点法力',
  effects:[{op:'gain_mana', value:3}],
  keywords:['法力']
},
taunt: {
  id:'taunt', name:'嘲讽', type:'action', cost:{ap:0},
  desc:'双方各抽 3 张牌，敌方丢弃所有非攻击牌',
  effects:[{op:'draw', value:3}, {op:'enemy_discard_type', type:'non_attack'}],
  keywords:['抽牌','弃牌']
},
dismount: {
  id:'dismount', name:'下马威', type:'counter', cost:{ap:1},
  desc:'敌方使用攻击牌时：造成 6 点伤害，抽 1 张牌',
  effects:[{op:'set_counter', trigger:'enemy_uses_attack', effects:[{op:'damage', target:'enemy', value:6}, {op:'draw', value:1}]}],
  keywords:['反制','伤害','抽牌']
},
sprint: {
  id:'sprint', name:'飞奔', type:'action', cost:{ap:0},
  desc:'行动力 +2，抽 2 张牌',
  effects:[{op:'gain_ap', value:2}, {op:'draw', value:2}],
  keywords:['行动力','抽牌']
},
creature: {
  id:'creature', name:'生灵', type:'spell', cost:{mana:1},
  desc:'造成 5 点穿刺伤害',
  effects:[{op:'damage', target:'enemy', value:5, piercing:true}],
  keywords:['伤害','穿刺']
},
berserk_axe: {
  id:'berserk_axe', name:'狂战斧', type:'equipment', cost:{ap:2},
  desc:'每使用 1 张普通攻击，将 1 张复制加入手牌',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'on_card_played', card_type:'attack', filter:'starter', effects:[{op:'copy_to_hand'}]},
  keywords:['装备','复制']
},
element_wave: {
  id:'element_wave', name:'元素波动', type:'spell', cost:{mana:2},
  desc:'造成 2 点火属性 + 2 点水属性 + 2 点雷属性伤害',
  effects:[{op:'damage', target:'enemy', value:6}],
  keywords:['伤害','元素']
},
execute: {
  id:'execute', name:'处决', type:'action', cost:{ap:2},
  desc:'造成 2 点伤害，敌方生命 < 30% 时造成 10 倍伤害',
  effects:[{op:'if', condition:{type:'hp_pct_lt', target:'enemy', value:30}, then:[{op:'damage', target:'enemy', value:20}], else:[{op:'damage', target:'enemy', value:2}]}],
  keywords:['伤害','条件']
},
moonlight_codex: {
  id:'moonlight_codex', name:'月光法典', type:'equipment', cost:{ap:1},
  desc:'回合开始时获得 3 点法力',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'start_of_turn', effects:[{op:'gain_mana', value:3}]},
  keywords:['装备','法力']
},
original_recipe: {
  id:'original_recipe', name:'原始配方', type:'equipment', cost:{ap:1},
  desc:'回合开始时移除，抽 1 张牌获得 3 点法力',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'start_of_turn', effects:[{op:'gain_mana', value:3}, {op:'draw', value:1}, {op:'remove_this_equipment'}]},
  keywords:['装备','法力','抽牌']
},
beast_trap: {
  id:'beast_trap', name:'捕兽夹', type:'equipment', cost:{ap:1},
  desc:'敌方每次使用攻击牌，对其造成 1 点伤害，其每有 1 张手牌伤害 +1',
  effects:[{op:'equip_this'}],
  equip_effect:{trigger:'enemy_uses_attack', effects:[{op:'damage', target:'enemy', value:1, scaling:'enemy_hand_size'}]},
  keywords:['装备','反制','伤害']
},

// 临时牌（系统生成，不在卡池中）
_tmp_shuriken: {
  id:'_tmp_shuriken', name:'流星镖', type:'attack', cost:{ap:0},
  desc:'造成 1 点伤害',
  effects:[{op:'damage', target:'enemy', value:1}],
  keywords:['临时','伤害']
},
_tmp_strike_iii: {
  id:'_tmp_strike_iii', name:'打击III', type:'attack', cost:{ap:1},
  desc:'造成 9 点伤害',
  effects:[{op:'damage', target:'enemy', value:9}],
  keywords:['伤害']
},
_tmp_prank: {
  id:'_tmp_prank', name:'恶作剧', type:'attack', cost:{ap:0},
  desc:'造成 2 点伤害',
  effects:[{op:'damage', target:'enemy', value:2}],
  keywords:['临时','伤害']
}
};

// 初始牌组
const STARTER_DECK = [
  'starter_strike','starter_strike','starter_strike','starter_strike','starter_strike',
  'starter_defend','starter_defend','starter_defend',
  'starter_heavy','starter_heavy'
];

// 战士完整卡池（不含初始牌）
const WARRIOR_POOL = [
  'slash','double_strike','shatter','deadly_weapon','holy_strike',
  'reckless_blow','fury_strike','spike_shield','storm_strike','boxing',
  'soul_strike','fearless',
  'shield_bash','stone_skin','preparation','weakness_scout','greed',
  'loyalty','raid','power_blessing','death_guard','pain_endure',
  'angel_protection','crash','brave_heart','battle_horn','superb_collection','short_combat',
  'toxic_dagger','angel_mirror','dragon_scale','round_shield','martyr_armor',
  'horseshoe','thunder_blade','flying_axe','short_sword','vampire_sword',
  'spike_armor','strange_rune'
];

// 通用卡池
const NEUTRAL_POOL = [
  'backstab','faith_nature','mana_potion','taunt','dismount',
  'sprint','creature','berserk_axe','element_wave','execute',
  'moonlight_codex','original_recipe','beast_trap'
];

// ═══════════════ 3. 怪物数据 ═══════════════
// intent: {type, val, desc, status?}
// type: 'attack'|'defend'|'buff'|'debuff'
const MONSTERS = {
  ch1: [
    { // 暗影狼
      id:'shadow_wolf', name:'暗影狼', hp:28, tier:'normal',
      intents:[
        {type:'attack', val:8, desc:'撕咬: 造成 8 伤害'},
        {type:'debuff', val:1, desc:'低吼: 施加 1 层虚弱', status:'weak', statusVal:1},
        {type:'attack', val:5, desc:'爪击: 造成 5 伤害'},
      ]
    },
    { // 毒液史莱姆
      id:'poison_slime', name:'毒液史莱姆', hp:22, tier:'normal',
      intents:[
        {type:'attack', val:4, desc:'喷射: 造成 4 伤害 + 2 层中毒', status:'poison', statusVal:2},
        {type:'defend', val:5, desc:'蜷缩: 获得 5 护甲'},
        {type:'attack', val:4, desc:'喷射: 造成 4 伤害 + 2 层中毒', status:'poison', statusVal:2},
      ]
    },
    { // 古树守卫
      id:'ancient_guard', name:'古树守卫', hp:35, tier:'normal',
      intents:[
        {type:'attack', val:6, desc:'树根鞭击: 造成 6 伤害'},
        {type:'attack', val:6, desc:'沉重一击: 造成 6 伤害'},
        {type:'defend', val:8, desc:'扎根: 获得 8 护甲'},
      ]
    },
    { // 哥布林掠夺者
      id:'goblin_raider', name:'哥布林掠夺者', hp:25, tier:'normal',
      intents:[
        {type:'attack', val:5, desc:'匕首: 造成 5 伤害'},
        {type:'attack', val:10, desc:'连刺: 造成 5 伤害 ×2', hits:2},
        {type:'defend', val:4, desc:'闪避: 获得 4 护甲'},
      ]
    },
    { // 第一章 Boss：树精之王
      id:'treant_king', name:'树精之王', hp:90, tier:'boss',
      intents:[
        {type:'attack', val:10, desc:'巨木横扫: 造成 10 伤害'},
        {type:'defend', val:12, desc:'树皮硬化: 获得 12 护甲'},
        {type:'attack', val:14, desc:'暴怒打击: 造成 14 伤害'},
      ],
      phase(b) {
        if (b.enemy.hp <= b.enemy.maxHp * 0.5 && !b.enemy._phased) {
          b.enemy._phased = true;
          b.enemy.strength = (b.enemy.strength || 0) + 2;
          return true; // 触发阶段切换提示
        }
        return false;
      },
      phaseMsg:'树精之王狂怒：力量 +2！'
    }
  ],
  ch2: [
    { // 骷髅守卫
      id:'skeleton_guard', name:'骷髅守卫', hp:32, tier:'normal',
      intents:[
        {type:'attack', val:8, desc:'挥砍: 造成 8 伤害'},
        {type:'attack', val:8, desc:'盾击: 造成 8 伤害'},
        {type:'attack', val:12, desc:'劈斩: 造成 12 伤害'},
      ]
    },
    { // 暗影法师
      id:'shadow_mage', name:'暗影法师', hp:38, tier:'elite',
      intents:[
        {type:'debuff', val:1, desc:'暗影诅咒: 施加 1 层虚弱 + 造成 5 伤害', status:'weak', statusVal:1, atk:5},
        {type:'attack', val:10, desc:'暗影箭: 造成 10 伤害'},
        {type:'buff', val:6, desc:'暗影护盾: 获得 6 护甲 + 1 力量', shield:6, selfBuff:'strength', buffVal:1},
      ]
    },
    { // 第二章 Boss：亡灵骑士
      id:'death_knight', name:'亡灵骑士', hp:130, tier:'boss',
      intents:[
        {type:'attack', val:12, desc:'死亡打击: 造成 12 伤害'},
        {type:'attack', val:15, desc:'暗影突刺: 造成 15 伤害'},
        {type:'defend', val:15, desc:'亡灵盾墙: 获得 15 护甲'},
      ],
      phase(b) {
        if (b.enemy.hp <= b.enemy.maxHp * 0.5 && !b.enemy._phased) {
          b.enemy._phased = true;
          b.enemy.strength = (b.enemy.strength || 0) + 3;
          return true;
        }
        return false;
      },
      phaseMsg:'亡灵骑士狂暴：力量 +3！'
    }
  ],
  ch3: [
    { // 深渊蠕虫
      id:'abyss_worm', name:'深渊蠕虫', hp:50, tier:'normal',
      intents:[
        {type:'attack', val:12, desc:'撕咬: 造成 12 伤害'},
        {type:'debuff', val:3, desc:'毒液喷射: 造成 8 伤害 + 3 层中毒', status:'poison', statusVal:3, atk:8},
        {type:'defend', val:99, desc:'钻地: 获得大量护甲'},
      ]
    },
    { // 火焰元素
      id:'fire_elemental', name:'火焰元素', hp:42, tier:'elite',
      intents:[
        {type:'attack', val:8, desc:'火球: 造成 8 伤害 + 2 层灼烧', status:'burn', statusVal:2},
        {type:'attack', val:14, desc:'烈焰风暴: 造成 14 伤害'},
        {type:'attack', val:6, desc:'焚尽: 造成 6 伤害 + 灼烧翻倍', status:'burn', statusVal:1},
      ]
    },
    { // 第三章 Boss：深渊之主
      id:'abyss_lord', name:'深渊之主', hp:180, tier:'boss',
      intents:[
        {type:'attack', val:14, desc:'虚空撕裂: 造成 14 伤害'},
        {type:'debuff', val:3, desc:'深渊之焰: 造成 10 伤害 + 3 层灼烧', status:'burn', statusVal:3, atk:10},
        {type:'attack', val:18, desc:'毁灭打击: 造成 18 伤害'},
        {type:'defend', val:20, desc:'虚空屏障: 获得 20 护甲'},
      ],
      phase(b) {
        if (b.enemy.hp <= b.enemy.maxHp * 0.5 && !b.enemy._phased) {
          b.enemy._phased = true;
          b.enemy.strength = (b.enemy.strength || 0) + 4;
          return true;
        }
        return false;
      },
      phaseMsg:'深渊之主觉醒：力量 +4！'
    }
  ]
};

// 随机怪物选择
function _pickMonster(chapter, elite) {
  const pool = MONSTERS['ch' + chapter].filter(m => {
    if (elite) return m.tier === 'elite';
    return m.tier === 'normal';
  });
  if (pool.length === 0) return MONSTERS['ch' + chapter].filter(m => m.tier === 'normal')[0];
  return pool[Math.floor(Math.random() * pool.length)];
}
function _pickBoss(chapter) {
  return MONSTERS['ch' + chapter].find(m => m.tier === 'boss');
}

// ═══════════════ 4. 遗物 ═══════════════
const RELICS = {
  common: [
    {id:'mini_shield',name:'迷你护盾',rarity:'common',desc:'最大生命 +5，每次战斗开始时获得 5 点护甲',
     onGet(s){s.maxHp+=5;s.hp+=5;}, onBattleStart(b){b.player.shield+=5;}},
    {id:'sword_training',name:'剑术训练',rarity:'common',desc:'造成的伤害 +1',
     onGet(s){s.bonusDmg=(s.bonusDmg||0)+1;}},
    {id:'time_hourglass',name:'时间沙漏',rarity:'common',desc:'基础行动力 +1',
     onGet(s){s.extraAp=(s.extraAp||0)+1;}},
    {id:'campfire',name:'营地篝火',rarity:'common',desc:'升级时额外获得 1 张牌',
     onGet(s){s.extraCardOnUpgrade=true;}},
    {id:'gold_pile',name:'大钱堆',rarity:'common',desc:'金币 +40',onGet(s){s.gold+=40;}},
    {id:'eagle_alert',name:'鹰之警觉',rarity:'common',desc:'每场战斗无效敌方第 1 张牌',
     onBattleStart(b){b.player._eagle=true;}},
    {id:'spider_poison',name:'蜘蛛之毒',rarity:'common',desc:'每回合使敌方获得 2 层中毒',
     onBattleStart(b){}/*handled in startTurn*/},
    {id:'ninja_star',name:'流星镖',rarity:'common',desc:'回合结束时获得临时流星镖（造成 1 伤害）',
     onBattleStart(b){}/*handled in endTurn*/},
    {id:'preparation2',name:'早有准备',rarity:'common',desc:'装备槽 +1，回合开始额外抽 1 张牌，回合结束时丢弃所有手牌',
     onGet(s){s.equipSlots=(s.equipSlots||1)+1;}},
    {id:'blood_bandage',name:'止血绷带',rarity:'common',desc:'使用行动牌时恢复 1 点生命',
     onBattleStart(b){b.player._bandage=true;}},
  ],
  rare: [
    {id:'phoenix_feather',name:'凤凰羽毛',rarity:'rare',desc:'下次死亡时复活并恢复 50% 生命',
     onGet(s){s._phoenix=true;}},
    {id:'energy_crystal',name:'能量水晶',rarity:'rare',desc:'每回合 AP +1',
     onGet(s){s.extraAp=(s.extraAp||0)+1;}},
    {id:'vampire_fang',name:'吸血鬼之牙',rarity:'rare',desc:'造成伤害的 20% 恢复生命',
     onBattleStart(b){b.player._vampire=true;}},
    {id:'thorn_armor',name:'反伤刺甲',rarity:'rare',desc:'受到攻击时反弹 3 点伤害',
     onBattleStart(b){b.player._thorns=3;}},
    {id:'frost_heart',name:'冰霜之心',rarity:'rare',desc:'每回合使敌方获得 1 层虚弱',
     onBattleStart(b){}/*handled in startTurn*/},
    {id:'berserker_charm',name:'狂战士护符',rarity:'rare',desc:'HP < 50% 时力量翻倍'},
    {id:'toy_box',name:'玩具盒',rarity:'rare',desc:'回合开始+结束时，装备效果触发 2 次'},
    {id:'giant_growth',name:'巨大化',rarity:'rare',desc:'造成 ≥10 点伤害时翻倍（每战 1 次）',
     onBattleStart(b){b.player._giant=true;}},
  ],
  pandora: [
    {id:'devil_codex',name:'恶魔法典',rarity:'pandora',desc:'抽牌数 +1，基础行动力 -1，最大生命 -8',
     onGet(s){s.maxHp-=8;s.hp=Math.min(s.hp,s.maxHp);s.extraAp=(s.extraAp||0)-1;s.extraDraw=(s.extraDraw||0)+1;}},
    {id:'double_sword',name:'双头剑',rarity:'pandora',desc:'造成伤害 +1，受到伤害 +1',
     onGet(s){s.bonusDmg=(s.bonusDmg||0)+1;s.extraDmgTaken=(s.extraDmgTaken||0)+1;}},
    {id:'death_contract',name:'亡者契约',rarity:'pandora',desc:'当前生命 -15，最大生命 +15',
     onGet(s){s.maxHp+=15;s.hp=Math.max(1,s.hp-15);}},
  ]
};

// ═══════════════ 5. 天赋 ═══════════════
const TALENTS = [
  {id:'nature_blessing', name:'自然祝福', icon:'🌿',
   desc:'每场战斗开始回复 5 点生命',
   onPick(s){s._talent='nature_blessing';},
   onBattleStart(b){b.player.hp=Math.min(b.player.maxHp,b.player.hp+5);}},
  {id:'warrior_soul', name:'战士之魂', icon:'⚔️',
   desc:'永久力量 +2',
   onPick(s){s._talent='warrior_soul';s.bonusStrength=(s.bonusStrength||0)+2;},
   onBattleStart(b){b.player.strength=(b.player.strength||0)+(b.playerState.bonusStrength||2);}},
  {id:'iron_wall', name:'铁壁', icon:'🛡️',
   desc:'最大生命 +15',
   onPick(s){s._talent='iron_wall';s.maxHp+=15;s.hp+=15;}},
];

// ═══════════════ 6. 效果解释器 ═══════════════
const FX = {
  // 主入口：执行效果数组
  execute(b, effects, ctx) {
    if (!effects) return;
    if (!Array.isArray(effects)) effects = [effects];
    const log = [];
    for (const fx of effects) {
      const r = this._run(fx, b, ctx);
      if (r) log.push(r);
    }
    return log;
  },

  _run(fx, b, ctx) {
    // ctx: { cardDef, handIdx } — 出牌上下文
    switch (fx.op) {
      case 'damage':       return this._dmg(fx, b, ctx);
      case 'gain_armor':    return this._armor(fx, b);
      case 'heal':         return this._heal(fx, b);
      case 'gain_mana':    b.player.mana = Math.min(b.player.maxMana, b.player.mana + (fx.value || 0)); return null;
      case 'gain_ap':      b.player.ap = Math.min(b.player.maxAp, b.player.ap + (fx.value || 0)); return null;
      case 'add_strength': b.player.strength = (b.player.strength || 0) + (fx.value || 0); return '力量 +' + fx.value;
      case 'draw':         return this._draw(fx, b);
      case 'discard_all':   return this._discardAll(fx, b);
      case 'discard_type':  return this._discardType(fx, b);
      case 'per_discard':   return this._perDiscard(fx, b);
      case 'next_draw_mod': b.player._nextDrawMod = (b.player._nextDrawMod || 0) + (fx.value || 0); return null;
      case 'next_attack_doubled': b.player._nextDbl = true; return '下次攻击伤害翻倍';
      case 'damage_reduction': b.player._dmgRed = (b.player._dmgRed || 0) + (fx.value || 0); return '伤害减免 +' + fx.value;
      case 'add_card':      return this._addCard(fx, b);
      case 'add_random_card': return this._addRandomCard(fx, b);
      case 'copy_random_card': return this._copyRandomCard(fx, b);
      case 'gain_max_hp':   return this._gainMaxHp(fx, b);
      case 'if_kill':       b._ifKill = fx.effect; return null; // 延迟结算
      case 'if':            return this._ifCond(fx, b, ctx);
      case 'repeat':        return this._repeat(fx, b, ctx);
      case 'apply_status':  return this._status(fx, b);
      case 'equip_this':    return this._equip(fx, b, ctx);
      case 'set_counter':   return this._setCounter(fx, b);
      case 'set_prayer':    return this._setPrayer(fx, b);
      case 'set_flag':      b.player[fx.flag] = true; return null;
      case 'gain_armor_per_equipment': return this._armorPerEquip(fx, b);
      case 'double_effect': b.player._doubler = true; return null;
      case 'copy_to_hand':  return this._copyPlayedCard(fx, b, ctx);
      case 'damage_per_armor': return this._dmgPerArmor(fx, b);
      case 'bonus_damage':  b.player._bonusDmg = (b.player._bonusDmg || 0) + (fx.value || 0); return null;
      case 'remove_this_equipment': b._removeEquip = true; return null;
      case 'boost_drawn_card': return this._boostDrawn(fx, b);
      case 'enemy_discard_type': return '敌方弃牌'; // TODO: implement enemy hand
      default:
        console.warn('FX: unknown op', fx.op);
        return null;
    }
  },

  // ── 伤害 ──
  _dmg(fx, b, ctx) {
    let raw = fx.value || 0;
    // 特殊缩放
    if (fx.scaling === 'lost_hp_div5') raw += Math.floor((b.player.maxHp - b.player.hp) / 5);
    if (fx.scaling === 'hp_30pct') raw = Math.floor(b.player.hp * 0.3);
    if (fx.scaling === 'actions_this_turn') raw += (b.player._actionsThisTurn || 0);
    if (fx.scaling === 'enemy_hand_size') raw += (b.enemy._handSize || 0);

    // 力量加成（只对敌人伤害生效）
    if (fx.target === 'enemy') raw += b.player.strength || 0;

    // bonus damage
    raw += b.player._bonusDmg || 0;

    // 状态修正
    const target = fx.target === 'self' ? b.player : b.enemy;
    const source = fx.target === 'self' ? b.player : b.player;

    // 虚弱（玩家攻击时）
    if (fx.target === 'enemy' && (b.player.weak || 0) > 0) raw = Math.floor(raw * 0.75);

    // 易伤（敌人受伤时）
    if (fx.target === 'enemy' && (b.enemy.vulnerable || 0) > 0) raw = Math.floor(raw * 1.5);

    // 易伤（自己受伤时）
    if (fx.target === 'self' && (b.player.vulnerable || 0) > 0) raw = Math.floor(raw * 1.5);

    // 狂战士护符：HP < 50% 力量翻倍
    if (fx.target === 'enemy' && b._hasRelic && b._hasRelic('berserker_charm') && b.player.hp < b.player.maxHp * 0.5) {
      raw += b.player.strength || 0; // double strength contribution
    }

    // 巨大化：单次 ≥10 伤害翻倍（每战 1 次）
    if (fx.target === 'enemy' && b.player._giant && raw >= 10 && !b._giantUsed) {
      raw *= 2; b._giantUsed = true;
    }

    // 下一次攻击翻倍
    if (fx.target === 'enemy' && b.player._nextDbl) {
      raw *= 2; b.player._nextDbl = false;
    }

    // 双头剑：伤害 +1
    if (fx.target === 'enemy') raw += 1; // handled by bonusDmg already

    raw = Math.max(fx.piercing ? 1 : 0, raw);

    // 护甲吸收
    if (!fx.piercing && target.shield > 0) {
      const absorbed = Math.min(target.shield, raw);
      target.shield -= absorbed;
      raw -= absorbed;
    }

    // 减伤
    if (fx.target === 'self') raw = Math.max(0, raw - (b.player._dmgRed || 0));

    if (fx.target === 'self') {
      // 双头剑：自己受伤 +1
      raw += 1;
    }

    target.hp = Math.max(0, target.hp - raw);

    // 荆棘
    if (fx.target === 'self' && b.player._thorns) {
      b.enemy.hp = Math.max(0, b.enemy.hp - b.player._thorns);
    }

    // 吸血
    if (fx.target === 'enemy' && b.player._vampire && raw > 0) {
      const heal = Math.max(1, Math.floor(raw * 0.2));
      b.player.hp = Math.min(b.player.maxHp, b.player.hp + heal);
    }

    // 捕兽夹额外伤害
    if (fx.target === 'self' && b._hasRelic && b._hasRelic('thorn_armor')) {
      // handled above with thorns
    }

    return (fx.target === 'self' ? '自伤 ' : '') + raw + ' 伤害';
  },

  // ── 护甲 ──
  _armor(fx, b) {
    b.player.shield += fx.value || 0;
    return '护甲 +' + fx.value;
  },
  _armorPerEquip(fx, b) {
    const n = b.equipment.length;
    const total = n * (fx.value || 1);
    b.player.shield += total;
    return '护甲 +' + total + '（' + n + '件装备）';
  },

  // ── 治疗 ──
  _heal(fx, b) {
    const amt = Math.min(fx.value || 0, b.player.maxHp - b.player.hp);
    b.player.hp += amt;
    return '恢复 ' + amt + ' 生命';
  },
  _gainMaxHp(fx, b) {
    b.player.maxHp += (fx.value || 0);
    b.player.hp += (fx.value || 0);
    return '最大生命 +' + fx.value;
  },

  // ── 抽牌 ──
  _draw(fx, b) {
    const n = fx.value || 1;
    let drawn = 0;
    for (let i = 0; i < n; i++) {
      if (b.drawPile.length === 0) {
        if (b.discardPile.length === 0) break;
        b.drawPile = [...b.discardPile];
        b.discardPile = [];
        _shuffle(b.drawPile);
      }
      if (b.hand.length >= b.player.handLimit) { b.discardPile.push(b.drawPile.pop()); continue; }
      b.hand.push(b.drawPile.pop());
      drawn++;
    }
    return drawn > 0 ? '抽 ' + drawn + ' 张牌' : null;
  },

  // ── 弃牌 ──
  _discardAll(fx, b) {
    const n = b.hand.length;
    while (b.hand.length) b.discardPile.push(b.hand.pop());
    b._lastDiscardCount = n;
    return '弃 ' + n + ' 张牌';
  },
  _discardType(fx, b) {
    let n = 0;
    // 丢弃所有非攻击牌
    const keep = [], disc = [];
    for (const c of b.hand) {
      const def = WX_CARDS[c];
      if (def && def.type === 'attack') keep.push(c);
      else disc.push(c);
    }
    b.hand = keep;
    b.discardPile.push(...disc);
    b._lastDiscardCount = disc.length;
    return '弃 ' + disc.length + ' 张非攻击牌';
  },
  _perDiscard(fx, b) {
    const n = b._lastDiscardCount || 0;
    if (!fx.effect) return null;
    for (let i = 0; i < n; i++) this.execute(b, fx.effect, {});
    return '每弃牌 +' + (fx.effect[0]?.value || 0) + ' ×' + n;
  },

  // ── 卡牌操作 ──
  _addCard(fx, b) {
    const loc = fx.location === 'hand' ? b.hand : b.discardPile;
    loc.push(fx.card_id);
    return '获得 ' + (WX_CARDS[fx.card_id]?.name || fx.card_id);
  },
  _addRandomCard(fx, b) {
    const pool = (fx.type === 'attack') ? WARRIOR_POOL.filter(id => WX_CARDS[id]?.type === 'attack')
               : (fx.type === 'equipment') ? WARRIOR_POOL.filter(id => WX_CARDS[id]?.type === 'equipment')
               : WARRIOR_POOL;
    if (pool.length === 0) return null;
    const id = pool[Math.floor(Math.random() * pool.length)];
    b.hand.push(id);
    return '获得 ' + (WX_CARDS[id]?.name || id);
  },
  _copyRandomCard(fx, b) {
    const pool = b.drawPile.concat(b.discardPile).filter(id => {
      const def = WX_CARDS[id];
      return def && def.type !== 'equipment';
    });
    if (pool.length === 0) return null;
    const id = pool[Math.floor(Math.random() * pool.length)];
    b.hand.push(id);
    return '复制 ' + (WX_CARDS[id]?.name || id);
  },
  _copyPlayedCard(fx, b, ctx) {
    if (ctx && ctx.cardDef) {
      b.hand.push(ctx.cardDef.id);
      return '复制 ' + ctx.cardDef.name;
    }
    return null;
  },
  _boostDrawn(fx, b) {
    // 刚抽到的卡牌伤害翻倍 — 标记最后抽的牌
    if (b.hand.length > 0) {
      b._boostedCard = b.hand[b.hand.length - 1];
    }
    return '抽到的牌伤害翻倍';
  },

  // ── 状态 ──
  _status(fx, b) {
    const target = fx.target === 'self' ? b.player : b.enemy;
    const key = fx.status;
    if (key === 'strength') {
      target.strength = (target.strength || 0) + (fx.value || 0);
    } else {
      target[key] = (target[key] || 0) + (fx.value || 0);
    }
    return (fx.target === 'self' ? '自己' : '敌方') + ' ' + _statusName(key) + ' +' + fx.value;
  },

  // ── 装备 ──
  _equip(fx, b, ctx) {
    if (!ctx || !ctx.cardDef) return null;
    if (b.equipment.length >= (b.player.equipSlots || 3)) return '装备槽已满';
    b.equipment.push({ id: ctx.cardDef.id, def: ctx.cardDef });
    return '已装备 ' + ctx.cardDef.name;
  },

  // ── 反制 ──
  _setCounter(fx, b) {
    b.counters.push({ trigger: fx.trigger, effects: fx.effects });
    return '设置反制牌';
  },

  // ── 祷告 ──
  _setPrayer(fx, b) {
    b.prayers.push({ turns: fx.turns || 3, effects: fx.effects });
    return '祷告 ' + fx.turns + ' 回合';
  },

  // ── 条件 ──
  _ifCond(fx, b, ctx) {
    const cond = fx.condition || {};
    let ok = false;
    switch (cond.type) {
      case 'hp_pct_lt':
        const target = cond.target === 'self' ? b.player : b.enemy;
        ok = target.hp < target.maxHp * (cond.value / 100);
        break;
      case 'hp_pct_gt':
        const tgt = cond.target === 'self' ? b.player : b.enemy;
        ok = tgt.hp > tgt.maxHp * (cond.value / 100);
        break;
    }
    return this.execute(b, ok ? fx.then : (fx.else || []), ctx);
  },

  // ── 循环/重复 ──
  _repeat(fx, b, ctx) {
    let n = 0;
    if (typeof fx.times === 'number') n = fx.times;
    else if (fx.times && fx.times.scaled_by === 'equipment_count') n = b.equipment.length;
    const log = [];
    for (let i = 0; i < n; i++) {
      if (fx.effect) {
        const r = this.execute(b, fx.effect, ctx);
        if (r) log.push(...r);
      }
    }
    return log.length ? log : null;
  },

  // ── 特殊 ──
  _dmgPerArmor(fx, b) {
    const threshold = fx.value || 4;
    const hits = Math.floor(b.player.shield / threshold);
    if (hits > 0) {
      for (let i = 0; i < hits; i++) this._dmg({op:'damage', target:'enemy', value:1}, b, {});
    }
    return '造成 ' + hits + ' 点伤害（护甲 ' + b.player.shield + '）';
  }
};

function _statusName(key) {
  const map = { poison:'中毒', burn:'灼烧', weak:'虚弱', vulnerable:'易伤', cold:'寒冷', strength:'力量' };
  return map[key] || key;
}
function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ═══════════════ 7. 战斗引擎 ═══════════════
const Battle = {
  create(state, enemyDef) {
    // 构建牌组：初始牌 + 获得的牌
    const deck = [...state.deck];
    // 复制牌组到 drawPile
    const drawPile = [...deck];
    _shuffle(drawPile);

    const b = {
      player: {
        hp: state.hp, maxHp: state.maxHp, shield: 0,
        ap: state.maxAp, maxAp: state.maxAp,
        mana: 3, maxMana: 3,
        strength: state.bonusStrength || 0,
        weak: 0, vulnerable: 0, poison: 0, burn: 0,
        handLimit: state.handLimit || 5,
        equipSlots: state.equipSlots || 1,
        _actionsThisTurn: 0
      },
      enemy: {
        hp: enemyDef.hp, maxHp: enemyDef.hp, shield: 0,
        strength: 0, weak: 0, vulnerable: 0, poison: 0, burn: 0,
        _phased: false
      },
      deck: deck,
      drawPile: drawPile,
      hand: [],
      discardPile: [],
      equipment: [],
      counters: [],
      prayers: [],
      exhausted: new Set(),
      turn: 0,
      phase: 'player_turn',
      log: [],
      _enemyDef: enemyDef,
      _intentIdx: 0,
      _hasRelic: function(id) { return (state.relics || []).includes(id); },
      playerState: state // ref to run state
    };

    // 应用遗物战斗开始效果
    for (const rid of (state.relics || [])) {
      const r = RELICS.common.find(x => x.id === rid)
             || RELICS.rare.find(x => x.id === rid)
             || RELICS.pandora.find(x => x.id === rid);
      if (r && r.onBattleStart) r.onBattleStart(b);
    }

    // 应用天赋战斗开始效果
    for (const t of TALENTS) {
      if (state._talent === t.id && t.onBattleStart) t.onBattleStart(b);
    }

    // 初始抽牌
    this.startTurn(b);
    return b;
  },

  startTurn(b) {
    b.turn++;
    b.phase = 'player_turn';
    b.player.ap = b.player.maxAp;
    b.player.mana = b.player.maxMana;
    b.player._actionsThisTurn = 0;
    b.player._doubler = false;
    b.player._bonusDmg = 0;
    b._removeEquip = false;

    // 装备触发
    for (const eq of b.equipment) {
      const fx = eq.def.equip_effect;
      if (fx && fx.trigger === 'start_of_turn') {
        FX.execute(b, fx.effects, { cardDef: eq.def });
      }
    }

    // 遗物触发
    if (b._hasRelic('spider_poison')) b.enemy.poison = (b.enemy.poison || 0) + 2;
    if (b._hasRelic('frost_heart')) b.enemy.weak = (b.enemy.weak || 0) + 1;

    // 抽牌：手牌上限 + 额外抽牌
    let drawN = b.player.handLimit + (b.player._extraDraw || 0) + (b.player._nextDrawMod || 0);
    b.player._nextDrawMod = 0;
    for (let i = 0; i < drawN; i++) {
      if (b.drawPile.length === 0) {
        if (b.discardPile.length === 0) break;
        b.drawPile = [...b.discardPile];
        b.discardPile = [];
        _shuffle(b.drawPile);
      }
      if (b.drawPile.length === 0) break;
      if (b.hand.length >= 10) { b.discardPile.push(b.drawPile.pop()); continue; }
      b.hand.push(b.drawPile.pop());
    }

    // 选择敌人意图
    const intents = b._enemyDef.intents;
    b.enemy.intent = intents[b._intentIdx % intents.length];
    b._intentIdx++;

    // Boss 阶段切换
    if (b._enemyDef.phase && b._enemyDef.phase(b)) {
      b.log.push(b._enemyDef.phaseMsg);
    }

    b.log.push('—— 第 ' + b.turn + ' 回合 ——');
  },

  playCard(b, handIdx) {
    if (b.phase !== 'player_turn') return '不是你的回合';
    const cardId = b.hand[handIdx];
    if (!cardId) return '无效卡牌';
    const def = WX_CARDS[cardId];
    if (!def) return '未知卡牌';
    const cost = def.cost || {};

    // 检查资源
    if (cost.ap && b.player.ap < cost.ap) return '行动力不足';
    if (cost.mana && b.player.mana < cost.mana) return '法力不足';

    // 扣资源
    if (cost.ap) b.player.ap -= cost.ap;
    if (cost.mana) b.player.mana -= cost.mana;

    // 追踪攻击牌使用计数
    if (def.type === 'attack') b.player._actionsThisTurn++;

    // 执行效果
    const ctx = { cardDef: def, handIdx };
    const results = FX.execute(b, def.effects, ctx);

    // 飞斧：第一张攻击牌翻倍
    if (def.type === 'attack' && b.player._doubler) {
      b.player._doubler = false; // 只触发一次
    }

    // 反制触发检查
    for (const c of b.counters) {
      if (c.trigger === 'enemy_uses_attack' && def.type === 'attack') {
        FX.execute(b, c.effects, ctx);
      }
    }

    // 装备牌特殊处理
    if (def.type === 'equipment') {
      if (b.equipment.length < (b.player.equipSlots || 3)) {
        b.equipment.push({ id: def.id, def });
      }
    }

    // 移除手牌
    b.hand.splice(handIdx, 1);

    // 移除（exhaust）→ 本场不再出现
    if (def.exhaust) {
      b.exhausted.add(cardId);
      b.log.push(def.name + ' 已移除');
    } else {
      b.discardPile.push(cardId);
    }

    // 战斗号角：每用一张攻击牌抽一张
    if (b.player._flag_draw_on_attack && def.type === 'attack') {
      FX.execute(b, [{op:'draw', value:1}], ctx);
    }

    // 装备触发（雷刃、短剑等）
    for (const eq of b.equipment) {
      const fx = eq.def.equip_effect;
      if (fx && fx.trigger === 'on_attack_played' && def.type === 'attack') {
        // every: N 触发一次
        if (fx.every && (b.player._attacksThisTurn || 0) % fx.every === 0) {
          FX.execute(b, fx.effects, ctx);
        }
      }
      if (fx && fx.trigger === 'on_card_played') {
        if (!fx.card_type || def.type === fx.card_type) {
          if (!fx.filter || def.id.includes('starter')) {
            FX.execute(b, fx.effects, ctx);
          }
        }
      }
    }

    // 遗物：止血绷带
    if (b.player._bandage && def.type === 'action') {
      b.player.hp = Math.min(b.player.maxHp, b.player.hp + 1);
    }

    // 检查击杀
    if (b.enemy.hp <= 0) {
      if (b._ifKill) {
        FX.execute(b, b._ifKill, ctx);
        b._ifKill = null;
      }
      b.phase = 'victory';
      return '击杀！战斗胜利';
    }

    // 检查巨兽化回收
    if (b._removeEquip && b.equipment.length > 0) {
      b.equipment.pop();
      b._removeEquip = false;
    }

    const desc = (results && results.length) ? results.filter(Boolean).join('，') : '';
    b.log.push(def.name + (desc ? '：' + desc : ''));
    return null; // no error
  },

  endTurn(b) {
    b.phase = 'enemy_acting';

    // 执行敌人意图
    const intent = b.enemy.intent;
    if (intent) {
      switch (intent.type) {
        case 'attack': {
          let hits = intent.hits || 1;
          for (let i = 0; i < hits; i++) {
            let d = (intent.val || 0) + (b.enemy.strength || 0);
            // 易伤增伤
            if (b.player.vulnerable > 0) d = Math.floor(d * 1.5);
            // 护甲吸收
            if (b.player.shield > 0) {
              const absorbed = Math.min(b.player.shield, d);
              b.player.shield -= absorbed;
              d -= absorbed;
            }
            b.player.hp = Math.max(0, b.player.hp - d);
            b.log.push('敌方 ' + intent.desc + ' → 造成 ' + d + ' 伤害');
          }
          break;
        }
        case 'defend':
          b.enemy.shield += (intent.val || 0);
          b.log.push('敌方 ' + intent.desc);
          break;
        case 'buff':
          if (intent.selfBuff === 'strength') b.enemy.strength = (b.enemy.strength || 0) + (intent.buffVal || 0);
          if (intent.shield) b.enemy.shield += intent.shield;
          b.log.push('敌方 ' + intent.desc);
          break;
        case 'debuff': {
          if (intent.status) {
            const key = intent.status;
            b.player[key] = (b.player[key] || 0) + (intent.statusVal || 0);
            b.log.push('敌方 ' + intent.desc);
          }
          if (intent.atk) {
            let d = (intent.atk || 0) + (b.enemy.strength || 0);
            if (b.player.vulnerable > 0) d = Math.floor(d * 1.5);
            // 护甲吸收
            if (b.player.shield > 0) {
              const absorbed = Math.min(b.player.shield, d);
              b.player.shield -= absorbed;
              d -= absorbed;
            }
            b.player.hp = Math.max(0, b.player.hp - d);
            b.log.push(' → 造成 ' + d + ' 伤害');
          }
          break;
        }
      }
    }

    // 反制触发：下马威等
    if (intent && intent.type === 'attack') {
      for (const c of b.counters) {
        if (c.trigger === 'enemy_uses_attack') {
          FX.execute(b, c.effects, {});
        }
      }
    }

    // 荆棘
    if (b.player._thorns && intent && intent.type === 'attack') {
      b.enemy.hp = Math.max(0, b.enemy.hp - b.player._thorns);
    }

    // 状态结算
    this._tickStatus(b.player);
    this._tickStatus(b.enemy);

    // 祷告倒计时
    for (const p of b.prayers) {
      p.turns--;
      if (p.turns <= 0) {
        FX.execute(b, p.effects, {});
        b.log.push('祷告触发！');
      }
    }
    b.prayers = b.prayers.filter(p => p.turns > 0);

    // 胜负判定
    if (b.enemy.hp <= 0) { b.phase = 'victory'; return '🎉 战斗胜利！'; }
    if (b.player.hp <= 0) { b.phase = 'defeat'; return '💀 阵亡…'; }

    // 流星镖遗物
    if (b._hasRelic && b._hasRelic('ninja_star') && b.hand.length < b.player.handLimit) {
      b.hand.push('_tmp_shuriken');
    }

    // 下一回合
    this.startTurn(b);
    return null;
  },

  _tickStatus(unit) {
    // 中毒
    if (unit.poison > 0) {
      unit.hp = Math.max(0, unit.hp - unit.poison);
      unit.poison = Math.max(0, unit.poison - 1);
    }
    // 灼烧
    if (unit.burn > 0) {
      unit.hp = Math.max(0, unit.hp - unit.burn);
      unit.burn = Math.max(0, Math.floor(unit.burn / 2));
    }
    // 虚弱
    if (unit.weak > 0) unit.weak = Math.max(0, unit.weak - 1);
    // 易伤
    if (unit.vulnerable > 0) unit.vulnerable = Math.max(0, unit.vulnerable - 1);
  },

  // 获取判定结果（用于 UI）
  getResult(b) {
    if (b.phase === 'victory') return {
      win: true,
      gold: 5 + Math.floor(Math.random() * 6), // 5-10
      cardChoices: _getRandomCards(3),
    };
    if (b.phase === 'defeat') return { win: false };
    return null;
  },

  // 奖励选牌
  addRewardCard(state, cardId) {
    state.deck.push(cardId);
  }
};

// 获取 N 张随机卡牌
function _getRandomCards(n) {
  const pool = [...WARRIOR_POOL, ...NEUTRAL_POOL];
  _shuffle(pool);
  return pool.slice(0, n);
}

// ═══════════════ 8. 地图系统 ═══════════════
const MAP_SYSTEM = {
  // 章节定义
  chapters: [
    { name:'迷雾森林', boss:'treant_king', nodeCount:5 },
    { name:'暗影城堡', boss:'death_knight', nodeCount:5 },
    { name:'深渊裂隙', boss:'abyss_lord', nodeCount:5 },
  ],

  // 节点类型池（每层随机排列）
  nodeTypes: {
    normal: ['battle','battle','battle','elite','shop','rest','event','treasure','bandage'],
    boss:   ['boss'],
  },

  // 生成一章的地图
  generate(chapter) {
    const ch = this.chapters[chapter - 1];
    const nodes = [];
    for (let floor = 0; floor < ch.nodeCount; floor++) {
      // 每层 2-3 个节点选项
      const isBoss = (floor === ch.nodeCount - 1);
      const choices = isBoss ? 1 : (2 + Math.floor(Math.random() * 2)); // 2 or 3
      const row = [];
      for (let c = 0; c < choices; c++) {
        if (isBoss) {
          row.push({ type:'boss', completed:false, enemyId:ch.boss });
        } else {
          const isElite = Math.random() < 0.25;
          const type = isElite ? 'elite' : this.nodeTypes.normal[Math.floor(Math.random() * this.nodeTypes.normal.length)];
          row.push({ type, completed:false });
        }
      }
      nodes.push(row);
    }
    return { chapter, name:ch.name, nodes, currentNode:0 };
  },

  // 获取当前层的可选节点
  getChoices(mapData) {
    return mapData.nodes[mapData.currentNode] || [];
  },

  // 处理节点事件
  handleNode(state, mapData, nodeIdx) {
    const node = mapData.nodes[mapData.currentNode][nodeIdx];
    if (!node || node.completed) return null;

    switch (node.type) {
      case 'battle':
      case 'elite':
      case 'boss': {
        const enemyDef = node.enemyId
          ? _pickBoss(mapData.chapter)
          : _pickMonster(mapData.chapter, node.type === 'elite');
        return { action:'battle', enemy:enemyDef };
      }
      case 'shop':
        return { action:'shop' };
      case 'rest':
        return { action:'rest' };
      case 'event':
        return { action:'event' };
      case 'treasure':
        return { action:'treasure' };
      case 'bandage':
        return { action:'bandage' };
      default:
        return null;
    }
  },

  // 标记节点完成，推进
  completeNode(mapData) {
    mapData.currentNode++;
    if (mapData.currentNode >= mapData.nodes.length) {
      return 'chapter_done'; // 章节完成（Boss 击败后）
    }
    return 'next_floor';
  }
};

// ═══════════════ 9. UI 渲染 ═══════════════
const CardUI = {
  // 渲染卡牌的 HTML（手牌中显示）
  renderCard(cardId) {
    const def = WX_CARDS[cardId];
    if (!def) return '<div class="cr-card cr-card-unknown">?</div>';

    let costHtml = '';
    if (def.cost && def.cost.ap) costHtml = '<span class="cr-cost cr-cost-ap">' + def.cost.ap + '⚡</span>';
    else if (def.cost && def.cost.mana) costHtml = '<span class="cr-cost cr-cost-mana">' + def.cost.mana + '💎</span>';
    else costHtml = '<span class="cr-cost cr-cost-free">0</span>';

    const typeIcon = { attack:'⚔️', action:'🌀', equipment:'🛡️', mana:'💎', spell:'✨', counter:'🪤', prayer:'🙏' }[def.type] || '🃏';
    const typeClass = 'cr-card-type-' + def.type;

    return '<div class="cr-card ' + typeClass + '">' +
      '<div class="cr-card-header"><span class="cr-card-type-icon">' + typeIcon + '</span>' + costHtml + '</div>' +
      '<div class="cr-card-name">' + def.name + '</div>' +
      '<div class="cr-card-desc">' + def.desc + '</div>' +
      (def.exhaust ? '<div class="cr-card-exhaust">移除</div>' : '') +
    '</div>';
  },

  // 战斗界面
  renderBattle(b) {
    const enemyName = b._enemyDef.name;
    const enemyHpPct = Math.max(0, Math.round(b.enemy.hp / b.enemy.maxHp * 100));
    const playerHpPct = Math.max(0, Math.round(b.player.hp / b.player.maxHp * 100));
    const intent = b.enemy.intent;

    let html = '<div class="cr-battle">';

    // ── 敌人区 ──
    html += '<div class="cr-enemy-zone">';
    html += '<div class="cr-enemy-info">';
    html += '<div class="cr-enemy-name">' + enemyName + '</div>';
    html += '<div class="cr-hp-bar"><div class="cr-hp-fill cr-hp-enemy" style="width:' + enemyHpPct + '%"></div></div>';
    html += '<div class="cr-hp-text">' + b.enemy.hp + '/' + b.enemy.maxHp + '</div>';
    // 状态图标
    html += '<div class="cr-statuses">';
    if (b.enemy.shield > 0) html += '<span class="cr-st cr-st-armor">🛡️' + b.enemy.shield + '</span>';
    if (b.enemy.strength > 0) html += '<span class="cr-st cr-st-str">💪' + b.enemy.strength + '</span>';
    if (b.enemy.weak > 0) html += '<span class="cr-st cr-st-weak">🔻' + b.enemy.weak + '</span>';
    if (b.enemy.vulnerable > 0) html += '<span class="cr-st cr-st-vuln">🎯' + b.enemy.vulnerable + '</span>';
    if (b.enemy.poison > 0) html += '<span class="cr-st cr-st-psn">☠️' + b.enemy.poison + '</span>';
    if (b.enemy.burn > 0) html += '<span class="cr-st cr-st-burn">🔥' + b.enemy.burn + '</span>';
    html += '</div></div>';

    // 意图气泡
    if (intent) {
      html += '<div class="cr-intent">' + (intent.type === 'attack' ? '⚔️' : intent.type === 'defend' ? '🛡️' : intent.type === 'buff' ? '⬆️' : '🔮') + ' ' + intent.desc + '</div>';
    }
    html += '</div>';

    // ── 玩家区 ──
    html += '<div class="cr-player-zone">';
    html += '<div class="cr-player-info">';
    html += '<div class="cr-hp-bar cr-hp-bar-p"><div class="cr-hp-fill cr-hp-player" style="width:' + playerHpPct + '%"></div></div>';
    html += '<div class="cr-hp-text">❤️ ' + b.player.hp + '/' + b.player.maxHp + '</div>';

    html += '<div class="cr-statuses">';
    if (b.player.shield > 0) html += '<span class="cr-st cr-st-armor">🛡️' + b.player.shield + '</span>';
    if (b.player.strength > 0) html += '<span class="cr-st cr-st-str">💪' + b.player.strength + '</span>';
    if (b.player.weak > 0) html += '<span class="cr-st cr-st-weak">🔻' + b.player.weak + '</span>';
    if (b.player.vulnerable > 0) html += '<span class="cr-st cr-st-vuln">🎯' + b.player.vulnerable + '</span>';
    if (b.player.poison > 0) html += '<span class="cr-st cr-st-psn">☠️' + b.player.poison + '</span>';
    if (b.player.burn > 0) html += '<span class="cr-st cr-st-burn">🔥' + b.player.burn + '</span>';
    html += '</div>';

    // 资源
    html += '<div class="cr-resources">';
    html += '<span class="cr-ap">⚡ ' + b.player.ap + '/' + b.player.maxAp + '</span>';
    html += '<span class="cr-mana">💎 ' + b.player.mana + '/' + b.player.maxMana + '</span>';
    html += '</div>';

    // 装备区
    html += '<div class="cr-equip-zone">装备: ';
    b.equipment.forEach(eq => {
      html += '<span class="cr-equip-item" title="' + eq.def.desc + '">' + eq.def.name + '</span> ';
    });
    html += '</div></div>';

    // ── 手牌区 ──
    html += '<div class="cr-hand-zone">';
    b.hand.forEach((cardId, i) => {
      const def = WX_CARDS[cardId];
      if (!def) return;
      // 检查能否打出
      const cost = def.cost || {};
      const canPlay = (!cost.ap || b.player.ap >= cost.ap) && (!cost.mana || b.player.mana >= cost.mana) && b.phase === 'player_turn';
      html += '<div class="cr-hand-card' + (canPlay ? ' cr-playable' : ' cr-unplayable') + '" onclick="CR._playCard(' + i + ')">';
      html += CardUI.renderMiniCard(cardId);
      html += '</div>';
    });
    html += '</div>';

    // ── 结束回合按钮 ──
    html += '<div class="cr-actions">';
    html += '<button class="cr-btn-end" onclick="CR._endTurn()"' + (b.phase !== 'player_turn' ? ' disabled' : '') + '>结束回合</button>';
    html += '</div>';

    // ── 战斗日志 ──
    html += '<div class="cr-log">';
    const recentLogs = b.log.slice(-8);
    recentLogs.forEach(l => { html += '<div class="cr-log-entry">' + l + '</div>'; });
    html += '</div>';

    html += '</div>'; // cr-battle
    return html;
  },

  // 小卡牌（手牌用）
  renderMiniCard(cardId) {
    const def = WX_CARDS[cardId];
    if (!def) return '?';
    let costTxt = '';
    if (def.cost && def.cost.ap) costTxt = def.cost.ap + '⚡';
    else if (def.cost && def.cost.mana) costTxt = def.cost.mana + '💎';
    else costTxt = '0';
    const typeIcon = { attack:'⚔️', action:'🌀', equipment:'🛡️', mana:'💎', spell:'✨', counter:'🪤', prayer:'🙏' }[def.type] || '🃏';
    return '<span class="cr-mini-cost">' + costTxt + '</span>' +
           '<span class="cr-mini-name">' + def.name + '</span>' +
           '<span class="cr-mini-type">' + typeIcon + '</span>';
  },

  // 地图界面
  renderMap(mapData, state) {
    let html = '<div class="cr-map">';
    html += '<div class="cr-map-title">🗺️ 第' + mapData.chapter + '章：' + mapData.name + '</div>';

    // 从上到下渲染每一层
    for (let floor = mapData.nodes.length - 1; floor >= 0; floor--) {
      html += '<div class="cr-map-floor">';
      const nodes = mapData.nodes[floor];
      const isCurrent = (floor === mapData.currentNode);
      const isPast = (floor < mapData.currentNode);

      nodes.forEach((node, ni) => {
        const icon = { battle:'⚔️', elite:'👹', shop:'🛒', rest:'🏕️', event:'❓', treasure:'📦', bandage:'🩹', boss:'💀' }[node.type] || '⬜';
        const cls = isPast ? ' cr-node-done'
                   : isCurrent ? ' cr-node-current'
                   : ' cr-node-locked';

        html += '<div class="cr-map-node' + cls + '"' +
          (isCurrent ? ' onclick="CR._selectNode(' + ni + ')"' : '') + '>' +
          '<span class="cr-node-icon">' + icon + '</span>' +
          '<span class="cr-node-type">' + node.type + '</span>' +
          (node.completed ? '<span class="cr-node-check">✅</span>' : '') +
        '</div>';
      });

      html += '</div>';
    }

    html += '<div class="cr-run-stats">❤️ ' + state.hp + '/' + state.maxHp + ' | 💰 ' + state.gold + ' | 🃏 ' + state.deck.length + ' 张牌 | 🏆 ' + (state.relics ? state.relics.length : 0) + ' 遗物</div>';
    html += '</div>';
    return html;
  },

  // 商店界面
  renderShop(state) {
    const cards = _getRandomCards(3);
    CR._shopCards = cards;
    let html = '<div class="cr-shop">';
    html += '<div class="cr-shop-title">🛒 商店 | 💰 ' + state.gold + ' 金币</div>';
    html += '<div class="cr-shop-cards">';
    cards.forEach((cardId, i) => {
      const def = WX_CARDS[cardId];
      const price = 15 + Math.floor(Math.random() * 20);
      CR._shopPrices = CR._shopPrices || [];
      CR._shopPrices[i] = price;
      html += '<div class="cr-shop-card" onclick="CR._buyCard(' + i + ')">';
      html += CardUI.renderCard(cardId);
      html += '<div class="cr-shop-price">💰 ' + price + '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="cr-shop-actions">';
    html += '<button class="cr-btn" onclick="CR._removeRandomCard()" ' + (state.gold < 30 ? 'disabled' : '') + '>🗑️ 删牌 (30💰)</button>';
    html += '<button class="cr-btn" onclick="CR._leaveShop()">离开商店</button>';
    html += '</div>';
    html += '</div>';
    return html;
  },

  // 休息界面
  renderRest(state) {
    return '<div class="cr-rest">' +
      '<div class="cr-rest-title">🏕️ 休息</div>' +
      '<div class="cr-rest-options">' +
      '<button class="cr-btn cr-btn-big" onclick="CR._restHeal()">💚 恢复 30% 生命</button>' +
      '<button class="cr-btn cr-btn-big" onclick="CR._restUpgrade()">⭐ 升级一张随机牌</button>' +
      '</div>' +
      '<div class="cr-rest-hp">当前 ❤️ ' + state.hp + '/' + state.maxHp + '</div>' +
    '</div>';
  },

  // 升级界面
  renderUpgrade(state) {
    const choices = _getRandomCards(3);
    CR._upgradeChoices = choices;
    let html = '<div class="cr-upgrade">';
    html += '<div class="cr-upgrade-title">🌟 升级！选择一张牌加入牌组</div>';
    html += '<div class="cr-upgrade-cards">';
    choices.forEach((cardId, i) => {
      html += '<div class="cr-upgrade-card" onclick="CR._pickUpgrade(' + i + ')">';
      html += CardUI.renderCard(cardId);
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="cr-upgrade-info">🃏 当前牌组：' + state.deck.length + ' 张 | ❤️ ' + state.hp + '/' + state.maxHp + '</div>';
    html += '</div>';
    return html;
  },

  // 天赋选择界面
  renderTalentSelect() {
    let html = '<div class="cr-talent">';
    html += '<div class="cr-talent-title">🌲 森林妖精的祝福 — 选择天赋</div>';
    html += '<div class="cr-talent-options">';
    TALENTS.forEach((t, i) => {
      html += '<div class="cr-talent-card" onclick="CR._pickTalent(' + i + ')">';
      html += '<div class="cr-talent-icon">' + t.icon + '</div>';
      html += '<div class="cr-talent-name">' + t.name + '</div>';
      html += '<div class="cr-talent-desc">' + t.desc + '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
    return html;
  },

  // 游戏结束界面
  renderGameOver(state, win) {
    const score = _calcScore(state, win);
    return '<div class="cr-gameover">' +
      '<div class="cr-go-title">' + (win ? '🎉 通关！' : '💀 阵亡…') + '</div>' +
      '<div class="cr-go-stats">' +
      '<div>⭐ 评分：' + score + '</div>' +
      '<div>🏆 章节：' + state.chapter + '</div>' +
      '<div>🃏 牌组：' + state.deck.length + ' 张</div>' +
      '<div>🏅 遗物：' + (state.relics ? state.relics.length : 0) + ' 个</div>' +
      '<div>❤️ 剩余生命：' + state.hp + '/' + state.maxHp + '</div>' +
      '</div>' +
      (win ? '<div><input id="cr-lb-name" class="cr-lb-input" placeholder="输入名字上榜..." value="' + (state.playerName || _randName()) + '"><br><button class="cr-btn cr-btn-big" onclick="CR._submitLB()" style="margin-top:8px">📋 提交排行榜</button></div>' : '') +
      '<button class="cr-btn cr-btn-big" onclick="CR._newGame()" style="margin-top:12px">🔄 新游戏</button>' +
      '<button class="cr-btn" onclick="CR._backToMap()" style="margin-top:8px">🗺️ 回到地图</button>' +
    '</div>';
  },

  // 宝箱界面
  renderTreasure(state) {
    _shuffle(state._relicPool || []);
    CR._treasureRelic = _pickRandomRelic();
    const r = CR._treasureRelic;
    return '<div class="cr-treasure">' +
      '<div class="cr-treasure-title">📦 宝箱</div>' +
      '<div class="cr-treasure-relic">' +
      '<div class="cr-relic-name">' + r.name + '</div>' +
      '<div class="cr-relic-rarity">' + r.rarity + '</div>' +
      '<div class="cr-relic-desc">' + r.desc + '</div>' +
      '</div>' +
      '<button class="cr-btn cr-btn-big" onclick="CR._takeRelic()">拾取</button>' +
    '</div>';
  },

  // 绷带界面
  renderBandage(state) {
    const heal = Math.floor(state.maxHp * 0.03 * 3);
    return '<div class="cr-bandage">' +
      '<div class="cr-bandage-title">🩹 绷带 ×3</div>' +
      '<div class="cr-bandage-info">每次恢复 3% 最大生命（共 ' + heal + ' 点）</div>' +
      '<button class="cr-btn cr-btn-big" onclick="CR._useBandage()">使用绷带（恢复 ' + heal + ' ❤️）</button>' +
    '</div>';
  },
};

// 辅助：随机遗物
function _pickRandomRelic() {
  const all = [...RELICS.common, ...RELICS.rare, ...RELICS.pandora];
  return all[Math.floor(Math.random() * all.length)];
}

// ═══════════════ 10. CR 生命周期（对接 GAMES 模式） ═══════════════
const CR = {
  active: false,
  state: null,   // run state
  battle: null,  // current battle B object
  map: null,     // current map data
  screen: null,  // 'title' | 'talent' | 'map' | 'battle' | 'shop' | 'rest' | 'event' | 'treasure' | 'bandage' | 'upgrade' | 'gameover'
  _shopCards: [], _shopPrices: [], _upgradeChoices: [], _treasureRelic: null,

  get cfg() { return { name:'勇者牌局', icon:'🃏' }; },

  init() {
    if (gCurr !== 'cardrogue') return;
    this.deactivate();
    this.active = true;
    this._load();
    this._render();
    window.addEventListener('keydown', this._key);
  },

  deactivate() {
    window.removeEventListener('keydown', this._key);
    this.active = false;
  },

  _resize() { this._render(); },

  // ── 渲染分发 ──
  _render() {
    if (!this.active) return;
    const view = document.getElementById('game-view');
    if (!view) return;

    let html = '';
    if (!this.state || !this.screen || this.screen === 'title') {
      html = this._renderTitle();
    } else if (this.screen === 'talent') {
      html = CardUI.renderTalentSelect();
    } else if (this.screen === 'map') {
      html = CardUI.renderMap(this.map, this.state);
    } else if (this.screen === 'battle' && this.battle) {
      html = CardUI.renderBattle(this.battle);
    } else if (this.screen === 'shop') {
      html = CardUI.renderShop(this.state);
    } else if (this.screen === 'rest') {
      html = CardUI.renderRest(this.state);
    } else if (this.screen === 'upgrade') {
      html = CardUI.renderUpgrade(this.state);
    } else if (this.screen === 'treasure') {
      html = CardUI.renderTreasure(this.state);
    } else if (this.screen === 'bandage') {
      html = CardUI.renderBandage(this.state);
    } else if (this.screen === 'gameover') {
      html = CardUI.renderGameOver(this.state, this._lastWin || false);
    } else {
      html = this._renderTitle();
    }

    view.innerHTML = html;
  },

  _renderTitle() {
    const hasSave = !!localStorage.getItem(CR_SAVE_KEY);
    return '<div class="cr-title-screen">' +
      '<div class="cr-title-icon">🃏</div>' +
      '<div class="cr-title-text">勇者牌局</div>' +
      '<div class="cr-title-sub">月圆之夜风格 · 卡牌Roguelike</div>' +
      '<div class="cr-title-btns">' +
      '<button class="cr-btn cr-btn-big" onclick="CR._newGame()">⚔️ 新游戏</button>' +
      (hasSave ? '<button class="cr-btn" onclick="CR._continueGame()">📂 继续</button>' : '') +
      '</div>' +
      '<div class="cr-title-version">v0.1 · 战士首发</div>' +
    '</div>';
  },

  // ── 键盘 ──
  _key(e) {
    if (!CR.active || CR.screen !== 'battle' || !CR.battle) return;
    if (e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key) - 1;
      if (idx < CR.battle.hand.length) CR._playCard(idx);
    }
    if (e.key === 'e' || e.key === 'E') { e.preventDefault(); CR._endTurn(); }
    if (e.key === 'Escape') { CR._backToMap(); }
  },

  // ── 游戏逻辑 ──
  _newGame() {
    this.screen = 'talent';
    this.state = {
      hp: 70, maxHp: 70,
      gold: 0,
      deck: [...STARTER_DECK],
      relics: [],
      bonusDmg: 0, bonusStrength: 0, extraAp: 0, extraDraw: 0,
      handLimit: 5, equipSlots: 1,
      maxAp: 3,
      chapter: 1,
      _talent: null,
      _phoenix: false,
    };
    this.map = null;
    this.battle = null;
    this._render();
  },

  _continueGame() {
    this._load();
    if (!this.state) { this._newGame(); return; }
    this._render();
  },

  _pickTalent(idx) {
    const t = TALENTS[idx];
    if (!t) return;
    t.onPick(this.state);
    this.state.maxAp = 3 + (this.state.extraAp || 0);
    this._startChapter(1);
  },

  _startChapter(ch) {
    this.state.chapter = ch;
    this.map = MAP_SYSTEM.generate(ch);
    this.screen = 'map';
    this._render();
    this._save();
  },

  _selectNode(idx) {
    if (this.screen !== 'map' || !this.map) return;
    const choices = MAP_SYSTEM.getChoices(this.map);
    if (idx < 0 || idx >= choices.length) return;
    const result = MAP_SYSTEM.handleNode(this.state, this.map, idx);
    if (!result) return;

    switch (result.action) {
      case 'battle':
        this.battle = Battle.create(this.state, result.enemy);
        this.screen = 'battle';
        break;
      case 'shop':
        this.screen = 'shop';
        this._shopCards = _getRandomCards(3);
        this._shopPrices = this._shopCards.map(() => 15 + Math.floor(Math.random() * 20));
        break;
      case 'rest':
        this.screen = 'rest';
        break;
      case 'treasure':
        this._treasureRelic = _pickRandomRelic();
        this.screen = 'treasure';
        break;
      case 'bandage':
        this.screen = 'bandage';
        break;
      case 'event':
        this._handleEvent();
        return;
    }
    this._render();
  },

  _playCard(idx) {
    if (!this.battle || this.screen !== 'battle') return;
    const err = Battle.playCard(this.battle, idx);
    if (err) { /* could show toast */ }
    // 检查胜负
    if (this.battle.phase === 'victory') {
      this._onVictory();
    } else if (this.battle.phase === 'defeat') {
      this._onDefeat();
    }
    this._render();
  },

  _endTurn() {
    if (!this.battle || this.screen !== 'battle') return;
    const result = Battle.endTurn(this.battle);
    if (this.battle.phase === 'victory') {
      this._onVictory();
    } else if (this.battle.phase === 'defeat') {
      this._onDefeat();
    }
    this._render();
  },

  _onVictory() {
    const result = Battle.getResult(this.battle);
    if (result) {
      this.state.gold += result.gold;
      this.state.hp = this.battle.player.hp;
      this.state.maxHp = this.battle.player.maxHp;

      // 显示奖励
      if (result.cardChoices && result.cardChoices.length > 0) {
        this._upgradeChoices = result.cardChoices;
        this.screen = 'upgrade';
      }
    }
    // 更新地图
    MAP_SYSTEM.completeNode(this.map);
    this.battle = null;
    this._save();
  },

  _onDefeat() {
    // 凤凰羽毛
    if (this.state._phoenix) {
      this.state._phoenix = false;
      this.state.hp = Math.floor(this.state.maxHp * 0.5);
      this.battle = null;
      this.screen = 'map';
      this._render();
      return;
    }
    this.state.hp = 0;
    this._lastWin = false;
    this.screen = 'gameover';
    this._save();
  },

  _pickUpgrade(idx) {
    const cardId = this._upgradeChoices[idx];
    if (cardId) {
      this.state.deck.push(cardId);
    }
    this.screen = 'map';
    this._upgradeChoices = [];
    this._render();
    this._save();
  },

  _buyCard(idx) {
    const cardId = this._shopCards[idx];
    const price = this._shopPrices[idx];
    if (!cardId || this.state.gold < price) return;
    this.state.gold -= price;
    this.state.deck.push(cardId);
    this._shopCards.splice(idx, 1);
    this._shopPrices.splice(idx, 1);
    this._render();
    this._save();
  },

  _removeRandomCard() {
    if (this.state.gold < 30 || this.state.deck.length <= 5) return;
    this.state.gold -= 30;
    const idx = Math.floor(Math.random() * this.state.deck.length);
    this.state.deck.splice(idx, 1);
    this._render();
    this._save();
  },

  _leaveShop() {
    this.screen = 'map';
    MAP_SYSTEM.completeNode(this.map);
    this._render();
    this._save();
  },

  _restHeal() {
    const heal = Math.floor(this.state.maxHp * 0.3);
    this.state.hp = Math.min(this.state.maxHp, this.state.hp + heal);
    this._advanceMap();
  },

  _restUpgrade() {
    // 随机升级一张牌：把它变成增强版（加伤害）
    if (this.state.deck.length > 0) {
      const idx = Math.floor(Math.random() * this.state.deck.length);
      const cardId = this.state.deck[idx];
      const def = WX_CARDS[cardId];
      if (def) {
        // 简单升级：给卡牌效果加伤害
        const newId = cardId + '_upg';
        // 如果已经有升级版就用升级版
        this.state.deck.splice(idx, 1);
        this.state.deck.push(cardId); // 简化：保留但标记为升级
        this.state.bonusDmg = (this.state.bonusDmg || 0) + 1;
      }
    }
    this._advanceMap();
  },

  _takeRelic() {
    if (this._treasureRelic) {
      this.state.relics = this.state.relics || [];
      this.state.relics.push(this._treasureRelic.id);
      if (this._treasureRelic.onGet) this._treasureRelic.onGet(this.state);
    }
    this._advanceMap();
  },

  _useBandage() {
    const heal = Math.floor(this.state.maxHp * 0.03 * 3);
    this.state.hp = Math.min(this.state.maxHp, this.state.hp + heal);
    this._advanceMap();
  },

  _handleEvent() {
    // 简单随机事件
    const roll = Math.random();
    if (roll < 0.3) {
      this.state.gold += 20;
    } else if (roll < 0.6) {
      this.state.hp = Math.max(1, this.state.hp - 5);
    } else {
      this.state.deck.push(WARRIOR_POOL[Math.floor(Math.random() * WARRIOR_POOL.length)]);
    }
    this._advanceMap();
  },

  _advanceMap() {
    const status = MAP_SYSTEM.completeNode(this.map);
    if (status === 'chapter_done') {
      if (this.state.chapter >= 3) {
        // 通关！
        this._lastWin = true;
        this.screen = 'gameover';
      } else {
        this._startChapter(this.state.chapter + 1);
        return;
      }
    } else {
      this.screen = 'map';
    }
    this._render();
    this._save();
  },

  _backToMap() {
    if (this.map) {
      this.screen = 'map';
      this._render();
    } else {
      this.screen = 'title';
      this._render();
    }
  },

  // ── 持久化 ──
  _save() {
    if (!this.state) return;
    const saveData = {
      state: this.state,
      map: this.map,
      screen: this.screen,
      ts: Date.now()
    };
    localStorage.setItem(CR_SAVE_KEY, JSON.stringify(saveData));
  },

  _load() {
    const raw = localStorage.getItem(CR_SAVE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      this.state = data.state;
      this.map = data.map;
      this.screen = data.screen;
      this.battle = null; // 不恢复战斗中状态，回地图
      if (this.screen === 'battle') this.screen = 'map';
    } catch (e) {
      this.state = null;
    }
  },

  // ── 排行榜 ──
  async _submitLB() {
    const input = document.getElementById('cr-lb-name');
    const name = (input?.value || '').trim() || _randName();
    this.state.playerName = name;
    const score = _calcScore(this.state, this._lastWin);
    try {
      await fetch(CR_APPSCRIPT + '?action=lb_submit&size=rogue&name=' + encodeURIComponent(name) + '&score=' + score + '&chapter=' + (this.state.chapter || 0), { mode: 'no-cors' });
    } catch (e) { /* ignore */ }
    // 本地存储
    const lb = JSON.parse(localStorage.getItem('cardrogue_lb') || '[]');
    lb.push({ name, score, chapter: this.state.chapter, ts: Date.now() });
    lb.sort((a, b) => b.score - a.score);
    localStorage.setItem('cardrogue_lb', JSON.stringify(lb.slice(0, 50)));
    this._render();
  },
};

// 评分计算
function _calcScore(state, win) {
  let score = state.deck.length * 5 + (state.relics ? state.relics.length : 0) * 15;
  score += Math.floor(state.hp / state.maxHp * 50);
  if (win) score += 200;
  score += state.chapter * 30;
  return score;
}

// 随机名字
function _randName() {
  const adj = ['Swift','Storm','Shadow','Nova','Blaze','Frost','Rogue','Ace','Echo','Neon','Zen','Flux','Void','Hawk','Lynx'];
  const noun = ['Card','Deck','Draw','Mana','Strike','Shield','Blade','Soul','Fate','Star','Moon','Fire','Wind','Stone','Wave'];
  return adj[Math.floor(Math.random()*adj.length)] + noun[Math.floor(Math.random()*noun.length)];
}
