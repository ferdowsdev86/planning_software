import { createApp } from 'vue';
import App from './App.vue';
import { Toast } from '@bryntum/schedulerpro';

createApp(App).mount('#app');


Toast.show({
    html : `<p>This demo uses the <a href='https://bryntum.com/products/grid/'>Bryntum Grid</a> component which is licensed separately.</p>
    `,
    timeout : 10000
});
