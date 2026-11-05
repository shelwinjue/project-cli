import { Mastra } from '@mastra/core/mastra';

import { exampleAgent } from './agents/example-agent.js';
import { ZJ_COMPUTILITY_GATEWAY_ID, zjComputilityGateway } from './gateways/zj-computility-gateway.js';
import { observability } from './observability.js';
import { storage } from './storage.js';

export const mastra = new Mastra({
  storage,
  observability,
  gateways: {
    [ZJ_COMPUTILITY_GATEWAY_ID]: zjComputilityGateway,
  },
  agents: {
    exampleAgent,
  },
});
