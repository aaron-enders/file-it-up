import Vue from 'nativescript-vue';

import App from './components/App';


// import Photo from './Photo';

// Uncommment the following to see NativeScript-Vue output logs
// Vue.config.silent = false;

new Vue({

  render: h => h('frame', [h(App)]),

}).$start();
