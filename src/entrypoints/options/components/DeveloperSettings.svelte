<script lang="ts">
  import { i18n } from '@/lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<!-- Developer Settings Section -->
<Section
  id="developer"
  title={i18n('options_developer_title', { defaultValue: 'Developer settings' })}
  description={i18n('options_developer_description', {
    defaultValue: 'Advanced options for developer debugging and testing.'
  })}>
  <!-- Debug Capability Info -->
  <SectionRow
    title={i18n('options_developer_debug_title', { defaultValue: 'Debug capability' })}
    description={i18n('options_developer_debug_description', {
      defaultValue: 'No standalone persisted developer debug switch is currently provided.'
    })}>
    <div
      slot="controls"
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
      {i18n('options_developer_debug_body', {
        defaultValue:
          'For troubleshooting, use extension management page, console logs, and feedback entry.'
      })}
    </div>
  </SectionRow>
</Section>
