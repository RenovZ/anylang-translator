<script lang="ts">
  import config from '@/lib/config';
  import { shouldEnableAutoTranslation } from '@/lib/translate/sw';
  import { INSTANT_LOOKUP_OVERLAY_ATTRIBUTE, NOTRANSLATE_CLASS } from '@/preset/dom';

  let tooltipContainerRef: HTMLElement | null = $state(null);

  $effect(() => {
    if (tooltipContainerRef) {
      tooltipContainerRef.setAttribute(INSTANT_LOOKUP_OVERLAY_ATTRIBUTE, '');
    }
  });

  // const shouldEnable = $derived(
  //   shouldEnableAutoTranslation(
  //     window.location.href,
  //     $config.langDetection.langCode,
  //     $config.sourceLangCode ?? 'auto',
  //     $config.instantLookup.autoAppliedSites,
  //     $config.instantLookup.autoAppliedLangs
  //   )
  // );
</script>

<div bind:this={tooltipContainerRef} class={NOTRANSLATE_CLASS}>123</div>
