<template>
  <div class="create-ticket-type-container">
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
              <md-field v-if="!form.isNF">
                <label for="fungibleSupply"
                  >Amount of Tickets within this Ticket category</label
                >
                <md-input
                  type="number"
                  min="0"
                  max="100000"
                  name="fungibleSupply"
                  id="fungibleSupply"
                  v-model="form.fungibleSupply"
                  :disabled="form.isNF"
                  v-if="!form.isNF"
                />
                <span class="md-error">The supply is required.</span>
              </md-field>
              <md-field v-if="form.isNF">
                <label for="nonFungibleSupply"
                  >Amount of Tickets within this Ticket category</label
                >
                <md-input
                  type="number"
                  name="nonFungibleSupply"
                  id="nonFungibleSupply"
                  v-model="amountOfSelectedSeats"
                  disabled
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

          <div class="md-layout md-gutter date-container">
            <div class="md-layout-item">
              <md-datepicker
                md-immediately
                name="date"
                id="date"
                v-model="finalizationTime_Date"
              >
                <label for="date">Finalization Time</label>
              </md-datepicker>
            </div>
            <div class="md-small-size-100" style="margin: 20px 0">
              <vue-timepicker
                v-model="form.finalizationTime_Time"
                format="HH:mm"
              ></vue-timepicker>
            </div>
            <div class="md-small-size-100 info-dialog-button">
              <md-button
                class="md-icon-button md-primary"
                @click="showFinalizationTimeDialog = true"
                style="margin-right: 16px"
              >
                <md-icon>help_outline</md-icon>
              </md-button>
            </div>
          </div>

          <md-dialog :md-active.sync="showFinalizationTimeDialog">
            <md-dialog-title>Finalization Time</md-dialog-title>
            <p class="dialog-text">
              After the first block with a timestamp higher than the
              finalization is mined, the aftermarket is closed.
            </p>
            <md-button
              class="md-primary"
              @click="showFinalizationTimeDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout-item md-gutter presale-checkbox">
            <md-checkbox class="md-primary" v-model="withPresale"
              >Presale Lottery</md-checkbox
            >
          </div>

          <div class="md-layout md-gutter date-container" v-if="withPresale">
            <div class="md-layout-item">
              <md-datepicker
                md-immediately
                name="presale_date"
                id="presale_date"
                v-model="presale_date"
              >
                <label for="date">Presale Closing Time</label>
              </md-datepicker>
            </div>
            <div class="md-small-size-100" style="margin: 20px 0">
              <vue-timepicker
                v-model="form.presale_time"
                format="HH:mm"
              ></vue-timepicker>
            </div>
            <div class="md-small-size-100 info-dialog-button">
              <md-button
                class="md-icon-button md-primary"
                @click="showPresaleDialog = true"
                style="margin-right: 16px"
              >
                <md-icon>help_outline</md-icon>
              </md-button>
            </div>
          </div>

          <md-dialog :md-active.sync="showPresaleDialog">
            <md-dialog-title>Presale</md-dialog-title>
            <p class="dialog-text">
              When choosing this option, guests can register in a presale for a
              ticket. The ticket price is paid upfront, when registering for its
              presale. The presale is closed after the time specified here and
              at that time a lottery is executed. If there is more supply than
              demand, every guest that registered in the presale can retrieve a
              ticket. If there is more demand than supply, the lottery decides
              who can retrieve a ticket. The registered guests that did not win
              in the lottery can simply recollect the ticket price they paid for
              the presale.<br /><br />
              <b>Note:</b> The time specified here is not definite. The average
              blocktime of the Ethereum blockchain is used to calculate the most
              likely blocknumber at this time. The hash of that specific block
              is then used as the random number that decides the lottery.
            </p>
            <md-button class="md-primary" @click="showPresaleDialog = false"
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
            v-bind:isNF="this.form.isNF"
            v-on:savetickettype="saveTicketType"
            v-on:updateamountofselected="updateAmountOfSelected"
          ></SeatingPlan>
        </md-card-content>

        <md-card-actions>
          <md-button type="submit" class="md-primary" @click="createTypes"
            >Create tickets</md-button
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
import VueTimepicker from "vue2-timepicker";
import "vue2-timepicker/dist/VueTimepicker.css";
const BigNumber = require("bignumber.js");

// internal imports
import { NETWORKS } from "../util/constants/constants.js";
import {
  EVENT_FACTORY_ABI,
  EVENT_FACTORY_ADDRESS
} from "../util/abi/EventFactory.js";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/abi/EventMintableAftermarketPresale";
import { ERC20_ABI } from "../util/abi/ERC20";
import SeatingPlan from "../components/SeatingPlan";
import { AVERAGE_BLOCKTIME } from "../util/constants/constants";
import idb from "../util/db/idb";
import getDecimals from "../util/utility.js";
import { ERC20TESTTOKEN } from "../util/constants/ERC20Tokens.js";

