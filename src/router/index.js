import Vue from "vue";
import VueRouter from "vue-router";
import Events from "../views/Events.vue"
import Summary from "../views/Summary.vue"
import NewEvent from "../views/NewEvent.vue"
import ApproverRegister from "../views/ApproverRegister.vue"
import ApproveIdentity from "../views/ApproveIdentity.vue"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Events",
    component: Events
  },
  {
    path: "/summary",
    name: "Summary",
    component: Summary
  },
  {
    path: "/new-event",
    name: "NewEvent",
    component: NewEvent
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
