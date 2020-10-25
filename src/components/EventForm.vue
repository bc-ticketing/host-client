<template>
  <div class="create-event-form-container">
    <form novalidate class="md-layout" @submit.prevent="validateForm">
      <md-card class="md-layout-item">
        <md-card-header>
          <div v-if="inNewMode" class="md-title">New Event</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter" v-if="inEditMode || inNewMode">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('title')">
                <label for="event-title">Title</label>
                <md-input
                  name="event-title"
                  id="event-title"
                  v-model="form.title"
                  :disabled="sending"
                />
                <p v-if="errors" class="error">
                  <span class="md-error" v-if="!$v.form.title.required"
                    >The event title is required</span
                  >
                </p>
              </md-field>
            </div>
          </div>

          <div
            class="location-container md-layout md-gutter"
            v-if="inEditMode || inNewMode"
          >
            <div class="md-layout-item">
              <md-field :class="getValidationClass('location')">
                <label for="location">Location</label>
                <md-input
                  name="location"
                  id="location"
                  v-model.lazy="$v.form.location.$model"
                  :disabled="sending"
                />
                <p v-if="errors" class="error">
                  <span class="md-error" v-if="!$v.form.location.required"
                    >The location is required</span
                  >
                </p>
              </md-field>
            </div>
          </div>

          <div
            class="md-layout md-gutter date-container"
            v-if="inEditMode || inNewMode"
            :disabled="sending"
          >
            <div class="md-layout-item">
              <md-datepicker
                v-if="!sending"
                md-immediately
                name="date"
                id="date"
                v-model="form.date"
                ><p v-if="errors" class="error">
                  <span class="md-error" v-if="!$v.form.date.required"
                    >The location is required</span
                  >
                </p>
                <label for="date">Date and Start Time</label>
              </md-datepicker>
              <md-datepicker
                v-if="sending"
                md-immediately
                name="disabled-datepicker"
                id="disabled-datepicker"
                v-model="dateUponSending"
                :md-disabled-dates="disabledDates"
              >
                <label for="disabled-datepicker">Date and Start Time</label>
                <p class="error" v-if="errors">
                  <span class="md-error" v-if="!$v.form.date.required"
                    >The date is required.</span
                  >
                </p>
              </md-datepicker>
            </div>
            <div class="md-small-size-100" style="margin: 20px 0">
              <vue-timepicker
                v-model="form.startTime"
                format="HH:mm"
                :disabled="sending"
              ></vue-timepicker>
            </div>
            <div class="md-small-size-100 info-dialog-button">
              <md-button
                class="md-icon-button md-primary"
                @click="showStartTimeDialog = true"
                style="margin-right: 16px"
                :disabled="sending"
              >
                <md-icon>help_outline</md-icon>
              </md-button>
            </div>
          </div>

          <md-dialog :md-active.sync="showStartTimeDialog">
            <md-dialog-title>Start Time</md-dialog-title>
            <p class="dialog-text">
              Specify the start time of the event here. To define a time for
              door opening use the finalization block on each ticket type.
            </p>
            <md-button class="md-primary" @click="showStartTimeDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout md-gutter" v-if="inEditMode || inNewMode">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="category">Category</label>
                <md-select
                  name="category"
                  id="category"
                  v-model="form.category"
                  :disabled="sending"
                >
                  <md-option value="Music">Music</md-option>
                  <md-option value="Sports">Sports</md-option>
                  <md-option value="Theatre">Theatre</md-option>
                </md-select>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter" v-if="inNewMode">
            <div class="md-layout-item md-small-size-100" style="display:flex">
              <!-- <md-field
                :class="getValidationClass('idApprover')"
                style="margin-right: 24px"
              > -->
              <md-field style="margin-right: 24px">
                <label for="idApprover">ID Approver</label>
                <!-- <md-input
                  name="idApprover"
                  id="idApprover"
                  v-model.lazy="$v.form.idApprover.$model"
                  @blur="checkIfApproverRegistered"
                  :disabled="sending"
                /> -->
                <md-select
                  id="idApprover"
                  name="idApprover"
                  v-model="form.selectedApproverAddress"
                  @md-selected="setApproverLevels"
                  :disabled="sending"
                >
                  <md-option
                    v-for="approver in this.$store.state.approvers"
                    v-bind:key="approver.approverAddress"
                    v-bind:value="approver.approverAddress"
                  >
                    {{ approver.title }}
                  </md-option>
                </md-select>
                <p v-if="errors" class="error">
                  <span class="md-error" v-if="!$v.form.idApprover.required"
                    >An identity approver is required</span
                  >
                </p>
              </md-field>
              <md-field style="max-width:250px">
                <label for="idLevel">Identification level</label>
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
                <p v-if="errors" class="error">
                  <span
                    class="md-error"
                    v-if="!$v.form.selectedApproverLevel.required"
                    >The id level is required</span
                  >
                </p>
              </md-field>
              <div class="info-dialog-button">
                <md-button
                  class="md-icon-button md-primary"
                  @click="showIdentityApproverDialog = true"
                >
                  <md-icon>help_outline</md-icon>
                </md-button>
              </div>
            </div>
          </div>

          <md-dialog :md-active.sync="showIdentityApproverDialog">
            <md-dialog-title>Identity Approver</md-dialog-title>
            <p class="dialog-text">
              Anyone who wants to buy a ticket needs to have its identity
              verified by the here specified approver. The level marks the
              minimum level of verification offered by the given approver.
            </p>
            <md-button
              v-if="approverRegistered"
              @click="
                showIdentityApproverDialog = false;
                showSelectedIdentityApproverDialog = true;
              "
              class="md-primary"
              >Information about {{ selectedApprover.title }}</md-button
            >
            <md-button
              class="md-primary"
              @click="showIdentityApproverDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <md-dialog :md-active.sync="showSelectedIdentityApproverDialog">
            <md-dialog-title>{{ selectedApprover.title }}</md-dialog-title>
            <div class="dialog-approver-entry">
              <div class="dialog-approver-entry-title"><b>Website: </b></div>
              <a
                class="dialog-text"
                v-if="selectedApprover.website.url"
                :href="selectedApprover.website.url"
                target="_blank"
                >{{ selectedApprover.website.url }}</a
              >
              <p class="dialog-text" v-if="!selectedApprover.website.url">
                No website linked
              </p>
            </div>
            <div class="dialog-approver-entry">
              <div class="dialog-approver-entry-title"><b>Twitter: </b></div>
              <a
                class="dialog-text"
                v-if="selectedApprover.twitter.url"
                :href="selectedApprover.twitter.url"
                target="_blank"
                >{{ selectedApprover.twitter.url }}</a
              >
              <p class="dialog-text" v-if="!selectedApprover.twitter.url">
                No Twitter linked
              </p>
            </div>
            <div class="dialog-approver-entry">
              <div class="dialog-approver-entry-title">
                <b>Provided Methods</b>
              </div>
            </div>
            <div class="dialog-approver-methods-wrapper">
              <div
                class="dialog-text dialog-approver-methods"
                :key="method.level"
                v-for="method in selectedApprover.methods"
              >
                <p class="dialog-approver-methods-level">
                  Level {{ method.level }}:
                </p>
                <p class="dialog-approver-methods-value">{{ method.value }}</p>
              </div>
            </div>
            <md-button
              class="md-primary"
              @click="
                showSelectedIdentityApproverDialog = false;
                showIdentityApproverDialog = true;
              "
              >Back</md-button
            >
            <md-button
              class="md-primary"
              @click="showSelectedIdentityApproverDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout md-gutter" v-if="inNewMode">
            <div class="md-layout-item md-small-size-100">
              <md-checkbox
                v-model="useERC20Token"
                :value="true"
                :disabled="sending"
                >Use ERC20 Token for Payment
              </md-checkbox>
            </div>
          </div>

          <div v-if="useERC20Token" class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100 info-dialog">
              <md-radio
                v-model.lazy="$v.form.erc20Token.$model"
                :value="erc20Tokens.testToken"
                :disabled="sending"
                >ERC20 Test Token</md-radio
              >
              <md-radio
                v-model.lazy="$v.form.erc20Token.$model"
                :value="erc20Tokens.dai"
                :disabled="sending"
                >DAI</md-radio
              >
            </div>
          </div>

          <md-dialog :md-active.sync="showTokenDialog">
            <md-dialog-title>Accepted Token</md-dialog-title>
            <p class="dialog-text">
              You can request any ERC20 Token for payment of your tickets. To
              use ETH, unselect the provided checkbox.
            </p>
            <md-button class="md-primary" @click="showTokenDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout md-gutter" v-if="inNewMode">
            <div class="md-layout-item md-small-size-100 info-dialog">
              <md-field :class="getValidationClass('eventGranularity')">
                <label for="event-granularity">Aftermarket Granularity</label>
                <md-select
                  type="number"
                  id="event-granularity"
                  name="event-granularity"
                  v-model.lazy="$v.form.granularity.$model"
                  :disabled="sending"
                >
                  <md-option value="1">1</md-option>
                  <md-option value="2">2</md-option>
                  <md-option value="4">4</md-option>
                  <md-option value="5">5</md-option>
                  <md-option value="10">10</md-option>
                  <md-option value="20">20</md-option>
                  <md-option value="25">25</md-option>
                  <md-option value="50">50</md-option>
                  <md-option value="100">100</md-option>
                </md-select>
                <p v-if="errors" class="error">
                  <span class="md-error" v-if="!$v.form.granularity.required"
                    >The granularity is required</span
                  >
                </p>
              </md-field>
              <div class="info-dialog-button">
                <md-button
                  class="md-icon-button md-primary"
                  @click="showGranularityDialog = true"
                >
                  <md-icon>help_outline</md-icon>
                </md-button>
              </div>
            </div>
          </div>

          <md-dialog :md-active.sync="showGranularityDialog">
            <md-dialog-title>Aftermarket Granularity</md-dialog-title>
            <p class="dialog-text">
              Ticket holders can resell their ticket for a price lower or equal
              to the initial buying price. You can define, for how many
              different prices ticket holders can resell their tickets. E.g. if
              you choose a granularity of 4, tickets can be resold for 100%,
              75%, 50% or 25% of the initial price, if you choose 100, tickets
              can be resold for 100%, 99%, 98%, ..., or 1%.
            </p>
            <md-button class="md-primary" @click="showGranularityDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout md-gutter" v-if="inEditMode || inNewMode">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('eventDescription')">
                <!-- <md-field> -->
                <label for="eventDescription">Description</label>
                <md-textarea
                  id="eventDescription"
                  name="eventDescription"
                  v-model.lazy="$v.form.eventDescription.$model"
                  :disabled="sending"
                ></md-textarea>
                <span class="md-error" v-if="!$v.form.eventDescription.required"
                  >A description is required</span
                >
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="image">Image</label>
                <md-file
                  name="image"
                  id="image"
                  @change="readImageFile"
                  accept="image/*"
                  :disabled="sending"
                />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="website">Website</label>
                <md-input
                  name="website"
                  id="website"
                  v-model.lazy="$v.form.website.$model"
                  :disabled="sending"
                />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter" v-if="inEditMode || inNewMode">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="twitter">Twitter</label>
                <md-input
                  name="twitter"
                  id="twitter"
                  v-model.lazy="$v.form.twitter.$model"
                  :disabled="sending"
                />
              </md-field>
            </div>
          </div>
        </md-card-content>

        <md-card-actions>
          <md-button
            v-if="inEditMode && !invokingMetadataChangeState"
            class="md-accent"
            @click="leaveEditMode"
            :disabled="sending"
            >Cancel</md-button
          >
          <md-button
            v-if="inEditMode && !invokingMetadataChangeState"
            type="submit"
            class="md-primary"
            @click.prevent="modifyEvent"
            :disabled="sending"
            >Submit changes</md-button
          >
          <md-button
            v-if="inNewMode && !deployingContractState"
            class="md-primary"
            @click.prevent="createEvent"
            :disabled="sending"
            >Create Event</md-button
          >
        </md-card-actions>
      </md-card>

      <md-progress-bar md-mode="indeterminate" v-if="sending" />
    </form>
    <div v-if="uploadingToIpfs" class="awaiting-ipfs-upload">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      <p class="process-message">
        Please wait - The Event metadata is uploaded to IPFS.
      </p>
    </div>

    <div v-if="waitingForSignature" class="awaiting-signature-message">
      <md-progress-bar md-mode="determinate" :md-value="100"></md-progress-bar>
      <p class="process-message">
        Please sign the transaction to deploy this event contract.
      </p>
    </div>
    <div v-if="waitingForDeploymentReceipt" class="awaiting-form-response">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      <p class="process-message">
        Please wait - The Event contract is being deployed.
      </p>
    </div>
    <div v-if="waitingForMetadataChangeReceipt" class="awaiting-form-response">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      <p class="process-message">
        Please wait - The metadata change invocation is being sent.
      </p>
    </div>
    <div v-if="showSuccessFullDeploymentMessage" class="successful-message">
      <p class="process-message">The event was successfully deployed.</p>
    </div>
    <div v-if="showSuccessfullMetadataChangeMessage" class="successful-message">
      <p class="process-message">The metadata change is confirmed.</p>
    </div>
    <div v-if="showErrorMessage" class="unsuccessful-deployment-message">
      <p class="process-message">Something went wrong...</p>
    </div>
  </div>
