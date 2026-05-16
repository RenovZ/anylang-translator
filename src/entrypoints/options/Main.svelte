<script lang="ts">
  import { Button, Indicator, Toast } from 'flowbite-svelte';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import { browser, type PublicPath } from 'wxt/browser';

  import '@/assets/app.css';

  import i18n from '@/lib/i18n';
  import shortcut from '@/lib/shortcut';

  import { bottomNavItems, topNavItems } from './data';
  import Empty from './Empty.svelte';

  const navItems = [...topNavItems, ...bottomNavItems];

  let activeNavId: string = $state(navItems[0].id);
  const activeNav = $derived(navItems.find((item) => item.id === activeNavId));

  onMount(() => {
    shortcut.main();
    syncActiveNavWithHash();
    window.addEventListener('hashchange', syncActiveNavWithHash);
    return () => window.removeEventListener('hashchange', syncActiveNavWithHash);
  });

  const syncActiveNavWithHash = () => {
    const hash = window.location.hash.replace(/^#/, '');
    activeNavId = navItems.find((item) => item.id === hash)?.id ?? navItems[0].id;
  };

  const goToSection = (id: string) => {
    if (window.location.hash !== `#${id}`) {
      window.location.hash = id;
    }
  };

  // const hoverCssUrl = browser.runtime.getURL('/contentScript/css/styles.css' as PublicPath);
</script>

<!-- <svelte:head>
  <link rel="stylesheet" href={hoverCssUrl} />
</svelte:head> -->

<!-- Header -->
<header
  class="sticky top-0 z-99 flex shrink-0 items-center justify-between bg-white/80 px-6 py-4 shadow backdrop-blur-xs dark:bg-slate-900/80">
  <div class="flex items-center gap-3">
    <div class="bg-primary-500 rounded-xl p-2 text-white shadow-md">
      <WandMagicSparklesSolid class="h-5 w-5" />
    </div>
    <div class="flex items-center gap-3">
      <span class="text-lg font-semibold">
        {i18n('options_title_extension_name', { defaultValue: 'Anylang Translator' })}
      </span>
      <span class="text-slate-400">v0.0.1</span>
    </div>
  </div>
  <Button
    color="alternative"
    class="rounded-xl px-4 py-2 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
    ⚒️ {i18n('options_button_toolbox', { defaultValue: 'Toolbox' })}
  </Button>
</header>

<!-- Main Content -->
<main class="grid min-h-0 w-full flex-1 grid-cols-1 gap-8 px-6 py-8 sm:grid-cols-[240px_1fr]">
  <!-- Sidebar -->
  <aside
    class="flex min-h-0 flex-col justify-between overflow-y-auto rounded-2xl bg-white/80 p-4 shadow-md dark:bg-slate-900/80">
    <div>
      {#each topNavItems as item (item.id)}
        <a
          href={`#${item.id}`}
          onclick={() => goToSection(item.id)}
          class={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
            activeNavId === item.id
              ? twMerge(
                  'text-primary-600 bg-slate-100 font-semibold dark:bg-slate-600',
                  'textStyle' in item ? item.textStyle : ''
                )
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-100 hover:dark:bg-slate-700'
          }`}>
          <span>{item.title}</span>
          {#if 'indicatorStyle' in item && item.indicatorStyle}
            <Indicator class={item.indicatorStyle} />
          {/if}
        </a>
      {/each}
    </div>
    <div class="space-y-1">
      {#each bottomNavItems as item (item.id)}
        <a
          href={`#${item.id}`}
          onclick={() => goToSection(item.id)}
          class={`flex w-full items-center rounded-2xl px-4 py-3 text-left transition ${
            activeNavId === item.id
              ? 'text-primary-600 bg-slate-100 font-semibold dark:bg-slate-600'
              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-100 hover:dark:bg-slate-700'
          }`}>
          {item.title}
        </a>
      {/each}
    </div>
  </aside>

  <!-- Content Area - Dynamic component rendering -->
  {#if activeNav}
    <activeNav.component />
  {:else}
    <Empty />
  {/if}
</main>
