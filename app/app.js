import Vue from 'nativescript-vue';

import { localize } from 'nativescript-localize';

import App from './components/App';


const auth_service_1 = require('./auth-service');

auth_service_1.configureOAuthProviders();


Vue.filter('L', localize);
Vue.prototype.$localize = localize;

// Uncommment the following to see NativeScript-Vue output logs
// Vue.config.silent = false;

new Vue({

  render: h => h('frame', [h(App)]),

}).$start();
