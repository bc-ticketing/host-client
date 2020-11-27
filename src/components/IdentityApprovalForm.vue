<!-- This component is a form to easily store the identity approval of an account on the blockchain. -->
<!-- It shall be used by identity approvers. -->
<template>
  <div class="approve-identity-form">
    <form novalidate class="md-layout">
      <md-card class="md-layout-item">
        <md-card-header>
          <div class="md-title">Identity Approval</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="address">Address to approve</label>
                <md-input
                  name="address"
                  id="address"
                  v-model="form.address"
                  :disabled="sending"
                />
              </md-field>
            </div>
          </div>

          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="approval-level">Approval Level</label>
              <md-select
                id="idLevel"
                name="idLevel"
                v-model="form.selectedApproverLevel"
                :disabled="sending"
              >
                <md-option
                  v-for="level in approverLevels"
                  v-bind:key="level.level"
                  v-bind:value="level.level"
                >
                  {{ level.value }}
                </md-option>
              </md-select>
            </md-field>
          </div>
        </md-card-content>

        <md-card-actions>
          <md-button type="submit" class="md-primary" @click="approveIdentity"
            >Approve Identity</md-button
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
  PROCESSING,
  WAITING_FOR_SIGNATURE,
  TRANSACTION_DENIED,
  DEFAULT_ERROR,
  PROGRESS_DETERMINATE,
  PROGRESS_INDETERMINATE,
  AVERAGE_TIME_PER_BLOCK,
  AVERAGE_TIME_WAITING_FOR_RECEIPT,
  IDENTITY_VERIFICATION,
  IDENTITY_VERIFICATION_SUCCESSFUL,
} from "../util/constants/constants";

export default {
  name: "IdentityApprovalForm",
  data() {
    return {
      sending: false,
      showStatusMessage: false,
      processBarMode: PROGRESS_DETERMINATE,
      processMessage: DEFAULT_ERROR,
      form: {
        address: "",
        selectedApproverLevel: 1,
      },
      approverLevels: [],
    };
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    identityContract() {
      return this.$store.state.identity;
    },
    registeredApprovers() {
      return this.$store.state.approvers;
    },
  },
  methods: {
    showStatus(processBarMode, message) {
      this.processBarMode = processBarMode;
      this.processMessage = message;
      this.showStatusMessage = true;
    },
    hideStatus() {
      this.showStatusMessage = false;
    },
    showErrorStatus() {
      this.showStatus(PROGRESS_DETERMINATE, DEFAULT_ERROR);
      setTimeout(() => {
        this.hideStatus();
      }, 5000);
    },
    setApproverLevels() {
      this.approverLevels = [];
      const approvers = this.$store.state.approvers;
      const index = approvers.indexOf(
        approvers.find(
          (approver) => approver.approverAddress === this.web3.account
        )
      );
      if (index) {
        const registered = approvers[index];
        const nrMethods = registered.methods.length;
        for (let i = 0; i < nrMethods; i++) {
          const method = registered.methods[i];
          this.approverLevels.push(method);
        }
      }
    },
    async approveIdentity() {
      this.sending = true;
      if (!this.web3.web3Instance.utils.isAddress(this.form.address)) {
        this.showErrorStatus();
        this.sending = false;
        return;
      }
      this.showStatus(PROGRESS_DETERMINATE, WAITING_FOR_SIGNATURE);
      const approval = await this.identityContract.methods
        .approveIdentity(this.form.address, this.form.selectedApproverLevel)
        .send(
          { from: this.$store.state.web3.account },
          async (error, transactionHash) => {
            this.showStatus(PROGRESS_INDETERMINATE, IDENTITY_VERIFICATION);
            if (transactionHash) {
              console.log(
                "submitted metadata change invocation: ",
                transactionHash
              );
            }
            let transactionReceipt = null;
            while (transactionReceipt == null) {
              transactionReceipt = await this.$store.state.web3.web3Instance.eth.getTransactionReceipt(
                transactionHash
              );
              await sleep(AVERAGE_TIME_WAITING_FOR_RECEIPT);
            }
            if (transactionReceipt) {
              // await sleep(5000);
              // console.log("Got the transaction receipt: ", transactionReceipt);
              // this.invokingMetadataChangeState = false;
              // this.showStatus(PROGRESS_INDETERMINATE, PROCESSING);
              // await this.$store.dispatch(
              //   "loadMetadataUpdatesOfEvent",
              //   this.$route.query.address
              // );
              // this.$emit("updatedEventMetadata");
            }
            this.showStatus(
              PROGRESS_DETERMINATE,
              IDENTITY_VERIFICATION_SUCCESSFUL
            );
            await sleep(2000);
            this.hideStatus();
            // todo: clear form
          }
        )
        .catch(async (e) => {
          // Transaction rejected or failed
          this.sending = false;
        });
      // todo waiting for receipt
      console.log(approval);
    },
    async getSecurityLevel() {
      const secLevel = await this.identityContract.methods
        .getSecurityLevel(this.$store.state.web3.account, this.form.address)
        .call();
    },
  },
  async created() {
    this.$root.$on("loadedApprovers", async () => {
      this.exists = this.registeredApprovers.find(
        (approver) => approver.approverAddress === this.web3.account
      );
      if (this.exists) {
        this.registered = true;
        this.setApproverLevels();
      }
    });
    if (this.registeredApprovers.length > 0 && this.web3.account) {
      this.exists = this.registeredApprovers.find(
        (approver) => approver.approverAddress === this.web3.account
      );
      if (this.exists) {
        this.registered = true;
        this.setApproverLevels();
      }
    }
  },
};
</script>

<style></style>
