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
                <span class="md-error" v-if="!$v.form.eventTitle.required"
                  >The event title is required</span
                >
                <span class="md-error" v-else-if="!$v.form.eventTitle.minlength"
                  >Invalid event title</span
                >
              </md-field>
            </div>
          </div>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('eventType')">
                <label for="event-type">Event Type</label>
                <md-select
                  name="event-type"
                  id="event-type"
                  v-model="form.eventType"
                >
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
                <md-input
                  name="erc20Token"
                  id="erc20Token"
                  v-model="form.erc20Token"
                />
                <!-- <span class="md-error" v-if="!$v.form.erc20Token.required"
                  >The token that is accepted for payment is required</span
                >
                <span class="md-error" v-else-if="!$v.form.erc20Token.minlength"
                  >Invalid event token hash</span
                >
                <span class="md-error" v-else-if="!$v.form.erc20Token.maxLength"
                  >Invalid event token hash</span
                > -->
              </md-field>
            </div>
          </div>

          <div class="md-layout-item md-small-size-100">
            <md-field :class="getValidationClass('idApprover')">
              <label for="idApprover">ID Approver</label>
              <md-select
                name="idApprover"
                id="idApprover"
                v-model="form.idApprover"
                md-dense
              >
                <md-option value="Idetix">Idetix</md-option>
              </md-select>
              <span class="md-error">An ID approver is required</span>
            </md-field>
          </div>

          <!-- TODO 24.7.2020 Michael: fetch approver levels and add as dropdown options to choose from -->
          <div class="md-layout-item md-small-size-100">
            <md-field :class="getValidationClass('idLevel')">
              <label for="idLevel">Identification level</label>
              <md-select
                type="number"
                id="idLevel"
                name="idLevel"
                v-model="form.idLevel"
              >
                <!-- <md-option></md-option> -->
                <md-option value="1">1</md-option>
                <md-option value="2">2</md-option>
                <md-option value="3">3</md-option>
              </md-select>
              <span class="md-error" v-if="!$v.form.idLevel.required"
                >The id level is required</span
              >
              <span class="md-error" v-else-if="!$v.form.idLevel.maxlength"
                >Invalid id level</span
              >
            </md-field>
          </div>

          <md-field :class="getValidationClass('email')">
            <label for="email">Email</label>
            <md-input
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              v-model="form.email"
            />
            <span class="md-error" v-if="!$v.form.email.required"
              >The email is required</span
            >
            <span class="md-error" v-else-if="!$v.form.email.email"
              >Invalid email</span
            >
          </md-field>
        </md-card-content>

        <md-progress-bar md-mode="indeterminate" v-if="sending" />

        <md-card-actions>
          <md-button type="submit" class="md-primary" @click="uploadEventToIpfs"
            >Uploaod to ipfs</md-button
          >
        </md-card-actions>
        <md-card-actions>
          <md-button type="submit" class="md-primary" :disabled="sending"
            >Deploy event contract</md-button
          >
        </md-card-actions>
        <p>eventTitle: {{ this.form.eventTitle }}</p>
        <p>eventType: {{ this.form.eventType }}</p>
        <!-- <p>eventTags: {{ this.form.eventTags }}</p> -->
        <p>description: {{ this.form.description }}</p>
        <p>idApprover: {{ this.form.idApprover }}</p>
        <p>idLevel: {{ this.form.idLevel }}</p>
      </md-card>

      <md-snackbar :md-active.sync="ipfsAdded"
        >The event {{ lastEvent }} was uploaded to IPFS with
        success!</md-snackbar
      >
      <md-snackbar :md-active.sync="eventContractDeployed"
        >The event {{ lastEvent }} was successfully deployed! Contract
        address:</md-snackbar
      >
    </form>
  </div>
</template>

<script>
// import { nonFungibleBaseId } from "idetix-utils";
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";
import { NETWORKS } from "./../util/constants/constants.js";
import { getWeb3 } from "../util/getWeb3";
import { cidToArgs, argsToCid } from "idetix-utils";

