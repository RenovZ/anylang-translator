import type { ToggleItem } from '@/entrypoints/popup/data';
import type { V2OptionsConfig } from '../types';

export type OptionsSectionSharedProps = {
  config: V2OptionsConfig;
  toggleItems: ToggleItem[];
  getToggleConfig: (key: string) => ToggleItem | undefined;
  updateToggleMode: (key: string, value: string) => void;
};

export type OptionsProviderSectionProps = {
  config: V2OptionsConfig;
  getProviderModels: (provider: string) => string[];
  updateField: (key: 'provider' | 'model' | 'promptPreset', value: string) => void;
};
