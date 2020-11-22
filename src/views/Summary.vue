<!-- This view contains a summary of a specific event, e.g. its tickets and some statistics. -->
<!-- Events can be edited in the form contained in this view. -->
<template>
  <div class="summary-container">
    <EventModificationCard
      v-if="eventSet"
      v-bind:event="event"
      @updatedEvent="updateEvent"
    ></EventModificationCard>
    <Tickets
      v-if="eventSet"
      v-bind:event="event"
      @updatedEventTickets="updateEvent"
    ></Tickets>
  </div>
</template>

<script>
import EventModificationCard from "../components/EventModificationCard";
import Tickets from "../components/Tickets";
import idb from "../util/db/idb";

export default {
  name: "Summary",
  components: {
    EventModificationCard,
    Tickets,
  },
  data: () => ({
    eventSet: false,
    notFoundMessageVisible: false,
    event: "",
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
