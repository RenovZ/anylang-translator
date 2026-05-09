import { mount } from 'svelte';
import { twMerge } from 'tailwind-merge';

import Main from './Main.svelte';

const target = document.body;
target.classList = twMerge(
  'h-screen overflow-hidden flex flex-col bg-slate-100 text-sm text-slate-900 dark:bg-slate-950/80 dark:text-slate-50'
);

const main = mount(Main, {
  target
});

export default main;
