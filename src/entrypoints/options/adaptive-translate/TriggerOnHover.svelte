<script lang="ts">
  import { Button, Dropdown, DropdownItem, Kbd } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import SectionRow from '@/components/SectionRow.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { HOTKEY_EVENT_KEYS, HOTKEY_ICONS, HOTKEYS } from '@/preset/translate';
</script>

<SectionRow
  title={i18n('translate_selection_trigger', {
    defaultValue: 'Hover or Long-Press Translation Shortcut'
  })}
  description={i18n('translate_selection_trigger_description', {
    defaultValue: 'Customize the hover modifier key or use long press to translate paragraphs'
  })}>
  <div slot="controls">
    <Button
      class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
      <span>
        {#if HOTKEYS.includes($config.adaptiveTranslate.translate.triggerOnHover)}
          <Kbd>{HOTKEY_ICONS[$config.adaptiveTranslate.translate.triggerOnHover]}</Kbd>
          <Kbd>{HOTKEY_EVENT_KEYS[$config.adaptiveTranslate.translate.triggerOnHover]}</Kbd>
        {:else}
          {i18n('unsupported_trigger', { defaultValue: 'Unsupported Trigger' })}
        {/if}
      </span>
      <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
    </Button>
    <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
      {#each HOTKEYS as key (key)}
        <DropdownItem onclick={() => ($config.adaptiveTranslate.translate.triggerOnHover = key)}>
          <Kbd>{HOTKEY_ICONS[key]}</Kbd>
          <Kbd>{HOTKEY_EVENT_KEYS[key]}</Kbd>
        </DropdownItem>
      {/each}
    </Dropdown>
  </div>
</SectionRow>
