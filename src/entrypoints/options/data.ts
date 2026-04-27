import i18n from '@/lib/i18n';

import General from './general/Index.svelte';
import ApiProviders from './api-providers/Index.svelte';
import CustomAiActions from './custom-ai-actions/Index.svelte';
import TextTranslation from './TextTranslation.svelte';
import LanguageBridge from './LanguageBridge.svelte';
import BilingualSubtitles from './BilingualSubtitles.svelte';
import IntelligentInput from './IntelligentInput.svelte';
import WritingCopilot from './WritingCopilot.svelte';
import InstantLookup from './InstantLookup.svelte';
import PanoramaReading from './PanoramaReading.svelte';
import ActionPalette from './ActionPalette.svelte';

import About from './About.svelte';
import Pricing from './Pricing.svelte';
import Docs from './Docs.svelte';
import Changelog from './Changelog.svelte';
import Feedback from './Feedback.svelte';

export type NavItem = {
  id: string;
  label: string;
  position: 'top' | 'bottom';
  component: import('svelte').Component;
};

export const topNavItems = [
  {
    id: 'general',
    label: i18n('general', { defaultValue: 'General' }),
    position: 'top',
    component: General
  },
  {
    id: 'api-providers',
    label: i18n('api_providers', { defaultValue: 'API Providers' }),
    position: 'top',
    component: ApiProviders
  },
  {
    id: 'custom-ai-actions',
    label: i18n('custom_ai_actions', { defaultValue: 'Custom AI Actions' }),
    position: 'top',
    component: CustomAiActions
  },
  {
    id: 'text-translation',
    label: i18n('text_translation', { defaultValue: 'Text Translation' }),
    position: 'top',
    component: TextTranslation
  },
  {
    id: 'language-bridge',
    label: i18n('language_bridge', { defaultValue: 'Language Bridge' }),
    position: 'top',
    component: LanguageBridge
  },
  {
    id: 'bilingual-subtitles',
    label: i18n('bilingual_subtitles', { defaultValue: 'Bilingual Subtitles' }),
    position: 'top',
    component: BilingualSubtitles
  },
  {
    id: 'intelligent-input',
    label: i18n('intelligent_input', { defaultValue: 'Intelligent Input' }),
    position: 'top',
    component: IntelligentInput
  },
  {
    id: 'writing-copilot',
    label: i18n('writing_copilot', { defaultValue: 'Writing Copilot' }),
    position: 'top',
    component: WritingCopilot
  },
  {
    id: 'instant-lookup',
    label: i18n('instant_lookup', { defaultValue: 'Instant Lookup' }),
    position: 'top',
    component: InstantLookup
  },
  {
    // Reading Copilot
    id: 'panorama-reading',
    label: i18n('panorama_reading', { defaultValue: 'Panorama Reading' }),
    position: 'top',
    component: PanoramaReading
  },
  {
    id: 'action-palette',
    label: i18n('action_palette', { defaultValue: 'Action Palette' }),
    position: 'top',
    component: ActionPalette
  }
] as const;

export const bottomNavItems = [
  {
    id: 'about',
    label: i18n('about', { defaultValue: 'About' }),
    position: 'bottom',
    component: About
  },
  {
    id: 'pricing',
    label: i18n('pricing', { defaultValue: 'Pricing' }),
    position: 'bottom',
    component: Pricing
  },
  {
    id: 'docs',
    label: i18n('docs', { defaultValue: 'Documentation' }),
    position: 'bottom',
    component: Docs
  },
  {
    id: 'changelog',
    label: i18n('changelog', { defaultValue: 'Changelog' }),
    position: 'bottom',
    component: Changelog
  },
  {
    id: 'feedback',
    label: i18n('feedback', { defaultValue: 'Feedback' }),
    position: 'bottom',
    component: Feedback
  }
] as const;
