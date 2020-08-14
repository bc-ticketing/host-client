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
              <md-field :class="getValidationClass('eventTitle')">
                <label for="event-title">Event Title</label>
                <md-input
                  name="event-title"
                  id="event-title"
                  v-model="form.eventTitle"
                  :disabled="sending"
                />
                <span
                  class="md-error"
                  v-if="!$v.form.eventTitle.required"
                >The event title is required</span>
                <span class="md-error" v-else-if="!$v.form.eventTitle.minlength">Invalid event title</span>
              </md-field>
            </div>
          </div>

          <div class="date-location-container md-layout md-gutter">
            <!-- <div class="md-layout-item">
              <md-datepicker name="date" id="date" v-model="form.rawDate">
                <label for="date">Date</label>
              </md-datepicker>
              <md-input name="date" id="date" v-model="form.date" />
            </div>-->

            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('location')">
                <label for="location">Location</label>
                <md-input name="location" id="location" v-model="form.location" />
              </md-field>
            </div>
          </div>

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
              <md-field :class="getValidationClass('erc20Token')">
                <label for="erc20Token">Accepted Token For Payment</label>
                <md-input name="erc20Token" id="erc20Token" v-model="form.erc20Token" />
                <span
                  class="md-error"
                  v-if="!$v.form.erc20Token.required"
                >The token that is accepted for payment is required</span>
                <!-- <span
                  class="md-error"
                  v-else-if="!$v.form.erc20Token.maxLength"
                >Invalid event token hash</span>-->
              </md-field>
            </div>
          </div>

          <div class="md-layout-item md-small-size-100">
            <md-field :class="getValidationClass('idApprover')">
              <label for="idApprover">ID Approver</label>
              <md-input name="idApprover" id="idApprover" v-model="form.idApprover" />
              <span class="md-error">An ID approver is required</span>
            </md-field>
          </div>

          <!-- TODO 24.7.2020 Michael: fetch approver levels and add as dropdown options to choose from -->
          <div class="md-layout-item md-small-size-100">
            <md-field :class="getValidationClass('idLevel')">
              <label for="idLevel">Identification level</label>
              <md-select type="number" id="idLevel" name="idLevel" v-model="form.idLevel">
                <md-option value="1">1</md-option>
                <md-option value="2">2</md-option>
                <md-option value="3">3</md-option>
              </md-select>
              <span class="md-error" v-if="!$v.form.idLevel.required">The id level is required</span>
            </md-field>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('eventGranularity')">
                <label for="event-granularity">Granularity</label>
                <md-select
                  type="number"
                  id="event-granularity"
                  name="event-granularity"
                  v-model="form.granularity"
                >
                  <!-- <md-option></md-option> -->
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
                <span
                  class="md-error"
                  v-if="!$v.form.granularity.required"
                >The granularity is required</span>
                <span class="md-error" v-else-if="!$v.form.granularity">Invalid granularity</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('type')">
                <label for="event-type">Event Type</label>
                <md-select name="event-type" id="event-type" v-model="form.type">
                  <md-option value="Music">Music</md-option>
                  <md-option value="Sports">Sports</md-option>
                  <md-option value="Theatre">Theatre</md-option>
                </md-select>
                <span class="md-error">The event type is required</span>
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

          <!-- <md-field :class="getValidationClass('email')">
            <label for="email">Email</label>
            <md-input
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              v-model="form.email"
            />
            <span class="md-error" v-if="!$v.form.email.required">The email is required</span>
            <span class="md-error" v-else-if="!$v.form.email.email">Invalid email</span>
          </md-field>-->
        </md-card-content>

        <md-progress-bar md-mode="indeterminate" v-if="sending" />

        <md-card-actions>
          <md-button type="submit" class="md-primary" @click="createEvent">Create Event</md-button>
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
        The event {{ lastEvent }} was uploaded to IPFS with
        success!
      </md-snackbar>
      <md-snackbar :md-active.sync="eventContractDeployed">
        The event {{ lastEvent }} was successfully deployed! Contract
        address:
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
// import format from "date-fns/format";

// project internal imports
import { NETWORKS } from "../constants/constants.js";
import { cidToArgs, argsToCid } from "idetix-utils";
import {
  EVENT_FACTORY_ABI,
  EVENT_FACTORY_ADDRESS
} from "../constants/EventFactory.js";
import { DAI } from "../constants/ERC20Tokens.js";

