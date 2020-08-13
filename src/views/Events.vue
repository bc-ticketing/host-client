<template>
  <div class="events-container">
    <md-button class="md-primary" @click="getMyEvents">Fetch my events</md-button>
    <md-button class="md-primary" @click="logWeb3">Log web3 object</md-button>
    <EventEntry v-for="event in events" v-bind:key="event.id" v-bind:event_data="event"></EventEntry>
  </div>
</template>

<script>
import EventList from "../components/EventList";

export default {
  name: "Events",
  data: () => ({
    eventAddresses: null,
    tempAddr: "asdfa",
    events: []
  }),
  methods: {
    async getMyLatestEvent() {
      const eventAddresses = await this.web3.eventFactory.methods
        .getEvents()
        .call();
      console.log(eventAddresses);
      this.latestEventAddress = eventAddresses[eventAddresses.length - 1];
      this.currentEventAddress = this.latestEventAddress;
      console.log("set latest event to: " + this.latestEventAddress);
    },
    setContractAddress() {
      this.contractAddress = this.contractAddressTemp;
    },
    async getMyEvents() {
      console.log(
        "fetching events of address: " + this.$store.state.web3.account
      );
      this.eventAddresses = await this.web3.eventFactory.methods
        .getEvents()
        .call();
      console.log(this.eventAddresses);
    },
    logWeb3() {
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
