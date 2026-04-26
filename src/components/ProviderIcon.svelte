<script lang="ts">
  import { Avatar } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  import avatar from '@/lib/avatar';
  import type { Provider } from '@/lib/types';

  let {
    provider,
    avatarClass,
    imgClass
  }: {
    provider: Provider;
    avatarClass?: string;
    imgClass?: string;
  } = $props();
</script>

{#if provider.icon}
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset={`https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/${provider.icon}.webp`} />
    <img
      alt={provider.name}
      class={twMerge('flex h-6 w-6', imgClass)}
      src={`https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/${provider.icon}.webp`} />
  </picture>
{:else}
  <Avatar
    class={twMerge('h-6 w-6', avatarClass)}
    src={avatar.dicebear(provider.name, {
      chars: 1,
      backgroundType: ['gradientLinear']
    })}
    size="lg" />
{/if}
