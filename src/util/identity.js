import { argsToCid } from "idetix-utils";
import axios from "axios";
import { getJSONFromIpfs } from "../util/getIpfs";
import { STARTING_BLOCK } from "./constants/constants";

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
      verification: false
    };
    this.twitter = {
      url: "",
      verification: false
    };
    this.lastFetchedBlock = STARTING_BLOCK;
    this.ipfsHash = "";
  }

  async loadMetadata(identityContract, currentBlock) {
    try {
      const hashRetrieved = await this.fetchIPFSHash(identityContract);
      if (hashRetrieved) {
        const loaded = await this.loadIPFSMetadata();
        if (loaded) {
          this.loadedMetadata = true;
          this.lastFetchedBlock = currentBlock;
          await this.verify();
          return true;
        }
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async fetchIPFSHash(identityContract) {
    const approverMetadata = await identityContract.methods
      .getApproverInfo(this.approverAddress)
      .call();
    if (approverMetadata == null) {
      return;
    }

    this.ipfsHash = argsToCid(
      approverMetadata.hashFunction,
      approverMetadata.size,
      approverMetadata.digest
    );
    return true;
  }

  async loadIPFSMetadata() {
    var ipfsData = null;
    ipfsData = await getJSONFromIpfs(this.ipfsHash);
    if (ipfsData == null) {
      return false;
    }
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

  async verify() {
    const twitterVerificationChanged = await this.verifyTwitter();
    const websiteVerificationChanged = await this.verifyWebsite();
    return twitterVerificationChanged || websiteVerificationChanged;
  }

  async verifyTwitter() {
    if (this.twitter.url) {
      const currentState = await requestTwitterVerification(this.twitter.url, this.approverAddress);
      if (currentState !== this.twitter.verification) {
        this.twitter.verification = currentState;
        return true;
      }
    }
    return false;
  }

  /**
   * Verifies the website of the event
   */
  async verifyWebsite() {
    if (this.website.url) {
      const currentState = await requestWebsiteVerification(this.website.url, this.approverAddress);
      if (currentState !== this.website.verification) {
        this.website.verification = currentState;
        return true;
      }
    }
    return false;
  }

  async getApprovalLevel(identitySC, userAddress) {
    const level = await identitySC.methods
      .getSecurityLevel(this.approverAddress, userAddress)
      .call();
    let method = this.methods.find(m => Number(m.level) === Number(level));
    return method;
  }

  getMethodFromLevel(level) {
    const method = this.methods.find(m => Number(m.level) === Number(level));
    return method ? method.value : undefined;
  }
}

export function getHandle(url) {
  return url.split("/").pop();
}

/**
 * Returns whether the twitter account contains the given address in the bio.
 *
 * @param {String} username
 * @param {String} address
 */
export async function requestTwitterVerification(twitter, address) {
  const VERIFIER_URL = process.env.VUE_APP_TRUST_CERTIFICATES_API;
  let username = twitter;
  if (twitter.includes("twitter.com")) {
    username = username.split("twitter.com/")[1];
  }
  try {
    let response = await axios.get(
      `${VERIFIER_URL}/twitter?username=${username}`
    );
    if (
      response.status == Number(200) &&
      response.data.eth_address === address
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function requestWebsiteVerification(url, address) {
  const VERIFIER_URL = process.env.VUE_APP_TRUST_CERTIFICATES_API;
  try {
    let response = await axios.get(`${VERIFIER_URL}/website?url=${url}`);
    if (
      response.status == Number(200) &&
      response.data.eth_address === address
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
