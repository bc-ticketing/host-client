<template>
  <div class="ticket-details-container">
    <div>
      <span class="md-title title-text">{{ ticketType.title }}</span>
      <md-chip class="md-primary" v-if="ticketType.isNf">Non-Fungible</md-chip>
      <md-chip class="md-accent" v-if="!ticketType.isNf">Fungible</md-chip>
      <!-- <md-button class="md-primary title-text md-filled">Edit</md-button> -->
    </div>

    <span class="md-caption">{{ ticketType.description }}</span>
    <div>Price: {{ prettyPrice }} {{ currency }}</div>
    <div>
      Tickets Sold: {{ ticketType.ticketsSold }}/{{ ticketType.supply }}
    </div>
    <!-- <div>Tickets On Aftermarket:</div>
    <div>Aftermarket:</div>
    <div>Aftermarket Time till close:</div> -->
    <!-- <div v-if="isLoaded">
      <TicketAftermarket v-bind:aftermarket="aftermarket" />
    </div> -->
  </div>
</template>

<script>
// import TicketAftermarket from "./TicketAftermarket";
import getWeb3 from "../util/getWeb3";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/constants/EventMintableAftermarketPresale";
import { getIdAsBigNumber } from "idetix-utils";
import {
  getCurrencySymbol,
  getCurrencyDecimals,
} from "../util/constants/ERC20Tokens";
import BigNumber from "bignumber.js";
// import { Aftermarket, QueuePair, Queue, Order } from "../util/aftermarket";

export default {
  name: "TicketDetails",
  components: {
    // TicketAftermarket,
  },
  props: {
    ticketType: Object,
    event: Object,
  },
  computed: {
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
  },
  data: () => ({
    isLoaded: false,
    // aftermarket: {},
    // mockAftermarket: {
    //   queuePairs: [
    //     {
    //       percentage: 100,
    //       sellingQueue: {
    //         head: 0,
    //         tail: 10,
    //         total: 3,
    //         orders: [
    //           {
    //             address: "0xE29F8D98a9EafFD7F35B0d392665BB46A03Ac134",
    //             quantity: 2,
    //           },
    //           {
    //             address: "0xE29F8D98a9EafFD7F35B0d392665BB46A03Ac134",
    //             quantity: 4,
    //           },
    //         ],
    //       },
    //       buyingQueue: {
    //         head: 0,
    //         tail: 10,
    //         total: 3,
    //         orders: [
    //           {
    //             address: "0xE29F8D98a9EafFD7F35B0d392665BB46A03Ac134",
    //             quantity: 2,
    //           },
    //           {
    //             address: "0xE29F8D98a9EafFD7F35B0d392665BB46A03Ac134",
    //             quantity: 4,
    //           },
    //         ],
    //       },
    //     },
    //   ],
    //   total: {
    //     inSelling: 6,
    //     inBuying: 4,
    //   },
    // },
  }),
  methods: {
    handleEditTickets() {},
    // async getAftermarket(eventContract, type) {
    //   let aftermarket = new Aftermarket();
    //   const granularity = Number(
    //     await eventContract.methods.granularity().call()
    //   );
    //   for (let i = 1; i <= granularity; i++) {
    //     let percentage = (100 / granularity) * i;
    //     let queuePair = new QueuePair(percentage);

    //     let buyingQueue = await eventContract.methods
    //       .buyingQueue(type, percentage)
    //       .call();

    //     queuePair.buyingQueue = new Queue(
    //       buyingQueue["head"],
    //       buyingQueue["tail"],
    //       buyingQueue["numberTickets"]
    //     );

    //     // buying queue
    //     for (
    //       let j = queuePair.buyingQueue.tail - 1;
    //       j >= queuePair.buyingQueue.head;
    //       --j
    //     ) {
    //       let queueEntryBuying = await eventContract.methods
    //         .getQueuedUserBuying(type, percentage, j)
    //         .call();
    //       let order = new Order(
    //         queueEntryBuying["userAddress"],
    //         queueEntryBuying["quantity"]
    //       );
    //       queuePair.buyingQueue.orders.push(order);
    //     }

    //     let sellingQueue = await eventContract.methods
    //       .sellingQueue(type, percentage)
    //       .call();

    //     queuePair.sellingQueue = new Queue(
    //       sellingQueue["head"],
    //       sellingQueue["tail"],
    //       sellingQueue["numberTickets"]
    //     );

    //     for (
    //       let j = queuePair.sellingQueue.head;
    //       j < queuePair.sellingQueue.tail;
    //       j++
    //     ) {
    //       let queueEntrySelling = await eventContract.methods
    //         .getQueuedUserSelling(type, percentage, j)
    //         .call();
    //       let order = new Order(
    //         queueEntrySelling["userAddress"],
    //         queueEntrySelling["quantity"]
    //       );
    //       queuePair.sellingQueue.orders.push(order);
    //     }
    //     aftermarket.queuePairs.push(queuePair);
    //   }

    //   aftermarket.total.inBuying = await eventContract.methods
    //     .totalInBuying(type)
    //     .call();
    //   aftermarket.total.inSelling = await eventContract.methods
    //     .totalInSelling(type)
    //     .call();
    //   return aftermarket;
    // },
    //   async load() {
    //     const eventContract = new this.$store.state.web3.web3Instance.eth.Contract(
    //       EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
    //       this.event.contractAddress
    //     );
    //     const nonce = await eventContract.methods.granularity().call();
    //     console.log(nonce);
    //     console.log(this.ticketType.typeId);
    //     this.aftermarket = await this.getAftermarket(
    //       eventContract,
    //       getIdAsBigNumber(this.ticketType.isNf, this.ticketType.typeId.toFixed())
    //     );
    //     this.isLoaded = true;
    //     console.log(this.aftermarket);

    //     console.log(
    //       getIdAsBigNumber(this.ticketType.isNf, this.ticketType.typeId).toFixed()
    //     );
    //   },
  },
  async created() {
    console.log(this.ticketType);
    console.log(this.event);
    // this.$root.$on("web3Injected", async () => {
    //   await this.load();
    // });
    // if (this.$store.state.web3.web3Instance) {
    //   await this.load();
    // }
  },
};
</script>

<style>
.title-text {
  vertical-align: middle;
  padding-right: 10px;
}
</style>
