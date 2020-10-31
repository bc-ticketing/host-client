import IpfsHttpClient, { CID } from "ipfs-http-client";
import axios from "axios";

const ipfs = new IpfsHttpClient({
  host: "localhost",
  port: 5001,
  protocol: "http"
});

// const globalIpfs = new HttpClient({
//   host: "ipfs.io/ipfs/",
//   protocol: "https"
// })

function getIpfs() {
  return ipfs;
}

export default getIpfs;

export async function getJSONFromIpfs(hash) {
  console.log("hash start");
  console.log(hash);
  console.log("hash end")
  const url = "https://ipfs.io/ipfs/" + hash;
  // const url = "https://gateway.pinata.cloud/ipfs/" + hash;
  console.log(url);
  let data;
  const response = await axios.get(url, { timeout: 13000 });
  if (response.status == 200) {
    data = JSON.parse(response.request.responseText);
    return data;
  } else {
    return false;
  }
}

//   // console.log(response);
//   // if (response.status == 200) {
//   //   return response.data;
//   // }
//   // return false;

//   // .then(response => console.log(response)).catch(e => {
//   //   console.log(e);
//   //   return false;
//   // });



//   // const http = new XMLHttpRequest();
//   // http.open("GET", url);
//   // http.send();

//   // http.onreadystatechange=(e)=> {
//   //   console.log(http.responseText);
//   // }
//   var xmlHttp = new XMLHttpRequest();
//   const url = "http://ipfs.io/ipfs/" + hash;
//   console.log(url)
//   xmlHttp.open( "GET", url, false ); // false for synchronous request
//   xmlHttp.send( null );
//   if (xmlHttp.status == 200) {
//     return JSON.parse(xmlHttp.responseText);
//   }
//   console.log("error");
//   return false;
// }
