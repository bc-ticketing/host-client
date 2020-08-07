<template>
  <div class="new-event-container">
    <NewEventForm />
    <NewTicketForm />
  </div>
</template>

<script>
import NewEventForm from "@/components/NewEventForm.vue";
import NewTicketForm from "@/components/NewTicketForm.vue";

export default {
  name: "NewEvent",
  components: {
    NewEventForm,
    NewTicketForm
  }
};
</script>

<style></style>
