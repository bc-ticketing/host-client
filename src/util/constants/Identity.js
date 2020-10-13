/* eslint no-use-before-define: 0 */ // --> OFF
const IDENTITY_ADDRESS = "0x68bB3B61635C932a4c1711Ea1B398BFb9F1c1874";
const IDENTITY_ABI = [
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
    "type": "function",
    "constant": true
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
    "type": "function",
    "constant": true
  }
]

export { IDENTITY_ADDRESS, IDENTITY_ABI }