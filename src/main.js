import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueIpfs from "./plugins/vue-ipfs";

// Load our IPFS plugin.
Vue.use(VueIpfs);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
