import '../env.js';

import { createOpenAICompatible } from '@ai-sdk/openai-compatible-v5';
import type { LanguageModelV2 } from '@ai-sdk/provider-v5';
import { MastraModelGateway, type ProviderConfig } from '@mastra/core/llm';

export const ZJ_COMPUTILITY_PROVIDER_ID = 'zj-computility';
export const ZJ_COMPUTILITY_GATEWAY_ID = 'zj-computility-custom-gateway';

function getBaseUrl(envVars: Record<string, string> = {}): string {
  const rawBaseUrl = envVars.AIZJ_BASE_URL ?? process.env.AIZJ_BASE_URL;
  const baseUrl = rawBaseUrl?.trim().replace(/\/+$/, '');

  if (!baseUrl) {
    throw new Error('缺少环境变量 AIZJ_BASE_URL');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error('AIZJ_BASE_URL 必须是有效的 HTTP(S) URL');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('AIZJ_BASE_URL 只支持 HTTP 或 HTTPS');
  }
  if (parsedUrl.pathname.endsWith('/chat/completions')) {
    throw new Error('AIZJ_BASE_URL 只能填写 API 根路径，不能包含 /chat/completions');
  }

  return baseUrl;
}

export class ZjComputilityGateway extends MastraModelGateway {
  readonly id = ZJ_COMPUTILITY_GATEWAY_ID;
  readonly name = 'ZJ Computility OpenAI-Compatible Gateway';

  override handlesModel(modelId: string): boolean {
    return modelId.startsWith(`${ZJ_COMPUTILITY_PROVIDER_ID}/`);
  }

  async fetchProviders(): Promise<Record<string, ProviderConfig>> {
    return {
      [ZJ_COMPUTILITY_PROVIDER_ID]: {
        name: 'ZJ Computility',
        models: [],
        apiKeyEnvVar: 'AIZJ_API_KEY',
        gateway: this.id,
        url: getBaseUrl(),
      },
    };
  }

  buildUrl(_modelId: string, envVars: Record<string, string> = {}): string {
    return getBaseUrl(envVars);
  }

  async getApiKey(_modelId: string): Promise<string> {
    const apiKey = process.env.AIZJ_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('缺少环境变量 AIZJ_API_KEY');
    }
    return apiKey;
  }

  resolveLanguageModel({
    modelId,
    providerId,
    apiKey,
  }: {
    modelId: string;
    providerId: string;
    apiKey: string;
  }): LanguageModelV2 {
    return createOpenAICompatible({
      name: providerId,
      apiKey,
      baseURL: getBaseUrl(),
      supportsStructuredOutputs: true,
    }).chatModel(modelId);
  }
}

export const zjComputilityGateway = new ZjComputilityGateway();
