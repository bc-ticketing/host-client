<template>
  <div class="modification-container">
    <md-card>
      <md-toolbar md-elevation="0">
        <h3 class="md-title" style="flex: 1">Tickets</h3>
        <md-button>Refresh</md-button>
        <md-button class="md-primary">Add New Ticket Category</md-button>
      </md-toolbar>
      <md-card-content>
        <md-app>
          <md-app-drawer md-permanent="full">
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
          </md-app-drawer>

          <md-app-content>
            <TicketDetails
              v-bind:ticketType="selectedTicketType"
              v-bind:event="event"
              v-if="
                selectedTicketType != null || selectedTicketType != undefined
              "
            >
              {{ selectedTicketType.title }}
            </TicketDetails>
          </md-app-content>
        </md-app>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
import TicketDetails from "../components/TicketDetails";
import getEvent from "../util/utility";
import { printQueues } from "idetix-utils";

export default {
  name: "Tickets",
  components: {
    TicketDetails,
  },
  props: {
    event: Object,
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
    console.log("TicketStats created executed");
    this.tickets = this.event.fungibleTickets.concat(
      this.event.nonFungibleTickets
    );
    if (this.tickets.length == 0) {
      console.log("no ticket found for event");
    } else {
      this.selectedTicketType = this.tickets[0];
    }
  },
};
</script>

<style></style>