import Web3 from "web3";
const web3 = new Web3("ws://localhost:7545");

export default {
  name: "CreateEventForm",
  mixins: [validationMixin],
  data: () => ({
    simonArgs: null,
    simonCid: null,
    ipfsHash: null,
    ipfsString: null,
    ethToken: "0x0",
    daiTokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    form: {
      eventTitle: null,
      eventLocation: null,
      eventStartTime: null,
      eventEndTime: null,
      eventType: null,
      //   eventTags: [],
      eventDescription: null,
      erc20Token: null,
      idApprover: "Idetix",
      idLevel: null,
      email: null,
    },
    ipfsAdded: false, // todo: set true, when ipfs hash is returned
    eventContractDeployed: false, // todo: set after web3js event catches deployment event
    sending: false,
    lastEvent: null,
  }),
  validations: {
    form: {
      eventTitle: {
        required,
        minLength: minLength(3),
      },
      eventType: {
        required,
      },
      eventDescription: {
        required,
        minLength: minLength(10),
      },
      erc20Token: {
        required,
        minLength: minLength(42),
        maxLength: maxLength(42),
      },
      idLevel: {
        required,
        maxLength: maxLength(1),
      },
      idApprover: {
        required,
      },
      email: {
        required,
        email,
      },
    },
  },
  methods: {
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];
      if (field) {
        return {
          "md-invalid": false, //field.$invalid && field.$dirty,
        };
      }
    },
    clearForm() {
      this.$v.$reset();
      this.form.eventTitle = null;
      this.form.eventType = null;
      //   this.form.eventTags = null;
      this.form.levelNumber = null;
      this.form.idApprover = null;
      this.form.email = null;
    },
    createIpfsString() {
      return JSON.stringify({
        title: this.form.eventTitle,
        description: this.form.eventDescription,
      });
    },
    async uploadEventToIpfs() {
      // if (!this.eventFormComplete()) {
      //   return;
      // }
      this.ipfsString = this.createIpfsString();
      // todo upload to ipfs correctly
      this.sending = true;
      try {
        const ipfs = await this.$ipfs;
        this.ipfsHash = await ipfs.add(this.ipfsString);
        console.log("ipfshash: " + this.ipfsHash);
        console.log("ipfscidstring: " + this.ipfsHash.cid.string);
        this.simonArgs = cidToArgs(this.ipfsHash.cid.string);
        this.simonCid = argsToCid(
          this.simonArgs.hashFunction,
          this.simonArgs.size,
          this.simonArgs.digest
        );
      } catch (err) {
        console.log(err);
      }
      // Instead of this timeout, here you can call your API
      window.setTimeout(() => {
        this.lastEvent = `${this.form.eventTitle} ${this.form.eventType}`;
        this.ipfsAdded = true;
        this.sending = false;
        // this.clearForm();
      }, 1500);
    },
    eventFormComplete() {
      // check if required input fields are valid and then upload the event form to ipfs
      this.$v.$touch();
      return !this.$v.$invalid;
    },
    async upload() {
      try {
        const ipfs = await this.$ipfs;
        const add = await ipfs.add("hallo simon.");
        console.log(add);
      } catch (err) {
        console.log(err);
      }
    },
    // parseIPFSData() {
    //   var items = "#event-title, #description";
    //   var obj = {};
    //   items.each(function() {
    //     obj[this.id] = this.val();
    //   });
    //   var ipfsString = JSON.stringify(obj, null, ``);
    //   console.log(ipfsString);
    //   return ipfsString;
    // },
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
  },
  computed: {},
  //   computed: {
  //     web3() {
  //       return this.$store.state.web3;
  //     },
  //     networkName() {
  //       return NETWORKS[this.web3.networkId];
  //     },
  //     isConnected() {
  //       return this.web3.networkId != null;
  //     },
  //   },
};
</script>

<style></style>
