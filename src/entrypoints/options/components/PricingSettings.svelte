<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
</script>

<Section
  id="pricing"
  title={i18n('options_pricing_title', { defaultValue: 'Pricing' })}
  description={i18n('options_pricing_description', {
    defaultValue: 'Upgrade to Pro to unlock more advanced features and premium services.'
  })}>
  <div class="border-primary-200 bg-primary-50 rounded-2xl border-2 p-8 text-center">
    <h3 class="text-primary-700 text-2xl font-bold">
      {i18n('options_pricing_pro_title', { defaultValue: 'Pro membership' })}
    </h3>
    <p class="text-primary-600/80 mt-2">
      {i18n('options_pricing_pro_description', {
        defaultValue: 'Enjoy premium services like DeepL and OpenAI translation'
      })}
    </p>
    <Button class="mt-6 rounded-xl px-8 py-3"
      >{i18n('options_pricing_upgrade_button', { defaultValue: 'Upgrade now' })}</Button>
  </div>
</Section>
