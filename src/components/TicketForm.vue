<template>
  <div class="create-ticket-type-container">
    <div class="not-found-container" v-show="notFoundMessageVisible">
      <h3>No event found for address: {{ this.$route.query.address }}.</h3>
      <md-button class="go-back-button md-primary" @click="routeToEventList()"
        >Go Back</md-button
      >
    </div>
    <md-card class="md-layout-item contract-address-card" v-if="eventSet">
      <md-card-header>
        <div class="md-title">Event</div>
      </md-card-header>
      <md-card-content>
        <div class="event-info">
          <div class="event-title">
            <div class="event-info-type">
              <h3>Title:</h3>
            </div>
            <p>{{ eventTitle }}</p>
          </div>
          <div class="event-address">
            <div class="event-info-type">
              <h3>Address:</h3>
            </div>
            <p>{{ this.$route.query.address }}</p>
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
                <label for="title">Ticket Title</label>
                <md-input name="title" id="title" v-model="form.title" />
                <span class="md-error">A Title is required.</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item">
              <md-radio class="md-primary" v-model="form.isNF" :value="true"
                >Non-Fungible</md-radio
              >
              <md-radio class="md-primary" v-model="form.isNF" :value="false"
                >Fungible</md-radio
              >
              <md-field>
                <label for="supply"
                  >Amount of Tickets within this Ticket category</label
                >
                <md-input
                  type="number"
                  min="0"
                  max="100000"
                  name="supply"
                  id="supply"
                  v-model="form.supply"
                  :disabled="form.isNF"
                />
                <span class="md-error">The supply is required.</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="price">Ticket Price</label>
                <md-input name="price" id="price" v-model="form.price" />
                <span class="md-error">The price is required.</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100 info-dialog">
              <md-field :class="getValidationClass('finalizationBlock')">
                <label for="finalization-block">Finalization Block</label>
                <md-input
                  name="finalization-block"
                  id="finalization-block"
                  v-model="form.finalizationBlock"
                />
                <span class="md-error"
                  >The finalization block is required.</span
                >
              </md-field>
              <div class="md-small-size-100 info-dialog-button">
                <md-button
                  class="md-icon-button md-primary"
                  @click="showFinalizationBlockDialog = true"
                  style="margin-right: 16px"
                >
                  <md-icon>help_outline</md-icon>
                </md-button>
              </div>
            </div>
          </div>

          <md-dialog :md-active.sync="showFinalizationBlockDialog">
            <md-dialog-title>Start Time</md-dialog-title>
            <p class="dialog-text">
              After the here specified block number has been reached, tickets of
              this type can no longer be bought or resold.
            </p>
            <md-button
              class="md-primary"
              @click="showFinalizationBlockDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field>
                <label for="ticket-description">Ticket Description</label>
                <md-textarea
                  id="ticket-description"
                  name="ticket-description"
                  v-model="form.description"
                ></md-textarea>
              </md-field>
            </div>
          </div>

          <SeatingPlan
            v-bind:address="this.$route.query.address"
            v-on:savetickettype="saveTicketType"
          ></SeatingPlan>
        </md-card-content>

        <md-card-actions>
          <!-- <md-button type="submit" class="md-primary" @click="uploadToIpfs">Upload to ipfs</md-button> -->
          <md-button type="submit" class="md-primary" @click="createTypes"
            >Create ticket types</md-button
          >
        </md-card-actions>
      </md-card>
    </form>
  </div>
</template>

<script>
// external imports
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength
} from "vuelidate/lib/validators";
import { cidToArgs, argsToCid } from "idetix-utils";

// internal imports
import { NETWORKS } from "../util/constants/constants.js";
import {
  EVENT_FACTORY_ABI,
  EVENT_FACTORY_ADDRESS
} from "../util/constants/EventFactory.js";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/constants/EventMintableAftermarketPresale";
import SeatingPlan from "../components/SeatingPlan";
import getEvent from "../util/utility";

