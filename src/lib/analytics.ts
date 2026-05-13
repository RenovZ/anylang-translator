import logger, { formatError } from '@/lib/logger';
import { sendMessage } from '@/lib/protocol';
import type {
  AnalyticsSurface,
  FeatureUsageContext,
  FeatureUsedEvent,
  FeatureUsedEventInput
} from '@/types/analytics';

const ANALYTICS_FEATURE_USED_EVENT = 'feature_used';

class AnalyticsManager {
  createFeatureUsageContext(
    feature: FeatureUsageContext['feature'],
    surface: AnalyticsSurface,
    startedAt = Date.now(),
    metadata?: Pick<FeatureUsageContext, 'action_id' | 'action_name'>
  ): FeatureUsageContext {
    return {
      feature,
      surface,
      startedAt,
      ...metadata
    };
  }

  getLatencyMs(startedAt: number, finishedAt = Date.now()): number {
    return Math.max(0, finishedAt - startedAt);
  }

  buildFeatureUsedEventProperties({
    feature,
    surface,
    outcome,
    startedAt,
    finishedAt = Date.now(),
    action_id,
    action_name
  }: FeatureUsedEventInput): FeatureUsedEvent {
    return {
      feature,
      surface,
      outcome,
      latency_ms: this.getLatencyMs(startedAt, finishedAt),
      ...(action_id !== undefined ? { action_id } : {}),
      ...(action_name !== undefined ? { action_name } : {})
    };
  }

  async trackFeatureUsed(input: FeatureUsedEventInput): Promise<void> {
    try {
      const msg = this.buildFeatureUsedEventProperties(input);
      logger.debug('trackFeatureUsedEvent', { msg });
      await sendMessage('trackFeatureUsedEvent', msg);
    } catch (error) {
      logger.warn(`Failed to track ${ANALYTICS_FEATURE_USED_EVENT}`, {
        error: formatError(error)
      });
    }
  }

  async trackFeatureAttempt<T>(context: FeatureUsageContext, run: () => Promise<T>): Promise<T> {
    try {
      const result = await run();
      void this.trackFeatureUsed({
        ...context,
        outcome: 'success'
      });
      return result;
    } catch (error) {
      void this.trackFeatureUsed({
        ...context,
        outcome: 'failure'
      });
      throw error;
    }
  }
}

export default new AnalyticsManager();
