import { ANALYTICS_FEATURE, ANALYTICS_SURFACE } from '@/preset/analytics';

export type AnalyticsFeature = (typeof ANALYTICS_FEATURE)[keyof typeof ANALYTICS_FEATURE];

export type AnalyticsSurface = (typeof ANALYTICS_SURFACE)[keyof typeof ANALYTICS_SURFACE];

export type AnalyticsOutcome = 'success' | 'failure';

export interface FeatureUsageContext {
  feature: AnalyticsFeature;
  surface: AnalyticsSurface;
  startedAt: number;
  action_id?: string;
  action_name?: string;
}

export interface FeatureUsedEvent {
  feature: AnalyticsFeature;
  surface: AnalyticsSurface;
  outcome: AnalyticsOutcome;
  latency_ms: number;
  action_id?: string;
  action_name?: string;
}

export interface FeatureUsedEventInput extends FeatureUsageContext {
  outcome: AnalyticsOutcome;
  finishedAt?: number;
}
