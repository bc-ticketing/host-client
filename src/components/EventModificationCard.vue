<template>
  <div class="event-modification-card-container">
    <div class="event-card-container">
      <EventCard
        @setEditMode="setEditMode"
        v-if="!editMode"
        v-bind:event="event"
        v-bind:inListView="false"
        v-bind:inModificationView="true"
        v-bind:inStatsView="false"
      ></EventCard>
    </div>
    <!-- <div class="event-card-container">
      <EventForm
        @setEditMode="setEditMode"
        v-if="!editMode"
        v-bind:event="event"
        v-bind:inListView="false"
        v-bind:inModificationView="true"
        v-bind:inStatsView="false"
      ></EventForm>
    </div> -->
    <p>hello</p>

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
  props: { event: Object },
  methods: {
    setEditMode(mode) {
      this.editMode = mode;
    }
  }
};
</script>

<style>
.router-button {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
