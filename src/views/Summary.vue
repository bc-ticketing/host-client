<!-- This view contains a summary of a specific event, e.g. its tickets and some statistics. -->
<!-- Events can be edited in the form contained in this view. -->
<template>
  <div class="summary-container">
    <div v-if="loading" class="loading-spinner-container">
      <md-progress-spinner
        class="loading-spinner"
        :md-stroke="4"
        :md-diameter="50"
        md-mode="indeterminate"
      ></md-progress-spinner>
      <h3 class="loading-spinner-text">Loading Event Data...</h3>
    </div>
    <EventModificationCard
      v-if="eventSet"
      v-bind:event="event"
      @updatedEvent="updateEvent"
      @enterEdit="eventEditMode = true"
      @leaveEdit="eventEditMode = false"
    ></EventModificationCard>
    <Tickets
      v-if="eventSet && !eventEditMode"
      v-bind:event="event"
      @updatedEventTickets="updateEvent"
      @enteringTicketCreationMode="ticketCreatingMode = true"
      @leavingTicketCreationMode="ticketCreatingMode = false"
    ></Tickets>
    <div class="seating-plan-container">
      <SeatingPlan
        v-if="!ticketCreatingMode && !eventEditMode && existingSeats"
        v-bind:address="this.$route.query.address"
        v-bind:sending="true"
        v-bind:onlySeatingPlan="true"
        @seatsToProcess="setExistingSeats"
      >
      </SeatingPlan>
    </div>
  </div>
</template>

<script>
import EventModificationCard from "../components/EventModificationCard";
import SeatingPlan from "../components/SeatingPlan";
import Tickets from "../components/Tickets";
import idb from "../util/db/idb";

export default {
  name: "Summary",
  components: {
    EventModificationCard,
    Tickets,
    SeatingPlan,
  },
  data: () => ({
    loading: false,
    eventSet: false,
    existingSeats: false,
    ticketCreatingMode: false,
    eventEditMode: false,
    notFoundMessageVisible: false,
    event: null,
  }),
  methods: {
    async updateEvent() {
      console.log("updateEvent triggered in Summary view");
      this.event = await idb.getEvent(this.$route.query.address);
      this.eventEditMode = false;
      this.existingSeats = true;
    },
    setExistingSeats(existing) {
      console.log("setExistingSeats");
      this.existingSeats = existing;
    },
  },
  async created() {
    console.log("summary view created executed");
    let address = this.$route.query.address;
    this.$root.$on("web3Injected", async () => {
      if (!this.loading && !this.eventSet) {
        this.loading = true;
        await this.$store.dispatch("loadMetadataUpdatesOfEvent", address);
        await this.$store.dispatch("loadTicketsOfEvent", address);
        this.loading = false;
      }
    });
    if (this.$store.state.web3.web3Instance) {
      if (!this.loading && !this.eventSet) {
        this.loading = true;
        await this.$store.dispatch("loadMetadataUpdatesOfEvent", address);
        await this.$store.dispatch("loadTicketsOfEvent", address);
        this.loading = false;
        this.existingSeats = true;
      }
    }
    this.$root.$on("loadedEvents", async () => {
      if (!this.loading && !this.eventSet) {
        this.loading = true;
        this.event = await idb.getEvent(address);
        if (this.event != null) {
          console.log(this.event);
          this.eventSet = true;
          this.notFoundMessageVisible = false;
          this.existingSeats = true;
        }
        this.loading = false;
      }
    });
    if (!this.loading) {
      this.loading = true;
      this.event = await idb.getEvent(address);
      if (this.event != null) {
        console.log(this.event);
        this.eventSet = true;
        this.existingSeats = true;
      }
      this.loading = false;
    }
  },
};
</script>

<style>
.show-hide-tickets {
  float: right;
  top: 16px;
  right: 16px;
}
.show-hide-tickets {
  position: relative;
}
.not-found-container {
  display: flex;
}
.go-back-button {
  float: right;
}
.seating-plan-container {
  margin: auto;
  width: 50%;
}
.seating-plan-title {
  text-align: center;
}
.loading-spinner-text {
  text-align: center;
}
.loading-spinner {
  width: 50px;
  margin-left: auto;
  margin-right: auto;
  display: block;
}
</style>