</template>

<script>
import getWeb3 from "../util/getWeb3";
import IpfsHttpClient, { CID } from "ipfs-http-client";
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  url,
  minLength,
  maxLength
} from "vuelidate/lib/validators";
import VueTimepicker from "vue2-timepicker";
import "vue2-timepicker/dist/VueTimepicker.css";
import sleep from "await-sleep";

// project internal imports
import {
  AVERAGE_BLOCKTIME,
  AVERAGE_BLOCKTIME_LOCAL,
  NETWORKS,
  NULL_ADDRESS
} from "../util/constants/constants.js";
import { cidToArgs, argsToCid } from "idetix-utils";
import {
  EVENT_FACTORY_ABI,
  EVENT_FACTORY_ADDRESS
} from "../util/abi/EventFactory.js";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/abi/EventMintableAftermarketPresale";
import { ETH, DAI, ERC20TESTTOKEN } from "../util/constants/ERC20Tokens.js";
import idb from "../util/db/idb";
import { IdentityApprover } from "../util/identity";
import { getApproverFromStore } from "../util/utility";

export default {
  name: "EventForm",
  mixins: [validationMixin],
  components: { VueTimepicker },
  props: {
    event: Object,
    inEditMode: Boolean,
    inNewMode: Boolean
  },
  data: () => ({
    uiState: "submit not clicked",
    errors: false,
    sending: false,
    waitingForSignature: false,
    waitingForDeploymentReceipt: false,
    waitingForMetadataChangeReceipt: false,
    deployingContractState: false,
    invokingMetadataChangeState: false,
    uploadingToIpfs: false,
    showSuccessFullDeploymentMessage: false,
    showSuccessfullMetadataChangeMessage: false,
    showErrorMessage: false,
    showStartTimeDialog: false,
    showTokenDialog: false,
    showIdentityApproverDialog: false,
    showSelectedIdentityApproverDialog: false,
    showGranularityDialog: false,
    ipfsArgs: null,
    ipfsCid: null,
    ipfsHash: null,
    ipfsData: null,
    ipfsString: null,
    ipfsError: false,
    ipfsAdded: false,
    eventContractDeployed: false,
    lastEventInfo: null,
    form: {
      // ipfs info
      title: "title",
      location: "Zurich",
      category: "Music",
      eventDescription: "",
      erc20Token: ERC20TESTTOKEN,
      startTime: {
        HH: "18",
        mm: "00"
      },
      website: "",
      twitter: "",
      idApprover: "0x4ACeea81cf19876a016436233E054E709E9d19D9",
      selectedApproverAddress: NULL_ADDRESS,
      selectedApproverLevel: 0,
      granularity: 2
    },
    noApprover: {
      title: "No approver",
      approverAddress: NULL_ADDRESS
    },
    zeroApproverLevel: {
      level: 0,
      value: "No identity approval required"
    },
    approverLevels: [{ level: 0, value: "No identity approval required" }],
    useERC20Token: false,
    erc20Tokens: {
      testToken: ERC20TESTTOKEN,
      dai: DAI
    },
    imageData: "",
    disabledDates: date => {
      const day = date.getDay();
      return day >= 0;
    },
    dateUponSending: null
  }),
  validations: {
    form: {
      title: {
        required
      },
      location: {
        required
      },
      date: {
        required
      },
      eventDescription: {
        required
      },
      erc20Token: {
        required
      },
      selectedApproverLevel: {
        required
      },
      idApprover: {
        required
      },
      granularity: {
        required
      },
      website: {
        url
      },
      twitter: {
        url
      }
    }
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    eventFactory() {
      return this.$store.state.eventFactory;
    },
    ipfsInstance() {
      return this.$store.state.ipfsInstance;
    },
    dateSeconds() {
      return Number(Date.parse(this.form.date) / 1000);
    },
    startTimeUnix() {
      return (
        this.dateSeconds +
        this.form.startTime.HH * 3600 +
        this.form.startTime.mm * 60
      );
    },
    usedToken() {
      return this.useERC20Token ? this.form.erc20Token : ETH;
    },
    getApproverLevel() {
      return this.approverLevels.find(
        approverLevel => approverLevel.level === this.form.selectedApproverLevel
      );
    },
    selectedApprover() {
      return getApproverFromStore(this.form.selectedApproverAddress)
        ? getApproverFromStore(this.form.selectedApproverAddress)
        : new IdentityApprover("");
    },
    approverRegistered() {
      return this.form.selectedApproverAddress != NULL_ADDRESS;
    }
  },
  watch: {
    showErrorMessage: function(val) {
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
    },
    sending: function(val) {
      this.dateUponSending = this.form.date;
    }
  },
  created() {
    this.form.date = this.getDateAfterMonths(8);
    if (this.inEditMode) {
      this.fillFormFromEvent();
    }
  },
  methods: {
    getDateAfterMonths(n) {
      let d = new Date();
      d.setMonth(d.getMonth() + n);
      return d;
    },
    fillFormFromEvent() {
      this.form.title = this.event.title;
    },
    leaveEditMode: function() {
      this.$emit("setEditMode", false);
    },
    getValidationClass(fieldName) {
      // return {
      //   "md-invalid": false
      // };
      const field = this.$v.form[fieldName];
      if (field) {
        if (this.errors) {
          return {
            "md-invalid": field.$invalid,
            "md-required": field.$required
          };
        }
      }
    },
    async createEvent() {
      this.errors = this.$v.form.$invalid;
      console.log(this.errors);
      this.uiState = "submit clicked";
      if (this.errors === true) {
        return;
      }
      let now = new Date();
      let nowSeconds = Date.parse(now) / 1000;
      if (this.dateSeconds < nowSeconds) {
        this.errors = true;
      }
      this.uiState = "form submitted";
      this.sending = true;
      await this.uploadToIpfs();
      await this.deployEventContract();
      this.sending = false;
    },
    async modifyEvent() {
      // todo: add checks to compare to current ipfs hash
      this.sending = true;
      await this.uploadToIpfs();
      await this.invokeMetadataChange();
      this.sending = false;
    },
    async uploadToIpfs() {
      this.ipfsString = this.createIpfsString();
      console.log(this.ipfsString);
      this.uploadingToIpfs = true;
      try {
        const response = await this.ipfsInstance.add(this.ipfsString);
        this.ipfsHash = response.path;
        console.log("Uploading to ipfs");
        console.log("http://ipfs.io/ipfs/" + this.ipfsHash);
        this.uploadingToIpfs = false;
        this.ipfsAdded = true;
      } catch (err) {
        console.log(err);
        this.ipfsError = true;
      }
    },
    async downloadFromIpfs() {
      console.log("downloading from ipfs...");
      for await (const chunk of this.ipfsInstance.cat(this.ipfsHash)) {
        this.ipfsData = Buffer(chunk, "utf8").toString();
      }
    },
    createIpfsString() {
      return JSON.stringify({
        version: "1.0",
        event: {
          title: this.form.title,
          location: this.form.location,
          category: this.form.category,
          description: this.form.eventDescription,
          time: this.startTimeUnix,
          duration: "",
          website: this.form.website,
          twitter: this.form.twitter,
          image: this.imageData
        }
      });
    },
    validateForm() {
      // check if required input fields are valid and then upload the event form to ipfs
      this.$v.$touch();
      return !this.$v.$invalid;
    },
    async invokeMetadataChange() {
      const args = cidToArgs(this.ipfsHash);
      const eventContract = new this.$store.state.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
        this.event.contractAddress
      );
      this.invokingMetadataChangeState = true;
      this.waitingForSignature = true;
      const updateMetadata = await eventContract.methods
        .updateEventMetadata(args.hashFunction, args.size, args.digest)
        .send(
          { from: this.$store.state.web3.account },
          async (error, transactionHash) => {
            this.waitingForSignature = false;
            this.waitingForMetadataChangeReceipt = true;
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
              await sleep(AVERAGE_BLOCKTIME_LOCAL);
            }
            if (transactionReceipt) {
              await sleep(5000);
              console.log("Got the transaction receipt: ", transactionReceipt);
              this.waitingForMetadataChangeReceipt = false;
              this.invokingMetadataChangeState = false;
              this.showSuccessfullMetadataChangeMessage = true;
            }
            await this.$store.dispatch("loadEvents");
            await sleep(2000);
            this.leaveEditMode();
          }
        )
        .catch(e => {
          // Transaction rejected or failed
          this.waitingForSignature = false;
          this.waitingForMetadataChangeReceipt = false;
          this.invokingMetadataChangeState = false;
          this.showSuccessfullMetadataChangeMessage = false;
          this.showErrorMessage = true;
          console.log(e);
        });
    },

    async deployEventContract() {
      const args = cidToArgs(this.ipfsHash);
      this.deployingContractState = true;
      this.waitingForSignature = true;
      console.log(args.hashFunction);
      console.log(args.size);
      console.log(args.digest);
      console.log(this.form.selectedApproverAddress);
      console.log(this.form.selectedApproverLevel);
      console.log(this.usedToken);
      console.log(this.form.granularity);
      const createEvent = await this.eventFactory.methods
        .createEvent(
          args.hashFunction,
          args.size,
          args.digest,
          this.form.selectedApproverAddress,
          this.form.selectedApproverLevel,
          this.usedToken,
          this.form.granularity
        )
        .send(
          { from: this.$store.state.web3.account },
          async (error, transactionHash) => {
            this.waitingForSignature = false;
            this.waitingForDeploymentReceipt = true;
            if (transactionHash) {
              console.log(
                "submitted event contract deployment invocation: ",
                transactionHash
              );
            }
            let transactionReceipt = null;
            while (transactionReceipt == null) {
              transactionReceipt = await this.$store.state.web3.web3Instance.eth.getTransactionReceipt(
                transactionHash
              );
              await sleep(AVERAGE_BLOCKTIME_LOCAL);
            }
            if (transactionReceipt) {
              console.log("Got the transaction receipt: ", transactionReceipt);
              this.waitingForDeploymentReceipt = false;
              this.showSuccessFullDeploymentMessage = true;
            }
            await this.$store.dispatch("loadEvents");
            this.$router.push({
              path: `/`
            });
          }
        )
        .catch(e => {
          // Transaction rejected or failed
          this.waitingForSignature = false;
          this.waitingForDeploymentReceipt = false;
          this.deployingContractState = false;
          this.showSuccessFullDeploymentMessage = false;
          this.showErrorMessage = true;
          console.log(e);
        });

      const eventAddresses = await this.eventFactory.methods.getEvents().call();
      console.log(eventAddresses);
    },
    readImageFile(event) {
      // Reference to the DOM input element
      var input = event.target;
      // Ensure that you have a file before attempting to read it
      if (input.files && input.files[0]) {
        // create a new FileReader to read this image and convert to base64 format
        var reader = new FileReader();
        // Define a callback function to run, when FileReader finishes its job
        reader.onload = e => {
          // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
          // Read image as base64 and set to imageData
          this.imageData = e.target.result;
        };
        // Start the reader job - read file as a data url (base64 format)
        reader.readAsDataURL(input.files[0]);
      }
    },

    setApproverLevels() {
      console.log("setting approver levels");
      this.approverLevels = [];
      let methods = getApproverFromStore(this.form.selectedApproverAddress)
        .methods;
      const nrMethods = methods.length;
      if (nrMethods > 0) {
        for (let i = 0; i < nrMethods; i++) {
          let method = methods[i];
          this.approverLevels.push(method);
        }
        this.form.selectedApproverLevel = 1;
      } else {
        this.approverLevels.push(this.zeroApproverLevel);
        this.form.selectedApproverLevel = 0;
      }
    }
    // Called on change in approver field
    // chaeckIfApproverRegistered() {
    //   this.approverLevels = [this.zeroApproverLevel];
    //   let approvers = this.$store.state.approvers;
    //   for (let i = 0; i < approvers.length; i++) {
    //     let approver = approvers[i];
    //     let address = approver.approverAddress;
    //     if (this.form.idApprover == address) {
    //       this.selectedApprover = approver;
    //       for (let j = 0; j < this.selectedApprover.methods.length; j++) {
    //         let method = this.selectedApprover.methods[j];
    //         this.approverLevels.push(method);
    //       }
    //       this.approverRegistered = true;
    //       return true;
    //     }
    //   }
    //   this.form.selectedApproverLevel = 0;
    //   this.form.selectedApprover = NULL_ADDRESS;
    //   this.approverRegistered = false;
    //   return false;
    // }
  }
};
</script>

<style>
.location-container {
  justify-content: center;
  display: flex;
}
.date-container {
  display: flex;
}
.process-message {
  text-align: center;
}
.dialog-approver-entry {
  display: flex;
}
.dialog-approver-entry-title {
  margin-left: 24px;
  min-width: 64px;
}
.dialog-approver-methods-wrapper {
  padding-bottom: 20px;
}
.dialog-approver-methods {
  display: flex;
  text-align: center;
  max-height: 1rem;
}
.dialog-approver-methods-level {
  min-width: 64px;
}
.dialog-approver-entry-value {
  margin-left: 10px;
}
</style>
