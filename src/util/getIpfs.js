import axios from "axios";
import { IPFS_TIMEOUT } from "./constants/constants"

export async function getJSONFromIpfs(hash) {
  const url = "https://ipfs.io/ipfs/" + hash;
  let data;
  const response = await axios.get(url, { timeout: IPFS_TIMEOUT });
  if (response.status == 200) {
    data = JSON.parse(response.request.responseText);
    return data;
  } else {
    return false;
  }
}
