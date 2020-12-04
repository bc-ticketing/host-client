# Host Client

Clone the repository with the following command in the folder of your desire:

```bash
git clone https://github.com/bc-ticketing/host-client.git
```

## Run Environment

First, go to the root of the project and install the dependencies.

```bash
cd host-client
npm install
```

Before you run the application locally, you will need to create a `.env`. For that, you can simply copy the file `.env_sample` and fill the necessary information.
For the pinata keys, you need an account [here](https://pinata.cloud/) and fill in the api and your private key. This is used to pin the metadata of events, tickets and approvers to the [IPFS](https://ipfs.io/) network. Further, you need to set the trust certificate api that you are going to use, which you can retrieve from the [social-trust-certificates-api](https://github.com/bc-ticketing/social-trust-certificates-api) repository and finally, you need an [Infura](https://infura.io/) key.

After setting these keys, you can now start serving the application locally.

```bash
npm run serve
```

The current contracts are deployed on the Kovan test net with the following addresses:
- EventFactory:   0x3840DFe78536c4b27A928B1B86898302C938Ae9D
- Identity:       0x2583d96704f7F0a6737b158b59739ac4b239F1dE
- TestERC20Token: 0xBFd25cac00F0E9a0cdFA634bdaED379FdC69E24d

To use your own deployed contracts, use the [idetix](https://github.com/bc-ticketing/idetix) repository to compile and deploy them and then copy the addresses into the following files:

- /src/util/abi/EventFactory.js --> EVENT_FACTORY_ADDRESS="{event factory contract address here}"

- /src/util/abi/Identity.js --> IDENTITY_ADDRESS="{identity contract address here}"
  
- /src/util/constants/ERC20Tokens.js --> ERC20TESTTOKEN="{erc20 test token contract address here}"
