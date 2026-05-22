<script module lang="ts">
  import IconAi302 from '~icons/lobehub/ai302';
  import IconAlibaba from '~icons/lobehub/alibaba';
  import IconAnthropic from '~icons/lobehub/anthropic';
  import IconBedrock from '~icons/lobehub/bedrock';
  import IconBing from '~icons/lobehub/bing';
  import IconCerebras from '~icons/lobehub/cerebras';
  import IconCohere from '~icons/lobehub/cohere';
  import IconDeepinfra from '~icons/lobehub/deepinfra';
  import IconDeepseek from '~icons/lobehub/deepseek';
  import IconFireworks from '~icons/lobehub/fireworks';
  import IconGemini from '~icons/lobehub/gemini';
  import IconGoogle from '~icons/lobehub/google';
  import IconGrok from '~icons/lobehub/grok';
  import IconGroq from '~icons/lobehub/groq';
  import IconHuggingface from '~icons/lobehub/huggingface';
  import IconKimi from '~icons/lobehub/kimi';
  import IconMinimax from '~icons/lobehub/minimax';
  import IconMistral from '~icons/lobehub/mistral';
  import IconMoonshot from '~icons/lobehub/moonshot';
  import IconOllama from '~icons/lobehub/ollama';
  import IconOpenai from '~icons/lobehub/openai';
  import IconOpenrouter from '~icons/lobehub/openrouter';
  import IconPerplexity from '~icons/lobehub/perplexity';
  import IconQwen from '~icons/lobehub/qwen';
  import IconReplicate from '~icons/lobehub/replicate';
  import IconSiliconcloud from '~icons/lobehub/siliconcloud';
  import IconTogether from '~icons/lobehub/together';
  import IconVercel from '~icons/lobehub/vercel';
  import IconVolcengine from '~icons/lobehub/volcengine';
  import IconXiaomimimo from '~icons/lobehub/xiaomimimo';
  import IconZai from '~icons/lobehub/zai';

  import { type Component } from 'svelte';

  const icons: Record<string, Component> = {
    ai302: IconAi302,
    alibaba: IconAlibaba,
    anthropic: IconAnthropic,
    bedrock: IconBedrock,
    bing: IconBing,
    cerebras: IconCerebras,
    cohere: IconCohere,
    deepinfra: IconDeepinfra,
    deepseek: IconDeepseek,
    fireworks: IconFireworks,
    gemini: IconGemini,
    google: IconGoogle,
    grok: IconGrok,
    groq: IconGroq,
    huggingface: IconHuggingface,
    kimi: IconKimi,
    minimax: IconMinimax,
    mistral: IconMistral,
    moonshotai: IconMoonshot,
    ollama: IconOllama,
    openai: IconOpenai,
    openrouter: IconOpenrouter,
    perplexity: IconPerplexity,
    qwen: IconQwen,
    replicate: IconReplicate,
    siliconcloud: IconSiliconcloud,
    together: IconTogether,
    vercel: IconVercel,
    volcengine: IconVolcengine,
    xiaomimimo: IconXiaomimimo,
    zai: IconZai
  };
</script>

<script lang="ts">
  import { Avatar } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  import avatar from '@/lib/avatar';

  interface ProviderIconProps {
    icon?: string;
    name: string;
    class?: string;
  }

  const { icon, name, class: className }: ProviderIconProps = $props();

  const IconComponent = $derived(icon ? icons[icon] : undefined);
</script>

{#if icon && name}
  {#if IconComponent}
    <IconComponent
      class={twMerge('flex h-auto w-6 shrink-0 text-black dark:text-white', className)} />
  {:else if icon === 'custom'}
    <Avatar
      class={twMerge('h-auto w-6 shrink-0', className)}
      src={avatar.dicebear(name, {
        chars: 1,
        backgroundType: ['gradientLinear']
      })}
      size="lg" />
  {/if}
{/if}
