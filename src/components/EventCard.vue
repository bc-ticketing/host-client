<!-- This component is a card that displays an event's metadata. -->
<template>
  <div class="event-card-container">
    <div class="event-card-router-container">
      <md-card class="event-card" md-with-hover>
        <div md-with-hover @click="openSummary()">
          <md-card-header>
            <div v-if="title" class="md-title event-card-title">
              {{ title }}
            </div>
            <div v-if="!title">
              <h4>Sadly there could no title be found for this event...</h4>
            </div>
            <div v-if="date" class="event-card-date">{{ date }}</div>
            <div v-if="location" class="md-subhead">{{ location }}</div>
          </md-card-header>
          <md-card-content class="event-card-content">
            <div class="event-card-content-text">
              <div v-if="category" class="event-card-content-entry">
                <b>Category: </b>{{ category }}
              </div>
              <div v-if="currency" class="event-card-content-entry">
                <b>Currency: </b>{{ currency }}
              </div>
              <div v-if="website" class="event-card-content-entry">
                <b>Website: </b
                >{{ website.url ? website.url : "None provided" }}
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
              <div v-if="twitter" class="event-card-content-entry">
                <b>Twitter: </b
                >{{ twitter.url ? twitter.url : "None provided" }}
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
              <div v-if="maxTicketsPerPerson" class="event-card-content-entry">
                <b>Maximum allowed tickets per person: </b
                >{{ maxTicketsPerPerson }}
              </div>
              <div v-if="description" class="event-card-content-entry">
                <b>Description: </b>{{ description }}
              </div>
              <div
                v-if="contractAddress && inModificationView"
                class="event-card-content-entry"
              >
                <b>Contract: </b>{{ contractAddress }}
              </div>
            </div>
            <div class="image-content-wrapper">
              <img v-if="image" class="image-content" :src="image" />
            </div>
          </md-card-content>
        </div>
        <div class="button-container">
          <md-button
            v-if="inModificationView"
            class="md-primary"
            @click="showEditDialog = true"
            >Edit event</md-button
          >
        </div>

        <md-dialog :md-active.sync="showEditDialog">
          <md-dialog-title>What do you want to change?</md-dialog-title>
          <md-button class="md-primary" @click="editMetadata()"
            >Metadata</md-button
          >
          <md-button class="md-primary" @click="editMaxTicketsPerPerson()"
            >Maximum tickets per person</md-button
          >
          <md-button class="md-accent" @click="showEditDialog = false"
            >Cancel</md-button
          >
        </md-dialog>
      </md-card>
    </div>
  </div>
</template>

<script>
import {
  WEEKDAYS,
  MONTHS,
  MAX_TICKETS_PER_PERSON,
} from "../util/constants/constants.js";
import { getCurrencySymbol } from "../util/constants/ERC20Tokens.js";

export default {
  name: "EventCard",
  data: () => ({
    showEditDialog: false,
  }),
  props: {
    event: Object,
    inListView: Boolean,
    inModificationView: Boolean,
    inSummaryView: Boolean,
  },
  methods: {
    openSummary: function () {
      if (this.inListView) {
        this.$router.push({
          path: `summary`,
          query: { address: this.contractAddress },
        });
      }
    },
    editMetadata: function () {
      this.$emit("editMetadata");
    },
    editMaxTicketsPerPerson: function () {
      this.$emit("editMaxTicketsPerPerson");
    },
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
    currency() {
      return this.event.currencySymbol
        ? this.event.currencySymbol
        : this.event.currency;
    },
    maxTicketsPerPerson() {
      return this.event.maxTicketsPerPerson
        ? this.event.maxTicketsPerPerson
        : MAX_TICKETS_PER_PERSON;
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
    contractAddress() {
      return this.event.contractAddress
        ? this.event.contractAddress
        : "address not found";
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
    },
  },
  created() {
    console.log("eventcard created executed");
  },
};
</script>

<style>
.event-card-container {
  margin-bottom: 10px;
}
.event-card-content {
  display: flex;
}
.event-card-content-entry {
  max-width: 500px;
}
.md-card-content.event-card-content {
  padding-bottom: 16px;
}
.image-content {
  position: absolute;
  top: 0;
  right: 0;
  max-width: 100%;
  max-height: 100%;
  z-index: -1;
}
.image-content-wrapper {
  height: 100%;
}
</style>
