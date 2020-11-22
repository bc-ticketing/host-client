<template>
  <div class="max-tickets-form-container">
    <form novalidate class="md-layout">
      <md-card class="md-layout-item">
        <md-card-header class="md-title event-card-title">{{
          event.title
        }}</md-card-header>
        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100 info-dialog">
              <md-field>
                <label for="event-granularity"
                  >Maximum allowed tickets per person</label
                >
                <md-input
                  type="number"
                  :min="0"
                  max="100"
                  name="maxTickets"
                  id="maxTickets"
                  v-model="maxTickets"
                  :disabled="sending"
                />
              </md-field>
              <div class="info-dialog-button">
                <md-button
                  class="md-icon-button md-primary"
                  @click="showInfo = true"
                >
                  <md-icon>help_outline</md-icon>
                </md-button>
              </div>
            </div>
          </div>

          <md-dialog :md-active.sync="showInfo">
            <md-dialog-title>Maximal number of tickets</md-dialog-title>
            <p class="dialog-text">
              This number defines the maximal number of tickets that can be
              bought per account. It applies to the event overall, not just per
              ticket category.
            </p>
            <md-button class="md-primary" @click="showInfo = false"
              >Close</md-button
            >
          </md-dialog>
        </md-card-content>

        <md-card-actions>
          <md-button
            class="md-accent"
            @click="leaveEditMode"
            :disabled="sending"
            >Cancel</md-button
          >
          <md-button
            class="md-primary"
            @click="invokeChange"
            :disabled="sending"
            >Submit</md-button
          >
        </md-card-actions>
      </md-card>
    </form>

    <div v-if="showStatusMessage" class="status-message">
      <md-progress-bar :md-mode="processBarMode"></md-progress-bar>
      <p class="process-message">
        {{ processMessage }}
      </p>
    </div>
  </div>
</template>

<script>
import sleep from "await-sleep";
import {
  PROGRESS_DETERMINATE,
  PROGRESS_INDETERMINATE,
  PROCESSING,
  AVERAGE_TIME_PER_BLOCK,
  DEFAULT_ERROR,
  EVENT_MAX_TICKETS_CHANGE,
  EVENT_MAX_TICKETS_CHANGE_SUCCESSFUL,
  WAITING_FOR_SIGNATURE,
} from "../util/constants/constants";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/abi/EventMintableAftermarketPresale";

export default {
  name: "EventMaxTicketsPerPersonForm",
  props: {
    event: Object,
  },
  data: () => ({
    sending: false,
    showStatusMessage: false,
    processBarMode: PROGRESS_DETERMINATE,
    processMessage: DEFAULT_ERROR,

    showInfo: false,
    maxTickets: 0,
  }),
  methods: {
    async invokeChange() {
      this.sending = true;
      if (this.maxTickets == this.event.maxTicketsPerPerson) {
        this.showStatusMessage(
          PROGRESS_DETERMINATE,
          "This number is already active, please choose a different one or cancel this process."
        );
        this.sending = false;
        return false;
      }
      if (this.maxTickets <= 0) {
        this.showStatusMessage(
          PROGRESS_DETERMINATE,
          "Please choose a valid number."
        );
        this.sending = false;
        return false;
      }
      const eventContract = new this.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
        this.event.contractAddress
      );
      this.showStatus(PROGRESS_DETERMINATE, WAITING_FOR_SIGNATURE);
      const setMaxTickets = await eventContract.methods
        .setMaxTicketsPerPerson(this.maxTickets)
        .send(
          { from: this.$store.state.web3.account },
          async (error, transactionHash) => {
            this.showStatus(PROGRESS_INDETERMINATE, EVENT_MAX_TICKETS_CHANGE);
            if (transactionHash) {
              console.log(
                "submitted max tickets change invocation: ",
                transactionHash
              );
            }
            let transactionReceipt = null;
            while (transactionReceipt == null) {
              transactionReceipt = await this.$store.state.web3.web3Instance.eth.getTransactionReceipt(
                transactionHash
              );
              await sleep(AVERAGE_TIME_PER_BLOCK);
            }
            if (transactionReceipt) {
              console.log("Got the transaction receipt: ", transactionReceipt);
              this.showStatus(PROGRESS_INDETERMINATE, PROCESSING);
              await this.$store.dispatch(
                "loadMaxTicketsChange",
                this.$route.query.address
              );
              this.$emit("updatedEventMaxTickets");
            }
            this.showStatus(
              PROGRESS_DETERMINATE,
              EVENT_MAX_TICKETS_CHANGE_SUCCESSFUL
            );
            await sleep(2000);
            this.hideStatus();
            this.leaveEditMode();
          }
        )
        .catch(async (e) => {
          // Transaction rejected or failed
          this.showErrorMessage();
        });
    },
    showStatus(processBarMode, message) {
      this.processBarMode = processBarMode;
      this.processMessage = message;
      this.showStatusMessage = true;
    },
    hideStatus() {
      this.showStatusMessage = false;
    },
    showErrorMessage() {
      this.showStatus(PROGRESS_DETERMINATE, DEFAULT_ERROR);
      setTimeout(() => {
        this.hideStatus();
      }, 5000);
    },
    leaveEditMode() {
      this.$emit("finishEditing");
    },
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
  },
  created() {
    this.maxTickets = this.event.maxTicketsPerPerson;
  },
};
</script>

<style></style>
