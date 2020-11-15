<!-- This component contains an event card that is exchanged for a form to edit the metadata of an event. -->
<!-- It is used in the overview of an event. -->
<template>
  <div class="tickets-container">
    <div class="ticket-summary-container">
      <TicketSummary
        v-bind:event="event"
        v-bind:ticketFormOpen="addTicketMode"
        @updatedEventTickets="updateEvent"
        @openTicketForm="addTicketMode = true"
      ></TicketSummary>
    </div>
    <div class="ticket-form-container">
      <TicketForm v-if="addTicketMode" />
      <!-- @setEditMode="setEditMode"
        v-if="editMode"
        v-bind:event="event"
        v-bind:inNewMode="false"
        v-bind:inEditMode="true"
        @updatedEventMetadata="updateEvent"
      /> -->
    </div>
  </div>
</template>

<script>
import TicketSummary from "../components/TicketSummary";
import TicketForm from "../components/TicketForm";

export default {
  name: "Tickets",
  components: {
    TicketSummary,
    TicketForm,
  },
  data: () => ({
    addTicketMode: false,
  }),
  props: { event: Object },
  methods: {
    setEditMode(mode) {
      this.editMode = mode;
    },
    updateEvent() {
      this.$emit("updatedEventMetadata");
    },
  },
};
</script>

<style>
/* .router-button {
  position: absolute;
  top: 16px;
  right: 16px;
} */
</style>