export default {
  name: "TicketForm",
  components: {
    SeatingPlan
  },
  data: () => ({
    eventSet: false,
    notFoundMessageVisible: false,
    occupiedSeats: [], // list of seats already used in a type on the blockchain
    savedTypes: [],
    address: null,
    eventTitle: null,
    // contractAddressTemp: null,
    // latestEventAddress: null,
    ipfsHash: "QmYWGJaqiYUPu5JnuUhVVbyXB6g6ydxcie3iwrbC7vxnNP",
    ipfsArgs: null,
    ipfsData: null,
    ipfsString: null,
    form: {
      title: "Standing Area",
      description: "ticket description",
      isNF: false,
      price: "2",
      finalizationBlock: 600,
      supply: 400
    },
    ipfsAdded: false,
    ticketTypeCreated: false,
    sending: false,
    // lastTicket: null,
    // temp: {
    //   pastEvents: null,
    //   latestEvent: null,
    //   loadedCid: null
    // },
    showFinalizationBlockDialog: false
  }),
  methods: {
    async createTypes() {
      let ipfsHashes = await this.uploadToIpfs(this.prepareIpfsStrings());
      console.log("ipfsHashes " + ipfsHashes);
      let response = await this.invokeContract(
        this.prepareContractInvocationParameters(ipfsHashes)
      );
      console.log(response);
    },
    // Creates json strings for each type and returns them in an ordered array.
    prepareIpfsStrings() {
      let listOfIpfsStrings = [];
      var i, j;
      for (i = 0; i < this.savedTypes.length; i++) {
        let type = this.savedTypes[i];
        let map = [];
        for (j = 0; j < type.seats.length; j++) {
          map.push(type.seats[j]);
        }
        listOfIpfsStrings.push(
          JSON.stringify({
            version: "1.0",
            ticket: {
              title: type.title,
              description: type.description,
              event: this.address,
              mapping: map
            }
          })
        );
      }
      return listOfIpfsStrings;
    },
    async uploadToIpfs(listOfIpfsStrings) {
      var i;
      var ipfsHashes = [];
      for (i = 0; i < listOfIpfsStrings.length; i++) {
        try {
          let response = await this.ipfsInstance.add(listOfIpfsStrings[i]);
          console.log("Uploading to ipfs");
          console.log("http://ipfs.io/ipfs/" + response.path);
          ipfsHashes.push(response.path);
          this.sending = true;
        } catch (err) {
          console.log(err);
        }
        window.setTimeout(() => {
          this.sending = false;
        }, 1500);
      }
      return ipfsHashes;
    },
    prepareContractInvocationParameters(ipfsHashes) {
      let hashFunctions = [];
      let sizes = [];
      let digests = [];
      let isNFs = [];
      let prices = [];
      let finalizationBlocks = [];
      let supplies = [];
      var i;
      for (i = 0; i < this.savedTypes.length; i++) {
        let type = this.savedTypes[i];
        let args = cidToArgs(ipfsHashes[i]);
        hashFunctions.push(args.hashFunction);
        sizes.push(args.size);
        digests.push(args.digest);
        isNFs.push(type.isNF);
        prices.push(type.price);
        finalizationBlocks.push(type.finalizationBlock);
        supplies.push(type.supply);

        // listOfParameters[i][0] = args.hashFunction;
        // listOfParameters[i][1] = args.size;
        // listOfParameters[i][2] = args.digest;
        // listOfParameters[i][3] = type.isNF;
        // listOfParameters[i][4] = type.price;
        // listOfParameters[i][5] = type.finalizationBlock;
        // listOfParameters[i][6] = type.supply;
      }
      let parameterArrays = [];
      parameterArrays.push(hashFunctions);
      parameterArrays.push(sizes);
      parameterArrays.push(digests);
      parameterArrays.push(isNFs);
      parameterArrays.push(prices);
      parameterArrays.push(finalizationBlocks);
      parameterArrays.push(supplies);
      console.log(parameterArrays);
      return parameterArrays;
    },
    async invokeContract(listOfParameters) {
      let response = await this.contract.methods
        .createTypes(
          listOfParameters[0],
          listOfParameters[1],
          listOfParameters[2],
          listOfParameters[3],
          listOfParameters[4],
          listOfParameters[5],
          listOfParameters[6]
        )
        .send({ from: this.$store.state.web3.account });
      console.log("invoked function createTypes");
      return response;
    },
    // await this.uploadToIpfs();
    // if (this.ipfsArgs === null) {
    //   this.ipfsArgs = cidToArgs(this.ipfsHash);
    // }
    // var nf = true;
    // // if (this.form.ticketIsNonFungible) {
    // //   nf = false;
    // // }
    // console.log("nf: " + nf);
    // let createResponse = await this.contract.methods
    //   .createType(
    //     this.ipfsArgs.hashFunction,
    //     this.ipfsArgs.size,
    //     this.ipfsArgs.digest,
    //     nf,
    //     this.web3.web3Instance.utils.toWei(this.form.price),
    //     this.form.finalizationBlock
    //     // this.form.ticketInitialSupply
    //   )
    //   .send({ from: this.web3.account });

    // console.log(createResponse);
    // },

    saveTicketType(selectedSeats) {
      console.log("save ticket executed in TicketForm");
      let amount = selectedSeats.length;
      if (amount == 0) {
        return;
      } else {
        if (!this.form.isNF) {
          amount = this.form.supply;
        }
        this.savedTypes.push({
          title: this.form.title,
          isNF: this.form.isNF,
          supply: amount,
          price: this.form.price,
          finalizationBlock: this.form.finalizationBlock,
          description: this.form.description,
          seats: selectedSeats
        });
        console.log(selectedSeats);
      }
    },
    async fetchOccupiedSeats() {
      let existingCids = await this.fetchIpfsHashesOfExistingTypes();
      console.log(existingCids);
      var i;
      let map = [];
      for (i = 0; i < existingCids.length; i++) {
        let ipfsData = await this.downloadFromIpfs(existingCids[i]);
        let typeJson = JSON.parse(ipfsData);
        let mapping = typeJson.ticket.mapping;
        var j;
        for (j = 0; j < mapping.length; j++) {
          map.push(mapping[j]);
        }
      }
      console.log(map);
      this.occupiedSeats = map;
    },
    async fetchIpfsHashesOfExistingTypes() {
      let pastEvents = await this.contract.getPastEvents("TicketMetadata", {
        fromBlock: 1
      });
      console.log(pastEvents);
      let cids = [];
      var i;
      for (i = 0; i < pastEvents.length; i++) {
        let args = pastEvents[i].returnValues;
        cids.push(argsToCid(args.hashFunction, args.size, args.digest));
      }
      return cids;
    },
    clearForm() {
      // this.$v.$reset();
      this.form.title = null;
      this.form.description = null;
      // this.form.ticketIsNonFungible = null;
      this.form.finalizationBlock = null;
      // this.form.ticketInitialSupply = null;
    },
    createIpfsString(type) {
      return JSON.stringify({
        version: "1.0",
        ticket: {
          title: type.title,
          description: type.description,
          event: this.address,
          mapping: type.seats
        }
      });
    },
    async downloadFromIpfs(cid) {
      console.log("downloading from ipfs...");
      for await (const chunk of this.ipfsInstance.cat(cid)) {
        return Buffer(chunk, "utf8").toString();
      }
    },
    isTicketFormComplete() {
      return true;
    },
    getValidationClass(fieldName) {
      var field = this.form.fieldName;
      if (field) {
        return {
          "md-invalid": false //field.$invalid && field.$dirty,
        };
      }
    },
    routeToEventList() {
      this.$router.push({
        name: `Events`
      });
    },
    setEvent() {
      this.event = getEvent(this.$route.query.address);
      if (this.event != null) {
        this.eventSet = true;
        console.log("eventset when eventsFullyLoaded " + this.eventSet);
        this.notFoundMessageVisible = false;
        this.contract = new this.web3.web3Instance.eth.Contract(
          EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
          this.$route.query.address
        );
        this.fetchOccupiedSeats();
      }
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
  async created() {
    setTimeout(() => {
      console.log("eventset when settimeout" + this.eventSet);
      if (!this.eventSet) {
        this.notFoundMessageVisible = true;
      }
    }, 5000);
    console.log("ticket form created executed");
    this.$root.$on("eventsFullyLoaded", () => {
      this.setEvent();
    });
    if (getEvent(this.$route.query.address) != null) {
      this.setEvent();
    }
  },
  validations: {
    form: {
      title: {
        // required,
        minLength: minLength(3)
      },
      finalizationBlock: {
        required
      }
    }
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
.event-title {
  display: flex;
}
.event-address {
  display: flex;
}
.event-info-type {
  width: 70px;
  margin-right: 20px;
}
</style>
