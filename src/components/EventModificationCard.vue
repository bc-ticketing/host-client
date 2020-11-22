<!-- This component contains an event card that is exchanged for a form to edit the metadata of an event. -->
<!-- It is used in the overview of an event. -->
<template>
  <div class="event-modification-card-container">
    <div class="event-card-container">
      <EventCard
        @editMetadata="setMode('metadata')"
        @editMaxTicketsPerPerson="setMode('maxTicketsPerPerson')"
        v-if="mode == 'card'"
        v-bind:event="event"
        v-bind:inListView="false"
        v-bind:inModificationView="true"
        v-bind:inSummaryView="false"
      ></EventCard>
    </div>
    <div class="event-card-container">
      <EventMaxTicketsPerPersonForm
        @finishEditing="setMode('card')"
        v-if="mode == 'maxTicketsPerPerson'"
        v-bind:event="event"
        @updatedEventMaxTickets="updateEvent"
      ></EventMaxTicketsPerPersonForm>
    </div>
    <div class="event-form-container">
      <EventForm
        @finishEditing="setMode('card')"
        v-if="mode == 'metadata'"
        v-bind:event="event"
        v-bind:inNewMode="false"
        v-bind:inEditMode="true"
        @updatedEventMetadata="updateEvent"
      />
    </div>
  </div>
</template>

<script>
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import EventMaxTicketsPerPersonForm from "../components/EventMaxTicketsPerPersonForm";

export default {
  name: "EventModificationCard",
  components: {
    EventCard,
    EventForm,
    EventMaxTicketsPerPersonForm,
  },
  data: () => ({
    mode: "card",
    editMode: false,
    changingMaxTickets: false,
  }),
  props: { event: Object },
  methods: {
    setMode(mode) {
      this.mode = mode;
    },
    updateEvent() {
      this.$emit("updatedEvent");
    },
  },
};
</script>

<style>
.router-button {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
