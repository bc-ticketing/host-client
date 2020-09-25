<template>
  <div class="Navigation">
    <div class="md-layout-column">
      <md-toolbar class="md-primary navigation-toolbar">
        <div class="navigation-title">
          <md-button class="md-icon-button" @click="showNavigation = true">
            <md-icon>menu</md-icon>
          </md-button>
          <span class="md-title">Idetix Host</span>
        </div>
        <div class="account-info-container">
          <div class="account-info">
            <span class="account-address">{{ prettyAddress(accountAddress) }} :</span>
            <span class="account-balance">{{ prettyBalance(accountBalance) }} ETH</span>
          </div>
          <div class="account-info-refresh-container">
            <md-icon>account_balance</md-icon>
            <md-button class="md-icon-button" @click="reloadWeb3AndEvents()">
              <md-icon>refresh</md-icon>
            </md-button>
          </div>
        </div>
      </md-toolbar>

      <md-drawer :md-active.sync="showNavigation" md-swipeable>
        <md-toolbar class="md-transparent" md-elevation="0">
          <span class="md-title">Idetix</span>
        </md-toolbar>

        <md-list>
          <div class="existing-events">
            <md-list-item @click="navigateTo(`/`)">
              <md-icon style="margin-right: 28px">event_note</md-icon>
              <p class="navigationText">My Events</p>
            </md-list-item>

            <!-- <md-list-item @click="navigateTo(`/tickets`)">
              <md-icon>notes</md-icon>
              <p class="navigationText">Tickets</p>
            </md-list-item>-->
          </div>

          <div class="modifications-container">
            <md-list-item @click="navigateTo(`/new-event`)">
              <md-icon style="margin-right: 28px">edit</md-icon>
              <p class="navigationText">New Event</p>
            </md-list-item>

            <!-- <md-list-item @click="navigateTo(`/new-ticket`)">
              <md-icon>playlist_add</md-icon>
              <p class="navigationText">New Ticket</p>
            </md-list-item>-->

            <!-- <md-list-item @click="navigateTo(`/modify`)">
              <md-icon>settings</md-icon>
              <p class="navigationText">Modify Event</p>
            </md-list-item>-->
          </div>

          <div class="approver-container">
            <md-list-item @click="navigateTo(`/register`)">
              <md-icon style="margin-right: 28px">verified_user</md-icon>
              <p class="navigationText">Approver Registration</p>
            </md-list-item>

            <md-list-item @click="navigateTo(`/approve`)">
              <md-icon style="margin-right: 28px">fact_check</md-icon>
              <p class="navigationText">Approve Identity</p>
            </md-list-item>
          </div>
        </md-list>
      </md-drawer>
    </div>
  </div>
</template>

<script>
import { EVENT_FACTORY_ADDRESS } from "../constants/EventFactory";
export default {
  name: "Navigation",
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
    },
    reloadWeb3AndEvents() {
      this.$root.$on("reloadedWeb3", async () => {
        this.reloadEvents();
      });
      this.reloadWeb3();
    },
    async reloadWeb3() {
      await this.$store.dispatch("registerWeb3");
      this.$root.$emit("reloadedWeb3");
    },
    async reloadEvents() {
      await this.$store.dispatch("loadEventAddresses");
      await this.$store.dispatch("loadEvents");
    },
    // async reloadEvents() {
    //   await this.$store.dispatch("loadEventAddresses");
    //   await this.$store.dispatch("loadEvents");
    // },
    prettyAddress(address) {
      const start = address.substring(0, 4);
      const end = address.substring(address.length - 4, address.length);
      return start + "..." + end;
    },
    prettyBalance(balance) {
      if (balance == null) {
        return "";
      }
      if (balance.includes(".")) {
        const truncateIndex = balance.indexOf(".") + 3;
        return balance.substring(0, truncateIndex);
      } else {
        return balance;
      }
    }
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    accounts() {
      return this.$store.state.web3.accounts;
    },
    accountAddress() {
      return this.web3.account ? this.web3.account : "";
    },
    accountBalance() {
      return this.web3.balance
        ? this.web3.web3Instance.utils.fromWei(String(this.web3.balance))
        : "";
      // return this.web3.isInjected
      // ? this.web3.web3Instance.utils.fromWei(String(this.web3.balance))
      // : null;
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
/* .existing-events {
  border-bottom: 1px solid black;
} */
/* .modifications-container {
  border-bottom: 1px solid black;
} */
.navigation-toolbar {
  justify-content: space-between;
}
.navigation-title {
  align-items: center;
  display: flex;
}
.account-info-container {
  align-items: center;
  display: flex;
}
.account-info {
  margin-right: 10px;
}
.account-info-refresh-container {
  align-items: center;
  display: flex;
  margin-left: 4px;
}
.account-address {
  margin-right: 7px;
}
</style>
