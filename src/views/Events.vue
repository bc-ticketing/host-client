<template>
  <div class="events-container">
    <md-button class="md-primary" @click="fetchEvents">Fetch my events</md-button>
    <md-button class="md-primary" @click="logAddress">Get address</md-button>
    <EventCard v-for="event in events" v-bind:key="event.id" v-bind:event_data="event"></EventCard>
  </div>
</template>

<script>
export default {
  name: "Events",
  data: () => ({
    tempAddr: "asdfa",
    events: []
  }),
  beforeCreate() {
    this.$store.dispatch("registerWeb3");
    this.$store.dispatch("registerIpfs");
  },
  methods: {
    fetchEvents() {
      console.log(
        "fetching events of address: " + this.$store.state.web3.account
      );

      this.events = null;
    },
    logAddress() {
      console.log(this.web3.web3Instance);
    }
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    address() {
      return this.tempAddr;
    }
  }
};
</script>

<style></style>
