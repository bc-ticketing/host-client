<template>
  <div class="tickets-container">
    <CreateTicketTypeForm />
  </div>
</template>

<script>
import { EVENT_ABI } from "../constants/Event.js";
import CreateTicketTypeForm from "../components/CreateTicketTypeForm";

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
  }),
  components: {
    CreateTicketTypeForm
  }
};
</script>

<style></style>