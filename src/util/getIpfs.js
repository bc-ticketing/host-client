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
  const url = "http://ipfs.io/ipfs/" + hash;
  console.log(url)
  let data;
  await axios.get(url, { timeout: 5000 })
  .then(response => {
    console.log("response:")
    console.log(response.request);
    data = JSON.parse(response.request.responseText);
  })
  .catch(err => {
      console.log("error: ");
      console.log(err);
  });
  return data;
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
