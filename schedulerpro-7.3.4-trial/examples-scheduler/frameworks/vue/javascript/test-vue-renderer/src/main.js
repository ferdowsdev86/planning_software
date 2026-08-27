import Vue from 'vue';
import App from './App.vue';

import AppButton from './components/AppButton.vue';
import EventRenderer from './components/EventRenderer.vue';

Vue.config.productionTip = false;

Vue.component('AppButton', AppButton);
Vue.component('EventRenderer', EventRenderer);

new Vue({
    render : h => h(App)
}).$mount('#app');
