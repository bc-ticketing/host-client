<template>
  <div class="event-card-container">
    <div class="event-card-router-container" @click="openEventOverview()">
      <md-card md-with-hover>
        <md-card-header>
          <div v-if="title" class="md-title event-card-title">{{ title }}</div>
          <div v-if="!title">
            <h4>
              Sadly there could no title be found for this event...
            </h4>
          </div>
          <div v-if="date" class="event-card-date">{{ date }}</div>
          <div v-if="location" class="md-subhead">{{ location }}</div>
        </md-card-header>
        <md-card-content>
          <div v-if="category" class="content-entry">
            {{ "Category: " + category }}
          </div>
          <div v-if="url" class="content-entry">
            {{ "Website: " + url }}
          </div>
          <div v-if="twitter" class="content-entry">
            {{ "Twitter: " + twitter }}
          </div>
          <div v-if="description" class="content-entry">
            {{ "Description: " + description }}
          </div>
        </md-card-content>
        <md-card-actions>
          <!-- <md-button class="md-primary" @click="openStats()"
            >See some stats</md-button
          > -->
          <md-button class="md-primary" @click="goToCreateTicketType()"
            >Create ticket</md-button
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
  data: () => ({}),
  props: { event: Object, inModificationView: Boolean },
  methods: {
    goToCreateTicketType: function() {
      this.$router.push({
        name: `NewTicket`,
        params: { address: this.event.contractAddress, title: this.event.title }
      });
    },
    openEventOverview: function() {
      if (!this.inModificationView) {
        this.$router.push({
          path: `modification`,
          query: { address: this.event.contractAddress }
        });
      }
    },
    openStats: function() {
      this.$router.push({
        name: `Stats`,
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
    date() {
      if (this.event.timestamp) {
        const date = new Date(this.event.timestamp * 1000);
        return (
          WEEKDAYS[date.getDay()] +
          " " +
          date.getDay() +
          ". " +
          MONTHS[date.getMonth()] +
          " " +
          date.getFullYear()
        );
      }
      return "no date found";
    },
    description() {
      return this.event.description
        ? this.event.description
        : "no description found";
    },
    url() {
      return this.event.url ? this.event.url : "no URL found";
    },
    twitter() {
      return this.event.twitter ? this.event.twitter : "no twitter found";
    }
  },
  created() {
    console.log("eventcard created executed");
    console.log(this.event);
  }
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
