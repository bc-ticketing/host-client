let state = {
    web3: {
        isInjected: false,
        web3Instance: null,
        networkId: null,
        account: null,
        balance: null,
        error: null,
        eventFactory: null
    },
    eventFactory: null,
    ipfs: null,
    events: [],
    contractInstance: null
}
export default state