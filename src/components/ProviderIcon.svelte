<script lang="ts">
  import { Avatar } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  import avatar from '@/lib/avatar';
  import type { ProviderConfig } from '@/types/provider';

  const {
    icon,
    name,
    class: className
  }: {
    icon?: string;
    name: string;
    class?: string;
  } = $props();
</script>

{#if icon}
  {#if icon}
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        srcset={`https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/${icon}.webp`} />
      <img
        alt={name}
        class={twMerge('flex h-auto w-6 shrink-0', className)}
        src={`https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/${icon}.webp`} />
    </picture>
  {:else}
    <Avatar
      class={twMerge('h-auto w-6 shrink-0', className)}
      src={avatar.dicebear(name, {
        chars: 1,
        backgroundType: ['gradientLinear']
      })}
      size="lg" />
  {/if}
{/if}
