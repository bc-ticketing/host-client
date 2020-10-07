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
    loadTickets: async function() {
      await this.$store.dispatch("loadFungibleTickets");
      await this.$store.dispatch("loadNonFungibleTickets");
      this.$root.$emit("loadedTickets");
      console.log(this.$store.state.events[0]);
    }
    // loadIpfsHashesEvents: async function() {
    //   await this.$store.dispatch("loadEvents");
    //   this.$root.$emit("loadedEvents");
    // },
    // loadTickets: async function() {
    //   await this.$store.dispatch("loadTickets");
    //   this.$root.$emit("loadedTickets");
    // },
    // loadIpfsEventMetadata: async function() {
    //   await this.$store.dispatch("loadIpfsEventMetadata");
    //   this.$root.$emit("loadedIpfsEventMetadata");
    // }
  },
  async beforeCreate() {
    this.$root.$on("eventFactoryCreated", async () => {
      this.loadEvents();
    });
    this.$root.$on("loadedEvents", async () => {
      this.loadTickets();
      this.$root.$emit("eventsFullyLoaded");
    });
    // this.$root.$on("loadedEvents", async () => {
    //   this.loadIpfsHashesEvents();
    //   // this.loadTickets();
    // });
    // this.$root.$on("loadedEvents", async () => {
    //   this.loadIpfsEventMetadata();
    // });
    await this.$store.dispatch("registerIpfs");
    await this.$store.dispatch("registerWeb3");
    this.$root.$emit("web3Injected");
    await this.$store.dispatch("createIdentityContract");
    this.$root.$emit("identityContractCreated");
    await this.$store.dispatch("createEventFactory");
    this.$root.$emit("eventFactoryCreated");
  },
  computed: {
    web3() {
      console.log("accounts");
      console.log(this.$store.state.web3.accounts);
      return this.$store.state.web3;
    }
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
