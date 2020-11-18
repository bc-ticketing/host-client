/* 
  This file contains the Event class and all its member functions. The main functionality contained here is the loading of event metadata and tickets from the Blockchain as well as handling Solidity events related to the event and its ticket. 
*/
import {
  getIdAsBigNumber,
  getTicketId,
  getTicketTypeIndex,
  argsToCid,
  isNf
} from "idetix-utils";
import {
  NonFungibleTicket,
  NonFungibleTicketType,
  FungibleTicketType,
  addBuyOrders,
  removeBuyOrders,
  addSellOrders,
  removeSellOrders,
  getLowestSellOrder
} from "./tickets";
import axios from "axios";
import {
  MintFungibles,
  ticketMetadataChanged,
  MintNonFungibles,
  BuyOrderPlaced,
  SellOrderFungiblePlaced,
  BuyOrderFungibleFilled,
  SellOrderFungibleWithdrawn,
  SellOrderNonFungiblePlaced,
  SellOrderNonFungibleFilled,
  BuyOrderNonFungibleFilled,
  SellOrderNonFungibleWithdrawn,
  BuyOrderWithdrawn,
  SellOrderFungibleFilled,
  eventMetadataChanged
} from "./blockchainEventHandler";
import { NULL_ADDRESS, STARTING_BLOCK } from "./constants/constants";
import { fetchIpfsHash, loadIPFSMetadata } from "./tickets";
import { requestTwitterVerification, requestWebsiteVerification, getHandle } from './identity';
import { getJSONFromIpfs } from "../util/getIpfs";
import { getCurrencySymbol } from "./constants/ERC20Tokens";

import BigNumber from "bignumber.js";

export class Event {
  constructor(contractAddress) {
    // hack to turn events from idb into proper event objects
    if (typeof contractAddress === "object") {
      Object.assign(this, contractAddress);
      this.contractAddress = contractAddress.contractAddress;
      return;
    }
    this.loadedMetadata = false;
    this.lastFetchedBlockMetadata = STARTING_BLOCK;
    this.lastFetchedBlockTickets = STARTING_BLOCK;
    this.lastFetchedBlockAftermarket = STARTING_BLOCK;
    this.contractAddress = contractAddress;
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
    this.location = "";
    this.title = "";
    this.image = "";
    this.description = "";
    this.category = "";
    this.timestamp = "";
    this.ipfsHash = "";
    this.currency = 0;
    this.currencySymbol = "";
    this.identityContractAddress = "";
    this.identityLevel = 0;
    this.website = {
      url: '',
      verification: false
    }
    this.twitter = {
      url: '',
      verification: false
    }
  }
  async update(web3Instance, ABI, currentBlock) {
    await this.loadMetadata(web3Instance, ABI, currentBlock);
    // await this
  }

  async updateTicketsOfEvent(web3Instance, ABI, currentBlock) {

  }

  /**
   * Loads the metadata from ipfs for this event.
   * Returns false, only if hash or data could not be retrieved from
   * the blockchain or IPFS respectively.
   * 
   * @param {*} web3Instance
   * @param {*} ABI
   * @param {*} ipfsInstance
   */
  async loadMetadata(web3Instance, ABI, currentBlock) {
    try {
      const hashRetrieved = await this.fetchIPFSHash(ABI, web3Instance);
      console.log("hashRetrieved? " + hashRetrieved);
      if (hashRetrieved) {
        const loaded = await this.loadIPFSMetadata();
        console.log("metadata loaded? " + loaded);
        if (loaded) {
          this.loadedMetadata = true;
          this.lastFetchedBlockMetadata = currentBlock;
          return true;
        }
      }
    } catch (e) {
      console.log(e);
      return false;
    }
    return false;
  }

  /**
   * /**
   * Fetches the last ipfs hash of the latest metadata change.
   * 
   * @param {*} ABI 
   * @param {*} web3Instance 
   * @returns whether a new hash was retrieved
   */
  async fetchIPFSHash(ABI, web3Instance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);

    console.log("fetchipfshash last block: " + this.lastFetchedBlockMetadata);
    const eventMetadata = await eventSC.getPastEvents("EventMetadata", {
      fromBlock: this.lastFetchedBlockMetadata + 1
    });

