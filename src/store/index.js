import Vue from "vue";
import Vuex from "vuex";
import state from "./state";
import getWeb3 from "../util/getWeb3";
import getIpfs from "../util/getIpfs";
import { argsToCid } from "idetix-utils";
import { EVENT_FACTORY_ABI, EVENT_FACTORY_ADDRESS } from "../constants/EventFactory";
import { IDENTITY_ABI, IDENTITY_ADDRESS } from "../constants/Identity";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "../constants/EventMintableAftermarket";

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
    setEventFactory(state, factory) {
      console.log("setting event factory");
      state.eventFactory = factory;
    },
    setIdentityContract(state, identity) {
      console.log("setting identity contract");
      state.identity = identity;
    },
    setEventAddresses(state, addresses) {
      console.log("setting event addresses");
      state.eventAddresses = addresses;
    },
    setEvents(state, events) {
      console.log("setting events");
      state.events = events;
    },
    addEventMetadata(state, event) {
      console.log("setting event metadata");
      console.log(event);
      console.log(state.events);
      state.events[event.contractAddress].metadata = event.metadata;
    },
    registerIpfsInstance(state, payload) {
      console.log("registerIpfsInstance Mutation being executed", payload)
      state.ipfsInstance = payload;
    }
  },
  actions: {
    async loadIpfsEventMetadata({ commit }) {
      console.log("loadIpfsEventMetadata Action being executed");
      for (const contract_address in state.events) {
        console.log("load metadata for: " + contract_address);
        const e = state.events[contract_address];
        try {
          var ipfsData = null;
          for await (const chunk of state.ipfsInstance.cat(e.ipfs_hash, {
            timeout: 2000
          })) {
            ipfsData = Buffer(chunk, "utf8").toString();
          }
          var temp = {
            ipfsHash: e.ipfs_hash,
            contractAddress: contract_address,
            metadata: JSON.parse(ipfsData)
          };
          console.log(temp);
          commit("addEventMetadata", temp);
        } catch (error) {
          if (error.name == "TimeoutError") {
            console.log("timeout while fetching ipfs metadata");
          }
          console.log(error);
        }
      }
    },

    async registerIpfs({ commit }) {
      console.log("registerIpfs Action being executed");
      const ipfs = await getIpfs();
      console.log("committing result to registerIpfsInstance mutation");
      commit("registerIpfsInstance", ipfs);
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
    async loadEventAddresses({ commit }) {
      console.log("loadEventAddresses action being executed");
      const allEventAddresses = await state.eventFactory.methods
        .getEvents()
        .call();
      var eventAddresses = [];
      for (let i = 0; i < allEventAddresses.length; i++) {
        var a = allEventAddresses[i];
        var eventContract = new state.web3.web3Instance.eth.Contract(
          EVENT_MINTABLE_AFTERMARKET_ABI,
          a
        );
        var owner = await eventContract.methods.getOwner().call();
        if (state.web3.account == owner) {
          eventAddresses.push(a);
        }
      }
      commit("setEventAddresses", eventAddresses);
    },
    async loadEvents({ commit }) {
      console.log("loadEvents Action being executed");
      var ipfs_hashes = {};
      for (let i = 0; i < state.eventAddresses.length; i++) {
        var addr = state.eventAddresses[i];
        try {
          const eventContract = new state.web3.web3Instance.eth.Contract(
            EVENT_MINTABLE_AFTERMARKET_ABI,
            addr
          );
          const eventMetadata = await eventContract.getPastEvents("EventMetadata", {
            fromBlock: 1
          });
          var metadataObject = eventMetadata[0].returnValues;
          ipfs_hashes[addr] = {
            address: addr,
            ipfs_hash: argsToCid(
              metadataObject.hashFunction,
              metadataObject.size,
              metadataObject.digest
            )
          }
        } catch {
          console.log("could not get metadata for event");
        }
      }
      commit("setEvents", ipfs_hashes);
      // following used before
      // const web3 = await getWeb3();
      // const eventAddresses = await web3.eventFactory.methods
      //   .getEvents()
      //   .call();
      // var i;
      // var events = [];
      // for (i = 0; i < eventAddresses.length; i++) {
      //   var eventInstance = new web3.web3Instance.eth.Contract(
      //     EVENT_MINTABLE_AFTERMARKET_ABI,
      //     eventAddresses[i]
      //   );
      //   console.log(eventInstance);
      //   var owner = await eventInstance.methods.getOwner().call();
      //   // if a non-active address should be used,
      //   //  `web3.account` should be replaced accordingly in the following condition.
      //   if (web3.account == owner) {
      //     events.push(eventInstance);
      //   }
      // }
      // console.log("commiting result to registerEventList mutation");
      // commit("setEvents", events);
    }
  },
  modules: {},
});
