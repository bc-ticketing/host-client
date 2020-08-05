<template>
  <div class="modify-event-container">
    <md-button @click="newTicket = !newTicket">Create a new ticket category</md-button>
    <CreateTicketTypeForm v-if="!ticketFormIsHidden" />
  </div>
</template>

<script>
// @ is an alias to /src
import CreateTicketTypeForm from "@/components/CreateTicketTypeForm";

export default {
  name: "Home",
  data: () => ({
    ticketFormIsHidden: false
  }),
  components: {
    CreateTicketTypeForm
  }
};
</script>
