import { createApp } from 'vue';
import App from './App.vue';

import 'vuetify/styles'; // Global CSS has to be imported
import { VTimePicker } from 'vuetify/labs/VTimePicker';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
    components : {
        ...components,
        VTimePicker
    },
    directives
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
