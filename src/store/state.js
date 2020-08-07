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
    ipfs: {
        ipfsInstance: null,
        host: null,
        port: null,
        protocol: null
    },
    events: [],
    contractInstance: null
}
export default state