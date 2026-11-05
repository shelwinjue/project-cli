# Mastra Nest Agent Starter

基于 NestJS、Mastra、自定义供应商接入 和 MySQL Storage 的团队 Agent 服务脚手架。

## 运行环境

项目统一运行在 Node.js `22.22.0` 环境。Jenkinsfile 和 Dockerfile 都会使用并校验这个版本。

本地开发还需要：

- npm
- MySQL 8.x
- 可访问的供应商模型网关

## 已内置能力

- NestJS 服务入口
- Mastra NestJS Adapter
- 固定为 `/api/mastra` 的 Mastra API 前缀
- 每分钟 3600 次的 NestJS 全局限流
- `zj-computility/model-name` 两段式模型路由
- MySQL Mastra Storage
- Mastra 表结构自动初始化
- 最近 8 条历史消息
- Observational Memory
- 默认启用的 Trace Observability
- Mastra Studio 启动命令
- Jenkins、Docker 和 Kubernetes 部署模板

## 修改与部署相关的变量

替换以下文件中的部署文件变量：

```text
deploy/Jenkinsfile
deploy/k8s/manifests-dev/app.yaml
deploy/k8s/manifests-prod/app.yaml
```

变量含义：

```text
${YOUR_PROJECT_NAME}  项目名称、Kubernetes 资源名和镜像名
${YOUR_GIT_URL}       项目 GitLab 地址
```

同时修改：

- **dev/prod K8s Service 实际分配的 `nodePort`**
  `nodePort: 32453` 沿用自参考项目。多个 Service 不能在同一集群中占用相同 NodePort，新项目部署前必须确认端口分配。

## 修改与项目、业务Agent相关的内容

- `package.json` 中的项目名称和描述
- `src/mastra/observability.ts` 中的 `serviceName`
- `src/mastra/agents/example-agent.ts` 中的 Agent 配置

## 安装依赖

```bash
npm install
```

将环境变量示例复制为本地环境文件：

```bash
copy .env.example .env
```

填写模型网关和 MySQL 配置：

```dotenv
PORT=3000
CORS_ORIGIN=*

AIZJ_BASE_URL=https://ai.zj-computility.com/maas/v1
AIZJ_API_KEY=your-api-key

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=agent_user
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=agent_app
```

MySQL Server、database 和用户需要提前创建。应用启动时，Mastra 自动初始化 Memory 和 Observability 所需的表与索引，如需。

## 本地启动 NestJS

```bash
npm run start:dev
```

默认服务地址：

```text
http://localhost:3000
```

Mastra API：

```text
http://localhost:3000/api/mastra
```

## 启动 Mastra Studio

先启动 NestJS 服务，然后在另一个终端运行：

```bash
npm install -g mastra  # 首次使用mastra需要安装 mstra 的环境，如已安装则跳过
npm run mastra:studio
```

脚本执行的完整命令是：

```bash
mastra studio --port 4111
```

Studio 地址：

```text
http://localhost:4111
```

第一次打开 Studio 时，在 Settings 中配置：

```text
Mastra instance URL: http://localhost:3000    // 3000是nest启动端口号
API prefix: /api/mastra
```

如需在命令中直接指定 NestJS 服务连接，可以运行：

```bash
mastra studio --port 4111 --server-host localhost --server-port 3000 --server-protocol http --server-api-prefix /api/mastra
```

## 模型配置约定

Gateway 只读取：

```text
AIZJ_BASE_URL
AIZJ_API_KEY
```

配上自己的 baseURL 和 apikey 即可

自己的业务文件中可以使用 Mastra 标准格式声明模型：

```ts
model: 'zj-computility/deepseek-v4-flash';
```

## Memory 配置约定

脚手架默认启用：

- 最近 8 条原始历史消息
- Observational Memory

脚手架默认不启用：

- `generateTitle`
- Working Memory
- Semantic Recall

这些能力应由业务项目根据需要显式增加。

## Storage 配置约定

项目统一使用 MySQL。本地、测试和生产通过不同的连接信息实现数据隔离。

`src/mastra/storage.ts` 将可初始化的 Storage 域限制为：

```text
memory
observability
```

这样不会创建当前项目未使用的领域表。

如果业务新增 Mastra Workflow、Dataset、Score 或其他需要持久化的能力，必须同步把对应 Store 加入 `mysqlStorage.stores`，否则该领域没有可用的持久化 Store。

## TypeORM 使用边界

`@mastra/mysql` 独立负责 Mastra Runtime 数据，不依赖 TypeORM。

如项目需要 NestJS Entity、Repository 和业务表时，需要手动额外安装并配置：

```text
@nestjs/typeorm
typeorm
typeorm-naming-strategies
mysql2
```

脚手架默认不引入这些依赖。

## 新业务接入顺序

1. 替换项目名、Git 地址、镜像名和 K8s 资源名。
2. 确认 dev/prod NodePort。
3. 创建项目专属 MySQL database 和用户。
4. 配置模型网关和 MySQL 环境变量。
5. 修改 Agent ID、Instructions、模型和 Tools。
6. 按业务调整 Observational Memory 模型和压缩阈值。
7. 执行类型检查和构建。
8. 启动 NestJS 与 Studio，验证 Agent、Memory 和 Trace。
9. 推送 dev 分支，验证 Jenkins 构建、K8s Rollout 和实际访问路径。