export default {
  name: "TicketForm",
  components: {
    SeatingPlan,
    VueTimepicker
  },
  data: () => ({
    contract: null,
    currencyDecimals: null,
    withPresale: false,
    amountOfSelectedSeats: 0,
    finalizationTime_Date: null,
    showFinalizationTimeDialog: false,
    showPresaleDialog: false,
    occupiedSeats: [], // list of seats already used in a type on the blockchain
    savedTypes: [],
    savedPresaleTypes: [],
    form: {
      title: "Standing Area",
      description: "ticket description",
      isNF: false,
      price: "2",
      finalizationTime_Time: {
        HH: "10",
        mm: "00"
      },
      presale_time: {
        HH: "10",
        mm: "00"
      },
      fungibleSupply: 400
    },
    sending: false
  }),
  methods: {
    async createTypes() {
      if (this.savedTypes.length > 0) {
        console.log("create non presale types");
        this.createNonPresaleTypes();
      }
      if (this.savedPresaleTypes.length > 0) {
        console.log("create presale types");
        this.createPresaleTypes();
      }
    },
    async createPresaleTypes() {
      let ipfsHashes = await this.uploadToIpfs(this.createIpfsStrings(true));
      console.log("presale ipfs hashes: " + ipfsHashes);
      let response = await this.invokeCreatePresaleTypes(
        this.prepareInvocationParametersPresale(ipfsHashes)
      );
      console.log(response);
    },
    async createNonPresaleTypes() {
      let ipfsHashes = await this.uploadToIpfs(this.createIpfsStrings(false));
      console.log("non presale ipfs hashes: " + ipfsHashes);
      let response = await this.invokeCreateTypes(
        this.prepareInvocationParameters(ipfsHashes)
      );
      console.log(response);
    },

    // Creates json strings for each type and returns them in an ordered array.
    // Takes a boolean presale, whether the list of non presale or presale types
    // should be used.
    createIpfsStrings(presale) {
      let types = this.savedTypes;
      if (presale) {
        types = this.savedPresaleTypes;
      }
      let ipfsStrings = [];
      var i, j;
      for (i = 0; i < types.length; i++) {
        let type = types[i];
        let map = [];
        for (j = 0; j < type.seats.length; j++) {
          map.push(type.seats[j]);
        }
        ipfsStrings.push(
          JSON.stringify({
            version: "1.0",
            ticket: {
              title: type.title,
              description: type.description,
              color: type.color,
              // image: type.imageIpfsHash,
              event: this.$route.query.address,
              mapping: map
            }
          })
        );
      }
      return ipfsStrings;
    },

    async uploadToIpfs(metadataList) {
      var i;
      var ipfsHashes = [];
      for (i = 0; i < metadataList.length; i++) {
        try {
          let response = await this.ipfsInstance.add(metadataList[i]);
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

    // Takes the necessary parameter of the saved ticket types that
    // dont have a presale and rearanges them in correct form for
    // the invocation.
    prepareInvocationParameters(ipfsHashes) {
      let hashFunctions = [];
      let sizes = [];
      let digests = [];
      let isNFs = [];
      let prices = [];
      let finalizationTimes = [];
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
        finalizationTimes.push(type.finalizationTime);
        supplies.push(type.supply);
      }
      let parameterArrays = [];
      parameterArrays.push(hashFunctions);
      parameterArrays.push(sizes);
      parameterArrays.push(digests);
      parameterArrays.push(isNFs);
      parameterArrays.push(prices);
      parameterArrays.push(finalizationTimes);
      parameterArrays.push(supplies);
      return parameterArrays;
    },
    prepareInvocationParametersPresale(ipfsHashes) {
      let hashFunctions = [];
      let sizes = [];
      let digests = [];
      let isNFs = [];
      let prices = [];
      let finalizationTimes = [];
      let supplies = [];
      let presaleBlocks = [];
      var i;
      for (i = 0; i < this.savedPresaleTypes.length; i++) {
        let type = this.savedPresaleTypes[i];
        let args = cidToArgs(ipfsHashes[i]);
        hashFunctions.push(args.hashFunction);
        sizes.push(args.size);
        digests.push(args.digest);
        isNFs.push(type.isNF);
        prices.push(type.price);
        finalizationTimes.push(type.finalizationTime);
        supplies.push(type.supply);
        presaleBlocks.push(type.presaleBlock);
      }
      let invocParams = [];
      invocParams.push(hashFunctions);
      invocParams.push(sizes);
      invocParams.push(digests);
      invocParams.push(isNFs);
      invocParams.push(prices);
      invocParams.push(finalizationTimes);
      invocParams.push(supplies);
      invocParams.push(presaleBlocks);
      return invocParams;
    },

    // Invokes the method createPresaleTypes
    async invokeCreatePresaleTypes(params) {
      console.log(params);
      let response = await this.contract.methods
        .createPresaleTypes(
          params[0], // hash function
          params[1], // size
          params[2], // digest
          params[3], // is non fungible
          params[4], // price
          params[5], // finalization time
          params[6], // supply
          params[7] // presale block
        )
        .send({ from: this.$store.state.web3.account });
      this.savedPresaleTypes = [];
      console.log("createPresaleTypes invocation executed");
      return response;
    },

    // Invokes the method createTypes
    async invokeCreateTypes(params) {
      console.log("invokeCreateTypes");
      console.log(params);
      let response = await this.contract.methods
        .createTypes(
          params[0], // hash function
          params[1], // size
          params[2], // digest
          params[3], // is non-fungible
          params[4], // price
          params[5], // finalization time
          params[6] // presale block
        )
        .send({ from: this.$store.state.web3.account });
      this.savedTypes = [];
      console.log("createTypes invocation executed");
      return response;
    },

    // This method is called in the SeatingPlan component.
    // It takes the seats selected in the SeatingPlan and
    // the inputs in this form and saves it to either savedTypes
    // or savedPresaleTypes.
    saveTicketType(seats, color) {
      console.log("save ticket executed in TicketForm");
      if (seats.length == 0) {
        return;
      } else {
        if (this.withPresale) {
          this.savedPresaleTypes.push(this.getTypeAsPresale(seats, color));
          console.log(this.getTypeAsPresale(seats, color));
        } else {
          this.savedTypes.push(this.getTypeAsNonPresale(seats, color));
          console.log(this.getTypeAsNonPresale(seats, color));
        }
      }
    },

    updateAmountOfSelected(amount) {
      this.amountOfSelectedSeats = amount;
    },

    getSupply() {
      let supply = this.form.fungibleSupply;
      if (this.form.isNF) {
        supply = this.nonFungibleSupply;
      }
      return supply;
    },

    getTypeAsNonPresale(seats, color) {
      return {
        title: this.form.title,
        isNF: this.form.isNF,
        supply: this.getSupply(),
        price: this.fractionPrice,
        finalizationTime: this.finalizationTimeUnix,
        description: this.form.description,
        seats: seats,
        color: color
      };
    },
    getTypeAsPresale(seats, color) {
      return {
        title: this.form.title,
        isNF: this.form.isNF,
        supply: this.getSupply(),
        price: this.fractionPrice,
        finalizationTime: this.finalizationTimeUnix,
        description: this.form.description,
        seats: seats,
        presaleBlock: this.computePresaleBlock(),
        color: color
      };
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
      // this.form.finalizationTime = null;
      // this.form.ticketInitialSupply = null;
    },
    createIpfsString(type) {
      return JSON.stringify({
        version: "1.0",
        ticket: {
          title: type.title,
          description: type.description,
          event: this.$route.query.address,
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
    getDateAfterMonths(n) {
      let d = new Date();
      d.setMonth(d.getMonth() + n);
      return d;
    },
    computePresaleBlock() {
      return (
        this.getCurrentBlockNumber() +
        Math.floor(
          (this.presaleTimeUnix - new Date().getTime() / 1000) /
            AVERAGE_BLOCKTIME
        )
      );
    },
    async getCurrentBlockNumber() {
      return await this.$store.state.web3.web3Instance.eth.getBlockNumber();
    }
  },
  computed: {
    currencyDecimalFactor() {
      return Math.pow(10, this.currencyDecimals);
    },

    fractionPrice() {
      return BigNumber(this.form.price * this.currencyDecimalFactor).toFixed();
    },
    nonFungibleSupply() {
      return this.amountOfSelectedSeats;
    },
    finalizationDateInSeconds() {
      return Number(Date.parse(this.finalizationTime_Date) / 1000);
    },
    finalizationTimeUnix() {
      return (
        this.finalizationDateInSeconds +
        this.form.finalizationTime_Time.HH * 3600 +
        this.form.finalizationTime_Time.mm * 60
      );
    },
    presaleDateInSeconds() {
      return Number(Date.parse(this.presale_date) / 1000);
    },
    presaleTimeUnix() {
      return (
        this.presaleDateInSeconds +
        this.form.presale_time.HH * 3600 +
        this.form.presale_time.mm * 60
      );
    },
    web3() {
      return this.$store.state.web3;
    },
    ipfsInstance() {
      return this.$store.state.ipfsInstance;
    },
    allSavedTypes() {
      return this.savedTypes.concat(this.savedPresaleTypes);
    }
  },
  async created() {
    console.log("ticket form created executed");
    this.$root.$on("web3Injected", async () => {
      this.contract = new this.$store.state.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
        this.$route.query.address
      );
      // let a = new this.$store.state.web3.web3Instance.eth.Contract(
      //   ERC20_ABI,
      //   ERC20TESTTOKEN
      // );
      // let c = await a.methods.decimals().call();
      // console.log(c);
    });
    if (this.$store.state.web3.web3Instance) {
      this.contract = new this.$store.state.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
        this.$route.query.address
      );
    }
    this.event = await idb.getEvent(this.$route.query.address);
    this.currencyDecimals = getDecimals(this.event.currency);
    this.finalizationTime_Date = this.getDateAfterMonths(8);
    this.presale_date = this.getDateAfterMonths(2);
  },
  validations: {
    form: {
      title: {
        // required,
        minLength: minLength(3)
        // },
        // finalizationTime: {
        //   required
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
.date-container {
  display: flex;
}
.presale-checkbox {
  display: flex;
}
</style>
