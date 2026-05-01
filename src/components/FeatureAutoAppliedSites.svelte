<script lang="ts">
  import { Button, Checkbox, Input, Label } from 'flowbite-svelte';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import type { FeatureField } from '@/lib/types';

  import SectionRow from './SectionRow.svelte';

  interface Props {
    title: string;
    description: string;
    field: FeatureField;
  }

  const { title, description, field }: Props = $props();

  let newSite = $state('');
  let editingSite = $state<string | null>(null);
  let editingValue = $state('');
  let batchMode = $state(false);
  let selectedSites = $state<string[]>([]);
</script>

<SectionRow {title} {description}>
  <div class="flex gap-2" slot="controls">
    <Input
      type="text"
      placeholder="example.com"
      class="border-none bg-gray-50 shadow placeholder:text-slate-400 dark:bg-gray-600"
      bind:value={newSite} />
    <Button
      class="rounded-xl border-none shadow"
      disabled={!newSite}
      onclick={async () => {
        if (!$config[field].autoAppliedSites) {
          $config[field].autoAppliedSites = [];
        }

        if (!$config[field].autoAppliedSites.includes(newSite)) {
          $config[field].autoAppliedSites = [...$config[field].autoAppliedSites, newSite];
        }

        newSite = '';
      }}>
      {i18n('add', { defaultValue: 'Add' })}
    </Button>
  </div>
  <div class="flex items-center justify-between">
    <button
      class="text-primary-600 mt-3 cursor-pointer text-sm"
      onclick={() => {
        if (batchMode) {
          batchMode = false;
          selectedSites = [];
        } else {
          batchMode = true;
          if ($config[field].autoAppliedSites) {
            selectedSites = [...$config[field].autoAppliedSites];
          }
        }
      }}>
      {batchMode
        ? i18n('cancel_batch', { defaultValue: 'Cancel batch' })
        : i18n('batch_ops', { defaultValue: 'Batch operations' })}
    </button>
    {#if batchMode && selectedSites.length > 0}
      <Button
        color="red"
        size="sm"
        onclick={() => {
          $config[field].autoAppliedSites = $config[field].autoAppliedSites?.filter(
            (s) => !selectedSites.includes(s)
          );
          selectedSites = [];
          batchMode = false;
        }}>
        {i18n('delete_selected', { defaultValue: 'Delete selected' })}({selectedSites.length})
      </Button>
    {/if}
  </div>
  <div
    class="max-h-80 space-y-1 overflow-y-auto rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700">
    {#if $config[field].autoAppliedSites}
      {#each $config[field].autoAppliedSites as site (site)}
        <div class="flex items-center justify-between pb-3 last:pb-0">
          {#if editingSite === site}
            <Input
              type="text"
              bind:value={editingValue}
              class="mr-2 flex-1"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  if ($config[field].autoAppliedSites) {
                    const idx = $config[field].autoAppliedSites.indexOf(site);
                    if (idx !== -1 && editingValue.trim()) {
                      const newList = [...$config[field].autoAppliedSites];
                      newList[idx] = editingValue.trim();
                      $config[field].autoAppliedSites = newList;
                    }
                  }
                  editingSite = null;
                } else if (e.key === 'Escape') {
                  editingSite = null;
                }
              }} />
            <div class="text-primary-600 flex items-center gap-4">
              <button
                type="button"
                onclick={() => {
                  if ($config[field].autoAppliedSites) {
                    const idx = $config[field].autoAppliedSites.indexOf(site);
                    if (idx !== -1 && editingValue.trim()) {
                      const newList = [...$config[field].autoAppliedSites];
                      newList[idx] = editingValue.trim();
                      $config[field].autoAppliedSites = newList;
                    }
                  }
                  editingSite = null;
                }}>
                {i18n('save', { defaultValue: 'Save' })}
              </button>
              <button
                type="button"
                onclick={() => {
                  editingSite = null;
                }}>
                {i18n('cancel', { defaultValue: 'Cancel' })}
              </button>
            </div>
          {:else}
            <Label>
              {#if batchMode}
                <Checkbox
                  checked={selectedSites.includes(site)}
                  onchange={() => {
                    if (selectedSites.includes(site)) {
                      selectedSites = selectedSites.filter((s) => s !== site);
                    } else {
                      selectedSites = [...selectedSites, site];
                    }
                  }} />
              {/if}
              <span class="font-medium" class:ms-2={batchMode}>{site}</span>
            </Label>
            <div class="text-primary-600 flex items-center gap-4">
              <button
                type="button"
                onclick={() => {
                  editingSite = site;
                  editingValue = site;
                }}>
                {i18n('edit', { defaultValue: 'Edit' })}
              </button>
              <button
                type="button"
                onclick={() => {
                  $config[field].autoAppliedSites = $config[field].autoAppliedSites?.filter(
                    (s) => s !== site
                  );
                }}>
                {i18n('delete', { defaultValue: 'Delete' })}
              </button>
            </div>
          {/if}
        </div>
      {/each}
    {:else}
      <p class="text-center text-sm text-gray-500 dark:text-gray-400">
        {i18n('no_sites', { defaultValue: 'No sites' })}
      </p>
    {/if}
  </div>
</SectionRow>
