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
import { NULL_ADDRESS, STARTING_BLOCK } from "../util/constants/constants";

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
    CLEAR_EVENTS(state) {
      state.lastFetchedBlockEvents = STARTING_BLOCK;
      state.events = [];
      console.log("CLEAR_EVENTS mutation executed");
    }
  },

  // Actions
  actions: {
    async loadMetadataUpdatesOfEvent({ commit }, address) {
      console.log("action loadMetadataUpdatesOfEvent");
      const currentBlock = state.web3.currentBlock;
      const inDb = await idb.getEvent(address); // whether this event is present in the db
      let event;
      let loadedMetadata;
      if (!inDb) {
        console.log("event not in db - saving to db");
        event = new Event(address);
        loadedMetadata = await event.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
      } else {
        console.log("in db");
        event = new Event(inDb);
        loadedMetadata = await event.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
      }
      if (!loadedMetadata) {
        await event.verify();
      }
      if (event) {
        console.log("saving following event to db");
        await idb.saveEvent(event);
        console.log("saved event to db");
        commit("UPDATE_EVENT_IN_STORE", event);
      }
    },

    async loadMaxTicketsChange({ commit }, address) {
        console.log("action loadMaxTicketsChange");
        const currentBlock = state.web3.currentBlock;
        const inDb = await idb.getEvent(address); // whether this event is present in the db
        let event;
        if (!inDb) {
          console.log("event not in db - saving to db");
          event = new Event(address);
          await event.loadMaxTicketsPerPerson(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
        } else {
          console.log("in db");
          event = new Event(inDb);
          await event.loadMaxTicketsPerPerson(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
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

    async clearEvents({ commit }) {
      commit("CLEAR_EVENTS");
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
      console.log(creationEvents);
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
            console.log("setting owner", owner);
            newEvent.owner = owner;
            await newEvent.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
            await newEvent.loadCurrency(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
            await newEvent.loadIdentityData(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
            await newEvent.loadMaxTicketsPerPerson(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
          } else {
            console.log("in db");
            newEvent = new Event(inDb);
            console.log("setting owner", owner);
            await newEvent.loadCurrency(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
            await newEvent.loadIdentityData(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
            await newEvent.loadMaxTicketsPerPerson(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI);
            await newEvent.loadMetadata(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
          }
          await idb.saveEvent(newEvent);
          newEvents.push(newEvent);
        }
      }
      state.lastFetchedBlockEvents = currentBlock;
      if (newEvents.length > 0) {
        console.log("new events found - committing ADD_EVENTS_TO_STORE mutation");
        commit("ADD_EVENTS_TO_STORE", newEvents);
      }
    },

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
      } else {
        console.log("in db");
        event = new Event(inDb);
      }
      if (event) {
        await event.loadTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, currentBlock);
        await idb.saveEvent(event);
        commit("UPDATE_EVENT_IN_STORE", event);
      }
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
      let newApprovers = [];
      let newApprover;
      // Fetching register events that occured since the last fetched block and store the approvers
      const registerEvents = await state.identity.getPastEvents("ApproverRegistered", {
        fromBlock: state.lastFetchedBlockApprovers + 1
      });
      // Add all newly registered approvers to the store and the db
      for (let i = 0; i < registerEvents.length; i++) {
        const address = registerEvents[i].returnValues[0];
        // if (registerEvents[i].blockNumber > highestFetchedBlock) {
        //   highestFetchedBlock = registerEvents[i].blockNumber;
        // }
        const inDb = await idb.getApprover(address); // whether this approver is present
        console.log("approver inDb? " + inDb);
        if (!inDb) {
          console.log("approver not in db - fetching approver data");
          newApprover = new IdentityApprover(address);
          await newApprover.loadMetadata(state.identity, currentBlock);
        } else {
          console.log("approver in db");
          newApprover = new IdentityApprover(inDb);
          if (!newApprover.loadedMetadata) {
            await newApprover.loadMetadata(state.identity, currentBlock);
          }
        }
        await idb.saveApprover(newApprover);
        newApprovers.push(newApprover);
      }
      state.lastFetchedBlockApprovers = currentBlock;
      if (newApprovers.length > 0) {
        commit("ADD_APPROVERS_TO_STORE", newApprovers, currentBlock);
      }
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
  }
});
