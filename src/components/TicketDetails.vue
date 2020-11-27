<template>
  <div
    v-bind:style="{
      'margin-top': topMargin,
      'padding-top': topPadding,
      'border-top': topBorder,
    }"
    class="ticket-details-container"
  >
    <div>
      <span class="md-title title-text">{{ ticketType.title }}</span>
      <md-chip v-if="ticketType.isNf">Non-Fungible</md-chip>
      <md-chip v-if="!ticketType.isNf">Fungible</md-chip>
    </div>
    <span class="md-caption">{{ ticketType.description }}</span>
    <div class="ticket-detail-entry">
      <div class="ticket-detail-entry-title">Seating Color:</div>
      <div v-bind:style="{ background: seatColor, color: seatColor }">
        seatcolor
      </div>
    </div>
    <div class="ticket-detail-entry">
      <div class="ticket-detail-entry-title">Price:</div>
      <div>{{ prettyPrice }} {{ currency }}</div>
    </div>
    <div v-if="created" class="ticket-detail-entry">
      <div class="ticket-detail-entry-title">Tickets Sold:</div>
      <div>{{ ticketType.ticketsSold }}/{{ ticketType.supply }}</div>
    </div>
    <div v-if="!created" class="ticket-detail-entry">
      <div class="ticket-detail-entry-title">Initial Supply:</div>
      <div>{{ ticketType.supply }}</div>
    </div>
    <div v-if="ticketType.hasPresale">
      <div v-if="ticketType.hasPresale && !ticketType.presalePassed">
        <div class="ticket-detail-entry">
          <div class="ticket-detail-entry-title">Presale block:</div>
          <div>
            {{ ticketType.presaleBlock }}
          </div>
        </div>
        <div class="ticket-detail-entry">
          <div class="ticket-detail-entry-title">Estimated presale end:</div>
          <div>
            {{ prettyPresaleEndDate }} - {{ daysUntilPresaleEnd }}
            {{ daysString }}
          </div>
        </div>
      </div>
    </div>
    <div class="ticket-detail-entry">
      <div class="ticket-detail-entry-title">Finalization Time:</div>
      <div>
        {{ prettyFinalizationDate }} - {{ daysUntilFinalization }}
        {{ daysString }}
      </div>
    </div>
    <div v-if="ticketType.presalePassed">The presale is closed.</div>
    <div v-if="!ticketType.hasPresale">This ticket type has no presale.</div>
  </div>
</template>

<script>
import getWeb3 from "../util/getWeb3";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/abi/EventMintableAftermarketPresale";
import { getIdAsBigNumber } from "idetix-utils";
import {
  getCurrencySymbol,
  getCurrencyDecimals,
} from "../util/constants/ERC20Tokens";
import BigNumber from "bignumber.js";
import {
  AVERAGE_TIME_PER_BLOCK,
  WEEKDAYS,
  MONTHS,
} from "../util/constants/constants";

export default {
  name: "TicketDetails",
  props: {
    ticketType: Object,
    event: Object,
    created: Boolean,
  },
  computed: {
    topPadding() {
      return this.created ? "0" : "10px";
    },
    topMargin() {
      return this.created ? "0" : "20px";
    },
    topBorder() {
      return this.created ? "" : "black solid 1px";
    },
    seatColor() {
      return this.ticketType.seatColor;
    },
    blocksUntilPresaleEnd() {
      return new BigNumber(this.ticketType.presaleBlock).minus(
        this.$store.state.web3.currentBlock
      );
    },
    milliSecondsUntilPresaleEnd() {
      return this.blocksUntilPresaleEnd.multipliedBy(AVERAGE_TIME_PER_BLOCK);
    },
    milliSecondsPresaleEnd() {
      return this.milliSecondsUntilPresaleEnd.plus(Date.now());
    },
    presaleEndDate() {
      return new Date(this.milliSecondsPresaleEnd.toNumber());
    },
    prettyPresaleEndDate() {
      return (
        WEEKDAYS[this.presaleEndDate.getDay()] +
        " " +
        this.presaleEndDate.getDate() +
        ". " +
        MONTHS[this.presaleEndDate.getMonth()] +
        " " +
        this.presaleEndDate.getFullYear()
      );
    },
    daysUntilPresaleEnd() {
      return new BigNumber(this.milliSecondsUntilPresaleEnd)
        .dividedBy(1000)
        .dividedBy(60)
        .dividedBy(60)
        .dividedBy(24)
        .decimalPlaces(0)
        .toFixed();
    },
    daysString() {
      return this.daysUntilPresaleEnd == 1 ? "day" : "days";
    },
    currency() {
      return this.event.currencySymbol
        ? this.event.currencySymbol
        : this.event.currency;
    },
    currencyDecimals() {
      return getCurrencyDecimals(this.event.currency);
    },
    prettyPriceDivisor() {
      return new BigNumber(10).pow(this.currencyDecimals);
    },
    prettyPrice() {
      return new BigNumber(this.ticketType.price).dividedBy(
        this.prettyPriceDivisor
      );
    },
    finalizationTimeMilliSeconds() {
      return new BigNumber(this.ticketType.finalizationTime).times(1000);
    },
    milliSecondsUntilfinalizationTime() {
      return this.finalizationTimeMilliSeconds.minus(Date.now());
    },
    finalizationDate() {
      return new Date(this.finalizationTimeMilliSeconds.toNumber());
    },
    prettyFinalizationDate() {
      return (
        WEEKDAYS[this.finalizationDate.getDay()] +
        " " +
        this.finalizationDate.getDate() +
        ". " +
        MONTHS[this.finalizationDate.getMonth()] +
        " " +
        this.finalizationDate.getFullYear()
      );
    },
    daysUntilFinalization() {
      return new BigNumber(this.milliSecondsUntilfinalizationTime)
        .dividedBy(1000)
        .dividedBy(60)
        .dividedBy(60)
        .dividedBy(24)
        .decimalPlaces(0)
        .toFixed();
    },
  },
  data: () => ({
    isLoaded: false,
  }),
  methods: {},
};
</script>

<style>
.title-text {
  vertical-align: middle;
  padding-right: 10px;
}
.ticket-detail-entry {
  display: flex;
}
.ticket-detail-entry-title {
  width: 160px;
}
</style>
