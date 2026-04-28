<script lang="ts">
  import { Button, Alert } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';

  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import { quickTranslateNav as nav } from './data';
</script>

<Section title={nav.title}>
  {#snippet description()}
    <Alert color="red" class="w-full space-y-1 shadow">
      <span class="text-sm font-bold">{nav.label}</span>
      <p>{nav.description}</p>
    </Alert>
  {/snippet}
  <!-- Glossary Status -->
  <SectionRow
    title={i18n('options_terms_status_title', { defaultValue: 'Glossary status' })}
    description={i18n('options_terms_status_description', {
      defaultValue: 'Custom glossary is currently disabled'
    })}>
    <Button slot="controls" class="w-full rounded-xl"
      >{i18n('options_terms_enable_button', { defaultValue: 'Enable glossary' })}</Button>
  </SectionRow>

  <!-- Empty State Hint -->
  <div
    class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
    {i18n('options_terms_empty_hint', {
      defaultValue: 'After enabling, you can add and manage terms here'
    })}
  </div>
</Section>
