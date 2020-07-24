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
          <md-list-item>
            <md-icon>home</md-icon>
            <span class="md-list-item-text">
              <router-link @click="showNavigation = false" to="/">Dashboard</router-link>
            </span>
          </md-list-item>

          <md-list-item>
            <md-icon>add</md-icon>
            <span class="md-list-item-text">
              <router-link to="/create">New Event</router-link>
            </span>
          </md-list-item>

          <md-list-item>
            <md-icon>edit</md-icon>
            <span class="md-list-item-text">
              <router-link to="/modify">Modify Event</router-link>
            </span>
          </md-list-item>
        </md-list>
      </md-drawer>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showNavigation: false,
      showSidepanel: false
    };
  }
};
</script>

<style>
.md-drawer {
  width: 230px;
  max-width: calc(100vw - 125px);
}
</style>