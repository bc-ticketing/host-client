<template>
  <div class="event-modification-card-container">
    <EventCard
      v-if="!editMode"
      v-bind:event="event"
      v-bind:inModificationView="true"
    ></EventCard>

    <!-- <form novalidate class="md-layout">
      <md-card class="md-layout-item">
        <div class="event-header">
          <md-card-header>
            <div class="md-title">Event</div>
          </md-card-header>
          <md-button
            class="md-raised md-dense md-primary router-button"
            @click="routeToEventList"
            >Back</md-button
          >
        </div>
        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="title">Event Title</label>
                <md-input
                  type="string"
                  name="title"
                  id="title"
                  v-model="title"
                  :disabled="!editMode"
                />
                <span class="md-error">The supply is required.</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="title">Event Title</label>
                <md-input
                  type="string"
                  name="title"
                  id="title"
                  v-model="title"
                  :disabled="!editMode"
                />
                <span class="md-error">The supply is required.</span>
              </md-field>
            </div>
          </div>
        </md-card-content>
      </md-card>
    </form> -->
  </div>
</template>

<script>
import EventCard from "../components/EventCard";

export default {
  name: "EventModificationCard",
  components: {
    EventCard
  },
  data: () => ({
    title: "hello",
    editMode: false
  }),
  props: { event: Object }
};
</script>

<style>
.router-button {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
