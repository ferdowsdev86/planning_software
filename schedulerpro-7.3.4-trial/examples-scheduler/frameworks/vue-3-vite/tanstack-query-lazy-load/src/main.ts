import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { queryClient } from './queryClient';

// Install the shared QueryClient app-wide. The lazy-loading stores fetch through the
// same instance imperatively (see schedulerApi.ts), so its cache is reused everywhere.
createApp(App)
    .use(VueQueryPlugin, { queryClient })
    .mount('#app');
