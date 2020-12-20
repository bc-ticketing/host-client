<p align="center">
    <img src="./docs/img/ticket-icon.png" alt="Ticketing dApp" align="center">
</p>

<h2 align="center">Blockchain Ticketing</h2>
<h3 align="center">Software Project</h3>
<div align="center"><code >University of Zurich</code></div>

---

# Host Client

## Requirements

- [Git](https://git-scm.com/) command line interface
- [Node.js](https://nodejs.org/) command line interface
- [Metamask Extension](https://metamask.io/) for your browser communicating with the Ethereum blockchain

## Clone the Repository

```bash
git clone --recurse-submodules https://github.com/bc-ticketing/host-client.git
```

## Necessary Environment Variables and Contract Addresses

Before you run the application locally, you will need to create a `.env` file in the root directory. For that, you can simply copy the file `.env_sample` and fill the necessary information.
For the pinata keys, you need a [pinata](https://pinata.cloud/) account and add the according keys to the environment variables as explained below. Pinata is used to pin the metadata of events, tickets and approvers to the [IPFS](https://ipfs.io/) network.
Further, you need to set the trust certificate api that you are going to use to verify that your trust verification is set correct. (For more information see the [social-trust-certificates-api](https://github.com/bc-ticketing/social-trust-certificates-api) repository.)

The application needs a file named `.env` in the root directory. The content of the file needs to be a set of key-value pairs in the format `KEY=VALUE`. The following values need to be set:

### Pinata Keys (in .env)
`VUE_APP_PINATA_API_KEY` & `VUE_APP_PINATA_SECRET_API_KEY`

### Trust Certificates API (in .env)
`VUE_APP_TRUST_CERTIFICATES_API`

### Identity Contract Address
> Public address of the deployed Identity contract

`IDENTITY_ADDRESS` in the file `/src/util/abi/Identity.js`

### Event Factory Contract Address
> Public address of the deployed Event Factory contract

`EVENT_FACTORY_ADDRESS` in the file `/src/util/abi/EventFactory.js`

## Run Environment

First, go to the root of the project and install the dependencies.

```bash
cd host-client
npm install
```

After setting the needed keys and contract addresses, you can start serving the application locally.

```bash
npm run serve
```
