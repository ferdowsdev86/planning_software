import { createApp } from 'vue';
import App from './App.vue';
import VueEventRenderer from './VueEventRenderer.vue';

const app = createApp(App);
app.component('VueEventRenderer', VueEventRenderer);
app.mount('#app');
