<template>
  <div class="modify-event-container">
    <md-button @click="newTicket = !newTicket">Create a new ticket category</md-button>
    <!-- <NewTicketForm v-if="!ticketFormIsHidden" /> -->
    <ModifyEventForm />
    <ModifyTicketForm />
  </div>
</template>

<script>
// @ is an alias to /src
import ModifyEventForm from "@/components/ModifyEventForm";
import ModifyTicketForm from "@/components/ModifyTicketForm";

export default {
  name: "ModifyEvent",
  data: () => ({
    ticketFormIsHidden: false
  }),
  components: {
    ModifyEventForm,
    ModifyTicketForm
  }
};
</script>
