<template>
  <div class="modification-container">
    <h2>TicketStats container</h2>
    <TicketAftermarket
      v-if="anyTicket"
      v-bind:ticket="ticket"
    ></TicketAftermarket>
  </div>
</template>

<script>
import TicketAftermarket from "../components/TicketAftermarket";
import getEvent from "../util/utility";

export default {
  name: "TicketStats",
  components: {
    TicketAftermarket
  },
  props: {
    event: Object
  },
  data: () => ({
    eventSet: false,
    anyTicket: false,
    notFoundMessageVisible: false
    // showTickets: false
  }),
  methods: {
    eventHasTickets() {
      if (
        this.event.fungibleTickets.length != 0 ||
        this.event.nonFungibleTickets.length != 0
      ) {
        return true;
      }
      return false;
    }
  },
  created() {
    console.log("TicketStats created executed");
    if (this.event.fungibleTickets.length != 0) {
      this.ticket = this.event.fungibleTickets[0];
      this.anyTicket = true;
    } else if (this.event.nonFungibleTickets.length != 0) {
      this.ticket = this.event.nonFungibleTickets[0];
      this.anyTicket = true;
    } else {
      console.log("no ticket found for event");
      this.anyTicket = false;
    }
  }
};
</script>

<style>
</style>
