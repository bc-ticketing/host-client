<template>
  <div class="create-ticket-type-container">
    <form novalidate class="md-layout" @submit.prevent="isTicketFormComplete">
      <md-card class="md-layout-item">
        <md-card-header>
          <div class="md-title">New Ticket Type</div>
        </md-card-header>

        <md-card-content>
          <!-- <div class="contract-address">
            <md-field>
              <md-input placeholder="Event Contract Address" v-model="contractAddressTemp" />
            </md-field>
            <md-button class="md-primary" @click="setContractAddress">Set Contract Address</md-button>
            <md-button class="md-primary" @click="setDefaultContractAddress">Set default</md-button>
          </div>-->
          <md-button class="md-primary" @click="getMyLatestEvent">Fetch my latest event</md-button>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-name">Ticket Name</label>
                <md-input name="ticket-name" id="ticket-name" v-model="form.ticketName" />
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item">
              <!-- <md-field> -->
              <!-- <label for="ticket-non-fungible">Is the ticket non-fungible?</label> -->
              <md-radio v-model="form.ticketIsNonFungible" value="true">Non-Fungible</md-radio>
              <md-radio v-model="form.ticketIsNonFungible" value="false">Fungible</md-radio>
              <!-- <md-input
                  name="ticket-non-fungible"
                  id="ticket-non-fungible"
                  v-model="form.ticketNonFungible"
              />-->
              <!-- </md-field> -->
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
          <md-button type="submit" class="md-primary" @click="uploadToIpfs">Upload to ipfs</md-button>
          <md-button type="submit" class="md-primary" @click="createTicketType">Create ticket type</md-button>
        </md-card-actions>
      </md-card>
    </form>
  </div>
</template>

<script>
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
import { EVENT_ABI } from "../constants/Event.js";

export default {
  name: "NewTicketForm",
  data: () => ({
    contractAddress: null,
    contractAddressTemp: null,
    latestEventAddress: null,
    ipfsHash: "QmYWGJaqiYUPu5JnuUhVVbyXB6g6ydxcie3iwrbC7vxnNP",
    ipfsArgs: null,
    ipfsData: null,
    ipfsString: null,
    form: {
      ticketName: "ticket name",
      ticketDescription: "ticket description",
      ticketIsNonFungible: false,
      ticketPrice: 10,
      ticketFinalizationBlock: 600,
      ticketInitialSupply: 20,
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
    async getMyLatestEvent() {
      const eventAddresses = await this.web3.eventFactory.methods
        .getEvents()
        .call();
      console.log(eventAddresses);
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
      this.form.ticketIsNonFungible = null;
      this.form.ticketFinalizationBlock = null;
      this.form.ticketInitialSupply = null;
    },
    createIpfsString() {
      // todo: fit to template
      return JSON.stringify({
        version: "1.0",
        ticket: {
          name: this.form.ticketName,
          description: this.form.ticketDescription,
          event: this.currentEventAddress
        }
      });
    },
    async uploadToIpfs() {
      this.ipfsString = this.createIpfsString();
      this.sending = true;
      const response = await this.ipfs.add(this.ipfsString);
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
      if (this.latestEventAddress === null) {
        this.getMyLatestEvent();
      }
      const event = new this.web3.web3Instance.eth.Contract(
        EVENT_ABI,
        this.latestEventAddress
      );
      if (this.ipfsArgs === null) {
        this.ipfsArgs = cidToArgs(this.ipfsHash);
      }
      var nf = true;
      if (this.form.ticketIsNonFungible != "true") {
        nf = false;
      }
      console.log("nf: " + nf);
      let eventPromise = event.methods
        .createType(
          this.ipfsArgs.hashFunction,
          this.ipfsArgs.size,
          this.ipfsArgs.digest,
          nf,
          this.form.ticketPrice,
          this.form.ticketFinalizationBlock,
          this.form.ticketInitialSupply
        )
        .send({ from: this.web3.account });

      console.log(eventPromise);
      // const nfNonce = await event.methods.nfNonce().call();
      // console.log(nfNonce);

      // this.temp.pastEvents = await event.methods
      //   .getPastEvents("EventMetadata", {
      //     fromBlock: 1
      //   })
      //   .call();
      // this.temp.latestEvent = this.pastEvents[
      //   this.pastEvents.length - 1
      // ].returnValues;

      // this.temp.loadedCid = argsToCid(
      //   this.latestEvent["hashFunction"],
      //   this.latestEvent["size"],
      //   this.latestEvent["digest"]
      // );
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
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
    ipfs() {
      return this.$store.state.ipfs;
    }
  }
};
</script>

<style>
.contract-address {
  display: flex;
}
</style>
