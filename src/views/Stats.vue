<!-- This view contains a summary of a specific event, e.g. its tickets and some statistics. -->
<!-- Events can be edited in the form contained in this view. -->
<template>
  <div class="modification-container">
    <!-- <div class="not-found-container" v-show="notFoundMessageVisible">
      <h3>No event found for address: {{ this.$route.query.address }}.</h3>
      <md-button class="go-back-button md-primary" @click="routeToEventList()"
        >Go Back</md-button
      >
    </div> -->
    <EventModificationCard
      v-if="eventSet"
      v-bind:event="event"
    ></EventModificationCard>
    <BlockchainStatsCard
      v-if="eventSet"
      v-bind:event="event"
    ></BlockchainStatsCard>
    <LiveStatsCard v-if="eventSet" v-bind:event="event"></LiveStatsCard>
    <TicketStats v-if="eventSet" v-bind:event="event"></TicketStats>
  </div>
</template>

<script>
import EventModificationCard from "../components/EventModificationCard";
// import TicketModificationCard from "../components/TicketModificationCard";
import BlockchainStatsCard from "../components/BlockchainStatsCard";
import LiveStatsCard from "../components/LiveStatsCard";
import TicketStats from "../components/TicketStats";
import idb from "../util/db/idb";

export default {
  name: "Stats",
  components: {
    EventModificationCard,
    BlockchainStatsCard,
    LiveStatsCard,
    TicketStats
  },
  data: () => ({
    eventSet: false,
    notFoundMessageVisible: false
    // showTickets: false
  }),
  methods: {
    routeToEventList() {
      this.$router.push({
        name: `Events`
      });
    }
  },
  async created() {
    setTimeout(() => {
      if (!this.eventSet) {
        this.notFoundMessageVisible = true;
      }
    }, 5000);
    console.log("modification view created executed");
    let address = this.$route.query.address;
    await this.$store.dispatch("loadTicketsOfExistingEvent", address);
    this.$root.$on("eventsFullyLoaded", async () => {
      this.event = await idb.getEvent(address);
      if (this.event != null) {
        this.eventSet = true;
        this.notFoundMessageVisible = false;
      }
    });
    this.event = await idb.getEvent(address);
    if (this.event != null) {
      this.eventSet = true;
    }
  }
};
</script>

<style>
.show-hide-tickets {
  float: right;
  top: 16px;
  right: 16px;
}
.show-hide-tickets {
  position: relative;
}
.not-found-container {
  display: flex;
}
.go-back-button {
  float: right;
}
</style>
