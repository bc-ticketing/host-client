<!-- This component is a card that displays an event's metadata. -->
<template>
  <div class="event-card-container">
    <div class="event-card-router-container">
      <md-card md-with-hover>
        <div md-with-hover @click="openStats()">
          <md-card-header>
            <div v-if="title" class="md-title event-card-title">
              {{ title }}
            </div>
            <div v-if="!title">
              <h4>
                Sadly there could no title be found for this event...
              </h4>
            </div>
            <div v-if="date" class="event-card-date">{{ date }}</div>
            <div v-if="location" class="md-subhead">{{ location }}</div>
          </md-card-header>
          <md-card-content class="card-content">
            <div class="text-content">
              <div v-if="category" class="content-entry">
                <b>Category: </b>{{ category }}
              </div>
              <div v-if="website" class="content-entry">
                <b>Website: </b>{{ website.url }}
                <span class="danger"
                  ><md-icon class="danger" v-if="website.verification == false"
                    >warning</md-icon
                  ></span
                >
                <span class="good"
                  ><md-icon v-if="website.verification == true"
                    >done</md-icon
                  ></span
                >
              </div>
              <div v-if="twitter" class="content-entry">
                <b>Twitter: </b>{{ twitter.url }}
                <span class="danger"
                  ><md-icon class="danger" v-if="twitter.verification == false"
                    >warning</md-icon
                  ></span
                >
                <span class="good"
                  ><md-icon v-if="twitter.verification == true"
                    >done</md-icon
                  ></span
                >
              </div>
              <div v-if="description" class="content-entry">
                <b>Description: </b>{{ description }}
              </div>
            </div>
            <div class="image-content-wrapper">
              <div v-if="image" class="content-entry-image">
                <img class="image-content" :src="image" />
              </div>
            </div>
          </md-card-content>
        </div>
        <!-- <md-card-actions> -->
        <!-- <md-button class="md-primary" @click="openStats()"
            >See some stats</md-button
          > -->
        <!-- <md-button
            v-if="inListView || inStatsView"
            class="md-primary"
            @click="openSummaryView()"
            >Overview</md-button
          > -->
        <md-button
          v-if="inModificationView"
          class="md-primary"
          @click="enterEditMode()"
          >Edit</md-button
        >
        <!-- <md-button
          v-if="inListView"
          class="md-primary"
          @click="openNewTicketView()"
          >Create ticket</md-button
        > -->
        <!-- </md-card-actions> -->
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
  props: {
    event: Object,
    inListView: Boolean,
    inModificationView: Boolean,
    inStatsView: Boolean
  },
  methods: {
    openNewTicketView: function() {
      this.$router.push({
        path: `new-ticket`,
        query: { address: this.event.contractAddress }
      });
    },
    openSummaryView: function() {
      if (!this.inModificationView) {
        this.$router.push({
          path: `modification`,
          query: { address: this.event.contractAddress }
        });
      }
    },
    openStats: function() {
      if (this.inListView) {
        this.$router.push({
          path: `stats`,
          query: { address: this.event.contractAddress }
        });
      }
    },
    enterEditMode: function() {
      this.$emit("setEditMode", true);
    }
  },
  computed: {
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
          date.getDate() +
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
    website() {
      return this.event.website ? this.event.website : "no website found";
    },
    twitter() {
      return this.event.twitter ? this.event.twitter : "no twitter found";
    },
    image() {
      return this.event.image ? this.event.image : "no image found";
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
  padding-bottom: 10px;
}
.content-entry {
  display: block;
}
.image-content {
  position: relative;
  padding: 16px;
  bottom: 10px;
  overflow: hidden;
}
.md-card-content.card-content {
  padding-bottom: 0;
}
.card-content {
  display: flex;
}
.text-content {
  min-width: 50%;
}
/* .image-content-wrapper {
  position: absolute;
  right: 20px;
  top: 20px;
} */
</style>
