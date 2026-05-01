import { mount } from 'svelte';

import Main from './Main.svelte';

const main = mount(Main, {
  target: document.getElementById('app')!
});

export default main;
