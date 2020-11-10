# host-client

## Setup environment
1) install ipfs (https://docs.ipfs.io/install/)
2) make sure your ipfs node accepts CORS request from localhosts
```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["http://localhost"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]' 
```
3) run ipfs daemon
```bash
ipfs daemon
```
4) install and start ipfs companion to connect browser to local ipfs node (https://chrome.google.com/webstore/detail/ipfs-companion/nibjojkomfdiaoajekhjakgkdhaomnch?hl=en)

## Run Environment

First, start local blockchain with by opening the Ganache application.

Then:

```bash
# get recent contracts, deploy them and run
./deployRun.sh
```

```bash
# if contracts already deployed
npm install
npm run serve
```

## Standalone setup and run commands

```bash
# compiles and minifies for production
npm run build
```

```bash
# run unit tests
npm run test:unit
```

```bash
# lints and fixes files
npm run lint
```
