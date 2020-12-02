import axios from "axios";
import { IPFS_TIMEOUT } from "./constants/constants"

export async function getJSONFromIpfs(hash) {
  console.log("hash start");
  console.log(hash);
  console.log("hash end")
  const url = "https://ipfs.io/ipfs/" + hash;
  // const url = "https://gateway.pinata.cloud/ipfs/" + hash;
  console.log(url);
  let data;
  const response = await axios.get(url, { timeout: IPFS_TIMEOUT });
  if (response.status == 200) {
    data = JSON.parse(response.request.responseText);
    return data;
  } else {
    return false;
  }
}
