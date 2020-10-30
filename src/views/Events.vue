<template>
  <div class="events-container">
    <EventCard
      v-for="event in $store.state.events.slice().reverse()"
      v-bind:key="event.contractAddress"
      v-bind:event="event"
      v-bind:inListView="true"
      v-bind:inModificationView="false"
      v-bind:inStatsView="false"
    ></EventCard>
    <h3 v-if="this.$store.state.events.size == 0">
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
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    eventFactory() {
      return this.$store.state.eventFactory;
    }
  }
};
</script>

<style></style>
