/* 
 * This file contains data classes for all ticket types and utility functions for state alterations. All functions that interact with the blockchain for buying/selling tickets are contained here as well as helper functions to get infos from ticket objects
 */
import { argsToCid, getIdAsBigNumber } from "idetix-utils";
import {
    NULL_ADDRESS,
    TRANSACTION_DENIED,
    TICKET_BOUGHT,
    DEFAULT_ERROR,
    MAX_TICKETS_ALLOWED,
    SELLORDER_PLACED,
    SELLORDER_WITHDRAWN
} from "./constants/constants";
import { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI } from "./../util/abi/EventMintableAftermarketPresale";
import { getJSONFromIpfs } from "../util/getIpfs"

const BigNumber = require("bignumber.js");

/**
 * Returns the number of available seats for a ticket Type
 * @param {TicketType} ticket
 */
export function numberFreeSeats(ticket) {
    return ticket.supply - ticket.ticketsSold;
}

export function getNumBuyOrdersByPercent(ticket, percentage) {
    let total = 0;
    ticket.buyOrders.forEach(o => {
        if (Number(o.percentage) === Number(percentage)) {
            total += Number(o.quantity);
        }
    });
    return total;
}

export function getNumSellOrdersByPercent(ticket, percentage) {
    let total = 0;
    ticket.sellOrders.forEach(o => {
        if (Number(o.percentage) === percentage) {
            total += Number(o.quantity);
        }
    });
    return total;
}

export function getAllSellOferingsNfTicketType(ticketType) {
    let offers = [];
    for (const ticket of ticketType.tickets) {
        if (ticket.sellOrder.address) {
        offers.push({
            percentage: ticket.sellOrder.percentage,
            ticketId: ticket.ticketId,
            seller: ticket.sellOrder.address});
        }
    }
    return offers;
}

/**
 * Fetches the buy orders for a Fungible ticketType and stores it in the object
 * @param {FungibleTicketType} ticket
 * @param {web3Instance} web3Instance
 * @param {SC_ABI} ABI
 */
export async function loadBuyOrders(ticket, web3Instance, ABI) {
    const aftermarket = new web3Instance.eth.Contract(
        ABI,
        ticket.eventContractAddress
    );
    for (let i = ticket.aftermarketGranularity; i >= 1; i--) {
        const percentage = (100 / ticket.aftermarketGranularity) * i;
        const buyingQueue = await aftermarket.methods
            .buyingQueue(getFullTicketTypeId(false, ticket.typeId), percentage)
            .call();
        const numBuyingOrders = buyingQueue.numberTickets;
        if (numBuyingOrders > 0) {
            ticket.buyOrders[percentage] = numBuyingOrders;
        }
    }
    return ticket;
}

/**
 * Fetches the sell orders for a Fungible ticketType and stores it in the object
 * @param {FungibleTicketType} ticket
 * @param {web3Instance} web3Instance
 * @param {SC_ABI} ABI
 */
export async function loadSellOrders(ticket, web3Instance, ABI) {
    const aftermarket = new web3Instance.eth.Contract(
        ABI,
        ticket.eventContractAddress
    );
    for (let i = ticket.aftermarketGranularity; i >= 1; i--) {
        const percentage = (100 / ticket.aftermarketGranularity) * i;
        const sellingQueue = await aftermarket.methods
            .sellingQueue(getFullTicketTypeId(false, ticket.typeId), percentage)
            .call();
        const numSellOrders = sellingQueue.numberTickets;
        if (numSellOrders > 0) {
            ticket.sellOrders[percentage] = numSellOrders;
        }
    }
    return ticket;
}

/**
 * Returns true if the NFTicket or FTicketType has sell orders
 * @param {Ticket} ticket
 */
export function hasSellOrder(ticket) {
    if (!ticket.isNf) {
        return ticket.sellOrders.length != 0;
    } else {
        return ticket.sellOrder.address != undefined;
    }
}

/**
 * Checks for the highest available buy order for a ticketType or NF Ticket
 * @param {FungibleTicketType} ticket
 * @returns highestBuyOrder or 0 if none
 */
