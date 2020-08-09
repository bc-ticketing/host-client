import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import getWeb3 from "../util/getWeb3";
import getIpfs from "../util/getIpfs";

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations: {
    // Blockchain
    addEventContract(state, event) {
      console.log("addEventContract Mutation being executed", event);
      state.events.push(event);
    },
    registerWeb3Instance(state, payload) {
      console.log("registerWeb3instance Mutation being executed", payload);
      state.web3.isInjected = payload.injectedWeb3;
      state.web3.web3Instance = payload;
      state.web3.networkId = payload.networkId;
      state.web3.account = payload.account;
      state.web3.balance = parseInt(payload.balance, 10);
      state.web3.eventFactory = payload.eventFactory;
      state.web3.identityContract = payload.identityContract;
    },
    // IPFS
    registerIpfsInstance(state, payload) {
      console.log("registerIpfsInstance Mutation being executed", payload)
      state.ipfs = payload;
    },
  },
  actions: {
    async registerIpfs({ commit }) {
      console.log("registerIpfs Action being executed");
      const ipfs = await getIpfs();
      console.log("committing result to registerIpfsInstance mutation");
      commit("registerIpfsInstance", ipfs);
    },
    async registerWeb3({ commit }) {
      console.log("registerWeb3 Action being executed");
      const web3 = await getWeb3();
      console.log("committing result to registerWeb3Instance mutation");
      commit("registerWeb3Instance", web3);
    },
  },
  modules: {},
});
