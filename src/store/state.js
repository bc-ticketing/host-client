let state = {
    web3: {
        isInjected: false,
        web3Instance: null,
        networkId: null,
        account: null,
        balance: null,
        error: null
    },
    eventAddresses: [],
    events: {},
    eventFactory: null,
    identity: null,
    ipfsInstance: null
}
export default state
