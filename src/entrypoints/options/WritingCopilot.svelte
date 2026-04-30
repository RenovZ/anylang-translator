<script lang="ts">
  import i18n from '@/lib/i18n';
  import SectionRow from '@/components/SectionRow.svelte';

  import Section from './Section.svelte';
  import { writingCopilotNav as nav } from './data';
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
      <!-- TODO: -->
    </div>
  </SectionRow>
</Section>
