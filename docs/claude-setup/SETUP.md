# 新电脑 Claude Code 开发环境配置

## 1. 基础环境

```bash
# 安装 Node.js（如未安装）
# https://nodejs.org/ 下载 LTS 版

# 安装 Claude Code（如未安装）
npm install -g @anthropic-ai/claude-code
```

## 2. 克隆项目

```bash
git clone https://github.com/SunsetzF2023/omnia.git
cd omnia
npm install
```

## 3. 安装 Superpowers Skill 插件（强烈推荐）

在 Claude Code 中运行：
```
/plugin install superpowers
```

有了这个插件，Claude 会更系统地帮你做头脑风暴、调试、规划。不装也能用，但装了体验更好。

## 4. 恢复 Git 用户配置

```bash
git config user.name "Sunsetz"
git config user.email "你的邮箱"
```

## 5. 世界观继续编辑

`world/` 目录就是你的天星界世界观。所有文件都是 Markdown + `[[双向链接]]` 格式。

新电脑上继续世界构建：
1. `git pull origin master` — 拉最新内容
2. 在 Claude Code 中直接聊——描述你想构建的世界内容
3. Claude 会自动读取现有 world/ 文件，创建/更新对应的 Markdown

**推荐工作流**：
```
git pull → 和 Claude 聊世界观 → git add world/ → git commit → git push
```

## 6. Memory 文件

Memory 存在 `~/.claude/projects/` 下，是 Claude 记住项目上下文的方式。新电脑上会自动从零开始积累。也可以在新电脑上第一次对话时说「回忆一下 Omnia 项目」，Claude 会从 CLAUDE.md 和 world/ 中重建认知。

## 7. Omnia App 开发

```bash
npm start           # 开发运行
npm run build:win   # 打包
```

## 8. 快速命令

把 `docs/claude-setup/05-restart.md` 复制到 `.claude/commands/`：
```bash
mkdir -p .claude/commands
cp docs/claude-setup/05-restart.md .claude/commands/
```
之后可以用 `/restart` 一键杀进程+重启 App。
