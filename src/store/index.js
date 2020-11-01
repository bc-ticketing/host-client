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
  // State
  state,

  // Mutations
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
    addNewEventsToStore(state, newEvents) {
      for (let i = 0; i < newEvents.length; i++) {
        state.events.push(newEvents[i]);
      }
    },
    addNewApproversToStore(state, newApprovers) {
      for (let i = 0; i < newApprovers.length; i++) {
        state.approvers.push(newApprovers[i]);
      }
    },

    // Only needed when using own ipfs instance.
    registerIpfsInstance(state, payload) {
      state.ipfsInstance = payload;
    }
  },

  // Actions
  actions: {
    /**
     * Register Web3 in the state.
     */
    async registerWeb3({ commit }) {
      const web3 = await getWeb3();
      commit("updateWeb3", web3);
    },

    /**
     * Pulls the current Web3 object and saves it in the store.
     */
    async updateWeb3({ commit }) {
      const web3 = await updateWeb3();
      commit("updateWeb3", web3);
    },

    /**
     * Creates the event factory contract instance and saves it in the store.
     */
    createEventFactory({ commit }) {
      const eventFactory = new state.web3.web3Instance.eth.Contract(
        EVENT_FACTORY_ABI,
        EVENT_FACTORY_ADDRESS
      );
      commit("setEventFactory", eventFactory);
    },

    /**
     * Creates the identity contract instance and saves it in the store.
     */
    createIdentity({ commit }) {
      const identity = new state.web3.web3Instance.eth.Contract(
        IDENTITY_ABI,
        IDENTITY_ADDRESS
      );
      commit("setIdentity", identity);
    },

    /**
     * Loads all newly created events since the last fetched block.
     * Stores all new events regardless whether the metadata could be fetched.
     * Uses the lastFetchedBlockEvents of the state.
     */
    async loadEvents({ commit }) {
      const currentBlock = state.web3.currentBlock;
      let newEvents = [];
      let newEvent;
      // Fetching register events that occured since last fetched block and store the events
      const creationEvents = await state.eventFactory.getPastEvents("EventCreated", {
        fromBlock: state.lastFetchedBlockEvents + 1
      });
      // Add all newly created events to the store and the db
      for (let i = 0; i < creationEvents.length; i++) {
        const address = creationEvents[i].returnValues[0];
        const eventContract = new state.web3.web3Instance.eth.Contract(
          EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
          address
        );
        const owner = await eventContract.methods.getOwner().call();
        if (state.web3.account == owner) {
          const inDb = await idb.getEvent(address); // whether this event is present in the db
          console.log("event inDb? " + inDb);
          if (!inDb) {
            console.log("event not in db - saving to db");
            newEvent = new Event(address);
            await newEvent.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
          } else {
            console.log("in db");
            newEvent = new Event(inDb);
            if (!newEvent.loadedMetadata) {
              await newEvent.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
            }
            if (newEvent.currency == 0) {
              await newEvent.loadCurrency(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
            }
          }
          await idb.saveEvent(newEvent);
          newEvents.push(newEvent);
        }
      }
      state.lastFetchedBlockEvents = currentBlock;
      commit("addNewEventsToStore", newEvents);
    },

    async updateMetadataOfExistingEvents({ commit }) {
      let events = [];
      for (let i = 0; i < state.events.length; i++) {
        const address = state.events[i].contractAddress;
        let inDb = await idb.getEvent(address);
        let event = new Event(inDb);
        let changed = await event.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
        console.log("updateMetadataOfExistingEvents");
        console.log(changed);
        if (!changed) {
          console.log("no changes to events metadata");
          return;
        }
        event.setLastFetchedBlockMetadata(state.web3.currentBlock);
        console.log("saving changes");
        await idb.saveEvent(event);
        events.push(event);
      }
      commit("addNewEventsToStore", events);
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

    // event area end
    // approver area start

    /**
     * Adds the null address as an IdentityApprover to the Store.
     * This is used to provide an instance for chosing no approver when creating
     * an event.
     * 
     * @param {*} param0 
     */
    async addNullAddressApproverToStore({ commit }) {
      console.log("adding null address approver to store")
      let approvers = [];
      let nullAddressApprover = new IdentityApprover(NULL_ADDRESS)
      nullAddressApprover.title = "No approver";
      approvers.push(nullAddressApprover);
      idb.saveApprover(nullAddressApprover);
      commit("addNewApproversToStore", approvers);
    },

    /**
     * Loads all newly registered approvers, since the last fetched block.
     * Uses the lastFetchedBlockApprovers of the state.
     * 
     * @param {*} param0 
     */
    async loadApprovers({ commit }) {
      const currentBlock = state.web3.currentBlock;
      let highestFetchedBlock = state.web3.currentBlock;
      let newApprovers = [];
      let newApprover;
      // Fetching register events that occured since the last fetched block and store the approvers
      const registerEvents = await state.identity.getPastEvents("ApproverRegistered", {
        fromBlock: state.lastFetchedBlockApprovers + 1
      });
      console.log("ApproverRegistered bc-events:")
      console.log(registerEvents);
      // Add all newly registered approvers to the store and the db
      for (let i = 0; i < registerEvents.length; i++) {
        console.log(registerEvents)
        let address = registerEvents[i].returnValues[0];
        if (registerEvents[i].blockNumber > highestFetchedBlock) {
          highestFetchedBlock = registerEvents[i].blockNumber;
        }
        const inDb = await idb.getApprover(address); // whether this approver is present
        console.log("approver inDb? " + inDb);
        console.log(state.identity)
        if (!inDb) {
          console.log("approver not in db - fetching approver data");
          newApprover = new IdentityApprover(address);
          await newApprover.loadMetadata(state.identity, IDENTITY_ABI, currentBlock);
        } else {
          console.log("approver in db");
          newApprover = new IdentityApprover(inDb);
          if (!newApprover.loadedMetadata) {
            await newApprover.loadMetadata(state.identity, IDENTITY_ABI, currentBlock);
          }
        }
        await idb.saveApprover(newApprover);
        newApprovers.push(newApprover);
      }
      state.lastFetchedBlockApprovers = highestFetchedBlock; // highestFetchedBlock is the highest block nr of the ApproverRegistered bc-events
      commit("addNewApproversToStore", newApprovers);
    },

    // approver area end
    // general area start

    /**
     * Only needed when using own ipfs instance.
     * 
     * @param {*} param0 
     */
    async registerIpfs({ commit }) {
      const ipfs = await getIpfs();
      commit("registerIpfsInstance", ipfs);
    }

    // general area end

    /* 
      Updates a specific event in the same manner as described in 'updateEvents'.
      This is used, e.g., when a user buys a ticket, in order to display
      the changes in ownership live, without reloading the page.
    */
    // async updateEvent({ commit }, address) {
    //   let event = state.events.find((e) => e.contractAddress === address);
    //   let fetch = await event.loadData(
    //     EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
    //     state.ipfsInstance,
    //     state.web3.web3Instance
    //   );
    //   if (fetch) {
    //     event.lastFetchedBlock = state.web3.currentBlock;
    //   }
    //   await idb.saveEvent(event);
    //   commit("updateEventStore", state.events);
    // }

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
  // }
  }
});
