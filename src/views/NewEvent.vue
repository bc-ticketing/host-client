<template>
  <div class="new-event-container">
    <CreateEventForm />
  </div>
</template>

<script>
import CreateEventForm from "@/components/CreateEventForm.vue";

export default {
  name: "NewEvent",
  components: {
    CreateEventForm,
  },
};
</script>

<style></style>
