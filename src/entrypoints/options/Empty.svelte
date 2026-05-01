<script lang="ts">
  import i18n from '@/lib/i18n';

  import Section from './Section.svelte';

  interface Props {
    message?: string;
  }

  let { message }: Props = $props();
</script>

<Section>
  <div class="flex h-64 items-center justify-center text-gray-400">
    <p>
      {message ??
        i18n('select_a_navigation_item_to_access', {
          defaultValue: 'Select a navigation item to access'
        })}
    </p>
  </div>
</Section>
