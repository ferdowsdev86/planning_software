import Vue from 'vue';
import App from './App.vue';

import AppButton from './components/AppButton.vue';

Vue.config.productionTip = false;

Vue.component('AppButton', AppButton);

new Vue({
    render : h => h(App)
}).$mount('#app');
