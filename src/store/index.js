import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import getWeb3 from "../util/getWeb3";
import getIpfs from "../util/getIpfs";
import { Event } from "../util/event";

import { EVENT_FACTORY_ABI, EVENT_FACTORY_ADDRESS } from "../util/constants/EventFactory";
import { IDENTITY_ABI, IDENTITY_ADDRESS } from "../util/constants/Identity";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/constants/EventMintableAftermarketPresale";

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations: {
    updateWeb3(state, payload) {
      console.log("updateWeb3 Mutation being executed", payload);
      state.web3.isInjected = payload.injectedWeb3;
      state.web3.web3Instance = payload.web3Instance;
      state.web3.networkId = payload.networkId;
      state.web3.account = payload.account;
      state.web3.balance = parseInt(payload.balance, 10);
    },
    setIpfsInstance(state, payload) {
      console.log("registerIpfsInstance Mutation being executed", payload)
      state.ipfsInstance = payload;
    },
    setEventFactory(state, factory) {
      console.log("setting event factory");
      state.eventFactory = factory;
    },
    setIdentityContract(state, identity) {
      console.log("setting identity contract");
      state.identity = identity;
    },
    updateEventStore(state, events) {
      console.log("setting events");
      state.events = events;
      console.log(events);
      console.log(state.events.length);
    }
  },
  actions: {
    async registerIpfs({ commit }) {
      console.log("registerIpfs Action being executed");
      const ipfsInstance = await getIpfs();
      commit("setIpfsInstance", ipfsInstance);
    },
    async registerWeb3({ commit }) {
      console.log("registerWeb3 Action being executed");
      const web3 = await getWeb3();
      commit("updateWeb3", web3);
    },
    createEventFactory({ commit }) {
      console.log("createEventFactory Action being executed");
      const eventFactory = new state.web3.web3Instance.eth.Contract(
        EVENT_FACTORY_ABI,
        EVENT_FACTORY_ADDRESS
      );
      commit("setEventFactory", eventFactory);
    },
    createIdentityContract({ commit }) {
      console.log("createIdentityContract Action being executed");
      const identityContract = new state.web3.web3Instance.eth.Contract(
        IDENTITY_ABI,
        IDENTITY_ADDRESS
      );
      commit("setIdentityContract", identityContract);
    },
    async loadEvents({ commit }) {
      console.log("loadEvents action being executed");
      // load the owned event addresses
      let eventAddresses = await state.eventFactory.methods
        .getEvents()
        .call();
      let events = [];
      // filter the event addresses of the owned events of the current active account
      for (let i = 0; i < eventAddresses.length; i++) {
        let a = eventAddresses[i];
        try {
          let event = new Event(a);
          let owner = await event.getOwner(EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.web3.web3Instance);
          if (owner == state.web3.account) {
            await event.loadData(EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance, state.web3.web3Instance);
            events.push(event);
          }
        } catch {
          console.log("could not get metadata for event " + a + ".");
        }
        commit("updateEventStore", events);
      }
    },
    async loadFungibleTickets({ commit }) {
      console.log("loadFungibleTickets action being executed");
      for (let i = 0; i < state.events.length; i++) {
        let e = state.events[i];
        await e.loadFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
      }
    },
    async loadNonFungibleTickets({ commit }) {
      console.log("loadNonFungibleTickets action being executed");
      for (let i = 0; i < state.events.length; i++) {
        let e = state.events[i];
        await e.loadNonFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
      }
    }
  }
});
