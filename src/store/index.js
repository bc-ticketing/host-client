import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import getWeb3 from "../util/getWeb3";
import getIpfs from "../util/getIpfs";
import { Event } from "../util/event";
import { FungibleTicketType, NonFungibleTicketType, NonFungibleTicket } from "../util/tickets";

import { argsToCid } from "idetix-utils";
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
    // setEventAddresses(state, addresses) {
    //   console.log("setting event addresses");
    //   state.eventAddresses = addresses;
    // },
    updateEventStore(state, events) {
      console.log("setting events");
      state.events = events;
      console.log(events);
      console.log(state.events.length);
    }
    // addEventMetadata(state, event) {
    //   console.log("setting event metadata");
    //   console.log(event);
    //   console.log(state.events);
    //   state.events[event.contractAddress].metadata = event.metadata;
    // }
  },
  actions: {
    // async loadIpfsEventMetadata({ commit }) {
    //   console.log("loadIpfsEventMetadata Action being executed");
    //   for (const contract_address in state.events) {
    //     console.log("load metadata for: " + contract_address);
    //     const e = state.events[contract_address];
    //     try {
    //       var ipfsData = null;
    //       for await (const chunk of state.ipfsInstance.cat(e.ipfsHash, {
    //         timeout: 2000
    //       })) {
    //         ipfsData = Buffer(chunk, "utf8").toString();
    //       }
    //       var temp = {
    //         ipfsHash: e.ipfsHash,
    //         contractAddress: contract_address,
    //         metadata: JSON.parse(ipfsData)
    //       };
    //       console.log(temp);
    //       commit("addEventMetadata", temp);
    //     } catch (error) {
    //       if (error.name == "TimeoutError") {
    //         console.log("timeout while fetching ipfs metadata");
    //       }
    //       console.log(error);
    //     }
    //   }
    // },
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
        // let eventContract = new state.web3.web3Instance.eth.Contract(
        //   EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
        //   a
        // );
        // let owner = await eventContract.methods.getOwner().call();
        // if (owner == state.web3.account) {
        //   let ipfsHash = eventContract.methods.getIpfs().call();
        //   let event = new Event(a, ipfsHash);
        //   event.loadIPFSMetadata(state.ipfsInstance);
        //   event.loadFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
        //   event.loadNonFungibleTickets(state.web3.web3Instance, EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI, state.ipfsInstance);
        //   ownedEvents.push(event);
        // }
        // }
        commit("updateEventStore", events);
      }
    }
    // async loadEvents({ commit }) {
    //   console.log("loadEvents Action being executed");
    //   var ipfsHashes = {};
    //   for (let i = 0; i < state.eventAddresses.length; i++) {
    //     var addr = state.eventAddresses[i];
    //     try {
    //       const eventContract = new state.web3.web3Instance.eth.Contract(
    //         EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
    //         addr
    //       );
    //       const eventMetadata = await eventContract.getPastEvents("EventMetadata", {
    //         fromBlock: 1
    //       });
    //       var metadataObject = eventMetadata[0].returnValues;
    //       ipfsHashes[addr] = {
    //         address: addr,
    //         ipfsHash: argsToCid(
    //           metadataObject.hashFunction,
    //           metadataObject.size,
    //           metadataObject.digest
    //         )
    //       }
    //     } catch {
    //       console.log("could not get metadata for event");
    //     }
    //   }
    //   commit("setEvents", ipfsHashes);
    //   // following used before
    //   // const web3 = await getWeb3();
    //   // const eventAddresses = await web3.eventFactory.methods
    //   //   .getEvents()
    //   //   .call();
    //   // var i;
    //   // var events = [];
    //   // for (i = 0; i < eventAddresses.length; i++) {
    //   //   var eventInstance = new web3.web3Instance.eth.Contract(
    //   //     EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI,
    //   //     eventAddresses[i]
    //   //   );
    //   //   console.log(eventInstance);
    //   //   var owner = await eventInstance.methods.getOwner().call();
    //   //   // if a non-active address should be used,
    //   //   //  `web3.account` should be replaced accordingly in the following condition.
    //   //   if (web3.account == owner) {
    //   //     events.push(eventInstance);
    //   //   }
    //   // }
    //   // console.log("commiting result to registerEventList mutation");
    //   // commit("setEvents", events);
    // }
  }
});
