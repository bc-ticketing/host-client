<template>
  <div class="event-card-container">
    <div class="event-card-router-container">
      <md-card md-with-hover @click="showDashboard()">
        <!-- <md-ripple> -->
        <md-card-header>
          <div class="md-title event-card-title">{{ title }}</div>
          <!-- <div class="event-card-date">{{ date }}</div> -->
          <div class="md-subhead">{{ location }}</div>
        </md-card-header>
        <md-card-content>
          <div class="content-entry">{{ "Location: " + location }}</div>
          <div class="content-entry">{{ "Category: " + category }}</div>
          <div class="content-entry">{{ "Description: " + description }}</div>
        </md-card-content>
        <md-card-actions>
          <md-button class="md-primary" @click="goToCreateTicketType()"
            >Create a new ticket type</md-button
          >
        </md-card-actions>
        <!-- </md-ripple> -->
      </md-card>
    </div>
  </div>
</template>

<script>
import { WEEKDAYS, MONTHS } from "../util/constants/constants.js";

export default {
  name: "EventCard",
  data() {
    return {};
  },
  props: { event: Object },
  methods: {
    goToCreateTicketType: function() {
      this.$router.push({
        name: `NewTicket`,
        params: { address: this.event.contractAddress, title: this.event.title }
      });
    },
    showDashboard: function() {
      this.$router.push({
        name: `Dashboard`,
        params: { address: this.event.contractAddress }
      });
    }
  },
  computed: {
    eventInstance() {
      return this.event;
      //todo get event information to display in this card!
    },
    title() {
      return this.event.title ? this.event.title : "no title found";
    },
    location() {
      return this.event.location ? this.event.location : "no location found";
    },
    category() {
      return this.event.category ? this.event.category : "no category found";
    },
    description() {
      return this.event.description
        ? this.event.description
        : "no description found";
    }
  },
  mounted: function() {}
};
</script>

<style>
.event-card-container {
  margin-bottom: 10px;
}
.content-entry {
  display: block;
}
</style>
