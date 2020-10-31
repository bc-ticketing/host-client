import { argsToCid } from "idetix-utils";
import axios from "axios";
import { getJSONFromIpfs } from "../util/getIpfs";
import { STARTING_BLOCK } from "./constants/constants";
// import { eventMetadataChanged } from "./blockchainEventHandler";

export class IdentityApprover {
  constructor(approverAddress) {
    if (typeof approverAddress === "object") {
      Object.assign(this, approverAddress);
      this.approverAddress = approverAddress.approverAddress;
      return;
    }
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

  async fetchIPFSHash(identitySC) {
    //const approverSC = new web3Instance.eth.Contract(ABI, this.approverAddress);
    const approverMetadata = await identitySC.methods
      .getApproverInfo(this.approverAddress)
      .call();
    this.ipfsHash = argsToCid(
      approverMetadata.hashFunction,
      approverMetadata.size,
      approverMetadata.digest
    );
    return true;
  }

  async loadIPFSMetadata(ipfsInstance) {
    var ipfsData = null;
    if (this.ipfsHash == null) {
      console.log("ipfshash was null");
      return;
    }
    ipfsData = await getJSONFromIpfs(this.ipfsHash);
    if (ipfsData == null) {
      return;
    }
    console.log(ipfsData)
    // for await (const chunk of ipfsInstance.cat(this.ipfsHash, {
    //   timeout: 2000,
    // })) {
    //   ipfsData = Buffer(chunk, "utf8").toString();
    // }
    const metadata = JSON.parse(ipfsData);
    this.title = metadata.approver.title;
    this.website.url = metadata.approver.website;
    this.twitter.url = metadata.approver.twitter;
    this.methods = metadata.approver.methods;
  }

  async loadData(identitySC, ipfsInstance) {
    await this.fetchIPFSHash(identitySC);
    await this.loadIPFSMetadata(ipfsInstance);
    // this.requestTwitterVerification();
    // this.requestUrlVerification();
  }

  async requestTwitterVerification() {
    try {
    this.twitter.verification = await requestTwitterVerification(
      getHandle(this.twitter.url)
    );
    } catch(e) {
      console.log(e)
    }
  }

  async requestUrlVerification() {
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
