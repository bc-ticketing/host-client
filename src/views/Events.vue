<template>
  <div class="events-container">
    <EventCard
      v-bind:event="event"
      v-for="event in this.$store.state.events"
      v-bind:key="event.contractAddress"
    ></EventCard>
    <h3 v-if="events.size == 0">
      No events found for your active address: {{ web3.account }}.
    </h3>
  </div>
</template>

<script>
import EventCard from "../components/EventCard";

export default {
  name: "Events",
  components: {
    EventCard
  },
  data: () => ({}),
  // methods: {
  // updateEvents() {
  //   for (let a in this.$store.state.events) {
  //     var e = this.$store.state.events[a];
  //     e.address = a;
  //     if (e.metadata != undefined) {
  //       this.events.push(e);
  //     }
  //   }
  // }
  // },
  // beforeCreate: async function() {
  //   this.$root.$on("loadedEvents", () => {
  //     this.updateEvents();
  //   });
  // },
  // beforeMount: function() {
  //   this.updateEvents();
  // },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    eventFactory() {
      return this.$store.state.eventFactory;
      // },
      // events() {
      //   return this.$store.state.events;
    }
  }
};
</script>

<style></style>
