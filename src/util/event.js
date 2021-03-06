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
  getLowestSellOrder,
  getNumberOfTicketsSold,
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
  eventMetadataChanged,
  getPresaleBlock
} from "./blockchainEventHandler";
import { NULL_ADDRESS, STARTING_BLOCK, MAX_ALLOWED_TICKET_AMOUNT } from "./constants/constants";
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
    this.owner = "";
    this.loadedMetadata = false;
    this.lastFetchedBlockMetadata = STARTING_BLOCK;
    this.lastFetchedBlockTickets = STARTING_BLOCK;
    this.lastFetchedBlockAftermarket = STARTING_BLOCK;
    this.contractAddress = contractAddress;
    this.maxTicketsPerPerson = MAX_ALLOWED_TICKET_AMOUNT;
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
    this.identityApproverAddress = "";
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

  setOwner(owner) {
    this.owner = owner;
  }

  /**
   * Loads the metadata from ipfs for this event.
   * Returns false, only if hash or data could not be retrieved from
   * the blockchain or IPFS respectively.
   * 
   * @param {*} web3Instance the web3 instance
   * @param {*} ABI the abi of the event contract
   * @param {*} currentBlock the current block on the network
   */
  async loadMetadata(web3Instance, ABI, currentBlock) {
    try {
      const hashRetrieved = await this.fetchIPFSHash(ABI, web3Instance);
      if (hashRetrieved) {
        const loaded = await this.loadIPFSMetadata();
        if (loaded) {
          this.loadedMetadata = true;
          this.lastFetchedBlockMetadata = currentBlock;
          await this.verify();
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
   * Fetches the last ipfs hash of the latest metadata change.
   * 
   * @param {*} ABI 
   * @param {*} web3Instance 
   * @returns whether a new hash was retrieved
   */
  async fetchIPFSHash(ABI, web3Instance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const eventMetadata = await eventSC.getPastEvents("EventMetadata", {
      fromBlock: this.lastFetchedBlockMetadata + 1
    });
    if (eventMetadata.length == 0) {
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

    this.ipfsHash = currentHash;
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

  /**
   * Loads the maximal tickets allowed per person for this event.
   */
  async loadMaxTicketsPerPerson(web3Instance, ABI) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    this.maxTicketsPerPerson = await eventSC.methods.maxTicketsPerPerson().call();
  }

  // Loads all ticket types for this event.
  async loadTickets(web3Instance, ABI, currentBlock) {
    try {
      await this.loadFungibleTickets(web3Instance, ABI, currentBlock);
      await this.loadNonFungibleTickets(web3Instance, ABI, currentBlock);
    } catch (e) {
      console.log(e);
      return false;
    }
    this.lastFetchedBlockTickets = currentBlock;
    return true;
  }

  setLastFetchedBlockTickets(block) {
    this.lastFetchedBlockTickets = block;
  }

  async loadNrTicketsBought(web3Instance, ABI) {
    for (let i = 0; i < this.fungibleTickets.length; i++) {
      let ticket = this.fungibleTickets[i];
      await getNumberOfTicketsSold(ticket, web3Instance, ABI);
    }
    for (let j = 0; j < this.nonFungibleTickets.length; j++) {
      let ticket = this.nonFungibleTickets[j];
      await getNumberOfTicketsSold(ticket, web3Instance, ABI);
    }
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

  /**
   * Loads the identity approver address and the level.
   * 
   * @param {*} web3Instance the web3 instance
   * @param {*} ABI the abi of the event contract
   */
  async loadIdentityData(web3Instance, ABI) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const identityApproverAddress = await eventSC.methods.identityApprover().call();
    const identityLevel = await eventSC.methods.identityLevel().call();
    this.identityApproverAddress = identityApproverAddress;
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

  async verify() {
    const twitterVerificationChanged = await this.verifyTwitter();
    const websiteVerificationChanged = await this.verifyWebsite();
    return twitterVerificationChanged || websiteVerificationChanged;
  }

  async verifyTwitter() {
    if (this.twitter.url) {
      const currentState = await requestTwitterVerification(this.twitter.url, this.owner);
      if (currentState !== this.twitter.verification) {
        this.twitter.verification = currentState;
        return true;
      }
    }
    return false;
  }

  async verifyWebsite() {
    if (this.website.url) {
      const currentState = await requestWebsiteVerification(this.website.url, this.owner);
      if (currentState !== this.website.verification) {
        this.website.verification = currentState;
        return true;
      }
    }
    return false;
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
  async loadFungibleTickets(web3Instance, ABI, currentBlock) {
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
        if (changed) {
          const exists = this.hasFungibleTicketType(i);
          let ticketType = exists
            ? exists
            : new FungibleTicketType(this.contractAddress, i);
          const presaleBlock = await getPresaleBlock(eventSC, 1, typeIdentifier.toFixed());
          ticketType.hasPresale = presaleBlock != 0;
          if (ticketType.hasPresale) {
            ticketType.presaleBlock = presaleBlock;
            ticketType.presalePassed = new BigNumber(ticketType.presaleBlock).comparedTo(currentBlock) < 1;
          }
          const ticketMapping = await eventSC.methods
            .ticketTypeMeta(typeIdentifier.toFixed())
            .call();
          ticketType.price = ticketMapping.price;
          ticketType.ticketsSold = Number(ticketMapping.ticketsSold);
          ticketType.supply = Number(ticketMapping.supply);
          ticketType.finalizationTime = Number(ticketMapping.finalizationTime);
          const granularity = await eventSC.methods.granularity().call();
          ticketType.aftermarketGranularity = granularity;
          const hashRetrieved = await fetchIpfsHash(ticketType, web3Instance, ABI);
          if (hashRetrieved) {
            await loadIPFSMetadata(ticketType);
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
  async loadNonFungibleTickets(web3Instance, ABI, currentBlock) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.nfNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 1; i <= nonce; i++) {
        const typeIdentifier = getIdAsBigNumber(true, i);
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
          const presaleBlock = await getPresaleBlock(eventSC, 1, typeIdentifier.toFixed());
          ticketType.hasPresale = presaleBlock != 0;
          if (ticketType.hasPresale) {
            ticketType.presaleBlock = presaleBlock;
            ticketType.presalePassed = new BigNumber(ticketType.presaleBlock).comparedTo(currentBlock) < 1;
          }
          const ticketMapping = await eventSC.methods
            .ticketTypeMeta(getIdAsBigNumber(true, i).toFixed())
            .call();
          ticketType.price = ticketMapping.price;
          ticketType.ticketsSold = ticketMapping.ticketsSold;
          ticketType.supply = ticketMapping.supply;
          ticketType.finalizationTime = Number(ticketMapping.finalizationTime);
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
            ticketType.tickets.push(ticket);
          }
          const hashRetrieved = await fetchIpfsHash(ticketType, web3Instance, ABI);
          if (hashRetrieved) {
            await loadIPFSMetadata(ticketType);
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
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const events = await MintFungibles(eventSC, this.lastFetchedBlockAftermarket + 1);
    for (const event of events) {
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
