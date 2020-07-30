<template>
  <div class="new-event-container">
    <CreateEventForm />
    <CreateTicketTypeForm />
  </div>
</template>

<script>
import CreateEventForm from "@/components/CreateEventForm.vue";
import CreateTicketTypeForm from "@/components/CreateTicketTypeForm.vue";

export default {
  name: "NewEvent",
  components: {
    CreateEventForm,
    CreateTicketTypeForm
  }
};
</script>

<style></style>
