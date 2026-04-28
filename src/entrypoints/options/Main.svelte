<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';
  import { browser, type PublicPath } from 'wxt/browser';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';

  import '@/assets/app.css';
  import i18n from '@/lib/i18n';

  import Empty from './Empty.svelte';
  import { topNavItems, bottomNavItems } from './data';

  const navItems = [...topNavItems, ...bottomNavItems];

  let activeNavId: string = $state(navItems[0].id);
  const activeNav = $derived(navItems.find((item) => item.id === activeNavId));

  onMount(() => {
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

  const hoverCssUrl = browser.runtime.getURL('/contentScript/css/styles.css' as PublicPath);
</script>

<svelte:head>
  <link rel="stylesheet" href={hoverCssUrl} />
</svelte:head>
<main
  class="min-h-screen bg-slate-100 text-sm text-slate-900 dark:bg-slate-950/80 dark:text-slate-50">
  <!-- Header -->
  <header
    id="page-header"
    class="sticky top-0 z-99 bg-white/80 shadow backdrop-blur-xs dark:bg-slate-900/80">
    <div class="mx-auto flex items-center justify-between px-6 py-4">
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
    </div>
  </header>

  <!-- Main Content -->
  <div id="page-main" class="mx-auto grid max-w-7xl grid-cols-[240px_1fr] gap-8 px-6 py-8">
    <!-- Sidebar -->
    <aside
      id="page-sidebar"
      class="sticky top-24 z-10 flex h-[calc(100vh-8rem)] flex-col justify-between overflow-y-auto rounded-2xl bg-white/80 p-4 shadow-md dark:bg-slate-900/80">
      <div>
        {#each topNavItems as item (item.id)}
          <a
            href={`#${item.id}`}
            onclick={() => goToSection(item.id)}
            class={`flex w-full items-center rounded-2xl px-4 py-3 text-left transition ${
              activeNavId === item.id
                ? 'text-primary-600 bg-slate-100 font-semibold dark:bg-slate-600'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-100 hover:dark:bg-slate-700'
            }`}>
            {item.label}
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
            {item.label}
          </a>
        {/each}
      </div>
    </aside>

    <!-- Content Area - Dynamic component rendering -->
    {#if activeNav}
      {@const SvelteComponent = activeNav.component}
      <SvelteComponent />
      <!-- <activeNav.component /> -->
    {:else}
      <Empty />
    {/if}
  </div>
</main>
