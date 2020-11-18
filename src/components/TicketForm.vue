<!-- This component contains a form to create tickets for an event. -->
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
                <md-input
                  name="title"
                  id="title"
                  v-model="form.title"
                  :disabled="sending"
                />
                <span class="md-error">A Title is required.</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter">
            <div class="md-layout-item">
              <md-radio
                class="md-primary"
                v-model="form.isNF"
                :value="true"
                :disabled="sending"
                >Non-Fungible</md-radio
              >
              <md-radio
                class="md-primary"
                v-model="form.isNF"
                :value="false"
                :disabled="sending"
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
                  :disabled="form.isNF || sending"
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
                <md-input
                  name="price"
                  id="price"
                  v-model="form.price"
                  :disabled="sending"
                />
                <span class="md-error">The price is required.</span>
              </md-field>
            </div>
          </div>

          <div class="md-layout md-gutter date-container">
            <div class="md-layout-item">
              <md-datepicker
                v-if="!sending"
                md-immediately
                name="date"
                id="date"
                v-model="finalizationDate"
              ></md-datepicker>
              <md-datepicker
                v-if="sending"
                md-immediately
                name="disabled-datepicker"
                id="disabled-datepicker"
                v-model="finalizationDateUponSending"
                :md-disabled-dates="disabledDates"
              >
                <label for="disabled-datepicker">Finalization Time</label>
              </md-datepicker>
            </div>
            <div class="md-small-size-100" style="margin: 20px 0">
              <vue-timepicker
                v-model="form.finalizationTime"
                format="HH:mm"
                :disabled="sending"
              ></vue-timepicker>
            </div>
            <div class="md-small-size-100 info-dialog-button">
              <md-button
                class="md-icon-button md-primary"
                @click="showFinalizationDialog = true"
                style="margin-right: 16px"
                :disabled="sending"
              >
                <md-icon>help_outline</md-icon>
              </md-button>
            </div>
          </div>

          <md-dialog :md-active.sync="showFinalizationDialog">
            <md-dialog-title>Finalization Time</md-dialog-title>
            <p class="dialog-text">
              After the first block with a timestamp higher than the
              finalization is mined, the aftermarket is closed.
            </p>
            <md-button
              class="md-primary"
              @click="showFinalizationDialog = false"
              >Close</md-button
            >
          </md-dialog>

          <div class="md-layout-item md-gutter presale-checkbox">
            <md-checkbox
              class="md-primary"
              v-model="withPresale"
              :disabled="sending"
              >Presale Lottery</md-checkbox
            >
          </div>

          <div class="md-layout md-gutter date-container" v-if="withPresale">
            <div class="md-layout-item">
              <md-datepicker
                v-if="!sending"
                md-immediately
                name="presale-closing-date"
                id="presale-closing-date"
                v-model="presaleClosingDate"
              >
                <label for="presale-closing-date">Presale Closing Time</label>
              </md-datepicker>
              <md-datepicker
                v-if="sending"
                md-immediately
                name="presale_date_disabled_datepicker"
                id="presale_date_disabled_datepicker"
                v-model="presaleClosingDateUponSending"
                :md-disabled-dates="disabledDates"
              >
                <label for="presale_date_disabled_datepicker"
                  >Presale Closing Time</label
                >
              </md-datepicker>
            </div>
            <div class="md-small-size-100" style="margin: 20px 0">
              <vue-timepicker
                v-model="form.presaleClosingTime"
                format="HH:mm"
                :disabled="sending"
              ></vue-timepicker>
            </div>
            <div class="md-small-size-100 info-dialog-button">
              <md-button
                class="md-icon-button md-primary"
                @click="showPresaleDialog = true"
                style="margin-right: 16px"
                :disabled="sending"
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
                  :disabled="sending"
                ></md-textarea>
              </md-field>
            </div>
          </div>
          <SeatingPlan
            v-bind:address="this.$route.query.address"
            v-bind:isNF="this.form.isNF"
            v-bind:sending="sending"
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
    <div v-if="showStatusMessage" class="status-message">
      <md-progress-bar :md-mode="progressBarMode"></md-progress-bar>
      <p class="process-message">
        {{ processMessage }}
      </p>
    </div>
  </div>
</template>

