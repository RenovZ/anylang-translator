<script lang="ts">
  import { A, Button } from 'flowbite-svelte';

  import Logo from '@/assets/logo.svg?component';
  import { APP_VERSION } from '@/lib/app';
  import i18n from '@/lib/i18n';

  import { aboutNav } from './data';
  import Section from './Section.svelte';
</script>

<Section title={aboutNav.title}>
  <!-- About Content -->
  <div class="flex flex-col items-center justify-center gap-4 py-8">
    <!-- Logo -->
    <Logo class="mb-4 h-14 w-14" />

    <!-- Product Info -->
    <h3 class="text-xl font-bold dark:text-slate-100">
      {i18n('options_about_product_name', { defaultValue: 'Anylang Translator' })}
    </h3>
    <p class="text-slate-500 dark:text-slate-400">
      {i18n('options_about_version', { defaultValue: 'Version' })}
      {APP_VERSION}
    </p>
    <A href="https://github.com/RenovZ/anylang-translator" target="_blank">
      https://github.com/RenovZ/anylang-translator
    </A>
  </div>
</Section>
