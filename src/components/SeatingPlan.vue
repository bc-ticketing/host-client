<template>
  <div class="seating-plan">
    <div class="md-layout md-gutter">
      <div class="md-layout-item md-small-size-100 size-container">
        <md-field style="margin-right: 24px">
          <label for="rows">Rows:</label>
          <md-input
            type="number"
            :min="minRowSize"
            max="800"
            name="rows"
            id="rows"
            v-model="rows"
          />
        </md-field>
        <md-field>
          <label for="cols">Cols:</label>
          <md-input
            type="number"
            :min="minColSize"
            max="800"
            name="cols"
            id="cols"
            v-model="cols"
          />
        </md-field>
      </div>
    </div>

    <div class="md-layout md-gutter">
      <div class="md-layout-item md-small-size-100">
        <md-checkbox class="md-primary" v-model="blockSelection" :value="true"
          >Block Selection</md-checkbox
        >
        <md-checkbox v-model="unselect" :value="true">Unselect</md-checkbox>
      </div>
    </div>

    <div class="md-layout md-gutter">
      <div class="md-layout-item md-small-size-100">
        <md-button class="md-primary" @click="increaseColorIndex"
          >Change color</md-button
        >
      </div>
    </div>

    <div
      class="seating-container"
      :ref="`cont`"
      @mouseup="disableMouseDown"
      @mousedown="enableMouseDown"
      @mouseleave="leaveGrid"
      draggable="false"
    >
      <div class="col" v-for="col in cols" v-bind:key="`col_` + col">
        <div
          :ref="`seat_` + col + `_` + row"
          data-status="free"
          @mousedown="mouseDownOnTile(col, row)"
          @mouseup="mouseUpOnTile(col, row)"
          @mouseenter="mouseEnter(col, row)"
          class="seat"
          v-for="row in rows"
          v-bind:key="`seat_` + row"
        ></div>
      </div>
    </div>
    <!-- <div class="design-settings">
      <div class="section">
        <div class="menu-group">
          <h3>Design Options</h3>

          <label for="color-selction">Color</label>
          <input
            class="radio-color yellow"
            type="radio"
            name="color-1"
            v-model="color"
            value="#D08770"
          />
          <input
            class="radio-color orange"
            type="radio"
            name="color-2"
            v-model="color"
            value="#EBCB8B"
          />
          <input
            class="radio-color red"
            type="radio"
            name="color-3"
            v-model="color"
            value="#bf616a"
          />
        </div>
        <div class="menu-group">
          <label for="block-selection">Block selection</label>
          <input type="checkbox" v-model="blockSelection" value="true" />
        </div>
    <div class="menu-group">-->
    <md-button class="md-accent" @click="resetSelection"
      >Reset selection</md-button
    >
    <md-button class="md-primary" @click="save">Save category</md-button>
    <!-- </div>
      </div>
      <div class="section legend">
        <h3>Legend</h3>
        <div class="menu-group">
          <div class="seat free"></div>
          <span>Free</span>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script>
import getEvent, { COLOR_ARRAY } from "../util/utility";
// This view is a demo for our seating plan generator, which will be used in the host client to let an event host generate somewhat accurate, yet arbitrary, seating plans for their venue.
// The code will also be adapted and used in the guest client for displaying which seats are available for purchase to a customer.

