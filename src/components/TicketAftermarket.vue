<template>
  <div class="ticket-aftermarket-container">
      <!-- <div class="md-layout md-gutter md-alignment-top-center">
          <div class="md-layout-item md-layout md-gutter md-alignment-top-right" >
              <div class="md-layout-item">{{order.quantity}}</div>
          </div>


        <div class="md-layout-item md-size-20">
          <span>- {{queuePair.percentage}}% -</span>
        </div>

        <div class="md-layout-item">
            <div v-for="(order, index) in queuePair.sellingQueue.orders" v-bind:key="'selling' + index">
          <span>{{order.quantity}} </span>
        </div>
        </div>
    </div> -->
<!--    <div class="md-layout md-gutter">-->
<!--      <div class="md-layout-item md-layout md-gutter item md-alignment-top-right md-size-40"><div>BuyingQueue</div></div>-->
<!--      <div class="md-layout-item md-layout md-gutter item md-alignment-top-center md-size"><div>Percentage</div></div>-->
<!--      <div class="md-layout-item md-layout md-gutter item md-alignment-top-left md-size-40"><div>SellingQueue</div></div>-->
<!--</div>-->
<!--    <div v-for="queuePair in aftermarket.queuePairs" v-bind:key="queuePair.percentage">-->
<!--          <div class="md-layout md-gutter">-->
<!--      <div class="md-layout-item md-layout md-gutter item md-alignment-top-right md-size-40">-->
<!--        <div v-for="(order, index) in queuePair.buyingQueue.orders" v-bind:key="'buying' + index">-->
<!--          <div class="nested ">{{order.quantity}}-</div>-->
<!--        </div>-->
<!--      </div>-->

<!--      <div class="md-layout-item md-layout md-gutter item md-size-20 md-alignment-top-center">-->
<!--        <div class="md-layout-item nested"> {{queuePair.percentage}}% </div>-->
<!--      </div>-->

<!--      <div class="item md-layout-item md-layout md-gutter md-alignment-top-left md-size-40">-->
<!--        <div v-for="(order, index) in queuePair.sellingQueue.orders" v-bind:key="'selling' + index">-->
<!--          <div class="nested">-{{order.quantity}}</div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
    <div class="grid-container">
      <div>Percentage</div>
      <div>Total</div>
      <div>Buying Queue</div>
      <div></div>
      <div>Selling Queue</div>
      <div>Total</div>
    </div>
<!--    <div v-for="">-->
      <div class="grid-container">
        <div>Percentage</div>
        <div>Total</div>
        <div>Buying Queue</div>
        <div></div>
        <div>Selling Queue</div>
        <div>Total</div>
      </div>
<!--    </div>-->
  </div>

</template>

<script>
export default {
  name: "TicketAftermarket",
  props: {
    aftermarket: Object,
  },
  data: () => ({}),
  methods: {
    handleEditTickets() {},
  },
  created() {
    console.log(this.aftermarket);
  },
};
</script>
<style>
.item{
  /* background: red; */
  text-align: center;
}
.nested{
  /* background: blue; */
}

.grid-container {
  display: grid;
  grid-template-columns: 100px 100px 1fr 30px 1fr 100px;
  grid-template-rows: 1fr;
  gap: 0px 0px;
  grid-template-areas:
    ". . . . . .";
}
</style>