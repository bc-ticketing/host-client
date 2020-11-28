<!-- This component is a form to register as an identity approver. -->
<template>
  <div class="approver-register-form-container">
    <div v-if="registered" class="already-registered-container">
      <h2>You are already registered as approver.</h2>
    </div>
    <form
      v-if="!registered"
      novalidate
      class="md-layout"
      @submit.prevent="isApproverRegisterFormComplete"
    >
      <md-card class="md-layout-item">
        <md-card-header>
          <div class="md-title">Approver Registration</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="event-title">Approver Title</label>
                <md-input
                  name="approver-title"
                  id="approver-title"
                  v-model="form.approverTitle"
                  :disabled="sending"
                />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100 info-dialog">
              <md-field>
                <label for="nr-of-levels">Number of Levels</label>
                <md-select
                  type="number"
                  id="numberOfLevels"
                  name="numberOfLevels"
                  v-model="form.numberOfLevels"
                  :disabled="sending"
                >
                  <md-option value="1">1</md-option>
                  <md-option value="2">2</md-option>
                  <md-option value="3">3</md-option>
                  <md-option value="4">4</md-option>
                  <md-option value="5">5</md-option>
                </md-select>
              </md-field>
              <div class="info-dialog-button">
                <md-button
                  class="md-icon-button md-primary"
                  @click="showNumberOfLevelsDialog = true"
                >
                  <md-icon>help_outline</md-icon>
                </md-button>
              </div>
            </div>
          </div>

          <md-dialog :md-active.sync="showNumberOfLevelsDialog">
            <md-dialog-title>Security Levels</md-dialog-title>
            <p class="dialog-text">
              Choose the number of levels that you want to provide for identity
              verification. The higher the level the more secure should the
              verification process be. Consider, that for an event that requires
              e.g. your level 2 verification, anyone with a level 2 or higher
              verification from you can buy a ticket for this event. So a higher
              level always comes with permission for your lower specified
              levels.
            </p>
            <p></p>
            <md-button
              class="md-primary"
              @click="showNumberOfLevelsDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout-item md-small-size-100">
            <md-field>
              <label for="firstLevel">First Level - Lowest Level</label>
              <md-input
                name="firstLevel"
                id="firstLevel"
                v-model="form.firstLevel"
                :disabled="sending"
              />
            </md-field>
          </div>

          <div
            v-if="form.numberOfLevels >= 2"
            class="md-layout-item md-small-size-100"
          >
            <md-field>
              <label for="secondLevel">Second Level</label>
              <md-input
                name="secondLevel"
                id="secondLevel"
                v-model="form.secondLevel"
                :disabled="sending"
              />
            </md-field>
          </div>

          <div
            v-if="form.numberOfLevels >= 3"
            class="md-layout-item md-small-size-100"
          >
            <md-field>
              <label for="thirdLevel">Third Level</label>
              <md-input
                name="thirdLevel"
                id="thirdLevel"
                v-model="form.thirdLevel"
                :disabled="sending"
              />
            </md-field>
          </div>

          <div
            v-if="form.numberOfLevels >= 4"
            class="md-layout-item md-small-size-100"
          >
            <md-field>
              <label for="fourthLevel">Fourth Level</label>
              <md-input
                name="fourthLevel"
                id="fourthLevel"
                v-model="form.fourthLevel"
                :disabled="sending"
              />
            </md-field>
          </div>

          <div
            v-if="form.numberOfLevels >= 5"
            class="md-layout-item md-small-size-100"
          >
            <md-field>
              <label for="fifthLevel">Fifth Level</label>
              <md-input
                name="fifthLevel"
                id="fifthLevel"
                v-model="form.fifthLevel"
                :disabled="sending"
              />
            </md-field>
          </div>

          <div class="md-layout-item md-small-size-100 info-dialog">
            <md-field>
              <label for="website">Website</label>
              <md-input
                name="website"
                id="website"
                v-model="form.approverWebsite"
                @blur="handleWebsiteBlur"
                :disabled="sending"
              />
            </md-field>
            <div class="info-dialog-button verification-icon">
              <md-icon class="md-accent" v-if="!websiteVerified"
                >warning</md-icon
              >
              <md-icon
                class="verification-icon"
                style="color: green"
                v-if="websiteVerified"
                >done</md-icon
              >
            </div>
          </div>

          <div class="md-layout-item md-small-size-100 info-dialog">
            <md-field>
              <label for="twitter">Twitter</label>
              <md-input
                name="twitter"
                id="twitter"
                v-model="form.approverTwitter"
                @blur="handleTwitterBlur"
                :disabled="sending"
              />
            </md-field>
            <div class="info-dialog-button verification-icon">
              <md-icon class="md-accent" v-if="!twitterVerified"
                >warning</md-icon
              >
              <md-icon style="color: green" v-if="twitterVerified"
                >done</md-icon
              >
            </div>
          </div>
        </md-card-content>

        <md-card-actions>
          <md-button
            type="submit"
            class="md-primary"
            @click="registerAsApprover"
            :disabled="sending"
            >Register as approver</md-button
          >
        </md-card-actions>
      </md-card>
    </form>

    <div v-if="showStatusMessage" class="status-message">
      <md-progress-bar
        :md-value="100"
        :md-mode="processBarMode"
      ></md-progress-bar>
      <p class="process-message">
        {{ processMessage }}
      </p>
    </div>
  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";
