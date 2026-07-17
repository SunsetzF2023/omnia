# Omnia 修仙宗门 — 设计文档

## 概述

Omnia 新增第 5 个 Tab：**修仙宗门**。轻量放置 + 异步 PvP，代码量 ~600 行（`js/cultivation.js`），后端复用 Apps Script。

---

## 一、核心循环

```
每分钟自动产灵石 → 升级境界 → 突破 → 招募弟子 → 攻打其他玩家 → 防守日志
```

## 二、数据结构

### 玩家宗门（本地 + Drive 同步）

```js
{
  name: '我的宗门',           // 宗门名
  realm: 1,                   // 境界 1-10
  realmName: '炼气期',        // 当前境界名
  spiritStones: 150,          // 灵石
  disciples: [                // 弟子列表（最多 5 个）
    { name: '张铁柱', power: 12, speed: 1.2 },
    ...
  ],
  atk: 20,                    // 总攻击力（基础 + 弟子 + 境界加成）
  def: 15,                    // 总防御力
  hp: 100,                    // 血量（防守用）
  maxHp: 100,
  wins: 0, losses: 0,         // PvP 战绩
  unreadLogs: [],             // 未读战斗日志
}
```

### 境界表（10 层）

```
1. 凡人     → 突破需 50 灵石
2. 炼气期   → 100
3. 筑基期   → 200
4. 金丹期   → 500
5. 元婴期   → 1,000
6. 化神期   → 2,500
7. 炼虚期   → 5,000
8. 合体期   → 10,000
9. 大乘期   → 25,000
10. 渡劫飞升 → 50,000
```

每突破一级：攻击 +5，防御 +3，弟子上限 +1（最多 5），灵石产量翻倍。

### Apps Script 存储

```js
// key: CULT_{userId}
{
  name: '我的宗门',
  realm: 3,
  atk: 45,
  def: 30,
  hp: 80,
  wins: 12,
  losses: 3,
  lastSeen: '2026-07-17T10:30:00Z'
}

// key: CULT_LOGS_{userId}
[
  { type: 'attack', attacker: '对方宗门', result: 'win', dmg: 25, time: '...' },
  { type: 'defense', attacker: '某某', result: 'loss', dmg: 40, time: '...' },
  ...
]
```

## 三、UI 布局

```
┌─────────────────────────────────────┐
│  🏯 修仙宗门                        │
├──────────┬──────────┬───────────────┤
│ 宗门信息  │ 弟子列表  │ 战斗记录      │
│          │          │               │
│ 🏰 太虚门 │ 🧑 张铁柱 │ ⚔️ 攻打胜利   │
│ 境界:金丹 │   战12   │ 🛡️ 被攻打失败 │
│ 💰 1500  │ 🧑 李灵儿 │ ⚔️ 攻打胜利   │
│ ⚔️ 45    │   战18   │               │
│ 🛡️ 30    │ [招募]   │ [出征]        │
│ ❤️ 80/100│          │               │
│ [突破]    │          │               │
│ 📊 12W3L │          │               │
└──────────┴──────────┴───────────────┘
```

移动端三栏自动转纵向堆叠。

## 四、核心功能

### 4.1 灵石自动生产

每分钟：`产量 = realm * 5 + 弟子总数 * 2`

前端用 `setInterval` 秒级更新余额显示，正式累加走 Drive 同步（类似 cmdbook 的排期保存）。

### 4.2 突破

点击"突破"按钮 → 消耗灵石 → 成功（境界+1，属性提升）/ 失败（灵石不退还，90% 成功率，随境界递减到 70%）

### 4.3 招募弟子

- 消耗灵石招募（费用 = realm * 50）
- 随机生成名字 + 随机战力（realm * 3 ~ realm * 10）
- 最多 5 个弟子

### 4.4 出征（异步 PvP）

```
1. 点击"出征" → POST AppsScript ?action=cult_match
2. 后端随机匹配一个其他玩家宗门快照
3. 战斗自动结算：
   damage = max(1, 我方ATK - 对方DEF) * (0.85 + random * 0.3)
4. 对方 HP -= damage
5. 如果对方 HP ≤ 0：我方胜利，对方更新快照
6. 战斗日志存到双方记录
```

### 4.5 防守日志

对方下次登录 / 刷新时，拉取未读战斗日志，弹通知。

---

## 五、后端（Apps Script）

新增两个 action：

```
?action=cult_ping          → POST 当前宗门快照
  body: { name, realm, atk, def, hp, maxHp, wins, losses }

?action=cult_match         → GET 随机匹配一个对手
  param: userId
  return: { name, realm, atk, def, hp, maxHp }  （对手快照）

?action=cult_result        → POST 战斗结果
  body: { attackerId, defenderId, attackerName, dmg, result }

?action=cult_logs          → GET 未读战斗日志
  param: userId
  return: [{ type, attacker, result, dmg, time }, ...]

?action=cult_logs_ack      → POST 标记已读
```

存储用 `PropertiesService`（跟 2048 排行榜一样），limit 100 条。

---

## 六、本地存储

- 宗门数据：Google Drive appDataFolder（与其他数据一起同步）
- 离线模式：localStorage `cult_data`
- 未读日志数：Drive / localStorage

---

## 七、Tab 集成

`index.html`：
- tabnav 新增 `<div class="tab" onclick="switchTab('cultivation')">🏯 修仙</div>`
- modules 新增 `<div class="module" id="module-cultivation"></div>`

`js/app.js`：
- activate/deactivate 生命周期调用

`js/cultivation.js`：
- `CULT` 全局对象，跟 `G24` 同模式
- `activateCultivation()` / `deactivateCultivation()`

---

## 八、不做的事情

- ❌ AI 对话
- ❌ 拍卖行 / 任务堂 / 宗门外交
- ❌ 5 种体质 × 40 种命格 × 55 种词条
- ❌ 弟子自主事件 / 婚姻
- ❌ Canvas 渲染 / 动画

---

## 九、预计工作量

| 部分 | 行数 | 时间 |
|------|------|------|
| `js/cultivation.js` | ~500 | 主逻辑 |
| `index.html` CSS | ~80 | 宗门 UI 样式 |
| `index.html` Tab 集成 | ~10 | nav + module |
| `js/app.js` 生命周期 | ~10 | activate/deactivate |
| Apps Script 后端 | ~60 | 4 个 action |
| **总计** | **~660 行** | |
