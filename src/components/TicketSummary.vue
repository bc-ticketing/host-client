<!-- This component contains the ticket types and displays the data of the selected ticket type. -->
<template>
  <div class="ticket-summary-container">
    <md-card>
      <md-toolbar md-elevation="0">
        <h3 class="md-title" style="flex: 1">Tickets</h3>
        <md-button
          class="md-primary"
          v-if="!ticketFormOpen"
          @click="openTicketForm"
          >Add New Ticket Category</md-button
        >
        <md-button
          class="md-accent"
          v-if="ticketFormOpen"
          @click="closeTicketForm"
          >Cancel</md-button
        >
      </md-toolbar>
      <div class="md-layout md-gutter">
        <div class="md-layout-item md-size-40 ticket-list-container">
          <md-content class="md-scrollbar">
            <div v-for="(ticketType, index) in tickets" :key="index">
              <md-list>
                <md-list-item
                  @click="selectTicketType(ticketType)"
                  :style="getStyle(ticketType)"
                >
                  <md-icon>move_to_inbox</md-icon>
                  <span class="md-list-item-text">{{ ticketType.title }}</span>
                </md-list-item>
              </md-list>
            </div>
          </md-content>
        </div>
        <div class="md-layout-item md-size-40 ticket-details-container">
          <TicketDetails
            v-bind:created="true"
            v-bind:ticketType="selectedTicketType"
            v-bind:event="event"
            v-if="selectedTicketType != null || selectedTicketType != undefined"
          >
            {{ selectedTicketType.title }}
          </TicketDetails>
        </div>
      </div>
    </md-card>
  </div>
</template>

<script>
import TicketDetails from "../components/TicketDetails";
import getEvent from "../util/utility";
import { printQueues } from "idetix-utils";

export default {
  name: "TicketSummary",
  components: {
    TicketDetails,
  },
  props: {
    event: Object,
    ticketFormOpen: Boolean,
  },
  data: () => ({
    tickets: null,
    notFoundMessageVisible: false,
    selectedTicketType: null,
    myStyle: {
      backgroundColor: "#e6e6e6",
    },
  }),
  methods: {
    openTicketForm() {
      this.$emit("openTicketForm");
    },
    closeTicketForm() {
      this.$emit("closeTicketForm");
    },
    eventHasTickets() {
      if (
        this.event.fungibleTickets.length != 0 ||
        this.event.nonFungibleTickets.length != 0
      ) {
        return true;
      }
      return false;
    },
    selectTicketType(ticketType) {
      this.selectedTicketType = ticketType;
    },
    getStyle(ticketType) {
      if (ticketType == this.selectedTicketType) {
        return {
          backgroundColor: "#e6e6e6",
        };
      }
    },
  },
  created() {
    this.tickets = this.event.fungibleTickets.concat(
      this.event.nonFungibleTickets
    );
    if (this.tickets.length == 0) {
      console.log("no ticket found for event", this.event.contractAddress);
    } else {
      this.selectedTicketType = this.tickets[0];
    }
  },
};
</script>

<style>
.ticket-list-container {
  height: 240px;
  margin-bottom: 30px;
}
.md-scrollbar {
  max-height: 240px;
  overflow: auto;
}
.ticket-details-container {
  left: 10px;
  padding-top: 20px;
}
</style>
