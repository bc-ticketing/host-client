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
              <div v-if="website.url" class="event-card-content-entry">
                <b>Website: </b>
                <a :href="website.url" target="_blank">{{ website.url }}</a>
                <md-icon class="md-accent" v-if="!website.verification"
                  >warning</md-icon
                >
                <md-icon
                  class="verification-icon"
                  style="color: green"
                  v-if="website.verification"
                  >done</md-icon
                >
              </div>
              <div v-else class="event-card-content-entry">
                <b>Website: </b>None provided
              </div>
              <div v-if="twitter.url" class="event-card-content-entry">
                <b>Twitter: </b
                ><a :href="twitter.url" target="_blank">{{ twitter.url }}</a>
                <md-icon style="md-accent" v-if="!twitter.verification"
                  >warning</md-icon
                >
                <md-icon
                  class="verification-icon"
                  style="color: green"
                  v-if="twitter.verification"
                  >done</md-icon
                >
              </div>
              <div v-if="!twitter.url" class="event-card-content-entry">
                <b>Twitter: </b>None provided
              </div>
              <div
                @click="showIdentityApproverDialog = true"
                v-if="approver"
                class="event-card-content-entry"
              >
                <b>Identity Approver: </b>{{ approver.title }}
              </div>
              <div v-if="maxTicketsPerPerson" class="event-card-content-entry">
                <b>Max tickets per person: </b>{{ maxTicketsPerPerson }}
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

            <md-dialog :md-active.sync="showIdentityApproverDialog">
              <md-dialog-title>{{ approver.title }}</md-dialog-title>
              <div class="dialog-approver-link-container">
                <div class="dialog-approver-entry">
                  <div class="dialog-approver-entry-title"><b>Website:</b></div>
                  <a
                    class="dialog-approver-link"
                    v-if="approver.website.url"
                    :href="approver.website.url"
                    target="_blank"
                    >{{ approver.website.url }}</a
                  >
                  <p class="dialog-text" v-if="!approver.website.url">
                    No website provided
                  </p>
                  <md-icon
                    class="verification-icon md-accent"
                    v-if="approver.website.url && !approverWebsiteVerified"
                    >warning</md-icon
                  >
                  <md-icon
                    class="verification-icon"
                    style="color: green"
                    v-if="approver.website.url && approverWebsiteVerified"
                    >done</md-icon
                  >
                </div>
                <div class="dialog-approver-entry">
                  <div class="dialog-approver-entry-title"><b>Twitter:</b></div>
                  <a
                    class="dialog-approver-link"
                    v-if="approver.twitter.url"
                    :href="approver.twitter.url"
                    target="_blank"
                    >{{ approver.twitter.url }}</a
                  >
                  <p class="dialog-text" v-if="!approver.twitter.url">
                    No Twitter provided
                  </p>
                  <md-icon
                    class="verification-icon md-accent"
                    v-if="approver.twitter.url && !approverTwitterVerified"
                    >warning</md-icon
                  >
                  <md-icon
                    class="verification-icon"
                    style="color: green"
                    v-if="approver.twitter.url && approverTwitterVerified"
                    >done</md-icon
                  >
                </div>
              </div>
              <div class="dialog-approver-entry">
                <div class="dialog-approver-entry-title">
                  <b>Provided Methods</b>
                </div>
              </div>
              <div class="dialog-approver-methods-wrapper">
                <div
                  class="dialog-text dialog-approver-methods"
                  :key="method.level"
                  v-for="method in approver.methods"
                  v-bind:class="{
                    'approver-level': method.level == approverLevel,
                  }"
                >
                  <p class="dialog-approver-methods-level">
                    Level {{ method.level }}:
                  </p>
                  <p class="dialog-approver-methods-value">
                    {{ method.value }}
                  </p>
                </div>
              </div>
              <md-button
                class="md-primary"
                @click="showIdentityApproverDialog = false"
                >Close</md-button
              >
            </md-dialog>
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
import { WEEKDAYS, MONTHS } from "../util/constants/constants.js";
import { getCurrencySymbol } from "../util/constants/ERC20Tokens.js";

export default {
  name: "EventCard",
  data: () => ({
    showEditDialog: false,
    showIdentityApproverDialog: false,
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
    approver() {
      return this.$store.state.approvers.find(
        (a) => a.approverAddress === this.event.identityApproverAddress
      );
    },
    approverLevel() {
      return this.event.identityLevel;
    },
    approverTwitterVerified() {
      return this.approver.twitter.verification;
    },
    approverWebsiteVerified() {
      return this.approver.website.verification;
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
    currency() {
      return this.event.currencySymbol
        ? this.event.currencySymbol
        : this.event.currency;
    },
    maxTicketsPerPerson() {
      return this.event.maxTicketsPerPerson
        ? this.event.maxTicketsPerPerson
        : "not found";
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
  padding-bottom: 1px;
}
.md-icon.verification-icon {
  padding-bottom: 4px;
  margin-left: 5px;
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
.approver-level {
  font-weight: bold;
  color: green;
}
</style>
