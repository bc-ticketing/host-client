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
    eventAddresses: [],
    events: [],
    eventFactory: null,
    identity: null,
    approvers: [],
    lastFetchedBlockEvents: 0,
    lastFetchedBlockApprovers: 0,
    ipfsInstance: null
};

export default state;
