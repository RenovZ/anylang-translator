<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import { i18n } from '@/lib/i18n';

  import Section from './Section.svelte';
</script>

<!-- Import/Export Settings Section -->
<Section
  id="import-export"
  title={i18n('options_import_export_title', { defaultValue: 'Import/Export' })}
  description={i18n('options_import_export_description', {
    defaultValue: 'Back up or restore all your configuration data.'
  })}>
  <!-- Import/Export Cards -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <!-- Export Card -->
    <div
      class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800">
      <h3 class="font-semibold dark:text-slate-100">
        {i18n('options_export_card_title', { defaultValue: 'Export config' })}
      </h3>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {i18n('options_export_card_description', {
          defaultValue: 'Save all current settings to a file'
        })}
      </p>
      <Button
        color="alternative"
        class="mt-4 w-full rounded-xl dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
        >{i18n('options_export_button', { defaultValue: 'Export' })}</Button>
    </div>

    <!-- Import Card -->
    <div
      class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800">
      <h3 class="font-semibold dark:text-slate-100">
        {i18n('options_import_card_title', { defaultValue: 'Import config' })}
      </h3>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {i18n('options_import_card_description', {
          defaultValue: 'Restore settings from a backup file'
        })}
      </p>
      <Button
        color="alternative"
        class="mt-4 w-full rounded-xl dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
        >{i18n('options_import_button', { defaultValue: 'Import' })}</Button>
    </div>
  </div>
</Section>
