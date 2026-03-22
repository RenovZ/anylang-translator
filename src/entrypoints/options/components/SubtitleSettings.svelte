<script lang="ts">
  import { Toggle } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import type { OptionsSectionSharedProps } from './section-props';

  export let toggleItems: OptionsSectionSharedProps['toggleItems'];
</script>

<Section
  id="subtitle"
  title={i18n('options_subtitle_title', { defaultValue: 'Video subtitles' })}
  description={i18n('options_subtitle_description', {
    defaultValue: 'Configure bilingual subtitle translation for online videos.'
  })}>
  <SectionRow
    title={i18n('options_subtitle_auto_title', {
      defaultValue: 'Auto-enable bilingual subtitles'
    })}
    description={i18n('options_subtitle_auto_description', {
      defaultValue: 'Automatically show bilingual subtitles on supported sites'
    })}>
    <div class="flex items-center justify-end">
      <Toggle
        bind:checked={toggleItems[4].enabled}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label={i18n('options_subtitle_auto_aria', {
          defaultValue: 'Auto-enable bilingual subtitles'
        })} />
    </div>
  </SectionRow>
</Section>
