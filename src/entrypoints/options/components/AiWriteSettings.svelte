<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<Section
  id="writing"
  title={i18n('options_writing_title', { defaultValue: 'AI Write' })}
  description={i18n('options_writing_description', {
    defaultValue: 'Configure AI writing assistance and polishing features.'
  })}>
  <SectionRow
    title={i18n('options_writing_status_title', { defaultValue: 'Feature status' })}
    description={i18n('options_writing_status_description', {
      defaultValue:
        'This version includes an entry point; saveable style and scenario presets will be added later.'
    })}>
    <div
      slot="controls"
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {i18n('options_writing_status_body', {
        defaultValue:
          'Writing templates, tone preferences, and auto-polish rules will be available in future versions.'
      })}
    </div>
  </SectionRow>
  <SectionRow
    title={i18n('options_writing_usage_title', { defaultValue: 'Recommended usage' })}
    description={i18n('options_writing_usage_description', {
      defaultValue:
        'For now, choose model and prompt in popup panel first, then use writing capability.'
    })}>
    <Button slot="controls" color="light" class="w-full rounded-xl border-none shadow-md"
      >{i18n('options_writing_view_soon_button', {
        defaultValue: 'View upcoming capabilities'
      })}</Button>
  </SectionRow>
</Section>
