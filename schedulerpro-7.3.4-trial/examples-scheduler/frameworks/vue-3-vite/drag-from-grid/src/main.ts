import { createApp } from 'vue';
import { Toast } from '@bryntum/schedulerpro';
import App from './App.vue';

createApp(App).mount('#app');


Toast.show({
    html    : `<p>This demo uses the <a href="https://bryntum.com/products/grid/">Bryntum Grid</a> component which is licensed separately.</p>`,
    timeout : 10000
});
