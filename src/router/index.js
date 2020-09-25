import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Events from "../views/Events.vue"
import NewEvent from "../views/NewEvent.vue"
import NewTicket from "../views/NewTicket.vue"
import ApproverRegister from "../views/ApproverRegister.vue"
import ApproveIdentity from "../views/ApproveIdentity.vue"

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
    path: "/new-ticket",
    name: "NewTicket",
    component: NewTicket
  },
  {
    path: "/register",
    name: "ApproverRegister",
    component: ApproverRegister
  },
  {
    path: "/approve",
    name: "ApproveIdentity",
    component: ApproveIdentity
  }
];

const router = new VueRouter({
  routes,
});

export default router;
