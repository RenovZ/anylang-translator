<script lang="ts">
  import type { FeatureField } from '@/preset/feature';

  import Provider from './Provider.svelte';
  import SectionRow from './SectionRow.svelte';

  interface Prop {
    title?: string;
    description?: string;
    showFreeProviders?: boolean;
    field: FeatureField;
  }

  const { title = '', description = '', field, showFreeProviders = false }: Prop = $props();
</script>

<SectionRow {title} {description}>
  <div class="flex w-full flex-col items-end space-y-3" slot="controls">
    <Provider {field} {showFreeProviders} />
  </div>
</SectionRow>
