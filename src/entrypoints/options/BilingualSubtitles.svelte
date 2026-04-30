<script lang="ts">
  import { Toggle } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import SectionRow from '@/components/SectionRow.svelte';

  import Section from './Section.svelte';
  import { bilingualSubtitlesNav as nav } from './data';

  // Local state instead of props
  let autoEnable = $state(false);
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <SectionRow
    title={i18n('options_subtitle_auto_title', {
      defaultValue: 'Auto-enable bilingual subtitles'
    })}
    description={i18n('options_subtitle_auto_description', {
      defaultValue: 'Automatically show bilingual subtitles on supported sites'
    })}>
    <div slot="controls" class="flex items-center justify-end">
      <Toggle
        bind:checked={autoEnable}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label={i18n('options_subtitle_auto_aria', {
          defaultValue: 'Auto-enable bilingual subtitles'
        })} />
    </div>
  </SectionRow>
</Section>
