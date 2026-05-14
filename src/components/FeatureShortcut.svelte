<script lang="ts">
  import { Kbd, Tooltip } from 'flowbite-svelte';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import shortcut from '@/lib/shortcut';
  import type { FeatureField } from '@/preset/constants';

  import SectionRow from './SectionRow.svelte';
  import type { ToastWrapperProp } from './ToastWrapper.svelte';
  import ToastWrapper from './ToastWrapper.svelte';

  interface Prop {
    title: string;
    description?: string;
    field: FeatureField;
  }

  const { title, description, field }: Prop = $props();
  const shortcutSettings = shortcut.getSettingsUrl();

  let toast = $state<ToastWrapperProp>({
    show: false,
    type: 'success',
    message: ''
  });
  let toastTitles = $state<string[]>([]);

  const showToast = (type: 'success' | 'error', titles: string[], message: string) => {
    toastTitles = titles;
    toast = { show: true, type, message };
  };

  const copiedToClipboard = i18n('copied_to_clipboard', {
    defaultValue: `(Copied to clipboard)`
  });

  const handleClick = () => {
    shortcut.openSettings(
      () =>
        showToast(
          'success',
          [
            i18n('shortcuts_copy_toast', {
              defaultValue: `Please manually paste the following address in the address bar.`
            }),
            copiedToClipboard
          ],
          shortcutSettings.url
        ),
      () =>
        showToast(
          'error',
          [
            i18n('shortcuts_manual_toast', {
              defaultValue: 'Please manually enter in the address bar.'
            }),
            copiedToClipboard
          ],
          shortcutSettings.url
        )
    );
  };
</script>

<ToastWrapper bind:show={toast.show} type={toast.type} message={toast.message}>
  {#snippet title()}
    <div class="mb-1 flex flex-col text-sm font-semibold text-gray-900 dark:text-white">
      {#each toastTitles as title (title)}
        <span>{title}</span>
      {/each}
    </div>
  {/snippet}
</ToastWrapper>
<SectionRow {title} {description}>
  <div class="flex flex-col space-y-3" slot="controls">
    <div class="flex gap-2 self-end">
      {#each shortcut.formatForDisplay($config[field].shortcut) as key (key)}
        <Kbd class="place-content-center border-none px-3 py-2 text-base shadow">{key}</Kbd>
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
