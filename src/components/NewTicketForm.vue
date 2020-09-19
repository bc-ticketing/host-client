<template>
  <div class="create-ticket-type-container">
    <md-card class="md-layout-item contract-address-card">
      <md-card-header>
        <div class="md-title">Event</div>
      </md-card-header>
      <md-card-content>
        <div class="event-info">
          <div class="event-title">
            <p>{{ eventTitle }}</p>
          </div>
          <div class="event-address">
            <p>{{ eventAddress }}</p>
          </div>
        </div>
      </md-card-content>
    </md-card>

    <form novalidate class="md-layout" @submit.prevent="isTicketFormComplete">
      <md-card class="md-layout-item new-ticket-form">
        <md-card-header>
          <div class="md-title">New Ticket Type</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-name">Ticket Name</label>
                <md-input name="ticket-name" id="ticket-name" v-model="form.ticketName" />
              </md-field>
            </div>
          </div>

          <SeatingPlan v-bind:types="types" v-bind:key="types"></SeatingPlan>

          <!-- <div class="md-layout md-gutter">
            <div class="md-layout-item">
              <md-radio v-model="form.ticketIsNonFungible" value="true">Non-Fungible</md-radio>
              <md-radio v-model="form.ticketIsNonFungible" value="false">Fungible</md-radio>
            </div>
          </div>-->

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-price">Ticket Price</label>
                <md-input name="ticket-price" id="ticket-price" v-model="form.ticketPrice" />
              </md-field>
            </div>
          </div>

          <!-- <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-initial-supply">Initial Supply</label>
                <md-input
                  name="ticket-initial-supply"
                  id="ticket-initial-supply"
                  v-model="form.ticketInitialSupply"
                />
              </md-field>
            </div>
          </div>-->

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-finalization-block">Finalization Block</label>
                <md-input
                  name="ticket-finalization-block"
                  id="ticket-finalization-block"
                  v-model="form.ticketFinalizationBlock"
                />
              </md-field>
            </div>
          </div>

          <md-dialog :md-active.sync="showFinalizationBlockDialog">
            <md-dialog-title>Start Time</md-dialog-title>
            <p
              class="dialog-text"
            >After the here specified block number has been reached, tickets of this type can no longer be bought or resold.</p>
            <md-button class="md-primary" @click="showFinalizationBlockDialog = false">Close</md-button>
          </md-dialog>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-description">Ticket Description</label>
                <md-textarea
                  id="ticket-description"
                  name="ticket-description"
                  v-model="form.ticketDescription"
                ></md-textarea>
              </md-field>
            </div>
          </div>
          <!-- todo: seating plan -->
        </md-card-content>

        <md-card-actions>
          <!-- <md-button type="submit" class="md-primary" @click="uploadToIpfs">Upload to ipfs</md-button> -->
          <md-button type="submit" class="md-primary" @click="createTicketType">Create ticket type</md-button>
        </md-card-actions>
      </md-card>
    </form>
  </div>
</template>

<script>
import SeatingPlan from "../components/SeatingPlan";
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength
} from "vuelidate/lib/validators";

// project internal imports
import { NETWORKS } from "../constants/constants.js";
import { cidToArgs, argsToCid } from "idetix-utils";
import {
  EVENT_FACTORY_ABI,
  EVENT_FACTORY_ADDRESS
} from "../constants/EventFactory.js";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "../constants/EventMintableAftermarket";

export default {
  name: "NewTicketForm",
  components: {
    SeatingPlan
  },
  data: () => ({
    types: [],
    showFinalizationBlockDialog: false,
    eventAddress: null,
    eventTitle: null,
    contractAddressTemp: null,
    latestEventAddress: null,
    ipfsHash: "QmYWGJaqiYUPu5JnuUhVVbyXB6g6ydxcie3iwrbC7vxnNP",
    ipfsArgs: null,
    ipfsData: null,
    ipfsString: null,
    form: {
      ticketName: "Standing Area",
      ticketDescription: "ticket description",
      // ticketIsNonFungible: "false",
      ticketPrice: "2",
      ticketFinalizationBlock: 600,
      // ticketInitialSupply: 400,
      currentEvent: null
    },
    ipfsAdded: false,
    ticketTypeCreated: false,
    sending: false,
    lastTicket: null,
    temp: {
      pastEvents: null,
      latestEvent: null,
      loadedCid: null
    }
  }),
  methods: {
    addTicketTypes() {
      this.$on("saveTicketType", types => {
        this.saveTicketTypes(types);
      });
    },
    async getMyEvents() {
      const eventAddresses = await this.$store.state.eventFactory.methods
        .getEvents()
        .call();
      console.log(eventAddresses);
      return eventAddresses;
    },
    async getMyLatestEvent() {
      const eventAddresses = await this.getMyEvents();
      this.latestEventAddress = eventAddresses[eventAddresses.length - 1];
      this.currentEventAddress = this.latestEventAddress;
      console.log("set latest event to: " + this.latestEventAddress);
    },
    setContractAddress() {
      this.contractAddress = this.contractAddressTemp;
    },
    clearForm() {
      // this.$v.$reset();
      this.form.ticketName = null;
      this.form.ticketDescription = null;
      // this.form.ticketIsNonFungible = null;
      this.form.ticketFinalizationBlock = null;
      // this.form.ticketInitialSupply = null;
    },
    createIpfsString() {
      return JSON.stringify({
        version: "1.0",
        ticket: {
          name: this.form.ticketName,
          description: this.form.ticketDescription,
          event: this.address
        }
      });
    },
    async uploadToIpfs() {
      this.ipfsString = this.createIpfsString();
      this.sending = true;
      const response = await this.ipfsInstance.add(this.ipfsString);
      this.ipfsHash = response.path;
      console.log("http://ipfs.io/ipfs/" + this.ipfsHash);

      // Instead of this timeout, here you can call your API
      window.setTimeout(() => {
        this.ipfsArgs = cidToArgs(this.ipfsHash);
        this.lastTicket = `${this.form.ticketName} ${this.ipfsHash}`;
        this.ipfsAdded = true;
        this.sending;
      }, 1500);
    },
    async downloadFromIpfs() {
      console.log("downloading from ipfs...");
      for await (const chunk of this.ipfs.cat(this.ipfsHash)) {
        this.ipfsData = Buffer(chunk, "utf8").toString();
      }
    },
    isTicketFormComplete() {
      return true;
    },
    async createTicketType() {
      await this.uploadToIpfs();
      const event = new this.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_ABI,
        this.address
      );
      if (this.ipfsArgs === null) {
        this.ipfsArgs = cidToArgs(this.ipfsHash);
      }
      var nf = true;
      // if (this.form.ticketIsNonFungible) {
      //   nf = false;
      // }
      console.log("nf: " + nf);
      let createResponse = await event.methods
        .createType(
          this.ipfsArgs.hashFunction,
          this.ipfsArgs.size,
          this.ipfsArgs.digest,
          nf,
          this.web3.web3Instance.utils.toWei(this.form.ticketPrice),
          this.form.ticketFinalizationBlock
          // this.form.ticketInitialSupply
        )
        .send({ from: this.web3.account });

      console.log(createResponse);
    }
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    ipfsInstance() {
      return this.$store.state.ipfsInstance;
    }
  },
  created() {
    this.eventAddress = this.$route.params.eventAddress;
    this.eventTitle = this.$route.params.eventTitle;
  }
};
</script>

<style>
.contract-address {
  display: flex;
}
.contract-address-card {
  margin-bottom: 10px;
}
.event-info {
  display: flex;
}
.event-title {
  margin-right: 15px;
}
</style>
