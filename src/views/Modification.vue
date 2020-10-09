<template>
  <div class="modification-container">
    <div class="not-found-container" v-show="notFoundMessageVisible">
      <h3>No event found for address: {{ this.$route.query.address }}.</h3>
      <md-button class="go-back-button md-primary" @click="routeToEventList()"
        >Go Back</md-button
      >
    </div>
    <EventModificationCard
      v-if="eventSet"
      v-bind:key="this.$route.query.address"
      v-bind:event="event"
    ></EventModificationCard>
    <div class="show-hide-tickets-container">
      <div class="show-hide-tickets">
        <md-button @click="showTickets = !showTickets" v-if="!showTickets"
          >Show tickets</md-button
        >
        <md-button @click="showTickets = !showTickets" v-if="showTickets"
          >Hide tickets</md-button
        >
      </div>
    </div>
    <TicketModificationCard v-if="showTickets"></TicketModificationCard>
  </div>
</template>

<script>
import EventModificationCard from "../components/EventModificationCard";
import TicketModificationCard from "../components/TicketModificationCard";
import getEvent from "../util/utility";

export default {
  name: "Modification",
  components: { EventModificationCard, TicketModificationCard },
  data: () => ({
    showTickets: false,
    eventSet: false,
    notFoundMessageVisible: false
  }),
  methods: {
    routeToEventList() {
      this.$router.push({
        name: `Events`
      });
    }
  },
  created() {
    setTimeout(() => {
      if (!this.eventSet) {
        this.notFoundMessageVisible = true;
      }
    }, 5000);
    console.log("modification view created executed");
    this.$root.$on("eventsFullyLoaded", () => {
      this.event = getEvent(address);
      if (this.event != null) {
        this.eventSet = true;
        this.notFoundMessageVisible = false;
      }
    });
    let address = this.$route.query.address;
    this.event = getEvent(address);
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
