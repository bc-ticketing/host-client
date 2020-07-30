<template>
  <div class="create-ticket-type-container">
    <form novalidate class="md-layout" @submit.prevent="isTicketFormComplete">
      <md-card class="md-layout-item">
        <md-card-header>
          <div class="md-title">New Ticket Type</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-name"></label>
                <md-input name="ticket-name" id="ticket-name" v-model="form.ticketName" />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-non-fungible">Is the ticket non-fungible?</label>
                <md-input
                  name="ticket-non-fungible"
                  id="ticket-non-fungible"
                  v-model="form.ticketNonFungible"
                />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-price">Ticket Price</label>
                <md-input name="ticket-price" id="ticket-price" v-model="form.ticketPrice" />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
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
          </div>

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

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-description">Ticket Description</label>
                <md-input
                  name="ticket-description"
                  id="ticket-description"
                  v-model="form.ticketDescription"
                />
              </md-field>
            </div>
          </div>
        </md-card-content>
        <md-card-actions>
          <md-button type="submit" class="md-primary" @click="uploadTicketTypeToIpfs">Upload to ipfs</md-button>
          <md-button type="submit" class="md-primary" @click="createTicketType">Create ticket type</md-button>
        </md-card-actions>
      </md-card>
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

// project internal imports
import { NETWORKS } from "./../util/constants/constants.js";
import { cidToArgs, argsToCid } from "idetix-utils";
import {
  EVENT_FACTORY_ABI,
  EVENT_FACTORY_ADDRESS
} from "../constants/EventFactory.js";
import { EVENT_ABI } from "../constants/Event.js";

const ipfs = new IpfsHttpClient({
  host: "localhost",
  port: 5001,
  protocol: "http"
});

export default {
  name: "CreateTicketTypeForm",
  data: () => ({
    eventContractAddress: "0x7Ec4fc83fcAf4931A6a95e612F6E5ef1723990Fe",
    ipfsHash: "QmYWGJaqiYUPu5JnuUhVVbyXB6g6ydxcie3iwrbC7vxnNP",
    ipfsArgs: null,
    ipfsData: null,
    ipfsString: null,
    form: {
      ticketName: null,
      ticketDescription: null,
      ticketIsNonFungible: null,
      ticketPrice: null,
      ticketFinalizationBlock: null,
      ticketInitialSupply: null
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
    clearForm() {
      // this.$v.$reset();
      this.form.ticketName = null;
      this.form.ticketDescription = null;
      this.form.ticketIsNonFungible = null;
      this.form.ticketFinalizationBlock = null;
      this.form.ticketInitialSupply = null;
    },
    createIpfsString() {
      // todo: fit to template
      return JSON.stringify({
        ticketName: this.form.ticketName,
        ticketDescription: this.form.ticketDescription
      });
    },
    async uploadTicketTypeToIpfs() {
      this.ipfsString = this.createIpfsString();
      this.sending = true;
      try {
        const response = await ipfs.add(this.ipfsString);
        this.ipfsHash = response.path;
      } catch (err) {
        console.log(err);
      }
      // Instead of this timeout, here you can call your API
      window.setTimeout(() => {
        this.ipfsArgs = cidToArgs(this.ipfsHash.cid.string);
        this.lastTicket = `${this.form.ticketName} ${this.ipfsHash}`;
        this.ipfsAdded = true;
        this.sending;
      }, 1500);
    },
    async downloadFromIpfs() {
      console.log("downloading from ipfs...");
      for await (const chunk of ipfs.cat(this.ipfsHash)) {
        this.ipfsData = Buffer(chunk, "utf8").toString();
      }
    },
    isTicketFormComplete() {
      return true;
    },
    async createTicketType() {
      const web3 = await getWeb3();
      const event = new web3.eth.Contract(EVENT_ABI, this.eventContractAddress);
      if (this.ipfsArgs === null) {
        this.ipfsArgs = cidToArgs(this.ipfsHash);
      }
      // event.methods
      //   .createType(
      //     this.ipfsArgs.hashFunction,
      //     this.ipfsArgs.size,
      //     this.ipfsArgs.digest,
      //     this.form.ticketIsNonFungible,
      //     this.form.ticketPrice,
      //     this.form.ticketFinalizationBlock,
      //     this.form.ticketInitialSupply
      //   )
      //   .send({ from: "0x37FcEF83b9E4Ba797ec97E5F0f7D5ccdb1716103" });

      // const nfNonce = await event.methods.nfNonce().call();
      // console.log(nfNonce);

      this.temp.pastEvents = await event.methods
        .getPastEvents("EventMetadata", {
          fromBlock: 1
        })
        .call();
      this.temp.latestEvent = this.pastEvents[
        this.pastEvents.length - 1
      ].returnValues;

      this.temp.loadedCid = argsToCid(
        this.latestEvent["hashFunction"],
        this.latestEvent["size"],
        this.latestEvent["digest"]
      );
    }
    // function createType(
    //     bytes1 _hashFunction,
    //     bytes1 _size,
    //     bytes32 _digest,
    //     bool _isNF,
    //     uint256 _price,
    //     uint256 _finalizationBlock,
    //     uint256 _initialSupply
    // )
  }
};
</script>

<style></style>
