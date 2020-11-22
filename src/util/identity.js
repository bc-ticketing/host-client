import { argsToCid } from "idetix-utils";
import axios from "axios";
import { getJSONFromIpfs } from "../util/getIpfs";
import { STARTING_BLOCK } from "./constants/constants";
import { IDENTITY_ABI } from "./abi/Identity";
// import { eventMetadataChanged } from "./blockchainEventHandler";

export class IdentityApprover {
  constructor(approverAddress) {
    if (typeof approverAddress === "object") {
      Object.assign(this, approverAddress);
      this.approverAddress = approverAddress.approverAddress;
      return;
    }
    this.loadedMetadata = false;
    this.approverAddress = approverAddress;
    this.title = "";
    this.methods = [];
    this.website = {
      url: "",
      verification: false,
    };
    this.twitter = {
      url: "",
      verification: false,
    };
    this.lastFetchedBlock = STARTING_BLOCK;
    this.ipfsHash = "";
  }

  async loadMetadata(identityContract, ABI, currentBlock) {
    if (this.loadedMetadata) {
      return true;
    }
    try {
      const hashRetrieved = await this.fetchIPFSHash(ABI, identityContract);
      console.log("hashRetrieved? " + hashRetrieved);
      if (hashRetrieved) {
        const loaded = await this.loadIPFSMetadata();
        console.log("metadata loaded? " + loaded);
        if (loaded) {
          this.loadedMetadata = true;
          this.lastFetchedBlock = currentBlock;
          return true;
        }
      }
    } catch (e) {
      console.log(e);
      return false;
    }
    return false;
  }

  async fetchIPFSHash(ABI, identityContract) {

    console.log("fetchipfshash last block approver: " + this.lastFetchedBlock);
    console.log(this.approverAddress);
    const approverMetadata = await identityContract.methods
      .getApproverInfo(this.approverAddress)
      .call();
    console.log("approverMetadata:");
    console.log(approverMetadata);
    if (approverMetadata == null) {
      return;
    }

    this.ipfsHash = argsToCid(
      approverMetadata.hashFunction,
      approverMetadata.size,
      approverMetadata.digest
    );
    console.log(this.ipfsHash);
    return true;
  }

  async loadIPFSMetadata() {
    var ipfsData = null;
    ipfsData = await getJSONFromIpfs(this.ipfsHash);
    if (ipfsData == null) {
      return false;
    }
    console.log(ipfsData);
    const metadata = ipfsData;
    this.title = metadata.approver.title;
    this.website.url = metadata.approver.website;
    this.twitter.url = metadata.approver.twitter;
    this.methods = metadata.approver.methods;
    return true;
  }

  async updateNeeded(web3Instance, ABI) {
    let changed = false;
    try {
      changed = await this.metadataChanged(ABI, web3Instance);
      return changed;
    } catch (e) {
      console.log(e);
    }
  }

  // /**
  //  * Loads the metadata if there are updates.
  //  * Returns true, if anything new has been loaded.
  //  * 
  //  * @param {*} web3Instance 
  //  * @param {*} ABI 
  //  */
  // async loadMetadata(web3Instance, ABI) {
  //   let changed = false;
  //   try {
  //     changed = await this.metadataChanged(ABI, web3Instance);
  //     console.log("approver metadata changed? " + changed);
  //     if (changed) {
  //       const hashRetrieved = await this.fetchIPFSHash(ABI, web3Instance);
  //       console.log("hashRetrieved? " + hashRetrieved);
  //       if (hashRetrieved) {
  //         const loaded = await this.loadIPFSMetadata();
  //         // this.requestTwitterVerification();
  //         // this.requestWebsiteVerification();
  //         console.log("metadata loaded? " + loaded);
  //         if (!loaded) {
  //           changed = false;
  //         }
  //       } else {
  //         changed = false;
  //       }
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     return false;
  //   }
  //   return changed;
  // }

  async requestTwitterVerification() {
    try {
    this.twitter.verification = await requestTwitterVerification(
      getHandle(this.twitter.url)
    );
    } catch(e) {
      console.log(e)
    }
  }

  async requestWebsiteVerification() {
    this.website.verification = await requestWebsiteVerification(
      this.website.url
    );
  }

  // async metadataChanged(identitySC) {
  //   const changed = await approverMetadataChanged(
  //     identitySC,
  //     this.lastFetchedBlock + 1
  //   )
  //   return changed;
  // }

  async getApprovalLevel(identitySC, userAddress) {
    const level = await identitySC.methods
      .getSecurityLevel(this.approverAddress, userAddress)
      .call();
    let method = this.methods.find((m) => Number(m.level) === Number(level));
    return method;
  }

  getMethodFromLevel(level) {
    const method = this.methods.find((m) => Number(m.level) === Number(level));
    return method ? method.value : undefined;
  }
}

export function getHandle(url) {
  return url.split("/").pop();
}

export async function requestTwitterVerification(handle) {
  console.log("request twitter verification");
  console.log(handle);
  const VERIFIER_URL = process.env.VUE_APP_TRUST_CERTIFICATES_API_URL;
  const VERIFIER_PORT = process.env.VUE_APP_TRUST_CERTIFICATES_API_PORT;
  try {
    let response = await axios.get(
      `${VERIFIER_URL}:${VERIFIER_PORT}/api/twitter?username=${handle}`
    );
    if (response.status == Number(200)) {
      console.log(response);
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function requestWebsiteVerification(url) {
  console.log(url);
  const VERIFIER_URL = process.env.VUE_APP_TRUST_CERTIFICATES_API_URL;
  const VERIFIER_PORT = process.env.VUE_APP_TRUST_CERTIFICATES_API_PORT;
  try {
    let response = await axios.get(
      `${VERIFIER_URL}:${VERIFIER_PORT}/api/website?url=${url}`
    );
    if (response.status == Number(200)) {
      console.log(response);
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function requestMailValidationCode(mail) {
  console.log(mail);
  return new Promise(resolve => {
    try {
      setTimeout(function() {
        console.log("faking API call");
        resolve(true);
      }, 1000);
    } catch {
      resolve('api call error');
    }
  });
}
