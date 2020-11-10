<!-- This view contains a form to create new tickets for an event. -->
<template>
  <div class="new-ticket-container">
    <TicketForm />
  </div>
</template>

<script>
import TicketForm from "@/components/TicketForm.vue";

export default {
  name: "NewTicket",
  components: {
    TicketForm
  }
};
</script>

<style></style>
