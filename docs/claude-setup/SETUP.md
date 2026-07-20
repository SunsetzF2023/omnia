# 新电脑 Omnia 开发环境配置

## 1. 克隆项目
```bash
git clone https://github.com/SunsetzF2023/omnia.git
cd omnia
npm install
```

## 2. 安装 Superpowers Skill 插件
在 Claude Code 中运行：
```
/plugin install superpowers
```
这是核心！所有头脑风暴、系统调试、发布流程 skill 都在里面。

## 3. 安装 Claude Commands
把 `docs/claude-setup/05-restart.md` 复制到项目 `.claude/commands/` 目录：
```bash
mkdir -p .claude/commands
cp docs/claude-setup/05-restart.md .claude/commands/
```
之后可以在 Claude Code 里用 `/restart` 命令一键杀进程+重启 App。

## 4. 复制 Memory 文件（重要！）
把旧电脑上的以下文件复制到新电脑的相同路径：
```
旧电脑: C:\Users\<用户名>\.claude\projects\C--Users-...-Omnia-cmdbook-desktop\memory\
新电脑: C:\Users\<用户名>\.claude\projects\C--Users-...-Omnia-cmdbook-desktop\memory\
```
或者直接在 Claude Code 里说「回忆一下 Omnia 项目」，它会从零重建 memory。

## 5. 测试
```bash
npm start
```
如果 Electron 窗口正常弹出，登录能用，就搞定了。
