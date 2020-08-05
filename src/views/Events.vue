<template>
  <div class="events-container">
    <md-button class="md-primary" @click="getEventsOfHost">Get my events</md-button>
    <EventCard v-for="event in events" v-bind:key="event.id" v-bind:event_data="event"></EventCard>
  </div>
</template>

<script>
export default {
  name: "Events",
  data: () => ({
    events: []
  }),
  methods: {
    getEventsOfHost() {
      this.events = null;
    }
  }
};
</script>

<style>
</style>
