<script module lang="ts">
  export function playAudio(original: string, langCode: DetectedLangCode) {
    if (!original.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(original);

    // Use detected language, fallback to en-US
    const lang = langCode && langCode !== 'und' ? langCode : 'en-US';
    utterance.lang = lang;

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang === lang) ??
      voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }
</script>

<script lang="ts">
  import LocalIcon from '@/components/LocalIcon.svelte';
  import type { DetectedLangCode } from '@/types/lang';

  interface Props {
    text: string;
    langCode: DetectedLangCode;
    ariaLabel?: string;
  }

  const { text, langCode, ariaLabel } = $props();

  function handleAudioClick(text: string, langCode: DetectedLangCode) {
    if (!text.trim()) return;
    playAudio(text, langCode);
  }
</script>

<button
  type="button"
  class="hover:text-primary-600 dark:hover:text-primary-400 ml-1 inline-flex items-center justify-center rounded-full p-0.5 text-gray-400 transition-colors dark:text-gray-500"
  onclick={() => handleAudioClick(text, langCode)}
  aria-label={ariaLabel}>
  <LocalIcon icon="tabler:volume" class="h-3.5 w-3.5" />
</button>
