<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<Section
  id="docs"
  title={i18n('options_docs_title', { defaultValue: 'Documentation' })}
  description={i18n('options_docs_description', {
    defaultValue: 'Read detailed feature guides and tutorials.'
  })}>
  <SectionRow
    title={i18n('options_docs_official_title', { defaultValue: 'Official docs' })}
    description={i18n('options_docs_official_description', {
      defaultValue: 'Detailed docs and FAQ for all features'
    })}>
    <Button slot="controls" color="light" class="w-full rounded-xl border-none shadow-md"
      >{i18n('options_docs_open_button', { defaultValue: 'Open docs' })}</Button>
  </SectionRow>
</Section>
