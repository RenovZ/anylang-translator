import {
  idAbout,
  idAdaptiveTranslate,
  idApiProviders,
  idGeneral,
  idInstantLookup
} from '@/components/NavIds.svelte';
import i18n from '@/lib/i18n';
import type { OptionsNavItem } from '@/types/options';

import About from './About.svelte';
import AdaptiveTranslate from './adaptive-translate/Index.svelte';
import APIProviders from './api-providers/Index.svelte';
import General from './general/Index.svelte';
import InstantLookup from './InstantLookup.svelte';

export const generalNav: OptionsNavItem = {
  id: idGeneral,
  title: i18n('general', { defaultValue: 'General' }),
  position: 'top',
  component: General
} as const;

export const apiProvidersNav: OptionsNavItem = {
  id: idApiProviders,
  title: i18n('api_providers', { defaultValue: 'API Providers' }),
  description: i18n('api_providers_description', {
    defaultValue:
      'Configure API providers for translation and vocabulary insight. We have 20+ built-in providers and support any OpenAI-compatible API provider.'
  }),
  position: 'top',
  component: APIProviders
} as const;

export const adaptiveTranslateNav: OptionsNavItem = {
  id: idAdaptiveTranslate,
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
  id: idInstantLookup,
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

export const topNavItems = [
  generalNav,
  apiProvidersNav,
  adaptiveTranslateNav,
  instantLookupNav
] as const;

export const aboutNav = {
  id: idAbout,
  title: i18n('about', { defaultValue: 'About' }),
  position: 'bottom',
  component: About
} as const;

// prettier-ignore
export const bottomNavItems = [
  aboutNav,
] as const;
