<!-- This component contains the navigation and sidebar that is used in this application. -->
<template>
  <div class="Navigation">
    <div class="md-layout-column">
      <md-toolbar class="md-primary navigation-toolbar">
        <div class="navigation-title">
          <md-button class="md-icon-button" @click="showSidebar = true">
            <md-icon>menu</md-icon>
          </md-button>
          <span class="md-title">Idetix Host</span>
        </div>
        <div class="account-info-container">
          <div class="account-info">
            <span class="account-address"
              >{{ prettyAddress(accountAddress) }} :</span
            >
            <span class="account-balance"
              >{{ prettyBalance(accountBalance) }} ETH</span
            >
          </div>
          <div class="account-info-refresh-container">
            <md-icon>account_balance</md-icon>
            <md-button class="md-icon-button" @click="reloadWeb3AndApprovers()">
              <md-icon>refresh</md-icon>
            </md-button>
          </div>
        </div>
      </md-toolbar>

      <md-drawer :md-active.sync="showSidebar" md-swipeable>
        <md-toolbar class="md-transparent" md-elevation="0">
          <span class="md-title">Idetix</span>
        </md-toolbar>

        <md-list>
          <div class="existing-events">
            <md-list-item @click="navigateTo(`/`)">
              <md-icon style="margin-right: 28px">event_note</md-icon>
              <p class="navigationText">My Events</p>
            </md-list-item>
          </div>

          <div class="modifications-container">
            <md-list-item @click="navigateTo(`/new-event`)">
              <md-icon style="margin-right: 28px">edit</md-icon>
              <p class="navigationText">New Event</p>
            </md-list-item>
          </div>

          <div class="approver-container">
            <md-list-item v-if="!registered" @click="navigateTo(`/register`)">
              <md-icon style="margin-right: 28px">verified_user</md-icon>
              <p class="navigationText">Approver Registration</p>
            </md-list-item>

            <md-list-item v-if="registered" @click="navigateTo(`/approve`)">
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
import { EVENT_FACTORY_ADDRESS } from "../util/abi/EventFactory";
export default {
  name: "Navigation",
  data() {
    return {
      showSidebar: false,
      registered: false,
    };
  },
  methods: {
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    navigateTo(route) {
      this.$router.push(route);
      this.showSidebar = false;
    },
    /**
     * Reloads web3 instance and registered approvers.
     * If the active account was changed, the events are cleared
     * and loaded for the now active account.
     */
    async reloadWeb3AndApprovers() {
      const currentAccount = this.$store.state.web3.account;
      await this.reloadWeb3();
      if (this.accountAddress !== currentAccount) {
        console.log("account changed - clearing old and loading new events");
        await this.$store.dispatch("clearEvents");
        await this.$store.dispatch("loadEvents");
      }
      await this.loadApprovers();
    },
    async reloadWeb3() {
      await this.$store.dispatch("updateWeb3");
      this.$root.$emit("updatedWeb3");
    },
    async reloadEvents() {
      await this.$store.dispatch("loadEvents");
    },
    async loadApprovers() {
      await this.$store.dispatch("loadApprovers");
      this.registered = null;
      this.checkIfRegisteredApprover();
    },
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
    },
    checkIfRegisteredApprover() {
      if (this.accountAddress && this.approvers.length > 0) {
        this.registered = this.approvers.find(
          (approver) => approver.approverAddress === this.accountAddress
        );
      }
    },
    registeredAsApprover() {
      return this.registered ? true : false;
    },
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
    },
    approvers() {
      return this.$store.state.approvers;
    },
  },
  created() {
    this.$root.$on("loadedApprovers", async () => {
      this.loadApprovers();
    });
  },
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