export default {
  name: "NewEventForm",
  mixins: [validationMixin],
  data: () => ({
    ipfsArgs: null,
    ipfsCid: null,
    ipfsHash: "QmYWGJaqiYUPu5JnuUhVVbyXB6g6ydxcie3iwrbC7vxnNP",
    ipfsData: null,
    ipfsString: null,
    ipfsError: false,
    ipfsAdded: false,
    lastEventInfo: null,
    ethToken: "0",
    form: {
      eventTitle: "testTitle",
      // rawDate: Date(2020, 10, 1),
      location: "Zurich",
      eventStartTime: null,
      eventEndTime: null,
      type: "Music",
      //   eventTags: [],
      eventDescription: "test description",
      erc20Token: "0x0000000000000000000000000000000000000000",
      idApprover: "0x3b7DA1a855C343806117182C058addcB096B0a69",
      idLevel: 1,
      granularity: 2,
      color: "#add8e6",
      email: null
    },
    eventContractDeployed: false, // todo: set after web3js event catches deployment event
    sending: false,
    lastEvent: null
  }),
  validations: {
    form: {
      eventTitle: {
        // required,
        minLength: minLength(3)
      },
      type: {
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
      // email: {
      //   // required,
      //   email
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
    ipfs() {
      return this.$store.state.ipfs;
    }
    // date() {
    //   return format(this.form.rawDate, this.$material.locale.dateFormat);
    // }
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
      this.form.eventTitle = null;
      this.form.type = null;
      //   this.form.eventTags = null;
      this.form.levelNumber = null;
      this.form.idApprover = null;
      (this.form.location = null),
        (this.form.granularity = null),
        (this.form.color = null),
        (this.form.email = null);
    },
    async createEvent() {
      await this.uploadToIpfs();
      await this.deployEventContract();
    },
    async uploadToIpfs() {
      this.ipfsString = this.createIpfsString();
      //TODO check if deamon (ipfs companion extension) is running locally. If so use localhost gateway, otherwise use remote http
      try {
        const response = await this.ipfs.add(this.ipfsString);
        this.ipfsHash = response.path;
        console.log("Uploading to ipfs");
        console.log("http://ipfs.io/ipfs/" + this.ipfsHash);
        this.sending = true;
      } catch (err) {
        console.log(err);
        this.ipfsError = true;
      }
      window.setTimeout(() => {
        this.lastEvent = `${this.form.eventTitle} ${this.form.description}`;
        this.ipfsAdded = true;
        this.sending = false;
        // this.clearForm();
      }, 1500);
    },
    async downloadFromIpfs() {
      console.log("downloading from ipfs...");
      for await (const chunk of this.ipfs.cat(this.ipfsHash)) {
        this.ipfsData = Buffer(chunk, "utf8").toString();
      }
    },
    createIpfsString() {
      return JSON.stringify({
        version: "1.0",
        event: {
          title: this.form.eventTitle,
          location: this.form.location,
          type: this.form.type,
          color: this.form.color,
          description: this.form.eventDescription
        }
      });
    },
    eventFormComplete() {
      // check if required input fields are valid and then upload the event form to ipfs
      this.$v.$touch();
      return !this.$v.$invalid;
    },
    // async getIpfsNodeInfo() {
    //   try {
    //     // Await for ipfs node instance.
    //     const ipfs = await this.$ipfs;
    //     // Call ipfs `id` method.
    //     // Returns the identity of the Peer.
    //     const { agentVersion, id } = await ipfs.id();
    //     this.agentVersion = agentVersion;
    //     this.id = id;
    //     // Set successful status text.
    //     this.status = "Connected to IPFS =)";
    //   } catch (err) {
    //     // Set error status text.
    //     this.status = `Error: ${err}`;
    //   }
    // },
    async upload() {
      try {
        const ipfs = await this.$ipfs;
        const add = await ipfs.add("hallo simon.");
        console.log(add);
      } catch (err) {
        console.log(err);
      }
    },
    async deployEventContract() {
      const args = cidToArgs(this.ipfsHash);
      const createEvent = await this.eventFactory.methods
        .createEvent(
          args.hashFunction,
          args.size,
          args.digest,
          this.web3.account,
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
.date-location-container {
  justify-content: center;
  display: flex;
}
</style>
