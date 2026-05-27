<script lang="ts">
  import { Button, Dropdown, DropdownItem, Kbd, Toggle } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import SectionRow from '@/components/SectionRow.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { TRIGGER_HOTKEYS, TRIGGER_ON_HOVER } from '@/preset/translate';
</script>

<SectionRow
  title={i18n('translate_selection_trigger', {
    defaultValue: 'Hover or Long-Press Translation Shortcut'
  })}
  description={i18n('translate_selection_trigger_description', {
    defaultValue: 'Customize the hover modifier key or use long press to translate paragraphs'
  })}>
  <div slot="controls" class="flex flex-col gap-2">
    <!-- NOTE: add relative to fix input[type="checkbox"] sr-only style bug -->
    <Toggle
      class="relative self-end"
      classes={{ span: 'me-0' }}
      bind:checked={$config.adaptiveTranslate.translate.triggerOnHover.enabled}>
    </Toggle>
    <Button
      disabled={!$config.adaptiveTranslate.translate.triggerOnHover.enabled}
      class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
      <span>
        {#if TRIGGER_HOTKEYS.includes($config.adaptiveTranslate.translate.triggerOnHover.hotkey)}
          <!-- <Kbd>{HOTKEY_ICONS[$config.adaptiveTranslate.translate.triggerOnHover.hotkey]}</Kbd> -->
          <Kbd>{$config.adaptiveTranslate.translate.triggerOnHover.hotkey}</Kbd>
        {:else}
          {i18n('unsupported_trigger', { defaultValue: 'Unsupported Trigger' })}
        {/if}
      </span>
      <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
    </Button>
    <Dropdown
      simple
      placement="bottom-end"
      class="max-h-80 overflow-y-auto bg-white/80 shadow-md backdrop-blur-xs dark:bg-slate-900/80">
      {#each TRIGGER_ON_HOVER as { hotkey, label } (hotkey)}
        <DropdownItem
          class="flex items-center gap-2"
          onclick={() => ($config.adaptiveTranslate.translate.triggerOnHover.hotkey = hotkey)}>
          <!-- <Kbd>{HOTKEY_ICONS[key]}</Kbd> -->
          <Kbd>{hotkey}</Kbd>
          {label}
        </DropdownItem>
      {/each}
    </Dropdown>
  </div>
</SectionRow>
