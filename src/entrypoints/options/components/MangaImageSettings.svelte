<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<Section
  id="manga"
  title={i18n('options_manga_title', { defaultValue: 'Manga/Images' })}
  description={i18n('options_manga_description', {
    defaultValue: 'Configure translation recognition settings for images and manga.'
  })}>
  <SectionRow
    title={i18n('options_manga_ocr_title', { defaultValue: 'Image recognition' })}
    description={i18n('options_manga_ocr_description', {
      defaultValue:
        'This capability follows main translation service settings; granular OCR options will arrive later.'
    })}>
    <div
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {i18n('options_manga_ocr_body', {
        defaultValue:
          'No standalone OCR engine config is needed now; global service config is reused.'
      })}
    </div>
  </SectionRow>
  <SectionRow
    title={i18n('options_manga_scene_title', { defaultValue: 'Applicable scenarios' })}
    description={i18n('options_manga_scene_description', {
      defaultValue: 'Useful for manga dialogue, screenshots, and subtitle-free image content.'
    })}>
    <Button color="light" class="w-full rounded-xl border-none shadow-md"
      >{i18n('options_manga_guide_button', {
        defaultValue: 'View image translation guide'
      })}</Button>
  </SectionRow>
</Section>