import sleep from "await-sleep";
const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.VUE_APP_PINATA_API_KEY,
  process.env.VUE_APP_PINATA_SECRET_API_KEY
);

// project internal imports
import { cidToArgs, argsToCid } from "idetix-utils";
import {
  AVERAGE_TIME_PER_BLOCK,
  AVERAGE_TIME_PER_BLOCK_LOCAL,
  AVERAGE_TIME_WAITING_FOR_RECEIPT,
  NETWORKS,
  NULL_ADDRESS,
  PROGRESS_DETERMINATE,
  PROGRESS_INDETERMINATE,
  DEFAULT_ERROR,
  WAITING_FOR_SIGNATURE,
  UPLOADING_TO_IPFS,
  APPROVER_REGISTRATION,
  APPROVER_REGISTRATION_SUCCESSFUL,
} from "../util/constants/constants.js";
import {
  requestTwitterVerification,
  requestWebsiteVerification,
} from "../util/identity";

export default {
  name: "ApproverRegisterForm",
  data: () => ({
    sending: false,
    showStatusMessage: false,
    processBarMode: PROGRESS_DETERMINATE,
    processMessage: DEFAULT_ERROR,

    registered: false,
    exists: null,

    twitterVerified: false,
    websiteVerified: false,

    showNumberOfLevelsDialog: false,
    IpfsHash: null,
    ipfsArgs: null,
    ipfsData: null,
    ipfsString: null,
    form: {
      approverTitle: "",
      methods: [],
      firstLevel: "",
      secondLevel: "",
      thirdLevel: "",
      fourthLevel: "",
      fifthLevel: "",
      approverWebsite: "",
      approverTwitter: "",
      numberOfLevels: 1,
    },
    showNrLevels: false,
  }),
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    formatTwitter() {
      let tw = this.form.approverTwitter;
      if (tw.includes("https://twitter.com/")) {
        return tw;
      } else {
        if (tw.includes(".com/")) {
          return "https://twitter.com/" + tw.split(".com/")[1];
        } else {
          return "https://twitter.com/" + tw;
        }
      }
    },
    registeredApprovers() {
      return this.$store.state.approvers;
    },
    identityContract() {
      return this.$store.state.identity;
    },
    approverMethods() {
      let methodArray = [];
      if (this.form.firstLevel != "") {
        methodArray.push({
          level: 1,
          value: this.form.firstLevel,
        });
      }
      if (this.form.secondLevel != "") {
        methodArray.push({
          level: 2,
          value: this.form.secondLevel,
        });
      }
      if (this.form.thirdLevel != "") {
        methodArray.push({
          level: 3,
          value: this.form.thirdLevel,
        });
      }
      if (this.form.fourthLevel != "") {
        methodArray.push({
          level: 4,
          value: this.form.fourthLevel,
        });
      }
      if (this.form.fifthLevel != "") {
        methodArray.push({
          level: 5,
          value: this.form.fifthLevel,
        });
      }
      return methodArray;
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
    async handleTwitterBlur() {
      console.log("handling twitter blur");
      console.log(this.formatTwitter);
      this.twitterVerified = await requestTwitterVerification(
        this.formatTwitter,
        this.$store.state.web3.account
      );
      console.log("twitter verified:", this.twitterVerified);
    },
    async handleWebsiteBlur() {
      console.log("handling website blur");
      console.log(this.form.approverWebsite);
      this.websiteVerified = await requestWebsiteVerification(
        this.form.approverWebsite,
        this.$store.state.web3.account
      );
      console.log("website verified:", this.websiteVerified);
    },
    createIpfsString() {
      var methods = this.approverMethods.slice(0, this.form.numberOfLevels);
      let json = JSON.stringify({
        version: "1.0",
        approver: {
          title: this.form.approverTitle,
          methods: methods,
          website: this.form.approverWebsite,
          twitter: this.formatTwitter,
        },
      });
      console.log(json);
      return json;
    },

    /**
     * Creates the metadata Json and pins it to IPFS with Pinata
     */
    async uploadToIpfs() {
      this.showStatus(PROGRESS_INDETERMINATE, UPLOADING_TO_IPFS);
      this.ipfsString = this.createIpfsString();
      const result = await pinata.pinJSONToIPFS(JSON.parse(this.ipfsString));
      this.IpfsHash = result.IpfsHash;
    },
    isApproverRegisterFormComplete() {
      return true;
    },
    async registerAsApprover() {
      this.sending = true;
      await this.uploadToIpfs();
      let ipfsArgs = cidToArgs(this.IpfsHash);
      this.showStatus(PROGRESS_DETERMINATE, WAITING_FOR_SIGNATURE);
      let register = await this.identityContract.methods
        .registerApprover(ipfsArgs.hashFunction, ipfsArgs.size, ipfsArgs.digest)
        .send({ from: this.web3.account }, async (error, transactionHash) => {
          this.showStatus(PROGRESS_INDETERMINATE, APPROVER_REGISTRATION);
          if (transactionHash) {
            console.log(
              "submitted approver register invocation: ",
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
            console.log("Got the transaction receipt: ", transactionReceipt);
            this.showStatus(
              PROGRESS_DETERMINATE,
              APPROVER_REGISTRATION_SUCCESSFUL
            );
            this.sending = false;
            this.$router.push({
              path: `/`,
            });
          }
        })
        .catch(async (e) => {
          // Transaction rejected or failed
          console.log(e);
          this.sending = false;
          this.showErrorStatus();
          const result = await pinata.unpin(this.IpfsHash);
        });
    },
  },
  async created() {
    this.$root.$on("loadedApprovers", async () => {
      this.exists = this.registeredApprovers.find(
        (approver) => approver.approverAddress === this.web3.account
      );
      if (this.exists) {
        this.registered = true;
      }
    });
    if (this.registeredApprovers.length > 0 && this.web3.account) {
      this.exists = this.registeredApprovers.find(
        (approver) => approver.approverAddress === this.web3.account
      );
      if (this.exists) {
        this.registered = true;
      }
    }
    const pinataAuth = await pinata.testAuthentication();
    console.log(pinataAuth);
  },
};
</script>

<style>
.process-message {
  text-align: center;
}
.already-registered-container {
  text-align: center;
}
.info-dialog-button.verification-icon {
  margin-left: 20px;
}
</style>
