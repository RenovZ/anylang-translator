<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import Logo from '@/assets/logo.svg?component';
  import i18n from '@/lib/i18n';

  import { aboutNav } from './data';
  import Section from './Section.svelte';
</script>

<Section title={aboutNav.title}>
  <!-- About Content -->
  <div class="flex flex-col items-center justify-center py-8">
    <!-- Logo -->
    <Logo class="mb-4 h-14 w-14" />

    <!-- Product Info -->
    <h3 class="text-xl font-bold dark:text-slate-100">
      {i18n('options_about_product_name', { defaultValue: 'Anylang Translator' })}
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
