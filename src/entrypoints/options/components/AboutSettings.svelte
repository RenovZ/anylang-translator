<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
</script>

<Section
  id="about"
  title={i18n('options_about_title', { defaultValue: 'About' })}
  description={i18n('options_about_description', {
    defaultValue: 'Learn about the Immersive Translate extension.'
  })}>
  <div class="flex flex-col items-center justify-center py-8">
    <div class="bg-primary-500 mb-4 rounded-2xl p-4 text-white shadow-lg">
      <WandMagicSparklesSolid class="h-10 w-10" />
    </div>
    <h3 class="text-xl font-bold">
      {i18n('options_about_product_name', { defaultValue: 'Immersive Translate' })}
    </h3>
    <p class="mt-2 text-slate-500">
      {i18n('options_about_version', { defaultValue: 'Version 0.0.1' })}
    </p>
    <div class="mt-6 flex gap-4">
      <Button color="light" class="rounded-xl border-none shadow-md"
        >{i18n('options_about_check_update', { defaultValue: 'Check for updates' })}</Button>
      <Button color="light" class="rounded-xl border-none shadow-md"
        >{i18n('options_about_website', { defaultValue: 'Official website' })}</Button>
    </div>
  </div>
</Section>
