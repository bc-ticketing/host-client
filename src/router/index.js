import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/events",
    name: "Events",
    component: () => import("../views/Events.vue"),
  },
  {
    path: "/ticket",
    name: "Tickets",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/Tickets.vue"),
  },
  {
    path: "/modify",
    name: "ModifyEvent",
    component: () => import("../views/ModifyEvent.vue"),
  }
];

const router = new VueRouter({
  routes,
});

export default router;
