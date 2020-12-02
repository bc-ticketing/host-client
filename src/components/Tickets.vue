<!-- This component contains an ticket summary and a ticket form. -->
<template>
  <div class="tickets-container">
    <div class="summary-container">
      <TicketSummary
        v-bind:event="event"
        v-bind:ticketFormOpen="createMode"
        @updatedEventTickets="updateEvent"
        @openTicketForm="setCreateModeTrue"
        @closeTicketForm="setCreateModeFalse"
      ></TicketSummary>
    </div>
    <div class="form-container">
      <TicketForm
        v-bind:event="event"
        v-if="createMode"
        @createdTickets="setCreateModeFalse"
        @cancelTicketCreation="setCreateModeFalse"
      />
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
    createMode: false,
  }),
  props: { event: Object },
  methods: {
    setCreateModeFalse() {
      this.createMode = false;
      this.$emit("leavingTicketCreationMode");
    },
    setCreateModeTrue() {
      this.createMode = true;
      this.$emit("enteringTicketCreationMode");
    },
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
.summary-container {
  padding-bottom: 10px;
}
</style>
