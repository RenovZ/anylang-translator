export type OptionsNavItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  position: 'top' | 'bottom';
  component?: import('svelte').Component;
  textStyle?: string;
  indicatorStyle?: string;
};
