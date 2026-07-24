---
name: world-building
description: Use when the user discusses any content under world/ — discussing characters, factions, locations, events, realms, techniques, or concepts in the 天星界 universe. Also use when the user says "/world" or mentions world-building, wiki editing, or wants to create/update files in world/.
---

# 天星界 World-Building

> 與用戶協作構建玄幻世界觀 wiki。用戶負責描述劇情，模型負責書寫和維護 markdown 文件。

## 入口：讀取索引

每次 session 開始世界構建前，先讀 `world/_INDEX.md` 了解全局。

```
world/
├── _INDEX.md          ← 索引入口（先讀這個）
├── WORKFLOW.md        ← 工作流（自動同步 GitHub）
├── README.md
├── templates/         ← 實體模板
├── realms/            ← 境界體系
├── characters/        ← 人物
├── factions/          ← 勢力/宗門/王朝
├── events/            ← 世界事件/時間線
├── techniques/        ← 功法/法術/戰技
├── concepts/          ← 概念（種族、宇宙觀、物品體系）
└── locations/         ← 地點/洲域/城市
```

## 核心流程

### 用戶給出新劇情時

1. **解析資訊** — 提取：人物、勢力、地點、事件、概念、功法、境界資訊
2. **判斷操作**：
   - 新實體 → 創建對應目錄下的 `.md` 文件
   - 已有實體的更新 → 編輯對應文件的相關章節
   - 重大事件 → 更新 `_INDEX.md` 的事件列表
3. **建立雙向鏈接** — 確保新文件鏈接到相關文件，相關文件也鏈接回來
4. **標註 [TODO]** — 不確定的信息用 `[TODO]` 標註，留待後續補充

### 每次修改後

**必須立即同步到 GitHub：**

```bash
git add world/
git commit -m "世界观更新：<簡短描述>"
git push origin master
```

這是強制步驟，不可省略。見 `world/WORKFLOW.md`。

## 文件格式規範

### Frontmatter（YAML 頭）

每個文件必須有 YAML frontmatter，以 `---` 包裹：

**人物：**
```yaml
---
tags: [人物, <洲域>, <勢力>, ...]
境界: <境界>
勢力: <所屬勢力>
身份: <身份>
狀態: [存活/已故/失蹤/已飛升]
---
```

**勢力：**
```yaml
---
tags: [勢力, <類型>, <洲域>, ...]
類型: [宗門/王朝/世家/組織/...]
所在地: <地點>
地位: <地位描述>
陣營: [正道/邪道/中立/...]
---
```

**地點：**
```yaml
---
tags: [地點, <類型>, ...]
所屬洲域: <洲域名>
類型: <地點類型>
狀態: <當前狀態>
---
```

### 正文結構

```markdown
# 名稱

> 一句話概括（引用塊）

## 基本信息
- 屬性：值（使用 [[../path/文件名|顯示名]] 鏈接）

## 主要章節（按需）
## 外貌 / 性格 / 經歷 / 能力 / 當前動態

## 關聯人物
- [[../characters/xxx|xxx]] — 關係描述

## 備註
- [TODO] 待補充內容
- 開放問題
```

### 雙向鏈接

- 使用 `[[../path/文件名]]` 格式（相對於當前文件的路徑）
- 鏈接顯示名：`[[../path/文件名|顯示名]]`
- 跨目錄：`[[../characters/xxx]]`、`[[../factions/xxx]]`、`[[../concepts/xxx]]`
- 建立新文件時，也要更新被鏈接方的「關聯人物/關聯勢力」等章節

### 引用塊（>）

用於一句話概括、角色對話、關鍵台詞：

```markdown
> 這段話概括了角色的本質。
```

### 表格

用於結構化資訊（勢力格局、境界對照、傷亡統計等）。

## 寫作風格

- **語言**：繁體中文
- **視角**：第三人稱，客觀記錄。保留用戶 POV 敘述的原汁原味
- **概述**：引用塊放一句話概括
- **深度**：不只是記錄「發生了什麼」，更要記錄「為什麼」、「意味著什麼」
- **未知**：用 `[TODO]` 標註不確定的信息，在備註中提出開放問題
- **一致性**：境界體系、物品品階、地名——全部引用 `realms/`、`concepts/` 中的定義
- **劇情反轉**：當用戶給出顛覆性資訊時，直接更新既有文件（標註修正），而非堆積矛盾

## 實體模板

新建實體時參考 `world/templates/` 下的模板文件：
- `_人物.md` / `_勢力.md` / `_境界.md` / `_事件.md`

## 全局規則

- **邊界控制**：用戶描述什麼就寫什麼。可以合理推測但必須標註 [TODO]
- **不碰胖琦線**：除非用戶明確指示，不要擅自推進胖琦/杜子騰/段山河的主線
- **同步優先**：每次修改 world/ 後立刻 git push，確保 GitHub 上永遠是最新版本
