import { z } from 'zod';

import type { FeatureKey } from '@/preset/feature';

import { FeatureUsageContext } from './analytics';

// FeatureValue type
export const featureValueSchema = z.object({
  disabled: z.boolean().optional(),
  state: z.boolean().optional()
});
export type FeatureValue = z.infer<typeof featureValueSchema>;

// Ordered feature definition for consistent UI rendering
export const featureItemSchema = z.object({
  key: z.string() as z.ZodType<FeatureKey>,
  label: z.string()
});
export type FeatureItem = z.infer<typeof featureItemSchema>;

export const featuresSchema = z.record(z.string(), featureValueSchema) as z.ZodType<
  Partial<Record<FeatureKey, FeatureValue>>
>;

export interface FeaturePayload {
  tabId?: number;
  enabled: boolean;
  analyticsContext?: FeatureUsageContext;
}