export function getHighestBuyOrder(ticket) {
    const sorted = ticket.buyOrders.sort((a, b) => {
        a.percentage - b.percentage;
    });
    console.log(sorted);
    return sorted.length > 0 ? sorted[0] : {};
}

/**
 * Checks for the lowst available sell order for a ticketType or NF Ticket
 * @param {FungibleTicketType} ticket
 * @returns lowestSellOrder or 0 if none
 */
export function getLowestSellOrder(ticket) {
    if (ticket.isNf) {
        return ticket.sellOrder;
    }
    const sorted = ticket.sellOrders.sort((a, b) => {
        a.percentage - b.percentage;
    });
    return sorted.length > 0 ? sorted[0] : {};
}

function decodeError(e) {
    if (e.code === 4001) {
        return {
        message: TRANSACTION_DENIED,
        status: -1
        };
    } else if (e.code === -32603) {
        return {
            message: MAX_TICKETS_ALLOWED,
            status: -1
        };
    }
    return {
        message: DEFAULT_ERROR,
        status: -1
    };
}

/*
/**
 * loads Metadata stored on IPFS for a ticketType
 * @param {TicketType} ticket
 * @param {ipfsInstance} ipfsInstance
 */
export async function loadIPFSMetadata(ticket, ipfsInstance) {
    if (ticket.ipfsHash === "") {
        return;
    }
    var ipfsData = null;
    ipfsData = await getJSONFromIpfs(this.ipfsHash);
    if (ipfsData == null) {
        console.log("ipfs data null for event: " + this.ipfsHash);
        return;
    }
    console.log(ipfsData)
    // for await (const chunk of ipfsInstance.cat(ticket.ipfsHash, {
    //     timeout: 2000
    // })) {
    //     ipfsData = Buffer(chunk, "utf8").toString();
    // }
    const metadata = JSON.parse(ipfsData);
    ticket.description = metadata.ticket.description;
    ticket.seatMapping = metadata.ticket.mapping;
    ticket.title = metadata.ticket.title;
    ticket.seatColor = metadata.ticket.color;
    if (ticket.isNf) {
        metadata.ticket.mapping.forEach((mapping, index) => {
            if (index >= ticket.tickets.length) {
                return;
            }
            ticket.tickets[index].seatMapping = mapping;
        });
    }
    return ticket;
}

/**
 * Fetches the IPFS hash on the blockchain for a ticket Type
 * @param {TicketType} ticket
 */
export async function fetchIpfsHash(ticket, web3Instance, ABI) {
    const eventSC = new web3Instance.eth.Contract(
        ABI,
        ticket.eventContractAddress
    );
    const ticketMetadata = await eventSC.getPastEvents("TicketMetadata", {
        filter: {
        ticketTypeId: getFullTicketTypeId(ticket.isNf, ticket.typeId)
        },
        fromBlock: 1
    });
    if (ticketMetadata.length < 1) {
        return;
    }
    var metadataObject = ticketMetadata[0].returnValues;
    const ipfsHash = argsToCid(
        metadataObject.hashFunction,
        metadataObject.size,
        metadataObject.digest
    );
    ticket.ipfsHash = ipfsHash;
    return ticket;
}

/**
 * Calculates the full Ticket Type Identifier
 * @param {isNf} Boolean,
 * @param {typeId} Number,
 * @returns {Identifier} String
 */
export function getFullTicketTypeId(isNf, typeId) {
    return getIdAsBigNumber(isNf, typeId).toFixed();
}

/**
 * Calculates the full Ticket Identifier for a NF Ticket
 * @param {ticketId} Number,
 * @param {ticketTypeId} Number
 * @returns {Identifier} String
 */
export function getFullTicketId(ticketId, ticketTypeId) {
    return getIdAsBigNumber(true, ticketTypeId, ticketId).toFixed();
}

/**
 * Checks if a NF ticket is free
 * @param {NonFungibleTicket} ticket
 * @returns {Boolean} isFree
 */
