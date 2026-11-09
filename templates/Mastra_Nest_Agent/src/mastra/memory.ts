import { Memory } from '@mastra/memory';

import { storage } from './storage.js';

export const agentMemory = new Memory({
  storage,
  options: {
    lastMessages: 8,
    observationalMemory: {
      model: 'zj-computility/deepseek-v4-flash',
      scope: 'thread',
      observation: {
        messageTokens: 30_000,
      },
    },
  },
});
