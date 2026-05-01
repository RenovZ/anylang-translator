import i18n from '@/lib/i18n';
import type { OptionsNavItem } from '@/lib/types';
import { apiProvidersId } from '@/components/ProvidersDropdown.svelte';

import About from './About.svelte';
import ActionPalette from './ActionPalette.svelte';
import AdaptiveTranslate from './adaptive-translate/Index.svelte';
import AIPrompts from './ai-prompts/Index.svelte';
import APIProviders from './api-providers/Index.svelte';
import BilingualSubtitles from './BilingualSubtitles.svelte';
import Changelog from './Changelog.svelte';
import Docs from './Docs.svelte';
import Feedback from './Feedback.svelte';
import General from './general/Index.svelte';
import InstantLookup from './InstantLookup.svelte';
import IntelligentInput from './IntelligentInput.svelte';
import PanoramaReading from './PanoramaReading.svelte';
import Pricing from './Pricing.svelte';
import WritingCopilot from './WritingCopilot.svelte';

export const generalNav: OptionsNavItem = {
  id: 'general',
  title: i18n('general', { defaultValue: 'General' }),
  position: 'top',
  component: General
} as const;

export const apiProvidersNav: OptionsNavItem = {
  id: apiProvidersId,
  title: i18n('api_providers', { defaultValue: 'API Providers' }),
  description: i18n('api_providers_description', {
    defaultValue:
      'Configure API providers for translation and vocabulary insight. We have 20+ built-in providers and support any OpenAI-compatible API provider.'
  }),
  position: 'top',
  component: APIProviders
} as const;

export const aiPromptsNav: OptionsNavItem = {
  id: 'ai-prompts',
  title: i18n('ai_prompts', { defaultValue: 'AI Prompts' }),
  description: i18n('ai_prompts_description', {
    defaultValue:
      'Configure prompts for custom API providers. Customize model instructions to shape responses and behavior across providers.'
  }),
  position: 'top',
  component: AIPrompts
} as const;

export const adaptiveTranslateNav: OptionsNavItem = {
  id: 'adaptive-translate',
  title: i18n('adaptive_translate', { defaultValue: 'Adaptive Translate' }),
  subtitle: i18n('adaptive_translate_subtitle', {
    defaultValue: 'Fast when you need speed. Deep when meaning matters.'
  }),
  description: i18n('adaptive_translate_description', {
    defaultValue:
      'Adaptive translation that combines lightweight instant translation with context-aware AI understanding, balancing speed, nuance, and quality across different scenarios.'
  }),
  position: 'top',
  component: AdaptiveTranslate,
  textStyle: 'text-orange-500 dark:text-orange-400',
  indicatorStyle: 'bg-orange-500 dark:bg-orange-400'
} as const;

export const instantLookupNav: OptionsNavItem = {
  id: 'instant-lookup',
  title: i18n('instant_lookup', { defaultValue: 'Instant Lookup' }),
  subtitle: i18n('instant_lookup_subtitle', { defaultValue: 'More than a dictionary.' }),
  description: i18n('instant_lookup_description', {
    defaultValue:
      'Understand words, idioms, and concepts instantly with AI-powered explanations and multilingual insight.'
  }),
  position: 'top',
  component: InstantLookup,
  textStyle: 'text-yellow-500 dark:text-yellow-400',
  indicatorStyle: 'bg-yellow-500 dark:bg-yellow-400'
} as const;

export const intelligentInputNav: OptionsNavItem = {
  id: 'intelligent-input',
  title: i18n('intelligent_input', { defaultValue: 'Intelligent Input' }),
  subtitle: i18n('intelligent_input_subtitle', { defaultValue: 'Think less. Express more.' }),
  description: i18n('intelligent_input_description', {
    defaultValue:
      'Generate polished multilingual text directly where you type — from quick replies to forms and everyday writing.'
  }),
  position: 'top',
  component: IntelligentInput,
  textStyle: 'text-green-500 dark:text-green-400',
  indicatorStyle: 'bg-green-500 dark:bg-green-400'
} as const;

export const bilingualSubtitlesNav: OptionsNavItem = {
  id: 'bilingual-subtitles',
  title: i18n('bilingual_subtitles', { defaultValue: 'Bilingual Subtitles' }),
  subtitle: i18n('bilingual_subtitles_subtitle', {
    defaultValue: 'Watch in two languages at once.'
  }),
  description: i18n('bilingual_subtitles_description', {
    defaultValue:
      'Real-time bilingual subtitles powered by contextual AI, making video content clearer, richer, and easier to follow.'
  }),
  position: 'top',
  component: BilingualSubtitles,
  textStyle: 'text-cyan-500 dark:text-cyan-400',
  indicatorStyle: 'bg-cyan-500 dark:bg-cyan-400'
} as const;

export const panoramaReadingNav: OptionsNavItem = {
  // Reading Copilot
  id: 'panorama-reading',
  title: i18n('panorama_reading', { defaultValue: 'Panorama Reading' }),
  subtitle: i18n('panorama_reading_subtitle', { defaultValue: 'See the whole picture.' }),
  description: i18n('panorama_reading_description', {
    defaultValue:
      'Extract key ideas, surface critical details, and grasp context faster with AI-enhanced reading intelligence.'
  }),
  position: 'top',
  component: PanoramaReading,
  textStyle: 'text-blue-500 dark:text-blue-400',
  indicatorStyle: 'bg-blue-500 dark:bg-blue-400'
} as const;

export const writingCopilotNav: OptionsNavItem = {
  id: 'writing-copilot',
  title: i18n('writing_copilot', { defaultValue: 'Writing Copilot' }),
  subtitle: i18n('writing_copilot_subtitle', { defaultValue: 'Write with an AI co-author.' }),
  description: i18n('writing_copilot_description', {
    defaultValue:
      'Draft, refine, and elevate your writing with context-aware assistance for clarity, tone, and precision.'
  }),
  position: 'top',
  component: WritingCopilot,
  textStyle: 'text-violet-500 dark:text-violet-400',
  indicatorStyle: 'bg-violet-500 dark:bg-violet-400'
} as const;

export const actionPaletteNav = {
  id: 'action-palette',
  title: i18n('action_palette', { defaultValue: 'Action Palette' }),
  position: 'top',
  component: ActionPalette
} as const;

export const topNavItems = [
  generalNav,
  apiProvidersNav,
  aiPromptsNav,
  adaptiveTranslateNav,
  instantLookupNav,
  intelligentInputNav,
  bilingualSubtitlesNav,
  panoramaReadingNav,
  writingCopilotNav,
  actionPaletteNav
] as const;

export const aboutNav = {
  id: 'about',
  title: i18n('about', { defaultValue: 'About' }),
  position: 'bottom',
  component: About
} as const;

export const pricingNav = {
  id: 'pricing',
  title: i18n('pricing', { defaultValue: 'Pricing' }),
  position: 'bottom',
  component: Pricing
} as const;

export const docsNav = {
  id: 'docs',
  title: i18n('docs', { defaultValue: 'Documentation' }),
  position: 'bottom',
  component: Docs
} as const;

export const changelogNav = {
  id: 'changelog',
  title: i18n('changelog', { defaultValue: 'Changelog' }),
  position: 'bottom',
  component: Changelog
} as const;

export const feedbackNav = {
  id: 'feedback',
  title: i18n('feedback', { defaultValue: 'Feedback' }),
  position: 'bottom',
  component: Feedback
} as const;

// prettier-ignore
export const bottomNavItems = [
  aboutNav,
  pricingNav,
  docsNav,
  changelogNav,
  feedbackNav,
] as const;
