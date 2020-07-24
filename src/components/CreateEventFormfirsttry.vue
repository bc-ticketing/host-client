<template>
  <div class="create-event-form-container">
    <img alt="Vue logo" src="../assets/logo.png" />
    <md-field>
      <label>upload file</label>
      <md-file placeholder="nice placeholder" />
    </md-field>
    <md-button @click="upload">submit</md-button>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <label>FileName</label>
      <input type="text" name="fileName" />
      <label>Upload file</label><input type="text" name="file" />
      <input type="submit" value="Submit" />
    </form>
  </div>
</template>

//
<script>
// // import web3 from "../util/getWeb3.js";
// import ipfs from "../util/ipfs.js";

// export default {
//   data() {
//     return {
//       image: "",
//       ipfsHash: null,
//       buffer: "",
//       ethAddress: "",
//       blockNumber: "",
//       transactionHash: "",
//       gasUsed: "",
//       txReceipt: "",
//     };
//   },
//   methods: {
//     captureFile(event) {
//       event.stopPropagation();
//       event.preventDefault();
//       const file = event.target.files[0];
//       let reader = new window.FileReader();
//       reader.readAsArrayBuffer(file);
//       reader.onloadend = () => this.convertToBuffer(reader);
//     },
//     async convertToBuffer(reader) {
//       //file is converted to a buffer for upload to IPFS
//       const Bufferdata = await Buffer.from(reader.result);
//       //set this buffer -using es6 syntax
//       this.buffer = Bufferdata;
//       console.log("BUF" + this.buffer);
//     },
//     async upload() {
//       await ipfs.add("logo", (err, hash) => {
//         if (err) {
//           return console.log(err);
//         }
//         console.log("hell");
//         console.log(`http://ipfs.infura.io/ipfs/` + hash);
//       });
//   console.log("after-upload");

//   event.preventDefault();
//   const accounts = await web3.eth.getAccounts();
//   console.log("Sending from Metamask account: " + accounts[0]);
//   console.log("this is koli" + storehash);
//   const EthAddress = await storehash.options.EthAddressconsole.log("dot");
//   this.ethAddress = EthAddress;
//   console.log("eth address:" + this.ethAddress);
//   await ipfs.add("{`ipfs-file`: `1.0`}");
//   console.log("added");

//   await ipfs.add("{`ipfs-file`: `1.0`}", (error, IpfsHash) => {
//     console.log("dot");

//     console.log("ipfshash: " + IpfsHash);
//     console.log(error);
//     //setState by setting ipfsHash to ipfsHash[0].hash
//     this.ipfsHash = IpfsHash[0].hash;
//     // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract
//     //return the transaction hash from the ethereum contract
//     //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
//     console.log("dot");

//     // storehash.methods.sendHash(this.ipfsHash).send({
//     //   from: accounts[0]
//     // });
//   });
//     },
//   },
//   name: "CreateEventForm",
// };
//
</script>

// <style></style>