<script>
// external imports
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";
import { cidToArgs, argsToCid } from "idetix-utils";
import VueTimepicker from "vue2-timepicker";
import "vue2-timepicker/dist/VueTimepicker.css";
import sleep from "await-sleep";
import { getJSONFromIpfs } from "../util/getIpfs";
import BigNumber from "bignumber.js";

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.VUE_APP_PINATA_API_KEY,
  process.env.VUE_APP_PINATA_SECRET_API_KEY
);

// internal imports
import {
  NETWORKS,
  TICKETS_CREATING_PRESALE,
  WAITING_FOR_SIGNATURE_PRESALE,
} from "../util/constants/constants.js";
import {
  EVENT_FACTORY_ABI,
  EVENT_FACTORY_ADDRESS,
} from "../util/abi/EventFactory.js";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/abi/EventMintableAftermarketPresale";
import { ERC20_ABI } from "../util/abi/ERC20";
import SeatingPlan from "../components/SeatingPlan";
import {
  WAITING_FOR_SIGNATURE,
  UPLOADING_TO_IPFS,
  UPLOADED_TO_IPFS,
  TRANSACTION_DENIED,
  DEFAULT_ERROR,
  PROGRESS_DETERMINATE,
  PROGRESS_INDETERMINATE,
  TICKETS_CREATING,
  TICKETS_CREATED,
  TICKETS_CREATED_PRESALE,
  AVERAGE_BLOCKTIME,
  AVERAGE_BLOCKTIME_LOCAL,
} from "../util/constants/constants";
import idb from "../util/db/idb";
import getDecimals from "../util/utility.js";
import { ERC20TESTTOKEN } from "../util/constants/ERC20Tokens.js";

