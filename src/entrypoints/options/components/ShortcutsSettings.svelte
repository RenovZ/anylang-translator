<script lang="ts">
  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<Section
  id="shortcuts"
  title={i18n('options_shortcuts_title', { defaultValue: 'Shortcuts' })}
  description={i18n('options_shortcuts_description', {
    defaultValue: 'Customize global and in-page shortcuts.'
  })}>
  <SectionRow
    title={i18n('options_shortcuts_window_title', {
      defaultValue: 'Standalone translation window'
    })}
    description={i18n('options_shortcuts_window_description', {
      defaultValue: 'Global shortcut to open the standalone translation window'
    })}>
    <div class="flex items-center justify-end gap-2">
      <kbd
        class="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800"
        >Alt</kbd>
      <span>+</span>
      <kbd
        class="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800"
        >T</kbd>
    </div>
  </SectionRow>
</Section>
