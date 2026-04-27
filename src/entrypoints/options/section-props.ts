// TODO: Refactor toggle item types - these are temporarily disabled during migration
// import type { ToggleItem } from '@/entrypoints/popup/data';

export type ToggleItem = {
  key: string;
  label: string;
  enabled?: boolean;
  mode?: string;
  options?: { value: string; label: string }[];
};

export type OptionsSectionSharedProps = {
  toggleItems: ToggleItem[];
  getToggleConfig: (key: string) => ToggleItem | undefined;
  updateToggleMode: (key: string, value: string) => void;
};

export type OptionsProviderSectionProps = {
  getProviderModels: (provider: string) => string[];
  updateField: (key: 'provider' | 'model' | 'promptPreset', value: string) => void;
};
