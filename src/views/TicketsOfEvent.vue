<template>
  <div class="tickets-container">
    <h3>Ticket List</h3>
  </div>
</template>

<script>
import { EVEVENT_MINTABLE_AFTERMARKET_ABIENT_ABI } from "../constants/EventMintableAftermarket";
import NewTicketForm from "../components/NewTicketForm";

// todo:
//  get event information from ipfs and parse into eventcard - similar to guest-client
//  create TicketCard.vue component
//  v-for list of TicketCards that are on the blockchain of the event to modify
//  -> uflischte, was will de host mache?
//  -> skizziere, was uf de landing page isch
//  -> skizziere, was uf de ticket site isch

export default {
  name: "Tickets",
  data: () => ({
    contractAddress: null
  })
};
</script>

<style></style>