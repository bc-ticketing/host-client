<template>
  <div class="new-event-container">
    <EventForm v-bind:inNewMode="true" v-bind:inEditMode="false" />
  </div>
</template>

<script>
import EventForm from "@/components/EventForm.vue";

export default {
  name: "NewEvent",
  components: {
    EventForm
  }
};
</script>

<style></style>
