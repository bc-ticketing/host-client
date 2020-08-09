<template>
  <div class="Navigation">
    <div class="md-layout-column">
      <md-toolbar class="md-primary">
        <md-button class="md-icon-button" @click="showNavigation = true">
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">Idetix Host</span>
      </md-toolbar>

      <md-drawer :md-active.sync="showNavigation" md-swipeable>
        <md-toolbar class="md-transparent" md-elevation="0">
          <span class="md-title">Idetix</span>
        </md-toolbar>

        <md-list>
          <div class="existing-events">
            <md-list-item @click="navigateTo(`/`)">
              <md-icon>event_note</md-icon>
              <p class="navigationText">My Events</p>
            </md-list-item>

            <md-list-item @click="navigateTo(`/tickets`)">
              <md-icon>notes</md-icon>
              <p class="navigationText">Tickets</p>
            </md-list-item>
          </div>

          <div class="modifications-container">
            <md-list-item @click="navigateTo(`/new-event`)">
              <md-icon>edit</md-icon>
              <p class="navigationText">New Event</p>
            </md-list-item>

            <md-list-item @click="navigateTo(`/new-ticket`)">
              <md-icon>playlist_add</md-icon>
              <p class="navigationText">New Ticket</p>
            </md-list-item>

            <md-list-item @click="navigateTo(`/modify`)">
              <md-icon>settings</md-icon>
              <p class="navigationText">Modify Event</p>
            </md-list-item>
          </div>

          <div class="approver-container">
            <md-list-item @click="navigateTo(`/register`)">
              <md-icon>verified_user</md-icon>
              <p class="navigationText">Approver Registration</p>
            </md-list-item>

            <md-list-item @click="navigateTo(`/approve`)">
              <md-icon>fact_check</md-icon>
              <p class="navigationText">Approve Identity</p>
            </md-list-item>
          </div>
        </md-list>
      </md-drawer>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showNavigation: false
    };
  },
  methods: {
    toggleNavigation() {
      this.showNavigation = !this.showNavigation;
    },
    navigateTo(route) {
      this.$router.push(route);
      this.showNavigation = false;
    }
  }
};
</script>

<style>
.md-drawer {
  width: 240px;
  max-width: calc(100vw - 125px);
}
.md-list-item-content {
  justify-content: flex-start;
}
.existing-events {
  border-bottom: 1px solid black;
}
.modifications-container {
  border-bottom: 1px solid black;
}
</style>