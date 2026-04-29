<script lang="ts">
  import i18n from '@/lib/i18n';

  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import { intelligentInputNav as nav } from './data';
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <SectionRow
    title={i18n('options_input_status_title', { defaultValue: 'Feature status' })}
    description={i18n('options_input_status_description', {
      defaultValue: 'Trigger conditions are being unified into one shortcut system.'
    })}>
    <div
      slot="controls"
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
      {i18n('options_input_status_body', {
        defaultValue:
          'This version keeps the entry hint; the actual shortcut switch will be added once shortcut settings stabilize.'
      })}
    </div>
  </SectionRow>
</Section>
