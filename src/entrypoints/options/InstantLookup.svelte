<script lang="ts">
  import { Alert } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';

  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import { instantLookupNav as nav } from './data';
</script>

<Section title={nav.title}>
  {#snippet description()}
    <Alert color="yellow" class="w-full space-y-1 shadow">
      <span class="text-sm font-bold">{nav.label}</span>
      <p>{nav.description}</p>
    </Alert>
  {/snippet}

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
