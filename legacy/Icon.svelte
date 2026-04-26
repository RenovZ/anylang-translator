<script lang="ts">
  import IconifyIcon from '@iconify/svelte';
  import { addIcon } from '@iconify/svelte';
  import { icons as flowbiteIcons } from '@iconify-json/flowbite';

  // 只打包项目中 hardcoded 使用的具体图标，不是整个集合
  addIcon('flowbite:chevron-down-outline', flowbiteIcons['chevron-down-outline']);
  addIcon('flowbite:chevron-right-outline', flowbiteIcons['chevron-right-outline']);
  addIcon('flowbite:plus-outline', flowbiteIcons['plus-outline']);
  addIcon('flowbite:trash-bin-outline', flowbiteIcons['trash-bin-outline']);
  addIcon('flowbite:eye-outline', flowbiteIcons['eye-outline']);
  addIcon('flowbite:eye-slash-outline', flowbiteIcons['eye-slash-outline']);
  addIcon('flowbite:question-circle-outline', flowbiteIcons['question-circle-outline']);
  addIcon('flowbite:arrow-right-outline', flowbiteIcons['arrow-right-outline']);
  addIcon('flowbite:language-outline', flowbiteIcons['language-outline']);
  addIcon('flowbite:cog-outline', flowbiteIcons['cog-outline']);
  addIcon('flowbite:wand-magic-sparkles-solid', flowbiteIcons['wand-magic-sparkles-solid']);

  let {
    icon,
    class: className = '',
    size = 20
  }: {
    icon: string;
    class?: string;
    size?: number | string;
  } = $props();
</script>

<IconifyIcon {icon} width={size} height={size} class={className} />
