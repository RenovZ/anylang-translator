<script lang="ts">
  import { i18n } from '@/lib/i18n';

  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<!-- Shortcuts Settings Section -->
<Section
  id="shortcuts"
  title={i18n('options_shortcuts_title', { defaultValue: 'Shortcuts' })}
  description={i18n('options_shortcuts_description', {
    defaultValue: 'Customize global and in-page shortcuts.'
  })}>
  <!-- Standalone Window Shortcut -->
  <SectionRow
    title={i18n('options_shortcuts_window_title', {
      defaultValue: 'Standalone translation window'
    })}
    description={i18n('options_shortcuts_window_description', {
      defaultValue: 'Global shortcut to open the standalone translation window'
    })}>
    <div slot="controls" class="flex items-center justify-end gap-2">
      <kbd
        class="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >Alt</kbd>
      <span class="dark:text-slate-400">+</span>
      <kbd
        class="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >T</kbd>
    </div>
  </SectionRow>
</Section>
