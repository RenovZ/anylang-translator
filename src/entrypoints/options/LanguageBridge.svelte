<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<!-- AI Write Settings Section -->
<Section
  title={i18n('options_writing_title', { defaultValue: 'AI Write' })}
  description={i18n('options_writing_description', {
    defaultValue: 'Configure AI writing assistance and polishing features.'
  })}>
  <!-- Feature Status Info -->
  <SectionRow
    title={i18n('options_writing_status_title', { defaultValue: 'Feature status' })}
    description={i18n('options_writing_status_description', {
      defaultValue:
        'This version includes an entry point; saveable style and scenario presets will be added later.'
    })}>
    <div
      slot="controls"
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
      {i18n('options_writing_status_body', {
        defaultValue:
          'Writing templates, tone preferences, and auto-polish rules will be available in future versions.'
      })}
    </div>
  </SectionRow>

  <!-- Recommended Usage Link -->
  <SectionRow
    title={i18n('options_writing_usage_title', { defaultValue: 'Recommended usage' })}
    description={i18n('options_writing_usage_description', {
      defaultValue:
        'For now, choose model and prompt in popup panel first, then use writing capability.'
    })}>
    <Button
      slot="controls"
      color="alternative"
      class="w-full rounded-xl dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
      >{i18n('options_writing_view_soon_button', {
        defaultValue: 'View upcoming capabilities'
      })}</Button>
  </SectionRow>
</Section>
