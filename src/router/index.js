import Vue from "vue";
import VueRouter from "vue-router";
import Dashboard from "../views/Dashboard.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/create",
    name: "NewEvent",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/NewEvent.vue"),
  },
  {
    path: "/modify",
    name: "ModifyEvent",
    component: () => import("../views/ModifyEvent.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
