<script lang="ts">
  import { Kbd, Tooltip } from 'flowbite-svelte';

  import config from '@/lib/config';
  import {
    getShortcutDisplay,
    getShortcutsSettingsUrl,
    openShortcutsSettings
  } from '@/lib/preset/shortcut';
  import i18n from '@/lib/i18n';
  import type { FeatureConfigKey } from '@/lib/types';

  import SectionRow from './SectionRow.svelte';

  interface Prop {
    title: string;
    description?: string;
    field: FeatureConfigKey;
  }

  const { title, description, field }: Prop = $props();
  const shortcutSettings = getShortcutsSettingsUrl();

  const handleClick = () => {
    openShortcutsSettings(
      () =>
        alert(
          i18n('shortcuts_copy_toast', {
            defaultValue: `Please manually paste the following address in the address bar:\n${shortcutSettings.url}\n\n(Copied to clipboard)`
          })
        ),
      () =>
        alert(
          i18n('shortcuts_manual_toast', {
            defaultValue: `Please manually enter in the address bar: ${shortcutSettings.url}`
          })
        )
    );
  };
</script>

<SectionRow {title} {description}>
  <div class="flex flex-col space-y-3" slot="controls">
    <div class="flex gap-2 self-end">
      {#each getShortcutDisplay($config[field].shortcut) as key (key)}
        <Kbd class="place-content-center border-none text-base shadow">{key}</Kbd>
      {/each}
    </div>
    <button
      type="button"
      class="text-primary-600 dark:text-primary-500 self-end text-sm"
      onclick={handleClick}>
      {i18n('customize_shortcuts', { defaultValue: 'Customize shortcuts' })}
    </button>
    {#if shortcutSettings.description}
      <Tooltip class="max-w-80">{shortcutSettings.description}</Tooltip>
    {/if}
  </div>
</SectionRow>
