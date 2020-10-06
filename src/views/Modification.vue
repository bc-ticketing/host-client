<template>
  <div class="modification-container">
    <EventModificationCard
      v-bind:key="event.contractAddress"
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
    showTickets: false
  }),
  created() {
    console.log("modification view created executed");
    console.log(this.$route.query);
    console.log(this.$route.query.address);
    let address = this.$route.query.address;
    console.log(address);
    this.event = getEvent(address);
    console.log(this.event);
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
</style>
