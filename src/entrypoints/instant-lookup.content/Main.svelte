<script lang="ts">
  // import '@/assets/app.css';

  import { twMerge } from 'tailwind-merge';

  import { NOTRANSLATE_CLASS } from '@/preset/dom';

  import Toolbar from './Toolbar.svelte';
</script>

<div class="bg-green-500">
  <Toolbar />
  Hello, World!
</div>
