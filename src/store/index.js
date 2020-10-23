import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";
import getIpfs from "../util/getIpfs";
import { Event } from "../util/event";

import { EVENT_FACTORY_ABI, EVENT_FACTORY_ADDRESS } from "../util/abi/EventFactory";
import { IDENTITY_ABI, IDENTITY_ADDRESS } from "../util/abi/Identity";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/abi/EventMintableAftermarketPresale";
import { IdentityApprover } from "../util/identity";
import idb from "./../util/db/idb";

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  mutations: {
    updateWeb3(state, web3) {
      state.web3.isInjected = web3.injectedWeb3;
      state.web3.web3Instance = web3.web3Instance;
      state.web3.networkId = web3.networkId;
      state.web3.account = web3.account;
      state.web3.balance = parseInt(web3.balance, 10);
      state.web3.currentBlock = web3.currentBlock;
    },
    setEventFactory(state, factory) {
      state.eventFactory = factory;
    },
    setIdentity(state, identity) {
      state.identity = identity;
    },
    updateEventStore(state, events) {
      state.events = events;
    },
    registerIpfsInstance(state, payload) {
      state.ipfsInstance = payload;
    }
  },
  actions: {
    async registerIpfs({ commit }) {
      const ipfs = await getIpfs();
      commit("registerIpfsInstance", ipfs);
    },
    async registerWeb3({ commit }) {
      const web3 = await getWeb3();
      commit("updateWeb3", web3);
    },
    /* pulls the current web3 object and updates the store with it */
    async updateWeb3({ commit }) {
      const web3 = await updateWeb3();
      commit("updateWeb3", web3);
    },
    createEventFactory({ commit }) {
      const eventFactory = new state.web3.web3Instance.eth.Contract(
        EVENT_FACTORY_ABI,
        EVENT_FACTORY_ADDRESS
      );
      commit("setEventFactory", eventFactory);
    },
    createIdentity({ commit }) {
      const identity = new state.web3.web3Instance.eth.Contract(
        IDENTITY_ABI,
        IDENTITY_ADDRESS
      );
      commit("setIdentity", identity);
    },

    /* 
      Loads all events from the IDB and Blockchain.
      First gets all the event addresses from the eventFactory Smart contract.
      Then checks for each address if there is a record in the DB.
      If there is a record, checks with the 'lastFetchedBlock' if any updates 
      are needed (metadata, tickets, ticketMetadata, aftermarket listings, etc.)
      and fetches the updates if needed.
      If there is no record, creates one and fetches all information from block 1.
      finally stores/updates the event in the IDB and puts it into 
      the state.
    */
    async loadEvents({ commit }) {
      const eventAddresses = await state.eventFactory.methods
        .getEvents()
        .call();
      let events = [];
      // filter the event addresses of the owned events of the current active account
      for (let i = 0; i < eventAddresses.length; i++) {
        const address = eventAddresses[i];
        const eventContract = new state.web3.web3Instance.eth.Contract(
          EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
          address
        );
        const owner = await eventContract.methods.getOwner().call();

        if (state.web3.account == owner) {
          const inStore = await idb.getEvent(address); // whether this event is present
          let event;
          console.log("loading event; " + address);
          if (!inStore) {
            console.log("not in store");
            event = new Event(address);
            await event.loadIdentityData(
              // load the data
              EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
              state.web3.web3Instance
            );
          } else {
            console.log("in store");
            event = new Event(inStore);
          }
          console.log("loading event data");
          let fetch = await event.loadData(
            EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
            state.ipfsInstance,
            state.web3.web3Instance
          );
          console.log("loaded event data");
          if (fetch) {
            event.lastFetchedBlock = state.web3.currentBlock;
          }
          console.log("saving event data");
          await idb.saveEvent(event);
          console.log("saved event data");
          events.push(event);
        }
      }
      commit("updateEventStore", events);
    },
    async loadApprovers({ commit }) {
      let approvers = [];
      for (const event of state.events) {
        const approverAddress = event.identityContractAddress;
        console.log(approverAddress);
        const inStore = await idb.getApprover(approverAddress);
        let approver;
        if (inStore) {
          approver = new IdentityApprover(inStore);
          approver.requestUrlVerification();
          approver.requestTwitterVerification();
        } else {
          approver = new IdentityApprover(approverAddress);
          await approver.loadData(state.identity, state.ipfsInstance);
        }
        await idb.saveApprover(approver);
        approvers.push(approver);
      }
      commit("updateApproverStore", approvers);
    },
    /* 
      Updates a specific event in the same manner as described in 'updateEvents'.
      This is used, e.g., when a user buys a ticket, in order to display
      the changes in ownership live, without reloading the page.
    */
    async updateEvent({ commit }, address) {
      let event = state.events.find((e) => e.contractAddress === address);
      let fetch = await event.loadData(
        EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
        state.ipfsInstance,
        state.web3.web3Instance
      );
      if (fetch) {
        event.lastFetchedBlock = state.web3.currentBlock;
      }
      await idb.saveEvent(event);
      commit("updateEventStore", state.events);
    }

    // async loadFungibleTickets({ commit }) {
    //   for (let i = 0; i < state.events.length; i++) {
    //     let e = state.events[i];
    //     await e.loadFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
    //   }
    // },
    // async loadNonFungibleTickets({ commit }) {
    //   for (let i = 0; i < state.events.length; i++) {
    //     let e = state.events[i];
    //     await e.loadNonFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
    //   }
    // }
  }
});
