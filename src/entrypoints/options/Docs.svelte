<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import SectionRow from '@/components/SectionRow.svelte';

  import Section from './Section.svelte';
  import { docsNav } from './data';
</script>

<Section title={docsNav.title}>
  <!-- Official Docs Link -->
  <SectionRow
    title={i18n('options_docs_official_title', { defaultValue: 'Official docs' })}
    description={i18n('options_docs_official_description', {
      defaultValue: 'Detailed docs and FAQ for all features'
    })}>
    <Button
      slot="controls"
      color="alternative"
      class="w-full rounded-xl dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
      >{i18n('options_docs_open_button', { defaultValue: 'Open docs' })}</Button>
  </SectionRow>
</Section>
