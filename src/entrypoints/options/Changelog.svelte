<script lang="ts">
  import i18n from '@/lib/i18n';
  import Section from './Section.svelte';
</script>

<!-- Changelog Settings Section -->
<Section
  title={i18n('options_changelog_title', { defaultValue: 'Changelog' })}
  description={i18n('options_changelog_description', {
    defaultValue: 'View recent updates and new features.'
  })}>
  <!-- Changelog Timeline -->
  <div class="space-y-6 border-l-2 border-slate-200 pl-6 dark:border-slate-700">
    <!-- Version Entry -->
    <div class="relative">
      <div
        class="bg-primary-500 absolute top-1 -left-7.75 h-4 w-4 rounded-full border-4 border-white dark:border-slate-900">
      </div>
      <h3 class="font-semibold dark:text-slate-100">v0.0.1</h3>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">2024-01-01</p>
      <ul class="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
        <li>{i18n('options_changelog_item_1', { defaultValue: 'Initial release' })}</li>
        <li>
          {i18n('options_changelog_item_2', {
            defaultValue: 'Supports multiple AI translation services'
          })}
        </li>
        <li>
          {i18n('options_changelog_item_3', {
            defaultValue: 'Supports bilingual webpage translation'
          })}
        </li>
      </ul>
    </div>
  </div>
</Section>
