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
    lastFetchedBlockApprovers: 1,
    ipfsInstance: null,
    lastFetchedBlock: 1,
};

export default state;