export default {
  name: "TicketForm",
  components: {
    SeatingPlan,
    VueTimepicker,
  },
  data: () => ({
    sending: false,
    showStatusMessage: false,
    progressBarMode: PROGRESS_DETERMINATE,
    processMessage: DEFAULT_ERROR,

    contract: null,
    presaleTypeIpfsHashes: [],
    presaleTypeIpfsStrings: [],
    nonPresaleTypeIpfsHashes: [],
    nonPresaleTypeIpfsStrings: [],
    currencyDecimals: null,
    withPresale: false,
    amountOfSelectedSeats: 0,
    finalizationDate: null,
    showFinalizationDialog: false,
    showPresaleDialog: false,
    occupiedSeats: [], // list of seats already used in a type on the blockchain
    savedTypes: [],
    savedPresaleTypes: [],
    form: {
      title: "Standing Area",
      description: "ticket description",
      isNF: false,
      price: "2",
      finalizationTime: {
        HH: "10",
        mm: "00",
      },
      presaleClosingTime: {
        HH: "10",
        mm: "00",
      },
      fungibleSupply: 400,
    },
    disabledDates: (date) => {
      const day = date.getDay();
      return day >= 0;
    },
    presaleClosingDateUponSending: null,
    finalizationDateUponSending: null,
  }),
  watch: {
    sending: function (val) {
      this.presaleClosingDateUponSending = this.presaleClosingDate;
      this.finalizationDateUponSending = this.finalizationDate;
    },
  },
  methods: {
    /**
     * Create all saved ticket types
     */
    async createTypes() {
      this.sending = true;
      if (this.savedTypes.length > 0) {
        this.createNonPresaleTypes();
      }
      if (this.savedPresaleTypes.length > 0) {
        this.createPresaleTypes();
      }

      this.sending = false;
    },
    async createPresaleTypes() {
      this.createIpfsStrings(true); // creating ipfs strings for presale types
      this.showStatus("indeterminate");
      let ipfsStatus = await this.uploadToIpfs(true);
      if (!ipfsStatus) {
        this.sending = false;
        this.showErrorMessage();
        return false;
      }
      let response = await this.invokeCreatePresaleTypes(
        this.prepareInvocationParametersPresale()
      );
      return true;
    },
    async createNonPresaleTypes() {
      this.createIpfsStrings(false); // creating ipfs strings for non presale types
      this.showStatus(PROGRESS_INDETERMINATE, UPLOADING_TO_IPFS);
      let ipfsStatus = await this.uploadToIpfs(false);
      if (!ipfsStatus) {
        this.sending = false;
        this.showErrorStatus();
        return false;
      }
      let response = await this.invokeCreateTypes(
        this.prepareInvocationParameters()
      );
      return true;
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
        const json = JSON.stringify({
          version: "1.0",
          ticket: {
            title: type.title,
            description: type.description,
            color: type.color,
            event: this.$route.query.address,
            mapping: map,
          },
        });
        if (presale) {
          this.presaleTypeIpfsStrings.push(json);
        } else {
          this.nonPresaleTypeIpfsStrings.push(json);
        }
      }
    },

    async uploadToIpfs(presale) {
      this.sending = true;
      this.nonPresaleTypeIpfsHashes = [];
      this.presaleTypeIpfsHashes = [];
      var listOfJsonStrings;
      if (presale) {
        listOfJsonStrings = this.presaleTypeIpfsStrings;
      } else {
        listOfJsonStrings = this.nonPresaleTypeIpfsStrings;
      }
      var i;
      for (i = 0; i < listOfJsonStrings.length; i++) {
        let currentString = listOfJsonStrings[i];
        console.log(currentString);
        const result = await pinata.pinJSONToIPFS(JSON.parse(currentString));
        // if (result.IpfsHash == null) {
        //   return false;
        // }
        if (presale) {
          this.presaleTypeIpfsHashes.push(result.IpfsHash);
        } else {
          this.nonPresaleTypeIpfsHashes.push(result.IpfsHash);
        }
      }
      return true;
    },

    // Takes the necessary parameter of the saved ticket types that
    // dont have a presale and rearanges them in correct form for
    // the invocation.
    prepareInvocationParameters() {
      let hashFunctions = [];
      let sizes = [];
      let digests = [];
      let isNFs = [];
      let prices = [];
      let finalizations = [];
      let supplies = [];
      var i;
      for (i = 0; i < this.savedTypes.length; i++) {
        let type = this.savedTypes[i];
        let args = cidToArgs(this.nonPresaleTypeIpfsHashes[i]);
        hashFunctions.push(args.hashFunction);
        sizes.push(args.size);
        digests.push(args.digest);
        isNFs.push(type.isNF);
        prices.push(type.price);
        finalizations.push(type.finalization);
        supplies.push(type.supply);
      }
      let parameterArrays = [];
      parameterArrays.push(hashFunctions);
      parameterArrays.push(sizes);
      parameterArrays.push(digests);
      parameterArrays.push(isNFs);
      parameterArrays.push(prices);
      parameterArrays.push(finalizations);
      parameterArrays.push(supplies);
      return parameterArrays;
    },

    prepareInvocationParametersPresale() {
      let hashFunctions = [];
      let sizes = [];
      let digests = [];
      let isNFs = [];
      let prices = [];
      let finalizations = [];
      let supplies = [];
      let presaleBlocks = [];
      var i;
      for (i = 0; i < this.savedPresaleTypes.length; i++) {
        let type = this.savedPresaleTypes[i];
        let args = cidToArgs(this.presaleTypeIpfsHashes[i]);
        hashFunctions.push(args.hashFunction);
        sizes.push(args.size);
        digests.push(args.digest);
        isNFs.push(type.isNF);
        prices.push(type.price);
        finalizations.push(type.finalization);
        supplies.push(type.supply);
        presaleBlocks.push(type.presaleBlock);
      }
      let invocParams = [];
      invocParams.push(hashFunctions);
      invocParams.push(sizes);
      invocParams.push(digests);
      invocParams.push(isNFs);
      invocParams.push(prices);
      invocParams.push(finalizations);
      invocParams.push(supplies);
      invocParams.push(presaleBlocks);
      return invocParams;
    },

    /**
     * Invokes the method `createPresaleTypes` on the event contract.
     */
    async invokeCreatePresaleTypes(params) {
      console.log(params);
      this.showStatus(PROGRESS_DETERMINATE, WAITING_FOR_SIGNATURE);
      let response = await this.contract.methods
        .createPresaleTypes(
          params[0], // hash function
          params[1], // size
          params[2], // digest
          params[3], // is non fungible
          params[4], // price
          params[5], // finalization
          params[6], // supply
          params[7] // presale block
        )
        .send(
          { from: this.$store.state.web3.account },
          async (error, transactionHash) => {
            this.waitingForDeploymentReceipt = true;
            if (transactionHash) {
              console.log(
                "submitted invocation to create presale tickets: ",
                transactionHash
              );
            }
            let transactionReceipt = null;
            while (transactionReceipt == null) {
              transactionReceipt = await this.$store.state.web3.web3Instance.eth.getTransactionReceipt(
                transactionHash
              );
              await sleep(AVERAGE_BLOCKTIME);
            }
            if (transactionReceipt) {
              console.log("Got the transaction receipt: ", transactionReceipt);
              this.showStatus(PROGRESS_DETERMINATE, TICKETS_CREATED_PRESALE);
            }
            await this.$store.dispatch("loadEvents");
          }
        )
        .catch(async (e) => {
          // Transaction rejected or failed
          console.log(e);
          this.showErrorMessage();
          for (let j = 0; j < this.presaleTypeIpfsHashes.length; j++) {
            let hash = this.presaleTypeIpfsHashes[j];
            const result = await pinata.unpin(hash);
            console.log(result);
          }
        });

      // await this.$store.dispatch("loadEvents");
      this.savedPresaleTypes = [];
      this.sending = false;
      return response;
    },

    /**
     * Invokes the method `createTypes` on the event contract.
     */
    async invokeCreateTypes(params) {
      this.showStatus(PROGRESS_DETERMINATE, WAITING_FOR_SIGNATURE);
      let response = await this.contract.methods
        .createTypes(
          params[0], // hash function
          params[1], // size
          params[2], // digest
          params[3], // is non-fungible
          params[4], // price
          params[5], // finalization
          params[6] // presale block
        )
        .send(
          { from: this.$store.state.web3.account },
          async (error, transactionHash) => {
            this.showStatus(PROGRESS_DETERMINATE, TICKETS_CREATING_PRESALE);
            if (transactionHash) {
              console.log(
                "submitted invocation to create non-presale tickets: ",
                transactionHash
              );
            }
            let transactionReceipt = null;
            while (transactionReceipt == null) {
              transactionReceipt = await this.$store.state.web3.web3Instance.eth.getTransactionReceipt(
                transactionHash
              );
              await sleep(AVERAGE_BLOCKTIME);
            }
            if (transactionReceipt) {
              console.log("Got the transaction receipt: ", transactionReceipt);
              this.showStatus(PROGRESS_DETERMINATE, TICKETS_CREATED);
            }
          }
        )
        .catch(async (e) => {
          // Transaction rejected or failed
          console.log(e);
          this.showErrorMessage();
          for (let j = 0; j < this.nonPresaleTypeIpfsHashes.length; j++) {
            let hash = this.nonPresaleTypeIpfsHashes[j];
            const result = await pinata.unpin(hash);
            console.log(result);
          }
        });
      this.savedTypes = [];
      return response;
    },

    /**
     * This method is called in the SeatingPlan component.
     * It takes the seats selected in the SeatingPlan and the inputs in this form
     *  and saves it to either `savedTypes` or `savedPresaleTypes`.
     */
    async saveTicketType(seats, color) {
      console.log("save ticket executed in TicketForm");
      if (seats.length == 0) {
        console.log("no seats selected - doing nothing");
        return;
      } else {
        if (this.withPresale) {
          let type = await this.getTypeAsPresale(seats, color);
          this.savedPresaleTypes.push(type);
          console.log(type);
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
      let supply = Number(this.form.fungibleSupply).toFixed();
      if (this.form.isNF) {
        supply = this.nonFungibleSupply.toFixed();
      }
      return supply;
    },

    getTypeAsNonPresale(seats, color) {
      let supply = this.getSupply();
      return {
        title: this.form.title,
        isNF: this.form.isNF,
        supply: supply,
        price: this.fractionPrice,
        finalization: this.finalizationUnixSeconds,
        description: this.form.description,
        seats: seats,
        color: color,
      };
    },
    async getTypeAsPresale(seats, color) {
      let supply = this.getSupply();
      let presaleBlock = await this.computePresaleBlock();
      return {
        title: this.form.title,
        isNF: this.form.isNF,
        supply: supply,
        price: this.fractionPrice,
        finalization: this.finalizationUnixSeconds,
        description: this.form.description,
        seats: seats,
        presaleBlock: presaleBlock,
        color: color,
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
        fromBlock: 1,
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
      // this.form.finalization = null;
      // this.form.ticketInitialSupply = null;
    },
    createIpfsString(type) {
      return JSON.stringify({
        version: "1.0",
        ticket: {
          title: type.title,
          description: type.description,
          event: this.$route.query.address,
          mapping: type.seats,
        },
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
          "md-invalid": false, //field.$invalid && field.$dirty,
        };
      }
    },
    routeToEventList() {
      this.$router.push({
        name: `Events`,
      });
    },
    getDateAfterMonths(n) {
      let d = new Date();
      d.setMonth(d.getMonth() + n);
      return d;
    },

    /**
     * Computing expected block from presale timestamp.
     */
    async computePresaleBlock() {
      let currentBlockNumber = BigNumber(await this.getCurrentBlockNumber());
      console.log(currentBlockNumber.toFixed());
      let nowUnixInSeconds = BigNumber(new Date().getTime()).dividedBy(
        BigNumber(1000)
      );
      let avgBlockTimeInSeconds = BigNumber(AVERAGE_BLOCKTIME).dividedBy(1000);
      return this.presaleClosingTimeUnixSeconds
        .minus(nowUnixInSeconds)
        .dividedBy(avgBlockTimeInSeconds)
        .plus(currentBlockNumber)
        .toFixed(0);
    },
    async getCurrentBlockNumber() {
      return await this.$store.state.web3.web3Instance.eth.getBlockNumber();
    },
    showStatus(processBarMode, message) {
      this.processBarMode = processBarMode;
      this.processMessage = message;
      this.showStatusMessage = true;
    },
    showErrorMessage() {
      this.showStatus(PROGRESS_DETERMINATE, DEFAULT_ERROR);
      setTimeout(() => {
        this.hideStatus();
      }, 5000);
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
  },
  computed: {
    currencyDecimalFactor() {
      return Math.pow(10, this.currencyDecimals);
    },

    fractionPrice() {
      return BigNumber(this.form.price)
        .multipliedBy(this.currencyDecimalFactor)
        .toFixed();
    },
    nonFungibleSupply() {
      return this.amountOfSelectedSeats;
    },
    finalizationDateInSeconds() {
      return BigNumber(Date.parse(this.finalizationDate)).dividedBy(
        BigNumber(1000)
      );
    },
    finalizationHoursInSeconds() {
      return BigNumber(this.form.finalizationTime.HH).multipliedBy(
        BigNumber(3600)
      );
    },
    finalizationMinutesInSeconds() {
      return BigNumber(this.form.finalizationTime.mm).multipliedBy(
        BigNumber(60)
      );
    },
    finalizationUnixSeconds() {
      return this.finalizationDateInSeconds
        .plus(this.finalizationHoursInSeconds)
        .plus(this.finalizationMinutesInSeconds)
        .toFixed();
    },
    presaleClosingDateInSeconds() {
      return BigNumber(Date.parse(this.presaleClosingDate)).dividedBy(
        BigNumber(1000)
      );
    },
    presaleClosingTimeHoursInSeconds() {
      return BigNumber(this.form.presaleClosingTime.HH).multipliedBy(
        BigNumber(3600)
      );
    },
    presaleClosingTimeMinutesInSeconds() {
      return BigNumber(this.form.presaleClosingTime.mm).multipliedBy(
        BigNumber(60)
      );
    },
    presaleClosingTimeUnixSeconds() {
      return this.presaleClosingDateInSeconds
        .plus(this.presaleClosingTimeHoursInSeconds)
        .plus(this.presaleClosingTimeMinutesInSeconds);
    },
    web3() {
      return this.$store.state.web3;
    },
    ipfsInstance() {
      return this.$store.state.ipfsInstance;
    },
    allSavedTypes() {
      return this.savedTypes.concat(this.savedPresaleTypes);
    },
  },
  async created() {
    console.log("ticket form created executed");
    const pinataAuth = await pinata.testAuthentication();
    console.log(pinataAuth);
    this.$root.$on("web3Injected", async () => {
      try {
        this.contract = new this.$store.state.web3.web3Instance.eth.Contract(
          EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
          this.$route.query.address
        );
      } catch (e) {
        this.showErrorMessage();
        console.log(e);
      }
    });
    if (this.$store.state.web3.web3Instance) {
      this.contract = new this.$store.state.web3.web3Instance.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
        this.$route.query.address
      );
    }
    try {
      this.event = await idb.getEvent(this.$route.query.address);
    } catch (e) {
      console.log(e);
    }
    if (!this.event) {
      this.showErrorMessage();
      return;
    }
    this.currencyDecimals = getDecimals(this.event.currency);
    this.finalizationDate = this.getDateAfterMonths(8);
    this.presaleClosingDate = this.getDateAfterMonths(2);
  },
  validations: {
    form: {
      title: {
        // required,
        minLength: minLength(3),
        // },
        // finalization: {
        //   required
      },
    },
  },
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
