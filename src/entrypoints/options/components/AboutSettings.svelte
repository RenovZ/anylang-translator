<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';

  import { i18n } from '@/lib/i18n';
  import Section from './Section.svelte';
</script>

<!-- About Settings Section -->
<Section
  id="about"
  title={i18n('options_about_title', { defaultValue: 'About' })}
  description={i18n('options_about_description', {
    defaultValue: 'Learn about the Anylang Translate extension.'
  })}>
  <!-- About Content -->
  <div class="flex flex-col items-center justify-center py-8">
    <!-- Logo -->
    <div class="bg-primary-500 mb-4 rounded-2xl p-4 text-white shadow-lg">
      <WandMagicSparklesSolid class="h-10 w-10" />
    </div>

    <!-- Product Info -->
    <h3 class="text-xl font-bold dark:text-slate-100">
      {i18n('options_about_product_name', { defaultValue: 'Anylang Translate' })}
    </h3>
    <p class="mt-2 text-slate-500 dark:text-slate-400">
      {i18n('options_about_version', { defaultValue: 'Version 0.0.1' })}
    </p>

    <!-- Action Buttons -->
    <div class="mt-6 flex gap-4">
      <Button
        color="alternative"
        class="rounded-xl dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >{i18n('options_about_check_update', { defaultValue: 'Check for updates' })}</Button>
      <Button
        color="alternative"
        class="rounded-xl dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >{i18n('options_about_website', { defaultValue: 'Official website' })}</Button>
    </div>
  </div>
</Section>
