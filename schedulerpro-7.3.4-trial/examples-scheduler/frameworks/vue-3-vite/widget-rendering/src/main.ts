import { createApp } from 'vue';
import App from './App.vue';
import VueWidget from './components/VueWidget.vue';
import VueTooltip from './components/VueTooltip.vue';
import VueEventTip from './components/VueEventTip.vue';

// The following 2 lines are only needed for internal Bryntum usage.
// Delete them in your app.
import { DomHelper } from '@bryntum/schedulerpro';

(window as unknown as { DomHelper: any }).DomHelper = DomHelper;

const app = createApp(App);

app.component('VueWidget', VueWidget);
app.component('VueTooltip', VueTooltip);
app.component('VueEventTip', VueEventTip);
app.mount('#app');