export function isFree(ticket) {
    return ticket.owner === NULL_ADDRESS;
}

export function addBuyOrders(
    ticketType,
    percentage,
    quantity,
    address,
    ticketId = 0
) {
    if (ticketId == 0) {
        ticketType.buyOrders.push({
        address: address,
        percentage: percentage,
        quantity: quantity
        });
    } else {
        let ticket = ticketType.tickets.find(t => t.ticketId == ticketId);
        ticket.buyOrders.push({
            address: address,
            percentage: percentage,
            quantity: quantity
        });
    }
}

export function addSellOrders(
    ticketType,
    percentage,
    quantity,
    address,
    ticketId = 0
) {
    if (ticketId == 0) {
        console.log('adding sell order');
        ticketType.sellOrders.push({
        address: address,
        percentage: percentage,
        quantity: quantity
        });
    } else {
        let ticket = ticketType.tickets.find(t => t.ticketId === ticketId);
        ticket.sellOrder = {
            address: address,
            percentage: percentage
        };
    }
}

export function removeBuyOrders(
    ticketType,
    percentage,
    quantity,
    address,
    ticketId = 0
) {
    if (ticketId == 0) {
        let order = ticketType.buyOrders.find(
            o => o.address === address && o.percentage === percentage
        );
        order.quantity = Math.min(0, order.quantity - quantity);
    } else {
        let ticket = ticketType.tickets.find(t => t.ticketId === ticketId);
        let order = ticket.buyOrders.find(
            o => o.address === address && o.percentage === percentage
        );
        order.quantity = Math.min(0, order.quantity - quantity);
    }
}

export function removeSellOrders(
    ticketType,
    percentage,
    quantity,
    address,
    ticketId = 0
) {
    if (ticketId == 0) {
        let order = ticketType.sellOrders.find(
            o => o.address === address && Number(o.percentage) == Number(percentage)
        );
        if (!order) {
            return;
        }
        if (Number(quantity) >= Number(order.quantity)) {
            ticketType.sellOrders = ticketType.sellOrders.filter(
                o => o.address !== address && Number(o.percentage) != Number(percentage)
            );
        } else {
            order.quantity = Math.min(0, Number(order.quantity) - Number(quantity));
        }
    } else {
        let ticket = ticketType.tickets.find(t => t.ticketId == ticketId);
        ticket.sellOrder = 0;
    }
}

/**
 * Data Class for Fungible Ticket types
 */
export class FungibleTicketType {
    constructor(eventContractAddress, typeId) {
        this.eventContractAddress = eventContractAddress;
        this.typeId = typeId;
        this.price = 0;
        this.supply = 0;
        this.ticketsSold = 0;
        this.aftermarketGranularity = 0;
        this.title = "";
        this.description = "";
        this.color = "";
        this.ipfsHash = "";
        this.sellOrders = [];
        this.buyOrders = [];
        this.seatMapping = [];
        this.isNf = false;
        this.seatColor = "";
    }
}
/**
 * Data Class for Nonfungible Ticket Types
 */
export class NonFungibleTicketType {
    constructor(eventContractAddress, typeId) {
        this.eventContractAddress = eventContractAddress;
        this.typeId = typeId;
        this.price = 0;
        this.supply = 0;
        this.ticketsSold = 0;
        this.aftermarketGranularity = 0;
        this.title = "";
        this.description = "";
        this.color = "";
        this.ipfsHash = "";
        this.sellOrders = [];
        this.buyOrders = [];
        this.tickets = [];
        this.isNf = true;
        this.seatColor = "";
    }
}

/**
 * Data Class for Nonfungible Tickets
 */
export class NonFungibleTicket {
    constructor(eventContractAddress, ticketTypeId, ticketId) {
        this.eventContractAddress = eventContractAddress;
        this.ticketTypeId = ticketTypeId;
        this.ticketId = ticketId;
        this.buyOrders = [];
        this.sellOrder = {};
        this.seatMapping = undefined;
        this.owner = undefined;
        this.isNf = true;
    }
}
