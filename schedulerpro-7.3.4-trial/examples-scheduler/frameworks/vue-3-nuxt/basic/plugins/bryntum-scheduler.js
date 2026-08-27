import { defineNuxtPlugin } from '#app';
import { BryntumScheduler } from '@bryntum/schedulerpro-vue-3';

export default defineNuxtPlugin((nuxtApp) => {
    // Register Bryntum Scheduler component globally
    nuxtApp.vueApp.component('BryntumScheduler', BryntumScheduler);
});
