# 使用

通过project-cli命令，快速创建项目

# 常用命令

`npx @zjlab-fe/project-cli create .`: 初始化当前文件夹

`npx @zjlab-fe/project-cli create frontend`: 创建文件夹frontend，并初始化

## 创建 Agent 项目

创建一个新目录，并在其中生成 NestJS + Mastra Agent 项目：

```bash
npx @zjlab-fe/project-cli create-agent knowledge-agent --prefix knowledge-agent --agent codex,cursor
```

不传项目名时，直接在当前空目录中生成项目。当前目录可以已经包含 `.git`：

```bash
npx @zjlab-fe/project-cli create-agent --prefix knowledge-agent --agent cursor
```

可以通过参数提供 Jenkins 使用的 Git 仓库地址：

```bash
npx @zjlab-fe/project-cli create-agent knowledge-agent \
  --prefix knowledge-agent \
  --agent codex \
  --git-url https://gitlab.example.com/team/knowledge-agent.git
```

`--prefix` 用于统一生成 `/api/<prefix>/chat`、`/api/<prefix>/conversation` 等业务接口前缀，以及 `/api/<prefix>/mastra-studio`。前缀只能包含小写字母、数字和中划线，不能包含 `/`。没有传入该参数时，CLI 会提示“请输入业务前缀”。

`--agent` 当前支持 `codex`、`trae`、`cursor` 和 `github-copilot`，其中 `github-copilot` 对应 VS Code Copilot。多个 Agent 使用逗号分隔，例如 `--agent=codex,cursor`。没有传入时，CLI 会显示四种选项供多选；如果不需要安装 Mastra Skills，不勾选任何 Agent，直接回车即可跳过。生成项目后手动执行 `npm install`，`postinstall` 会扫描 `@mastra/*/dist/docs/SKILL.md`，并链接到所选 Agent 的项目级 Skills 目录；初始化时跳过选择则不会创建链接。

项目生成后也可以运行 `npm run add-mastra-skills -- --agent=codex,cursor`，把已经安装的 Mastra Skills 链接到多个受支持的 Agent。

没有传入 `--git-url` 时，CLI 会询问 Git 仓库地址，并允许留空。CLI 不会自动安装依赖，也不会创建 `.env`。
