// todo: set supply to nr of boxes when non-fungible is active
// todo: 
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
          @click="selectSeat(col, row)"
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
import getEvent from "../util/utility";
/* This view is a demo for our seating plan generator, which will be used in the host client to let an event host generate somewhat accurate, yet arbitrary, seating plans for their venue. 
    The code will also be adapted and used in the guest client for displaying which seats are available for purchase to a customer.
 */

export default {
  name: "SeatingPlan",
  data() {
    return {
      selectedSeats: [],
      rows: 12,
      cols: 12,
      minRowSize: 0,
      minColSize: 0,
      blockSelection: false,
      selection_start: { x: 0, y: 0 },
      last_selected: { x: 0, y: 0 },
      color: "#B48EAD",
      emptyColor: "#8fbcbb",
      occupiedColor: "#4c566a",
      stageColor: "#d8dee9",
      mouseDown: false,
      seatingObject: {
        rows: 0,
        cols: 0,
        assignedSeats: []
      },
      occupiedSeats: []
    };
  },
  props: { address: String },
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
    occupiedSeats: function(val) {
      if (val.length > 0) {
        this.fetchAndUpdateGrid();
        window.setTimeout(() => {
          this.setUsedSeats();
        }, 500);
        // this.setUsedSeats();
      }
    }
  },
  methods: {
    fetchAndUpdateGrid() {
      var i;
      var max_x = this.cols;
      var max_y = this.rows;
      for (i = 0; i < this.occupiedSeats.length; i++) {
        let cords = this.occupiedSeats[i].split("/");
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
    setUsedSeats() {
      var i;
      for (i = 0; i < this.occupiedSeats.length; i++) {
        let cords = this.occupiedSeats[i].split("/");
        var seat = this.$refs[`seat_${cords[0]}_${cords[1]}`];
        seat[0].dataset.status = "occupied";
        seat[0].style.backgroundColor = this.occupiedColor;
        this.selectedSeats.push(`${cords[0]}/${cords[1]}`);
        // console.log(cords[0] + "/" + cords[1]);
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
      this.mouseDown = true;
      if (this.blockSelection) {
        this.selection_start = { x: col, y: row };
      } else {
        this.selectSeat(col, row);
      }
    },
    // mouse release handler, check if we are doing block selection to select all tiles within the rectangle spaned by the starting and the releasing point
    mouseUpOnTile(col, row) {
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
    // mark a specific seat for the ticket type
    selectSeat(col, row) {
      var seat = this.$refs[`seat_${col}_${row}`];
      if (seat[0].dataset.status != "occupied") {
        seat[0].dataset.status = "selected";
        if (this.fungible) {
          seat[0].classList.add("fungible");
        }
        seat[0].style.backgroundColor = this.color;
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
            seat[0].style.backgroundColor = this.emptyColor;
          }
        }
      }
    },
    // TODO Michael: finish implementations with SC calls and IPFS uploads for host client
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
            seat[0].style.backgroundColor = this.occupiedColor;
            selectedSeats.push(`${i}/${j}`);
          }
        }
      }
      console.log(JSON.stringify(selectedSeats));
      this.$emit("savetickettype", selectedSeats);
      /*
          selectedSeats is a list of x/y coordinates. it contains all seats in the venue that have been marked for the ticket to be created
          for NF tickets: create 1 ticket per selected seat, store on ipfs for each ticket: the x/y index in the grid, the ticket address itself
          for F tickets: the host can select how many tickets should be created for the selected standing area and the ticket type. Store on IPFS: list of all indices of the seats (for frontend display on guest client).  
           */
      //TODO: call SC to create tickets + store metadata on ipfs including ticket mapping
    }
  },
  mounted() {
    console.log("SeatingPlan mounted called");
    this.$refs["cont"].style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    this.$refs["cont"].style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
    this.$root.$on("eventsFullyLoaded", () => {
      let event = getEvent(this.address);
      if (event != null) {
        console.log("event not null");
        this.occupiedSeats = [].concat.apply(
          [],
          event.fungibleTickets.map(ticket => ticket.seatMapping)
        );
      }
    });
    let event = getEvent(this.address);
    if (event != null) {
      this.occupiedSeats = [].concat.apply(
        [],
        event.fungibleTickets.map(ticket => ticket.seatMapping)
      );
    }
    // nftickettype.tickets.map(ticket => ticket.seatMapping);

    // this.occupiedSeats =
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
  grid-gap: 2px;
}
.seat {
  margin-bottom: 2px;
  background-color: #8fbcbb;
  height: 100%;
  width: 20px;
}
.seat.fungible {
  transform: scale(1.06);
}
.legend .seat {
  display: inline-block;
  margin-right: 1rem;
  margin-bottom: 2px;
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
