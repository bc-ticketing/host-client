import { STARTING_BLOCK } from "../util/constants/constants";

let state = {
    web3: {
        isInjected: false,
        web3Instance: null,
        networkId: null,
        eth: null,
        account: null,
        balance: null,
        error: null,
        currentBlock: null
    },
    events: [],
    eventFactory: null,
    identity: null,
    approvers: [],
    lastFetchedBlockEvents: STARTING_BLOCK,
    lastFetchedBlockApprovers: STARTING_BLOCK,
};

export default state;
