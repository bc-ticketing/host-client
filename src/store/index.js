import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import { getWeb3, updateWeb3 } from "../util/getWeb3";
import getIpfs from "../util/getIpfs";
import { Event } from "../util/event";
import sleep from "await-sleep";

import { EVENT_FACTORY_ABI, EVENT_FACTORY_ADDRESS } from "../util/abi/EventFactory";
import { IDENTITY_ABI, IDENTITY_ADDRESS } from "../util/abi/Identity";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "../util/abi/EventMintableAftermarketPresale";
import { IdentityApprover } from "../util/identity";
import idb from "./../util/db/idb";
import { NULL_ADDRESS } from "../util/constants/constants";
import { SellOrderFungiblePlaced } from "../util/blockchainEventHandler";

Vue.use(Vuex);

export default new Vuex.Store({
  // State
  state,

  // Mutations
  mutations: {
    UPDATE_WEB3(state, web3) {
      state.web3.isInjected = web3.injectedWeb3;
      state.web3.web3Instance = web3.web3Instance;
      state.web3.networkId = web3.networkId;
      state.web3.account = web3.account;
      state.web3.balance = parseInt(web3.balance, 10);
      state.web3.currentBlock = web3.currentBlock;
    },
    SET_EVENT_FACTORY(state, factory) {
      state.eventFactory = factory;
    },
    SET_IDENTITY(state, identity) {
      state.identity = identity;
    },
    ADD_EVENTS_TO_STORE(state, newEvents) {
      for (let i = 0; i < newEvents.length; i++) {
        state.events.push(newEvents[i]);
      }
    },
    ADD_APPROVERS_TO_STORE(state, newApprovers) {
      for (let i = 0; i < newApprovers.length; i++) {
        state.approvers.push(newApprovers[i]);
      }
    },
    UPDATE_EVENT_IN_STORE(state, payload) {
      console.log("starting UPDATE_EVENT_IN_STORE");
      const events = state.events;
      const index = events.indexOf(events.find(e => e.contractAddress === payload.contractAddress));
      // mutate events by replacing the event with the updated event object
      if (index != -1) {
        state.events.splice(index, 1, payload);
      }
      console.log("ending UPDATE_EVENT_IN_STORE");
    },

    // Only needed when using own ipfs instance.
    REGISTER_IPFS(state, payload) {
      state.ipfsInstance = payload;
    }
  },

  // Actions
  actions: {
    async loadMetadataUpdatesOfEvent({ commit }, address) {
      console.log("action loadMetadataUpdatesOfEvent");
      const currentBlock = state.web3.currentBlock;
      const inDb = await idb.getEvent(address); // whether this event is present in the db
      let event;
      if (!inDb) {
        console.log("event not in db - saving to db");
        event = new Event(address);
        await event.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
      } else {
        console.log("in db");
        event = new Event(inDb);
        await event.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
      }
      if (event) {
        console.log("saving following event to db");
        await idb.saveEvent(event);
        console.log("saved event to db");
        commit("UPDATE_EVENT_IN_STORE", event);
      }
    },
    /**
     * Register Web3 in the state.
     */
    async registerWeb3({ commit }) {
      const web3 = await getWeb3();
      commit("UPDATE_WEB3", web3);
    },

    /**
     * Pulls the current Web3 object and saves it in the store.
     */
    async updateWeb3({ commit }) {
      const web3 = await updateWeb3();
      commit("UPDATE_WEB3", web3);
    },

    /**
     * Creates the event factory contract instance and saves it in the store.
     */
    createEventFactory({ commit }) {
      const eventFactory = new state.web3.web3Instance.eth.Contract(
        EVENT_FACTORY_ABI,
        EVENT_FACTORY_ADDRESS
      );
      commit("SET_EVENT_FACTORY", eventFactory);
    },

    /**
     * Creates the identity contract instance and saves it in the store.
     */
    createIdentity({ commit }) {
      const identity = new state.web3.web3Instance.eth.Contract(
        IDENTITY_ABI,
        IDENTITY_ADDRESS
      );
      commit("SET_IDENTITY", identity);
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
      commit("ADD_EVENTS_TO_STORE", newEvents);
    },

    // async updateMetadataOfExistingEvents({ commit }) {
    //   let events = [];
    //   for (let i = 0; i < state.events.length; i++) {
    //     const address = state.events[i].contractAddress;
    //     let inDb = await idb.getEvent(address);
    //     let event = new Event(inDb);
    //     let changed = await event.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
    //     console.log("updateMetadataOfExistingEvents");
    //     console.log(changed);
    //     if (!changed) {
    //       console.log("no changes to events metadata");
    //       return;
    //     }
    //     event.setLastFetchedBlockMetadata(state.web3.currentBlock);
    //     console.log("saving changes");
    //     await idb.saveEvent(event);
    //     events.push(event);
    //   }
    //   commit("ADD_EVENTS_TO_STORE", events);
    // },

    /**
     * Loads all tickets of an event and their metadata.
     * 
     * @param {String} address the contract address from which to load the tickets.
     */
    async loadTicketsOfEvent({ commit }, address) {
      console.log("loadTickets action executed for event contract address: " + address);
      const currentBlock = state.web3.currentBlock;
      const inDb = await idb.getEvent(address);
      let event;
      if (!inDb) {
        console.log("event not in db - saving to db");
        event = new Event(address);
        await event.loadTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
      } else {
        console.log("in db");
        event = new Event(inDb);
        await event.loadTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
      }
      if (event) {
        await idb.saveEvent(event);
        commit("UPDATE_EVENT_IN_STORE", event);
      }
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
      commit("ADD_APPROVERS_TO_STORE", approvers);
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
      commit("ADD_APPROVERS_TO_STORE", newApprovers);
    },

    // approver area end
    // general area start

    /**
     * Only needed when using own ipfs instance.
     */
    async registerIpfs({ commit }) {
      const ipfs = await getIpfs();
      commit("REGISTER_IPFS", ipfs);
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
