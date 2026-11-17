/**
 * Agent 业务接口的统一路由前缀。
 * Chat、Conversation 等 Controller 应基于该常量声明自己的子路由。
 */
export const AGENT_ROUTE_PREFIX = '${YOUR_AGENT_PREFIX}';

/** Mastra Studio 与 SDK 使用的原生 API 前缀。 */
export const MASTRA_STUDIO_ROUTE_PREFIX = `/api/${AGENT_ROUTE_PREFIX}/mastra-studio`;
