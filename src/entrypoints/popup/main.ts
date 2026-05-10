import { mount } from 'svelte';
import { twMerge } from 'tailwind-merge';

import Main from './Main.svelte';

const target = document.body;
target.classList = twMerge('min-w-80 bg-slate-100 text-sm dark:bg-slate-950/80');

const main = mount(Main, { target });

export default main;
