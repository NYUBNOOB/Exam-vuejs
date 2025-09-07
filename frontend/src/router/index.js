import { createRouter, createWebHistory } from "vue-router";
import login from "../components/login.vue";
import deposit from "../components/deposit.vue";
import transaction from "../components/transaction.vue";

const routes = [
  { path: "/", component: login },
  { path: "/deposit", component: deposit,  },
  { path: "/transaction", component: transaction, },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
