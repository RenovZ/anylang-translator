<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<Section
  id="terms"
  title={i18n('options_terms_title', { defaultValue: 'AI terminology' })}
  description={i18n('options_terms_description', {
    defaultValue: 'Manage your translation glossary for consistent terms.'
  })}>
  <SectionRow
    title={i18n('options_terms_status_title', { defaultValue: 'Glossary status' })}
    description={i18n('options_terms_status_description', {
      defaultValue: 'Custom glossary is currently disabled'
    })}>
    <Button slot="controls" class="w-full rounded-xl"
      >{i18n('options_terms_enable_button', { defaultValue: 'Enable glossary' })}</Button>
  </SectionRow>
  <div class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
    {i18n('options_terms_empty_hint', {
      defaultValue: 'After enabling, you can add and manage terms here'
    })}
  </div>
</Section>
