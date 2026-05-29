import {
  idAbout,
  idAdaptiveTranslate,
  idApiProviders,
  idGeneral,
  idInstantLookup
} from '@/components/NavIds.svelte';
import i18n from '@/lib/i18n';

export const moreItems = [
  { id: idGeneral, label: i18n('more_items_general', { defaultValue: 'General' }) },
  {
    id: idApiProviders,
    label: i18n('more_items_api_providers', { defaultValue: 'API providers' })
  },
  {
    id: idAdaptiveTranslate,
    label: i18n('more_items_adaptive_translate', { defaultValue: 'Adaptive translate' })
  },
  {
    id: idInstantLookup,
    label: i18n('more_items_instant_lookup', { defaultValue: 'Instant lookup' })
  },
  {
    id: idAbout,
    label: i18n('more_items_about', { defaultValue: 'About' })
  }
];
