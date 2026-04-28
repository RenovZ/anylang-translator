import i18n from '@/lib/i18n';

import General from './general/Index.svelte';
import APIProviders from './api-providers/Index.svelte';
import AIPrompts from './ai-prompts/Index.svelte';
import QuickTranslate from './QuickTranslate.svelte';
import ContextTranslate from './ContextTranslate.svelte';
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
  title: string;
  label?: string;
  description?: string;
  position: 'top' | 'bottom';
  component: import('svelte').Component;
  font?: string;
  indicator?: string;
};

export const generalNav = {
  id: 'general',
  title: i18n('general', { defaultValue: 'General' }),
  position: 'top',
  component: General
} as const;

export const apiProvidersNav = {
  id: 'api-providers',
  title: i18n('api_providers', { defaultValue: 'API Providers' }),
  description: i18n('api_providers_description', {
    defaultValue:
      'Configure API providers for translation and vocabulary insight. We have 20+ built-in providers and support any OpenAI-compatible API provider.'
  }),
  position: 'top',
  component: APIProviders
} as const;

export const aiPromptsNav = {
  id: 'ai-prompts',
  title: i18n('ai_prompts', { defaultValue: 'AI Prompts' }),
  description: i18n('ai_prompts_description', {
    defaultValue:
      'Configure prompts for custom API providers. Customize model instructions to shape responses and behavior across providers.'
  }),
  position: 'top',
  component: AIPrompts
} as const;

export const quickTranslateNav = {
  id: 'quick-translate',
  title: i18n('quick_translate', { defaultValue: 'Quick Translate' }),
  label: i18n('quick_translate_label', { defaultValue: 'Instant translation, zero friction.' }),
  description: i18n('quick_translate_description', {
    defaultValue:
      'Fast and lightweight translation for everyday use. Prioritizes speed over deep contextual understanding, so nuance and precision may be limited in complex content.'
  }),
  position: 'top',
  component: QuickTranslate,
  font: 'text-red-500',
  indicator: 'bg-red-500'
} as const;

export const contextTranslateNav = {
  id: 'context-translate',
  title: i18n('context_translate', { defaultValue: 'Context Translate' }),
  label: i18n('context_translate_label', { defaultValue: 'Translation that understands meaning.' }),
  description: i18n('context_translate_description', {
    defaultValue:
      'Go beyond literal conversion with AI-powered translation shaped by context, nuance, and intent.'
  }),
  position: 'top',
  component: ContextTranslate,
  font: 'text-orange-500',
  indicator: 'bg-orange-500'
} as const;

export const instantLookupNav = {
  id: 'instant-lookup',
  title: i18n('instant_lookup', { defaultValue: 'Instant Lookup' }),
  label: i18n('instant_lookup_label', { defaultValue: 'More than a dictionary.' }),
  description: i18n('instant_lookup_description', {
    defaultValue:
      'Understand words, idioms, and concepts instantly with AI-powered explanations and multilingual insight.'
  }),
  position: 'top',
  component: InstantLookup,
  font: 'text-yellow-500',
  indicator: 'bg-yellow-500'
} as const;

export const intelligentInputNav = {
  id: 'intelligent-input',
  title: i18n('intelligent_input', { defaultValue: 'Intelligent Input' }),
  label: i18n('intelligent_input_label', { defaultValue: 'Think less. Express more.' }),
  description: i18n('intelligent_input_description', {
    defaultValue:
      'Generate polished multilingual text directly where you type — from quick replies to forms and everyday writing.'
  }),
  position: 'top',
  component: IntelligentInput,
  font: 'text-green-500',
  indicator: 'bg-green-500'
} as const;

export const bilingualSubtitlesNav = {
  id: 'bilingual-subtitles',
  title: i18n('bilingual_subtitles', { defaultValue: 'Bilingual Subtitles' }),
  label: i18n('bilingual_subtitles_label', { defaultValue: 'Watch in two languages at once.' }),
  description: i18n('bilingual_subtitles_description', {
    defaultValue:
      'Real-time bilingual subtitles powered by contextual AI, making video content clearer, richer, and easier to follow.'
  }),
  position: 'top',
  component: BilingualSubtitles,
  font: 'text-cyan-500',
  indicator: 'bg-cyan-500'
} as const;

export const panoramaReadingNav = {
  // Reading Copilot
  id: 'panorama-reading',
  title: i18n('panorama_reading', { defaultValue: 'Panorama Reading' }),
  label: i18n('panorama_reading_label', { defaultValue: 'See the whole picture.' }),
  description: i18n('panorama_reading_description', {
    defaultValue:
      'Extract key ideas, surface critical details, and grasp context faster with AI-enhanced reading intelligence.'
  }),
  position: 'top',
  component: PanoramaReading,
  font: 'text-blue-500',
  indicator: 'bg-blue-500'
} as const;

export const writingCopilotNav = {
  id: 'writing-copilot',
  title: i18n('writing_copilot', { defaultValue: 'Writing Copilot' }),
  label: i18n('writing_copilot_label', { defaultValue: 'Write with an AI co-author.' }),
  description: i18n('writing_copilot_description', {
    defaultValue:
      'Draft, refine, and elevate your writing with context-aware assistance for clarity, tone, and precision.'
  }),
  position: 'top',
  component: WritingCopilot,
  font: 'text-violet-500',
  indicator: 'bg-violet-500'
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
  quickTranslateNav,
  contextTranslateNav,
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
  feedbackNav
] as const;
