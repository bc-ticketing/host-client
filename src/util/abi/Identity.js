/* eslint no-use-before-define: 0 */ // --> OFF
export const IDENTITY_ADDRESS = "0x067b6772E882b541121a2af3Cf947E27D1edf4E9"; // docker
// export const IDENTITY_ADDRESS = "0x58344E4d66f335DCE8b809E1A16D374412B66F63";
export const IDENTITY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "approverAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes1",
        "name": "hashFunction",
        "type": "bytes1"
      },
      {
        "indexed": false,
        "internalType": "bytes1",
        "name": "size",
        "type": "bytes1"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "digest",
        "type": "bytes32"
      }
    ],
    "name": "ApproverRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes1",
        "name": "_hashFunction",
        "type": "bytes1"
      },
      {
        "internalType": "bytes1",
        "name": "_size",
        "type": "bytes1"
      },
      {
        "internalType": "bytes32",
        "name": "_digest",
        "type": "bytes32"
      }
    ],
    "name": "registerApprover",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_identity",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "_level",
        "type": "uint8"
      }
    ],
    "name": "approveIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_approver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_identity",
        "type": "address"
      }
    ],
    "name": "getSecurityLevel",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_approver",
        "type": "address"
      }
    ],
    "name": "getApproverInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes1",
            "name": "hashFunction",
            "type": "bytes1"
          },
          {
            "internalType": "bytes1",
            "name": "size",
            "type": "bytes1"
          },
          {
            "internalType": "bytes32",
            "name": "digest",
            "type": "bytes32"
          }
        ],
        "internalType": "struct Identity.IpfsCid",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_approver",
        "type": "address"
      }
    ],
    "name": "hasRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
