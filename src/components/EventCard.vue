<template>
  <div class="event-card-container">
    <div class="event-card-router-container">
      <md-card md-with-hover>
        <!-- <md-ripple> -->
        <md-card-header>
          <div class="md-title event-card-title">{{ title }}</div>
          <!-- <div class="event-card-date">{{ date }}</div> -->
          <div class="md-subhead">{{ location}}</div>
        </md-card-header>
        <md-card-content>
          <div class="content-entry">{{ "Location: " + location }}</div>
          <div class="content-entry">{{ "Type: " + type }}</div>
          <div class="content-entry">{{ "Description: " + description }}</div>
        </md-card-content>
        <md-card-actions>
          <md-button class="md-primary" @click="goToCreateTicketType()">Create a new ticket category</md-button>
        </md-card-actions>
        <!-- </md-ripple> -->
      </md-card>
    </div>
  </div>
</template>

<script>
import { WEEKDAYS, MONTHS } from "../constants/constants.js";

export default {
  name: "EventCard",
  data() {
    return {};
  },
  props: { event: Object },
  methods: {
    goToCreateTicketType: function() {
      this.$router.push({
        name: "NewTicket",
        params: {
          eventAddress: this.event.address,
          eventTitle: this.event.metadata.event.title
        }
      });
    }
  },
  computed: {
    eventInstance() {
      return this.event;
      //todo get event information to display in this card!
    },
    title() {
      return this.event.metadata
        ? this.event.metadata.event.title
        : "no title found";
    },
    location() {
      return this.event.metadata
        ? this.event.metadata.event.location
        : "no location found";
    },
    type() {
      return this.event.metadata
        ? this.event.metadata.event.type
        : "no type found";
    },
    description() {
      return this.event.metadata
        ? this.event.metadata.event.description
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
