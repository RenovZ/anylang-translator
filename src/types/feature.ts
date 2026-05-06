import type { FeatureKey } from '@/lib/preset/constants';

export type FeatureValue = {
  disabled?: boolean;
  state?: boolean;
};

// Ordered feature definition for consistent UI rendering
export type FeatureItem = {
  key: FeatureKey;
  label: string;
};
