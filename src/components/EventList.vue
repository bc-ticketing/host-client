<template>
  <div class="event-list-container">
    <EventCard v-for="event in events" v-bind:key="event.id" v-bind:event_data="event"></EventCard>
  </div>
</template>

<script>
export default {
  name: "EventList",
  data: function() {
    return {};
  }
};
</script>

<style>
</style>