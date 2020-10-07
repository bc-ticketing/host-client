<template>
  <div class="create-event-form-container">
    <form novalidate class="md-layout" @submit.prevent="eventFormComplete">
      <md-card class="md-layout-item">
        <md-card-header>
          <div class="md-title">New Event</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('title')">
                <label for="event-title">Title</label>
                <md-input
                  name="event-title"
                  id="event-title"
                  v-model="form.title"
                  :disabled="sending"
                />
                <span class="md-error" v-if="!$v.form.title.required"
                  >The event title is required</span
                >
                <span class="md-error" v-else-if="!$v.form.title.minlength"
                  >Invalid event title</span
                >
              </md-field>
            </div>
          </div>

          <div class="location-container md-layout md-gutter">
            <div class="md-layout-item">
              <md-field :class="getValidationClass('location')">
                <label for="location">Location</label>
                <md-input
                  name="location"
                  id="location"
                  v-model="form.location"
                />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter date-container">
            <div class="md-layout-item">
              <md-datepicker
                md-immediately
                name="date"
                id="date"
                v-model="form.date"
              >
                <label for="date">Date and Start Time</label>
              </md-datepicker>
            </div>
            <div class="md-small-size-100" style="margin: 20px 0">
              <vue-timepicker
                v-model="form.startTime"
                format="HH:mm"
              ></vue-timepicker>
            </div>
            <div class="md-small-size-100 info-dialog-button">
              <md-button
                class="md-icon-button md-primary"
                @click="showStartTimeDialog = true"
                style="margin-right: 16px"
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

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('category')">
                <label for="category">Category</label>
                <md-select
                  name="category"
                  id="category"
                  v-model="form.category"
                >
                  <md-option value="Music">Music</md-option>
                  <md-option value="Sports">Sports</md-option>
                  <md-option value="Theatre">Theatre</md-option>
                </md-select>
                <span class="md-error">The event category is required.</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100" style="display:flex">
              <md-field
                :class="getValidationClass('idApprover')"
                style="margin-right: 24px"
              >
                <label for="idApprover">ID Approver</label>
                <md-input
                  name="idApprover"
                  id="idApprover"
                  v-model="form.idApprover"
                />
                <span class="md-error">An ID approver is required</span>
              </md-field>
              <md-field
                :class="getValidationClass('idLevel')"
                style="max-width:150px"
              >
                <label for="idLevel">Identification level</label>
                <md-select
                  type="number"
                  id="idLevel"
                  name="idLevel"
                  v-model="form.idLevel"
                >
                  <md-option value="1">1</md-option>
                  <md-option value="2">2</md-option>
                  <md-option value="3">3</md-option>
                </md-select>
                <span class="md-error" v-if="!$v.form.idLevel.required"
                  >The id level is required</span
                >
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
            <md-button class="md-primary"
              >Click here for avaliable information about your set approver,
              e.g. its level specifications.</md-button
            >
            <md-button
              class="md-primary"
              @click="showIdentityApproverDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <!-- TODO 24.7.2020 Michael: fetch approver levels and add as dropdown options to choose from -->
          <!-- <div class="md-layout-item md-small-size-100">
            
          </div>-->

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100 info-dialog">
              <md-field :class="getValidationClass('erc20Token')">
                <label for="erc20Token">Accepted Token For Payment</label>
                <md-input
                  name="erc20Token"
                  id="erc20Token"
                  v-model="form.erc20Token"
                />
                <span class="md-error" v-if="!$v.form.erc20Token.required"
                  >The token that is accepted for payment is required</span
                >
                <!-- <span
                  class="md-error"
                  v-else-if="!$v.form.erc20Token.maxLength"
                >Invalid event token hash</span>-->
              </md-field>
              <div class="info-dialog-button">
                <md-button
                  class="md-icon-button md-primary"
                  @click="showTokenDialog = true"
                >
                  <md-icon>help_outline</md-icon>
                </md-button>
              </div>
            </div>
          </div>

          <md-dialog :md-active.sync="showTokenDialog">
            <md-dialog-title>Accepted Token</md-dialog-title>
            <p class="dialog-text">
              You can request any ERC20 Token for payment of your tickets. To
              use ETH, keep the initial placeholder.
            </p>
            <md-button class="md-primary" @click="showTokenDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100 info-dialog">
              <md-field :class="getValidationClass('eventGranularity')">
                <label for="event-granularity">Aftermarket Granularity</label>
                <md-select
                  type="number"
                  id="event-granularity"
                  name="event-granularity"
                  v-model="form.granularity"
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
                <span class="md-error" v-if="!$v.form.granularity.required"
                  >The granularity is required</span
                >
                <span class="md-error" v-else-if="!$v.form.granularity"
                  >Invalid granularity</span
                >
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
            <p></p>
            <md-button class="md-primary" @click="showGranularityDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass(`eventDescription`)">
                <label for="eventDescription">Description</label>
                <md-textarea
                  id="eventDescription"
                  name="eventDescription"
                  v-model="form.eventDescription"
                  :disabled="sending"
                ></md-textarea>
                <span class="md-error">A description is required</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('color')">
                <label for="color">Color</label>
                <md-input name="color" id="color" v-model="form.color" />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('url')">
                <label for="url">URL</label>
                <md-input name="url" id="url" v-model="form.url" />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('twitter')">
                <label for="twitter">Twitter</label>
                <md-input name="twitter" id="twitter" v-model="form.twitter" />
              </md-field>
            </div>
          </div>
        </md-card-content>

        <md-progress-bar md-mode="indeterminate" v-if="sending" />

        <md-card-actions>
          <md-button type="submit" class="md-primary" @click="createEvent"
            >Create Event</md-button
          >
        </md-card-actions>
        <!-- <md-card-actions>
          <md-button type="submit" class="md-primary" @click="uploadToIpfs">Uploaod to ipfs</md-button>
          <md-button type="submit" class="md-primary" @click="downloadFromIpfs">Download from ipfs</md-button>
        </md-card-actions>
        <md-card-actions>
          <md-button
            type="submit"
            class="md-primary"
            @click="deployEventContract"
          >Deploy event contract</md-button>
        </md-card-actions>-->
      </md-card>

      <md-snackbar :md-active.sync="ipfsAdded">
        The event {{ lastEvent }} was uploaded to IPFS with success!
      </md-snackbar>
      <md-snackbar :md-active.sync="eventContractDeployed">
        The event {{ lastEvent }} was successfully deployed! Contract address:
      </md-snackbar>
    </form>
  </div>
