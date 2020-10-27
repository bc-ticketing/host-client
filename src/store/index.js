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
import { NULL_ADDRESS } from "../util/constants/constants";

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
    updateEventDataInStore(state, {index, updatedEvent}) {
      state.events[index] = updatedEvent;
    },
    updateApproverStore(state, approvers) {
      state.approvers = approvers;
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

    async updateMetadataOfExistingEvents({ commit }) {
      let events = [];
      for (let i = 0; i < state.events.length; i++) {
        const address = state.events[i].contractAddress;
        let inDb = await idb.getEvent(address);
        let event = new Event(inDb);
        await event.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
        event.setLastFetchedBlockMetadata(state.web3.currentBlock);
        await idb.saveEvent(event);
        events.push(event);
      }
      commit("updateEventStore", events);
    },

    async loadTicketsOfExistingEvent({ commit }, address) {
      console.log("loadTickets action executed");
      let events = [];
      for (let i = 0; i < state.events.length; i++) {
        if (state.events[i].contractAddress == address) {
          let inDb = await idb.getEvent(address);
          let event = new Event(inDb);
          await event.loadTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
          event.setLastFetchedBlockTickets(state.web3.currentBlock);
          await idb.saveEvent(event);
          events.push(event);
        } else {
          let inDb = await idb.getEvent(address);
          let event = new Event(inDb);
          events.push(event);
        }
      }
      commit("updateEventStore", events);
    },

    async loadAftermarketOfExistingEvent({ commit }, address) {
      console.log("loadAftermarket action executed");
      let events = [];
      for (let i = 0; i < state.events.length; i++) {
        if (state.events[i].contractAddress == address) {
          let inDb = await idb.getEvent(address);
          let event = new Event(inDb);
          await event.loadAftermarket(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
          event.setLastFetchedBlockAftermarket(state.web3.currentBlock);
          await idb.saveEvent(event);
          events.push(event);
        } else {
          let inDb = await idb.getEvent(address);
          let event = new Event(inDb);
          events.push(event);
        }
      }
      commit("updateEventStore", events);
    },

    // Loads events and its metadata
    // Loads only events that are newly created since the last time checked
    async loadNewEvents({ commit }){
      let events = [];
      let event;
      // adding events that are already in the store to the list
      for (let i = 0; i < state.events.length; i++) {
        event = state.events[i];
        await idb.saveEvent(event);
        events.push(event);
      }
      // Fetching register events that occured since last fetched block and store the events
      const creationEvents = await state.eventFactory.getPastEvents("EventCreated", {
        fromBlock: state.lastFetchedBlockEvents + 1
      });
      // update last fetched block for events
      state.lastFetchedBlockEvents = state.web3.currentBlock;
      // add all newly created events to the store and the db
      for (let i = 0; i < creationEvents.length; i++) {
        const address = creationEvents[i].returnValues[0];
        const eventContract = new state.web3.web3Instance.eth.Contract(
          EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
          address
        );
        const owner = await eventContract.methods.getOwner().call();

        if (state.web3.account == owner) {
          const inDb = await idb.getEvent(address); // whether this event is present in the db
          if (!inDb) {
            console.log("event not in db - saving to db");
            event = new Event(address);
            await event.loadIPFSMetadata();
          } else {
            event = new Event(inDb)
          }
          await event.loadCurrency(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
          await idb.saveEvent(event);
          events.push(event);
        }
      }
      console.log(events);
      commit("updateEventStore", events);
    },

    async addNullAddressApproverToStore({ commit }) {
      console.log("adding null address approver to store")
      let approvers = [];
      let nullAddressApprover = new IdentityApprover(NULL_ADDRESS)
      nullAddressApprover.title = "No approver";
      approvers.push(nullAddressApprover)
      commit("updateApproverStore", approvers);
    },

    async loadApprovers({ commit }) {
      let approvers = [];
      // adding approvers that are already in the store to the list
      for (let i = 0; i < state.approvers.length; i++) {
        let approver = state.approvers[i];
        await idb.saveApprover(approver);
        approvers.push(approver);
      }
      // Fetching register events that occured since the last fetched block and store the approvers
      const registerEvents = await state.identity.getPastEvents("ApproverRegistered", {
        fromBlock: state.lastFetchedBlockApprovers + 1
      });
      // update last fetched block for approvers
      state.lastFetchedBlockApprovers = state.web3.currentBlock;
      // add all newly registered approvers to the store and the db
      for (let i = 0; i < registerEvents.length; i++) {
        let registerEvent = registerEvents[i];
        let address = registerEvent.returnValues.approverAddress;
        const inStore = await idb.getApprover(address); // whether this approver is present
        let approver;
        if (!inStore) {
          console.log("approver not in store - fetching approver data");
          approver = new IdentityApprover(address);
          await approver.loadData(state.identity, state.ipfsInstance);
        } else {
          approver = new IdentityApprover(inStore);
        }
        await idb.saveApprover(approver);
        approvers.push(approver);
        console.log("added " + approver.title)
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
