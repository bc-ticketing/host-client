<template>
  <div class="app-container">
    <Navigation />
    <md-content class="container">
      <router-view />
    </md-content>
  </div>
</template>

<script>
// Material kit css
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";
import Navigation from "./components/Navigation";
import Vue from "vue";

// Importing Modules from the material kit, these are global imports
// For components only used in single views, import locally
import VueMaterial from "vue-material";
// import Web3 from "web3";

Vue.use(VueMaterial);
// Vue.use(Web3);

export default {
  name: "IdetixHost",
  components: {
    Navigation,
  },
  data: () => ({
    components: {
      Navigation,
    },
  }),
  // methods: {
  //   toggleMenu() {
  //     this.menuVisible = !this.menuVisible;
  //   }
  //},
  // components: {}
};
</script>

<style>
/* ----------- Fonts ----------- */
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

.page-container {
  min-height: 300px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(#000, 0.12);
}

.md-content {
  padding: 16px;
}
</style>
