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

Vue.use(VueMaterial);

export default {
  name: "IdetixHost",
  components: {
    Navigation
  },
  methods: {
    loadEvents: async function() {
      await this.$store.dispatch("loadEvents");
      this.$root.$emit("loadedEvents");
    },
    loadApprovers: async function() {
      await this.$store.dispatch("loadApprovers");
      this.$root.$emit("loadedApprovers");
    },
    loadEventsAndApproversInInterval: async function() {
      setInterval(async () => {
        this.loadEvents();
        this.loadApprovers();
      }, 5000);
    }
  },
  async beforeCreate() {
    this.$root.$on("eventFactoryCreated", async () => {
      this.loadEvents();
      this.loadApprovers();
      this.loadEventsAndApproversInInterval();
    });
    await this.$store.dispatch("registerIpfs");
    await this.$store.dispatch("registerWeb3");
    this.$root.$emit("web3Injected");
    await this.$store.dispatch("createIdentity");
    this.$root.$emit("identityContractCreated");
    await this.$store.dispatch("createEventFactory");
    this.$root.$emit("eventFactoryCreated");
  }
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
.container {
  width: 80%;
  max-width: 1440px;
  margin: auto;
}
.info-dialog {
  display: flex;
}
.info-dialog-button {
  padding: 17px 0 21px;
}
.dialog-text {
  margin: 0 24px 10px;
}
</style>
