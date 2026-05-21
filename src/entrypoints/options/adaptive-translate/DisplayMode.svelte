<script lang="ts">
  import TranslateModes from '@/components/AdaptiveTranslateModes.svelte';
  import SectionRow from '@/components/SectionRow.svelte';
  import i18n from '@/lib/i18n';
</script>

<SectionRow
  title={i18n('translate_display_mode', {
    defaultValue: 'Translate Display Mode'
  })}
  description={i18n('translate_display_mode_description', {
    defaultValue: 'Choose how the translated text is displayed: bilingual or translation only.'
  })}>
  <TranslateModes slot="controls" />
</SectionRow>
