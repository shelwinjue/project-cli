import { MastraStorageExporter, Observability, SamplingStrategyType } from '@mastra/observability';

class TraceOnlyStorageExporter extends MastraStorageExporter {
  override onMetricEvent(): Promise<void> {
    return Promise.resolve();
  }
}

export const observability = new Observability({
  sensitiveDataFilter: true,
  configs: {
    default: {
      serviceName: 'mastra-nest-agent-starter',
      sampling: {
        type: SamplingStrategyType.ALWAYS,
      },
      exporters: [
        new TraceOnlyStorageExporter({
          maxBatchWaitMs: 1_000,
        }),
      ],
      serializationOptions: {
        maxStringLength: 2_000_000,
        maxArrayLength: 1_000,
        maxObjectKeys: 500,
        maxDepth: 20,
      },
    },
  },
});
