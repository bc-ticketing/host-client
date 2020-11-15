<!-- This view contains a summary of a specific event, e.g. its tickets and some statistics. -->
<!-- Events can be edited in the form contained in this view. -->
<template>
  <div class="summary-container">
    <!-- <div class="not-found-container" v-show="notFoundMessageVisible">
      <h3>No event found for address: {{ this.$route.query.address }}.</h3>
      <md-button class="go-back-button md-primary" @click="routeToEventList()"
        >Go Back</md-button
      >
    </div> -->
    <EventModificationCard
      v-if="eventSet"
      v-bind:event="event"
      @updatedEventMetadata="updateEvent"
    ></EventModificationCard>
    <!-- <BlockchainStatsCard
      v-if="eventSet"
      v-bind:event="event"
    ></BlockchainStatsCard>
    <LiveStatsCard v-if="eventSet" v-bind:event="event"></LiveStatsCard> -->
    <Tickets
      v-if="eventSet"
      v-bind:event="event"
      @updatedEventTickets="updateEvent"
    ></Tickets>
  </div>
</template>

<script>
import EventModificationCard from "../components/EventModificationCard";
// import TicketModificationCard from "../components/TicketModificationCard";
import BlockchainStatsCard from "../components/BlockchainStatsCard";
import LiveStatsCard from "../components/LiveStatsCard";
import Tickets from "../components/Tickets";
import idb from "../util/db/idb";

export default {
  name: "Summary",
  components: {
    EventModificationCard,
    // BlockchainStatsCard,
    // LiveStatsCard,
    Tickets,
  },
  data: () => ({
    eventSet: false,
    notFoundMessageVisible: false,
    event: "",
    // showTickets: false
  }),
  methods: {
    async updateEvent() {
      console.log("updateEvent triggered in Summary view");
      this.event = await idb.getEvent(this.$route.query.address);
    },
    routeToEventList() {
      this.$router.push({
        name: `Events`,
      });
    },
  },
  async created() {
    // setTimeout(() => {
    //   if (!this.eventSet) {
    //     this.notFoundMessageVisible = true;
    //   }
    // }, 5000);
    console.log("summary view created executed");
    let address = this.$route.query.address;
    this.$root.$on("web3Injected", async () => {
      await this.$store.dispatch("loadMetadataUpdatesOfEvent", address);
      await this.$store.dispatch("loadTicketsOfEvent", address);
    });
    if (this.$store.state.web3.web3Instance) {
      await this.$store.dispatch("loadTicketsOfEvent", address);
      await this.$store.dispatch("loadMetadataUpdatesOfEvent", address);
    }
    this.$root.$on("eventsFullyLoaded", async () => {
      this.event = await idb.getEvent(address);
      if (this.event != null) {
        console.log(this.event);
        this.eventSet = true;
        this.notFoundMessageVisible = false;
      }
    });
    this.event = await idb.getEvent(address);
    if (this.event != null) {
      console.log(this.event);
      this.eventSet = true;
    }
  },
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
