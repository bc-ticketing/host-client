<!-- This is the base view that is used in the whole application. -->
<template>
  <div class="app-container">
    <Navigation />
    <md-content class="container">
      <div class="welcome-message-container">
        <h2 v-if="welcome">Welcome to the Idetix Event-Host App</h2>
      </div>
      <div class="welcome-message-container">
        <h3 v-if="!anyEvent">No events found for your active account.</h3>
      </div>
      <router-view />
    </md-content>
  </div>
</template>

<script>
// Material kit css
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";
import sleep from "await-sleep";
import Navigation from "./components/Navigation";
import Vue from "vue";

// Importing Modules from the material kit, these are global imports
// For components only used in single views, import locally
import VueMaterial from "vue-material";

Vue.use(VueMaterial);

export default {
  name: "IdetixHost",
  components: {
    Navigation,
  },
  data: () => ({
    welcome: true,
    anyEvent: true,
  }),
  methods: {
    loadEvents: async function () {
      console.log("loading events");
      await this.$store.dispatch("loadEvents");
      this.$root.$emit("loadedEvents");
      this.welcome = false;
    },
    loadEventsInterval: function () {
      setInterval(async () => {
        await this.loadEvents();
      }, 30000);
    },
    loadApprovers: async function () {
      console.log("loading approvers");
      await this.$store.dispatch("loadApprovers");
      this.$root.$emit("loadedApprovers");
    },
    loadApproversInterval: function () {
      setInterval(async () => {
        await this.loadApprovers();
      }, 10000);
    },
    anyEventPresent: function () {
      if (this.$store.state.events.length > 0) {
        this.anyEvent = true;
      } else {
        this.anyEvent = false;
      }
    },
  },
  async beforeCreate() {
    this.$root.$on("eventFactoryCreated", async () => {
      await this.loadEvents();
      await this.loadApprovers();
      this.loadApproversInterval();
      this.loadEventsInterval();
    });
    await this.$store.dispatch("addNullAddressApproverToStore");
    this.$root.$emit("addedNullAddressApproverToStore");
    await this.$store.dispatch("registerWeb3");
    this.$root.$emit("web3Injected");
    await this.$store.dispatch("createIdentity");
    this.$root.$emit("identityContractCreated");
    await this.$store.dispatch("createEventFactory");
    this.$root.$emit("eventFactoryCreated");
  },
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
.welcome-message-container {
  margin: auto;
  text-align: center;
}
.loading-message-container {
  margin: auto;
  text-align: center;
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
