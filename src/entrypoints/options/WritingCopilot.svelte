<script lang="ts">
  import i18n from '@/lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<!-- Video Subtitles Settings Section -->
<Section
  title={i18n('options_subtitle_title', { defaultValue: 'Video subtitles' })}
  description={i18n('options_subtitle_description', {
    defaultValue: 'Configure bilingual subtitle translation for online videos.'
  })}>
  <!-- Auto-enable Subtitles Toggle -->
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