</template>

<script>
import getWeb3 from "../util/getWeb3";
import IpfsHttpClient, { CID } from "ipfs-http-client";
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength
} from "vuelidate/lib/validators";
import VueTimepicker from "vue2-timepicker";
import "vue2-timepicker/dist/VueTimepicker.css";

// project internal imports
import { NETWORKS } from "../util/constants/constants.js";
import { cidToArgs, argsToCid } from "idetix-utils";
import {
  EVENT_FACTORY_ABI,
  EVENT_FACTORY_ADDRESS
} from "../util/constants/EventFactory.js";
import { DAI } from "../util/constants/ERC20Tokens.js";
export default {
  name: "EventForm",
  mixins: [validationMixin],
  components: { VueTimepicker },
  data: () => ({
    showStartTimeDialog: false,
    showTokenDialog: false,
    showIdentityApproverDialog: false,
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
    ethToken: "0",
    form: {
      // ipfs info
      title: "title",
      location: "Zurich",
      category: "Music",
      eventDescription: "test description",
      color: "#add8e6",
      date: new Date(2020, 10, 2),
      startTime: {
        HH: "18",
        mm: "00"
      },
      url: "",
      twitter: "",
      //   eventTags: [],
      // blockchain info
      erc20Token: "0x0000000000000000000000000000000000000000",
      idApprover: "0x2bF80bcfA49A7058a053B1F121cFaCEe072C432e",
      idLevel: 1,
      granularity: 2
    },
    sending: false,
    lastEvent: null
  }),
  validations: {
    form: {
      title: {
        // required,
        minLength: minLength(3)
      },
      category: {
        // required,
      },
      eventDescription: {
        // required,
        minLength: minLength(10)
      },
      erc20Token: {
        required
        // maxLength: maxLength(42)
      },
      idLevel: {
        required
      },
      idApprover: {
        required
      },
      granularity: {
        required
      }
      // url: {
      //   // required,
      //   url
      // }
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
    }
  },
  methods: {
    getValidationClass(fieldName) {
      return {
        "md-invalid": false
      };
      // const field = this.$v.form[fieldName];
      // if (field) {
      //   return {
      //     "md-invalid": false, //field.$invalid && field.$dirty,
      //   };
      // }
    },
    clearForm() {
      this.$v.$reset();
      this.form.title = "";
      this.form.location = "";
      this.form.category = "";
      this.form.eventDescription = "";
      this.color = "";
      this.time = 0;
      this.url = "";
      this.twitter = "";
      //   this.form.eventTags = null;

      this.form.levelNumber = null;
      this.form.idApprover = null;
      this.form.granularity = 4;
    },
    async createEvent() {
      await this.uploadToIpfs();
      await this.deployEventContract();
    },
    async uploadToIpfs() {
      this.ipfsString = this.createIpfsString();
      try {
        const response = await this.ipfsInstance.add(this.ipfsString);
        this.ipfsHash = response.path;
        console.log("Uploading to ipfs");
        console.log("http://ipfs.io/ipfs/" + this.ipfsHash);
        this.sending = true;
      } catch (err) {
        console.log(err);
        this.ipfsError = true;
      }
      window.setTimeout(() => {
        this.lastEvent = `${this.form.title} ${this.form.description}`;
        this.ipfsAdded = true;
        this.sending = false;
        // this.clearForm();
      }, 1500);
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
          color: this.form.color,
          time: this.startTimeUnix,
          duration: "",
          url: this.form.url,
          twitter: this.form.twitter
        }
      });
    },
    eventFormComplete() {
      // check if required input fields are valid and then upload the event form to ipfs
      this.$v.$touch();
      return !this.$v.$invalid;
    },
    async deployEventContract() {
      const args = cidToArgs(this.ipfsHash);
      const createEvent = await this.eventFactory.methods
        .createEvent(
          args.hashFunction,
          args.size,
          args.digest,
          this.form.idApprover,
          this.form.idLevel,
          this.form.erc20Token,
          this.form.granularity
        )
        .send({ from: this.$store.state.web3.account });

      this.eventFactory.events
        .EventCreated()
        .on(`data`, event => {
          const ev = { address: event.returnValues[0], cid: this.ipfsHash };
          this.lastEventInfo = ev;
          this.$store.commit("addEventContract", ev);
          this.eventContractDeployed = true;
          console.log("Contract created");
          console.log(this.lastEventInfo);
        })
        .on(`error`, console.error);

      const eventAddresses = await this.eventFactory.methods.getEvents().call();
      console.log(eventAddresses);
    }
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
</style>
