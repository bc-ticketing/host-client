<!-- This component contains an event card that is exchanged for a form to edit the metadata of an event. -->
<!-- It is used in the overview of an event. -->
<template>
  <div class="event-modification-card-container">
    <div class="event-card-container">
      <EventCard
        @setEditMode="setEditMode"
        v-if="!editMode"
        v-bind:event="event"
        v-bind:inListView="false"
        v-bind:inModificationView="true"
        v-bind:inStatsView="false"
      ></EventCard>
    </div>
    <div class="event-form-container">
      <EventForm
        @setEditMode="setEditMode"
        v-if="editMode"
        v-bind:event="event"
        v-bind:inNewMode="false"
        v-bind:inEditMode="true"
      />
    </div>
  </div>
</template>

<script>
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";

export default {
  name: "EventModificationCard",
  components: {
    EventCard,
    EventForm
  },
  data: () => ({
    editMode: false
  }),
  props: { event: Object },
  methods: {
    setEditMode(mode) {
      this.editMode = mode;
    }
  }
};
</script>

<style>
.router-button {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