    if (eventMetadata.length == 0) {
      // no update found
      return true;
    }

    var metadataObject = eventMetadata[eventMetadata.length - 1].returnValues;
    if (metadataObject == null) {
      return false;
    }
    let currentHash = argsToCid(
      metadataObject.hashFunction,
      metadataObject.size,
      metadataObject.digest
    );

    if (this.ipfsHash == currentHash) {
      return false;
    }
    
    this.ipfsHash = currentHash;
    console.log(this.ipfsHash);
    return true;
  }

  /**
   * Loads the data stored at the ipfsHash of this event.
   * If it fails to load the data, nothing in this object is changed.
   */
  async loadIPFSMetadata() {
    var ipfsData = null;
    ipfsData = await getJSONFromIpfs(this.ipfsHash);
    if (ipfsData == null) {
      return false;
    }
    console.log(ipfsData);
    const metadata = ipfsData;
    this.location = metadata.event.location;
    this.title = metadata.event.title;
    this.image = metadata.event.image;
    this.description = metadata.event.description;
    this.category = metadata.event.category;
    this.duration = metadata.event.duration;
    this.twitter.url = metadata.event.twitter;
    this.website.url = metadata.event.website;
    this.timestamp = metadata.event.time;
    this.parseTimeStamp();
    return true;
  }

  /**
   * Loads the token address used as currency for this event.
   * 
   * @param {*} web3Instance the web3 instance
   * @param {*} ABI the abi of the event contract
   */
  async loadCurrency(web3Instance, ABI) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const currency = await eventSC.methods.erc20Contract().call();
    this.currency = currency;
    let symbol = getCurrencySymbol(this.currency);
    if (symbol) {
      this.currencySymbol = symbol;
    }
  }

  // loading ticket types
  async loadTickets(web3Instance, ABI, ipfsInstance) {
    try {
      console.log("loading tickets");
      await this.loadFungibleTickets(web3Instance, ABI, ipfsInstance);
      await this.loadNonFungibleTickets(web3Instance, ABI, ipfsInstance);
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }

  setLastFetchedBlockTickets(block) {
    this.lastFetchedBlockTickets = block;
  }

  // loading aftermarket related information
  async loadAftermarket(web3Instance, ABI) {
    try {
      await this.loadOwnerShipChanges(web3Instance, ABI);
      await this.loadTicketsSoldChanges(web3Instance, ABI);
      await this.loadAftermarketChanges(web3Instance, ABI);
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }

  setLastFetchedBlockAftermarket(block) {
    this.lastFetchedBlockAftermarket = block;
  }

  // loading identity approver and its level
  async loadIdentityData(web3Instance, ABI) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const identityContractAddress = await eventSC.methods.identityApprover().call();
    const identityLevel = await eventSC.methods.identityLevel().call();
    this.identityContractAddress = identityContractAddress;
    this.identityLevel = identityLevel;
  }

  // returns true if metadata changed since last fetched block
  async metadataChanged(ABI, web3Instance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const changed = await eventMetadataChanged(
      eventSC,
      this.lastFetchedBlockMetadata + 1
    );
    return changed;
  }

  parseTimeStamp() {
    this.date = new Date(this.timestamp * 1000);
    this.hours = this.date.getHours();
    this.minutes = "0" + this.date.getMinutes();
    this.seconds = "0" + this.date.getSeconds();
  }

  getTime() {
    return this.hours + ":" + this.minutes.substr(-2);
  }

  getDay() {
    return this.date.getDay();
  }

  getMonth() {
    return this.date.getMonth();
  }

  // getting the geo-position of the location
  async fetchPosition() {
    let response;
    try {
      response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${this.location}&key=9b5c0f0e97664b69baf8d617c4d0f1c6&language=en&pretty=1`
      );
    } catch (e) {
      this.latlong = "";
      return;
    }
    var first = response.data.results[0];
    var latlong = {
      lat: first.geometry.lat,
      lng: first.geometry.lng
    };
    this.latlong = latlong;
  }

  getNfOwner(ticketType, ticketId) {
    if (this.getTicketType(ticketType).isNf) {
      return this.getNfTicket(ticketType, ticketId).owner;
    }
    return false;
  }

  hasSellOrders(ticketType, ticket = false) {
    let t;
    if (!ticket) {
      t = this.fungibleTickets.find(t => t.typeId === ticketType);
      return t.sellOrders.length !== 0;
    } else {
      const tt = this.nonFungibleTickets.find(
        type => type.typeId === ticketType
      );
      t = tt.tickets.find(temp => temp.ticketId === ticket);
      return t.sellOrder.address != undefined;
    }
  }

  getLowestSellOrder(ticketType, ticketId = false) {
    let ticket;
    if (!ticketId) {
      ticket = this.getTicketType(ticketType, false);
      return getLowestSellOrder(ticket);
    } else {
      const tt = this.nonFungibleTickets.find(
        type => type.typeId === ticketType
      );
      ticket = tt.tickets.find(t => t.ticketId === ticketId);
      return getLowestSellOrder(ticket);
    }
  }

  getSellOrdersByAddress(address, ticketType, nfId) {
    if (nfId) {
      const tt = this.getTicketType(ticketType, true);
      const t = tt.tickets.find(ticket => ticket.ticketId === nfId);
      return t.sellOrder.address === address ? t.sellOrder : {};
    } else {
      const tt = this.getTicketType(ticketType, false);
      return tt.sellOrders.filter(o => o.address === address);
    }
  }

  getBuyOrdersByAddress(address, isNf) {
    let buyOrders = [];
    const tickets = !isNf ? this.fungibleTickets : this.nonFungibleTickets;
    for (const tt of tickets) {
      let orders = tt.buyOrders.filter(o => o.address === address);
      orders.forEach(o => {
        o.ticketTypeId = tt.typeId;
        o.eventAddress = tt.eventContractAddress;
      });
      buyOrders = buyOrders.concat(orders);
    }
    return buyOrders;
  }

  getGranularity(ticketType) {
    return this.getTicketType(ticketType).aftermarketGranularity;
  }

  isAvailable(ticketType, ticket = false) {
    if (!ticket || ticket == 0) {
      const t = this.getTicketType(ticketType, false);
      return Number(t.ticketsSold) < Number(t.supply);
    }
    return this.getNfTicket(ticketType, ticket).owner === NULL_ADDRESS;
  }

  getTimeAndDate() {
    return `${this.date.getDay()}/${this.date.getMonth()}/${this.date.getFullYear()} - ${this.getTime()}`;
  }

  getLowestPrice() {
    let lowestFungible = Math.min(
      this.fungibleTickets.map(ticket => Number(ticket.price))
    );
    let lowestNonFungible = Math.min(
      this.nonFungibleTickets.map(ticket => Number(ticket.price))
    );
    return Math.min(lowestFungible, lowestNonFungible);
  }

  getTicketType(ticketTypeId, isNf = false) {
    if (isNf) {
      const foundNonFungible = this.nonFungibleTickets.find(
        t => t.typeId === ticketTypeId
      );
      return foundNonFungible;
    } else {
      const foundFungible = this.fungibleTickets.find(
        t => t.typeId === ticketTypeId
      );
      return foundFungible;
    }
  }

  // get a specific non-fungible ticket
  getNfTicket(ticketTypeId, ticketId) {
    const foundNonFungible = this.nonFungibleTickets.find(
      t => t.typeId === ticketTypeId
    );
    if (foundNonFungible) {
      return foundNonFungible.tickets.find(t => t.ticketId === ticketId);
    }
  }

  async requestTwitterVerification() {
    this.twitter.verification = await requestTwitterVerification(getHandle(this.twitter.url));
  }

  async requestUrlVerification() {
    this.website.verification = await requestWebsiteVerification(this.website.url);
  }

  hasFungibleTicketType(id) {
    return this.fungibleTickets.filter(t => t.typeId == id).length > 0
      ? this.fungibleTickets.filter(t => t.typeId == id)[0]
      : false;
  }

  hasNonFungibleTicketType(id) {
    return this.nonFungibleTickets.filter(t => t.typeId == id).length > 0
      ? this.nonFungibleTickets.filter(t => t.typeId == id)[0]
      : false;
  }

  /**
   * Loads new fungible ticket types of this event and adds them to the list of tickets.
   */
  async loadFungibleTickets(web3Instance, ABI, ipfsInstance) {
    console.log("loading fungible");
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.fNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 1; i <= nonce; i++) {
        const typeIdentifier = getIdAsBigNumber(false, i);
        const changed = await ticketMetadataChanged(
          eventSC,
          this.lastFetchedBlockTickets + 1,
          typeIdentifier.toFixed()
        );
        console.log(changed);
        if (changed) {
          const exists = this.hasFungibleTicketType(i);
          let ticketType = exists
            ? exists
            : new FungibleTicketType(this.contractAddress, i);
          const ticketMapping = await eventSC.methods
            .ticketTypeMeta(typeIdentifier.toFixed())
            .call();
          ticketType.price = ticketMapping.price;
          ticketType.ticketsSold = Number(ticketMapping.ticketsSold);
          ticketType.supply = Number(ticketMapping.supply);
          const granularity = await eventSC.methods.granularity().call();
          ticketType.aftermarketGranularity = granularity;
          const hashRetrieved = await fetchIpfsHash(ticketType, web3Instance, ABI);
          if (hashRetrieved) {
            await loadIPFSMetadata(ticketType, ipfsInstance);
            //await loadSellOrders(ticketType, web3Instance, ABI);
            //await loadBuyOrders(ticketType, web3Instance, ABI);
          }
          if (!exists) {
            this.fungibleTickets.push(ticketType);
          }
        }
      }
    }
  }

  /**
   * Loads new non-fungible ticket types of this event and adds them to the list of tickets.
   */
  async loadNonFungibleTickets(web3Instance, ABI, ipfsInstance) {
    console.log("loading non-fungible");
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.nfNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 1; i <= nonce; i++) {
        console.log(nonce);
        const typeIdentifier = getIdAsBigNumber(false, i);
        console.log(typeIdentifier);
        const changed = await ticketMetadataChanged(
          eventSC,
          this.lastFetchedBlockTickets + 1,
          typeIdentifier.toFixed()
        );
        if (changed) {
          const exists = this.hasNonFungibleTicketType(i);
          let ticketType = exists
            ? exists
            : new NonFungibleTicketType(this.contractAddress, i);
          const ticketMapping = await eventSC.methods
            .ticketTypeMeta(getIdAsBigNumber(true, i).toFixed())
            .call();
          ticketType.price = ticketMapping.price;
          ticketType.ticketsSold = ticketMapping.ticketsSold;
          ticketType.supply = ticketMapping.supply;
          const granularity = await eventSC.methods.granularity().call();
          ticketType.aftermarketGranularity = granularity;
          for (let j = 1; j <= ticketType.supply; j++) {
            const ticketId = getIdAsBigNumber(true, i, j).toFixed();
            let ticket = this.hasNonFungibleTicket(i, j);
            if (!ticket) {
              ticket = new NonFungibleTicket(this.contractAddress, i, j);
            }
            const owner = await eventSC.methods.nfOwners(ticketId).call();
            ticket.owner = owner;
            //const sellOrder = await eventSC.methods.nfTickets(ticketId).call();
            //ticket.sellOrder = sellOrder;
            ticketType.tickets.push(ticket);
          }
          const hashRetrieved = await fetchIpfsHash(ticketType, web3Instance, ABI);
          if (hashRetrieved) {
            await loadIPFSMetadata(ticketType, ipfsInstance);
            //await loadSellOrders(ticketType, web3Instance, ABI);
            //await loadBuyOrders(ticketType, web3Instance, ABI);
          }
          if (!exists) {
            this.nonFungibleTickets.push(ticketType);
          }
        }
      }
    }
  }

  updateNfOwner(ticketType, ticketId, owner) {
    let ticket = this.nonFungibleTickets
      .find(tt => tt.typeId === ticketType)
      .tickets.find(t => t.ticketId === ticketId);
    ticket.owner = owner;
  }

  hasNonFungibleTicket(ticketType, ticketId) {
    const tt = this.getTicketType(ticketType, true);
    if (tt) {
      return tt.tickets.find(t => t.ticketId === ticketId);
    }
    return false;
  }

  updateTicketsSold(ticketTypeId, isNf, amount) {
    let ticketType;
    if (isNf) {
      ticketType = this.nonFungibleTickets.find(t => t.typeId === ticketTypeId);
    } else {
      ticketType = this.fungibleTickets.find(t => t.typeId === ticketTypeId);
    }
    ticketType.ticketsSold += amount;
  }

  async loadOwnerShipChanges(web3Instance, ABI) {
    console.log("loading ownership changes");
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const events = await MintNonFungibles(eventSC, this.lastFetchedBlockAftermarket + 1);
    for (const event of events) {
      const owner = event.returnValues.owner;
      for (const id of event.returnValues.ids) {
        const ticketType = Number(
          getTicketTypeIndex(new BigNumber(id)).toFixed()
        );
        const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
        this.updateNfOwner(ticketType, ticketId, owner);
        this.updateTicketsSold(ticketType, true, 1);
      }
    }
  }

  async loadTicketsSoldChanges(web3Instance, ABI) {
    console.log("loading tickets sold changes");
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const events = await MintFungibles(eventSC, this.lastFetchedBlockAftermarket + 1);
    for (const event of events) {
      //const owner = event.returnValues.owner;
      const ticketType = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
      );
      const quantity = Number(event.returnValues.quantity);
      this.updateTicketsSold(ticketType, false, quantity);
    }
  }

  adjustOrders(
    ticketTypeId,
    isNf,
    percentage,
    quantity,
    buyOrSell,
    placedOrFilled,
    address,
    ticketId = 0
  ) {
    if (!isNf) {
      let ticketType = this.getTicketType(ticketTypeId, false);
      if (buyOrSell === "buy") {
        if (placedOrFilled === "placed") {
          addBuyOrders(ticketType, percentage, quantity, address);
        } else {
          removeBuyOrders(ticketType, percentage, quantity, address);
        }
        /* SELL */
      } else {
        if (placedOrFilled === "placed") {
          console.log('placed');
          addSellOrders(ticketType, percentage, quantity, address);
        } else {
          removeSellOrders(ticketType, percentage, quantity, address);
        }
      }
    } else {
      let ticketType = this.getTicketType(ticketTypeId, true);
      if (buyOrSell == "buy") {
        if (placedOrFilled === "placed") {
          addBuyOrders(ticketType, percentage, quantity, address, ticketId);
        } else {
          removeBuyOrders(ticketType, percentage, quantity, address, ticketId);
        }
        /* SELL */
      } else {
        if (placedOrFilled === "placed") {
          addSellOrders(ticketType, percentage, quantity, address, ticketId);
        } else {
          removeSellOrders(ticketType, percentage, quantity, address, ticketId);
        }
      }
    }
  }

  async loadAftermarketChanges(web3Instance, ABI) {
    console.log("loading aftermarket changes");
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);

    const buyOrdersPlaced = await BuyOrderPlaced(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of buyOrdersPlaced) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
      );
      const quantity = event.returnValues.quantity;
      const address = event.returnValues.addr;
      const percentage = event.returnValues.percentage;
      const nf = isNf(new BigNumber(event.returnValues.ticketType));
      const ticketId = nf
        ? Number(
            getTicketId(new BigNumber(event.returnValues.ticketType)).toFixed()
          )
        : 0;
      this.adjustOrders(
        ticketTypeId,
        nf,
        percentage,
        quantity,
        "buy",
        "placed",
        address,
        ticketId
      );
    }

    const buyOrderWithdrawn = await BuyOrderWithdrawn(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of buyOrderWithdrawn) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
      );
      const quantity = event.returnValues.quantity;
      const address = event.returnValues.addr;
      const percentage = event.returnValues.percentage;
      const nf = isNf(new BigNumber(event.returnValues.ticketType));
      const ticketId = nf
        ? Number(
            getTicketId(new BigNumber(event.returnValues.ticketType)).toFixed()
          )
        : 0;
      this.adjustOrders(
        ticketTypeId,
        nf,
        percentage,
        quantity,
        "buy",
        "filled",
        address,
        ticketId
      );
    }

    const sellOrderFungiblePlaced = await SellOrderFungiblePlaced(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of sellOrderFungiblePlaced) {
      console.log('sell order fungible placed');
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
      );
      const quantity = event.returnValues.quantity;
      const address = event.returnValues.addr;
      const percentage = event.returnValues.percentage;
      this.adjustOrders(
        ticketTypeId,
        false,
        percentage,
        quantity,
        "sell",
        "placed",
        address
      );
    }

    const sellOrderFungibleFilled = await SellOrderFungibleFilled(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of sellOrderFungibleFilled) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
      );
      const quantity = event.returnValues.quantity;
      const address = event.returnValues.addr;
      const percentage = event.returnValues.percentage;
      this.adjustOrders(
        ticketTypeId,
        false,
        percentage,
        quantity,
        "sell",
        "filled",
        address
      );
    }

    const buyOrderFungibleFilled = await BuyOrderFungibleFilled(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of buyOrderFungibleFilled) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
      );
      const quantity = event.returnValues.quantity;
      const address = event.returnValues.addr;
      const percentage = event.returnValues.percentage;
      this.adjustOrders(
        ticketTypeId,
        false,
        percentage,
        quantity,
        "buy",
        "filled",
        address
      );
    }

    const sellOrderFungibleWithdrawn = await SellOrderFungibleWithdrawn(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of sellOrderFungibleWithdrawn) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
      );
      const quantity = event.returnValues.quantity;
      const address = event.returnValues.addr;
      const percentage = event.returnValues.percentage;
      this.adjustOrders(
        ticketTypeId,
        false,
        percentage,
        quantity,
        "sell",
        "filled",
        address
      );
    }
    const sellOrderNonFungiblePlaced = await SellOrderNonFungiblePlaced(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of sellOrderNonFungiblePlaced) {
      const address = event.returnValues.addr;
      for (const [index, id] of event.returnValues._ids.entries()) {
        const ticketTypeId = Number(
          getTicketTypeIndex(new BigNumber(id)).toFixed()
        );
        const percentage = event.returnValues.percentage[index];
        const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
        this.adjustOrders(
          ticketTypeId,
          true,
          percentage,
          1,
          "sell",
          "placed",
          address,
          ticketId
        );
      }
    }
    const sellOrderNonFungibleFilled = await SellOrderNonFungibleFilled(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of sellOrderNonFungibleFilled) {
      const address = event.returnValues.addr;
      for (const [index, id] of event.returnValues._ids.entries()) {
        const ticketTypeId = Number(
          getTicketTypeIndex(new BigNumber(id)).toFixed()
        );
        const percentage = event.returnValues.percentage[index];
        const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
        this.adjustOrders(
          ticketTypeId,
          true,
          percentage,
          1,
          "sell",
          "filled",
          address,
          ticketId
        );
      }
    }

    const buyOrderNonFungibleFilled = await BuyOrderNonFungibleFilled(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of buyOrderNonFungibleFilled) {
      const address = event.returnValues.addr;
      for (const [index, id] of event.returnValues._ids.entries()) {
        const ticketTypeId = Number(
          getTicketTypeIndex(new BigNumber(id)).toFixed()
        );
        const percentage = event.returnValues.percentage[index];
        const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
        this.adjustOrders(
          ticketTypeId,
          true,
          percentage,
          1,
          "buy",
          "filled",
          address,
          ticketId
        );
      }
    }

    const sellOrderNonFungibleWithdrawn = await SellOrderNonFungibleWithdrawn(
      eventSC,
      this.lastFetchedBlockAftermarket + 1
    );
    for (const event of sellOrderNonFungibleWithdrawn) {
      const address = event.returnValues.addr;
        const ticketTypeId = Number(
          getTicketTypeIndex(
            new BigNumber(event.returnValues._id)
          ).toFixed()
        );
        const ticketId = Number(getTicketId(new BigNumber(event.returnValues._id)).toFixed());
        this.adjustOrders(
          ticketTypeId,
          true,
          0,
          1,
          "sell",
          "filled",
          address,
          ticketId
        );
    }
  }
}
