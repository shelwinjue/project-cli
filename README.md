# 使用

通过project-cli命令，快速创建项目

# 常用命令

`npx @zjlab-fe/project-cli create .`: 初始化当前文件夹

`npx @zjlab-fe/project-cli create frontend`: 创建文件夹frontend，并初始化

## 创建 Agent 项目

创建一个新目录，并在其中生成 NestJS + Mastra Agent 项目：

```bash
npx @zjlab-fe/project-cli create-agent knowledge-agent
```

不传项目名时，直接在当前空目录中生成项目。当前目录可以已经包含 `.git`：

```bash
npx @zjlab-fe/project-cli create-agent
```

可以通过参数提供 Jenkins 使用的 Git 仓库地址：

```bash
npx @zjlab-fe/project-cli create-agent knowledge-agent \
  --git-url https://gitlab.example.com/team/knowledge-agent.git
```

没有传入 `--git-url` 时，CLI 只会询问 Git 仓库地址，并允许留空。CLI 不会自动安装依赖，也不会创建 `.env`。

