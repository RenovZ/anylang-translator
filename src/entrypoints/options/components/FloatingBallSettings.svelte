<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<!-- Floating Ball Settings Section -->
<Section
  id="floating"
  title={i18n('options_floating_title', { defaultValue: 'Floating ball' })}
  description={i18n('options_floating_description', {
    defaultValue: 'Quick translation floating ball settings on page edges.'
  })}>
  <!-- Current Strategy Info -->
  <SectionRow
    title={i18n('options_floating_strategy_title', { defaultValue: 'Current strategy' })}
    description={i18n('options_floating_strategy_description', {
      defaultValue:
        'Floating ball follows page translation rules; standalone behavior controls are planned for later versions.'
    })}>
    <div
      slot="controls"
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
      {i18n('options_floating_strategy_body', {
        defaultValue:
          'The floating ball does not save its own switch yet and follows page translation and site rules.'
      })}
    </div>
  </SectionRow>

  <!-- Site Rules Link -->
  <SectionRow
    title={i18n('options_floating_site_rule_title', { defaultValue: 'Site rules' })}
    description={i18n('options_floating_site_rule_description', {
      defaultValue: 'To adjust auto-translation sites, open the site list in General settings.'
    })}>
    <Button
      slot="controls"
      color="alternative"
      class="w-full rounded-xl dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
      >{i18n('options_floating_site_rule_button', {
        defaultValue: 'View site rule guide'
      })}</Button>
  </SectionRow>
</Section>