// occupied: This seat is already included in another ticket type
// free:     This seat is not linked to any ticket type yet
// selected: This seat is selected. When save category is clicked,
//             a ticket type containing this seat is saved in the
//             parent TicketForm.
export default {
  name: "SeatingPlan",
  data() {
    return {
      amountSelected: 0,
      rows: 12,
      cols: 12,
      minRowSize: 0,
      minColSize: 0,
      blockSelection: false,
      unselect: false,
      selection_start: { x: 0, y: 0 },
      last_selected: { x: 0, y: 0 },
      colorIndex: 0,
      freeColor: "#8fbcbb",
      occupiedColor: "#4c566a",
      stageColor: "#d8dee9",
      mouseDown: false,
      seatingObject: {
        rows: 0,
        cols: 0,
        assignedSeats: []
      },
      fungibleOccupiedSeats: [],
      nonFungibleOccupiedSeats: []
    };
  },
  props: { address: String, isNF: Boolean },
  /* Watch over rows and cols to adjust grid size dynamically */
  watch: {
    rows: function(val) {
      this.rows = Number(val);
      this.updateGridSize();
    },
    cols: function(val) {
      this.cols = Number(val);
      this.updateGridSize();
    },
    amountSelected: function() {
      this.$emit("updateamountofselected", this.amountSelected);
    },
    colorIndex: function() {
      for (let i = 1; i <= this.rows; i++) {
        for (let j = 1; j <= this.cols; j++) {
          console.log(i + " " + j);
          let seat = this.$refs[`seat_${j}_${i}`];
          console.log(seat);
          if (seat[0].dataset.status == "selected") {
            seat[0].style.backgroundColor = this.color;
          }
        }
      }
    }
    // fungibleOccupiedSeats: function(val) {
    //   if (val.length > 0) {
    //     this.fetchAndUpdateGrid();
    //     window.setTimeout(() => {
    //       this.setFungibleOccupiedSeats();
    //     }, 500);
    //   }
    // },
    // nonFungibleOccupiedSeats: function(val) {
    //   if (val.length > 0) {
    //     this.fetchAndUpdateGrid();
    //     window.setTimeout(() => {
    //       this.setNonFungibleOccupiedSeats();
    //     }, 500);
    //   }
    // }
  },
  methods: {
    fetchAndUpdateGrid() {
      var i;
      var max_x = this.cols;
      var max_y = this.rows;
      for (i = 0; i < this.nonFungibleOccupiedSeats.length; i++) {
        let cords = this.nonFungibleOccupiedSeats[i].split("/");
        let row_cord = Number(cords[0]);
        let col_cord = Number(cords[1]);
        if (row_cord > max_x) {
          max_x = row_cord;
        }
        if (col_cord > max_y) {
          max_y = col_cord;
        }
      }
      for (i = 0; i < this.fungibleOccupiedSeats.length; i++) {
        let cords = this.fungibleOccupiedSeats[i].split("/");
        let row_cord = Number(cords[0]);
        let col_cord = Number(cords[1]);
        if (row_cord > max_x) {
          max_x = row_cord;
        }
        if (col_cord > max_y) {
          max_y = col_cord;
        }
      }
      this.cols = max_x;
      this.rows = max_y;
      this.minColSize = max_x;
      this.minRowSize = max_y;
    },

    setOccupiedSeats(event) {
      let existingNfTickets = event.nonFungibleTickets;
      for (let i = 0; i < existingNfTickets.length; i++) {
        let nfTicket = existingNfTickets[i];
        console.log(nfTicket);
        let c = nfTicket.color;
        for (let s = 0; s < nfTicket.seatMapping.length; s++) {
          let cords = nfTicket.seatMapping[s].split("/");
          let seat = this.$refs[`seat_${cords[0]}_${cords[1]}`];
          seat[0].dataset.status = "occupied";
          if (c == "" || c == null) {
            seat[0].style.backgroundColor = this.occupiedColor;
          } else {
            seat[0].style.backgroundColor = c;
          }
        }
      }
      let existingFungibleTickets = event.fungibleTickets;
      for (let i = 0; i < existingFungibleTickets.length; i++) {
        let fungibleTicket = existingFungibleTickets[i];
        console.log(fungibleTicket);
        let c = fungibleTicket.color;
        for (let s = 0; s < fungibleTicket.seatMapping.length; s++) {
          let cords = fungibleTicket.seatMapping[s].split("/");
          let seat = this.$refs[`seat_${cords[0]}_${cords[1]}`];
          seat[0].dataset.status = "occupied";
          if (c == "" || c == null) {
            seat[0].style.backgroundColor = this.occupiedColor;
          } else {
            seat[0].style.backgroundColor = c;
          }
          seat[0].classList.add("fungible");
        }
      }
    },

    // set status of non-fungible seats already occupied in another ticket type
    setNonFungibleOccupiedSeats() {
      for (let i = 0; i < this.nonFungibleOccupiedSeats.length; i++) {
        let cords = this.nonFungibleOccupiedSeats[i].split("/");
        var seat = this.$refs[`seat_${cords[0]}_${cords[1]}`];
        seat[0].dataset.status = "occupied";
        seat[0].style.backgroundColor = this.occupiedColor;
      }
    },

    // set status of fungible seats already occupied in another ticket type
    setFungibleOccupiedSeats() {
      for (let i = 0; i < this.fungibleOccupiedSeats.length; i++) {
        let cords = this.fungibleOccupiedSeats[i].split("/");
        let seat = this.$refs[`seat_${cords[0]}_${cords[1]}`];
        seat[0].dataset.status = "occupied";
        seat[0].style.backgroundColor = this.occupiedColor;
      }
    },

    // Update styles for the grid
    updateGridSize() {
      this.$refs[
        "cont"
      ].style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
      this.$refs["cont"].style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
    },
    // on mouse click release handler, if we are not on a tile we still want to act like we were on the previous tile
    disableMouseDown() {
      this.mouseUpOnTile(this.last_selected.x, this.last_selected.y);
    },
    // on mouse down handler
    enableMouseDown(event) {
      event.preventDefault();
      this.mouseDown = true;
    },
    // mouse down handler for when we are not on a tile
    mouseDownOnTile(col, row) {
      // console.log("mouseDownTriggered");
      this.mouseDown = true;
      if (this.blockSelection) {
        this.selection_start = { x: col, y: row };
      } else {
        this.selectSeat(col, row);
      }
    },
    // mouse release handler, check if we are doing block selection to select all tiles within the rectangle spaned by the starting and the releasing point
    mouseUpOnTile(col, row) {
      // console.log("mouseUpTriggered");
      this.mouseDown = false;
      if (this.blockSelection) {
        let start_x =
          this.selection_start.x < col ? this.selection_start.x : col;
        let start_y =
          this.selection_start.y < row ? this.selection_start.y : row;
        let end_x = this.selection_start.x > col ? this.selection_start.x : col;
        let end_y = this.selection_start.y > row ? this.selection_start.y : row;
        for (let i = start_x; i <= end_x; i++) {
          for (let j = start_y; j <= end_y; j++) {
            this.selectSeat(i, j);
          }
        }
        this.removeAllTempSelections();
      }
    },
    // select a tile if we hover it while holding the mouse trigger
    mouseEnter(col, row) {
      // console.log("mouseEnterTriggered");
      if (this.mouseDown) {
        if (this.blockSelection) {
          let start_x =
            this.selection_start.x < col ? this.selection_start.x : col;
          let start_y =
            this.selection_start.y < row ? this.selection_start.y : row;
          let end_x =
            this.selection_start.x > col ? this.selection_start.x : col;
          let end_y =
            this.selection_start.y > row ? this.selection_start.y : row;
          this.removeAllTempSelections();
          for (let i = start_x; i <= end_x; i++) {
            for (let j = start_y; j <= end_y; j++) {
              this.markForSelection(i, j);
            }
          }
        } else {
          this.selectSeat(col, row);
        }
      }
    },
    nonBlockSelect(col, row) {
      // console.log("nonBlockTriggered");
      if (!this.blockSelection) {
        console.log("nonBlock - selectSeat triggered");
        this.selectSeat(col, row);
      }
    },
    // mark a specific seat for the ticket type
    selectSeat(col, row) {
      console.log("selectSeat triggered");
      var seat = this.$refs[`seat_${col}_${row}`];
      let status = seat[0].dataset.status;
      if (status != "occupied") {
        if (this.unselect) {
          if (status == "selected") {
            this.amountSelected -= 1;
            seat[0].dataset.status = "free";
            seat[0].style.backgroundColor = this.freeColor;
            seat[0].classList.remove("fungible");
          }
        } else if (status == "free") {
          this.amountSelected += 1;
          seat[0].dataset.status = "selected";
          seat[0].style.backgroundColor = this.color;
          // if (this.fungible) {
          //   seat[0].classList.add("fungible");
          // }
        }
      }
      this.last_selected = { x: col, y: row };
    },
    // mark a specific seat for temporary selection in the block selection
    markForSelection(col, row) {
      var seat = this.$refs[`seat_${col}_${row}`];
      if (seat[0].dataset.status != "occupied") {
        seat[0].classList.add("temporary-selected");
      }

      this.last_selected = { x: col, y: row };
    },
    // clear all temporary selections
    removeAllTempSelections() {
      for (let i = 1; i <= this.cols; i++) {
        for (let j = 1; j <= this.rows; j++) {
          var seat = this.$refs[`seat_${i}_${j}`];
          seat[0].classList.remove("temporary-selected");
          //this.last_selected = {x:col, y: row};
        }
      }
    },
    // mouse grid leave handler
    leaveGrid() {
      this.mouseDown = false;
      if (this.blockSelection) {
        this.mouseUpOnTile(this.last_selected.x, this.last_selected.y);
      }
    },
    // returns seat status: 'free', 'occupied'
    getSeatStatus(col, row) {
      var seat = this.$refs[`seat_${col}_${row}`];
      return seat[0].dataset.status;
    },
    // reset all selected but not yet assigned seats
    resetSelection() {
      for (let i = 1; i <= this.cols; i++) {
        for (let j = 1; j <= this.rows; j++) {
          var seat = this.$refs[`seat_${i}_${j}`];
          if (this.getSeatStatus(i, j) != "occupied") {
            seat[0].dataset.status = "free";
            seat[0].style.backgroundColor = this.freeColor;
          }
        }
      }
    },
    save() {
      // emit to parent type creation to add to list and display TicketTypeCard below
      // add selectedSeats to occupiedSeats list
      // empty selectedSeats
      let selectedSeats = [];
      for (let i = 1; i <= this.cols; i++) {
        for (let j = 1; j <= this.rows; j++) {
          var seat = this.$refs[`seat_${i}_${j}`];
          // if the seat is selected mark it occupied and add it to the list to emit to the parent.
          if (seat[0].dataset.status == "selected") {
            if (i > this.minColSize) {
              this.minColSize = i;
            }
            if (j > this.minRowSize) {
              this.minRowSize = j;
            }
            seat[0].dataset.status = "occupied";
            seat[0].style.backgroundColor = this.color;
            if (!this.isNF) {
              seat[0].classList.add("fungible");
            }
            selectedSeats.push(`${i}/${j}`);
          }
        }
      }
      console.log(JSON.stringify(selectedSeats));
      this.$emit("savetickettype", selectedSeats, this.color);
      this.increaseColorIndex();
      this.amountSelected = 0;
      /*
          selectedSeats is a list of x/y coordinates. it contains all seats in the venue that have been marked for the ticket to be created
          for NF tickets: create 1 ticket per selected seat, store on ipfs for each ticket: the x/y index in the grid, the ticket address itself
          for F tickets: the host can select how many tickets should be created for the selected standing area and the ticket type. Store on IPFS: list of all indices of the seats (for frontend display on guest client).  
           */
      //TODO: call SC to create tickets + store metadata on ipfs including ticket mapping
    },
    increaseColorIndex() {
      if (this.colorIndex == COLOR_ARRAY.length - 1) {
        this.colorIndex = 0;
      } else {
        this.colorIndex += 1;
      }
    }
  },
  computed: {
    color() {
      return COLOR_ARRAY[this.colorIndex];
    }
  },
  mounted() {
    console.log("SeatingPlan mounted called");
    this.$refs["cont"].style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    this.$refs["cont"].style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
    this.$root.$on("eventsFullyLoaded", () => {
      let event = getEvent(this.address);
      if (event != null) {
        this.setOccupiedSeats(event);
        //   this.nonFungibleOccupiedSeats = [].concat.apply(
        //     [],
        //     event.nonFungibleTickets.map(ticket => ticket.seatMapping)
        //   );
        // this.fungibleOccupiedSeats = [].concat.apply(
        //   [],
        //   event.fungibleTickets.map(ticket => ticket.seatMapping)
        // );
      }
    });
    let event = getEvent(this.address);
    if (event != null) {
      this.setOccupiedSeats(event);
      // console.log("event not null");
      // this.nonFungibleOccupiedSeats = [].concat.apply(
      //   [],
      //   event.nonFungibleTickets.map(ticket => ticket.seatMapping)
      // );
      // this.fungibleOccupiedSeats = [].concat.apply(
      //   [],
      //   event.fungibleTickets.map(ticket => ticket.seatMapping)
      // );
    }
  }
};
</script>

<style scoped>
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  margin-right: 2rem;
  margin-top: 1rem;
  cursor: pointer;
}
.btn-danger {
  background-color: #bf616a;
}
.btn-success {
  background-color: #a3be8c;
}
.radio-color.red {
  background-color: #bf616a;
}
.radio-color.yellow {
  background-color: #ebcb8b;
}
.radio-color.orange {
  background-color: #d08770;
}
.seating-container {
  width: max-content;
  display: grid;
}
.seat {
  background-color: #8fbcbb;
  border: 1px solid #ffffff;
  height: 100%;
  width: 20px;
}
.seat.fungible {
  border: none;
}
.legend .seat {
  display: inline-block;
  margin-right: 1rem;
  /* margin-bottom: 2px; */
  background-color: #8fbcbb;
  height: 20px;
  width: 20px;
}
.seat:hover {
  background-color: gray;
}
.seat.occupied {
  background-color: red;
}
.seat.selected {
  background-color: blue;
}
.seat.temporary-selected {
  background-color: #88c0d0 !important;
}
.size-container {
  display: flex;
  max-width: 300px;
}
</style>
