import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Events from "../views/Events.vue"
import NewEvent from "../views/NewEvent.vue"
import TicketsOfEvent from "../views/TicketsOfEvent.vue"
import NewTicket from "../views/NewTicket.vue"
import ModifyEvent from "../views/ModifyEvent.vue"

Vue.use(VueRouter);

const routes = [
  {
    path: "/home",
    name: "home",
    component: Home
  },
  {
    path: "/",
    name: "Events",
    component: Events
  },
  {
    path: "/new-event",
    name: "NewEvent",
    component: NewEvent
  },
  {
    path: "/tickets",
    name: "Tickets",
    component: TicketsOfEvent
  },
  {
    path: "/new-ticket",
    name: "NewTicket",
    component: NewTicket
  },
  {
    path: "/modify",
    name: "ModifyEvent",
    component: ModifyEvent
  },
];

const router = new VueRouter({
  routes,
});

export default router;
