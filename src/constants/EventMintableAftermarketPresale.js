const EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI = [
    {
        "inputs": [
            {
                "internalType": "address payable",
                "name": "_owner",
                "type": "address"
            },
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
            },
            {
                "internalType": "address",
                "name": "_identityContract",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_identityApprover",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "_identityLevel",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "_erc20Contract",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "_granularity",
                "type": "uint8"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
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
        "name": "EventMetadata",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ticketType",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "MintFungibles",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "ids",
                "type": "uint256[]"
            }
        ],
        "name": "MintNonFungibles",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ticketType",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "supply",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "block",
                "type": "uint256"
            }
        ],
        "name": "PresaleCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "luckyNumber",
                "type": "uint256"
            }
        ],
        "name": "PresaleJoined",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ticketType",
                "type": "uint256"
            }
        ],
        "name": "TicketClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "ticketTypeId",
                "type": "uint256"
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
        "name": "TicketMetadata",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "TicketPriceRefunded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ticketType",
                "type": "uint256"
            }
        ],
        "name": "TicketTransferred",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "name": "allowedPercentages",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "name": "buyingQueue",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "head",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "tail",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "numberTickets",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            }
        ],
        "name": "claim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
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
            },
            {
                "internalType": "bool",
                "name": "_isNF",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "_price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_finalizationBlock",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_supply",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_block",
                "type": "uint256"
            }
        ],
        "name": "createPresaleType",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes1[]",
                "name": "_hashFunctions",
                "type": "bytes1[]"
            },
            {
                "internalType": "bytes1[]",
                "name": "_sizes",
                "type": "bytes1[]"
            },
            {
                "internalType": "bytes32[]",
                "name": "_digests",
                "type": "bytes32[]"
            },
            {
                "internalType": "bool[]",
                "name": "_isNFs",
                "type": "bool[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_prices",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_finalizationBlocks",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "_initialSupplys",
                "type": "uint256[]"
            }
        ],
        "name": "createTypes",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "entries",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "erc20Contract",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fNonce",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            }
        ],
        "name": "fillBuyOrderFungibles",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "_ids",
                "type": "uint256[]"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            }
        ],
        "name": "fillBuyOrderNonFungibles",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            }
        ],
        "name": "fillSellOrderFungibles",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "_ids",
                "type": "uint256[]"
            },
            {
                "internalType": "uint8[]",
                "name": "_percentages",
                "type": "uint8[]"
            }
        ],
        "name": "fillSellOrderNonFungibles",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            }
        ],
        "name": "getNumberOfTicketOffers",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            }
        ],
        "name": "getNumberOfTicketsForSale",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "getQueuedUserBuying",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address payable",
                        "name": "userAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IdetixLibrary.QueuedUser",
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
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "getQueuedUserSelling",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address payable",
                        "name": "userAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "quantity",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IdetixLibrary.QueuedUser",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "granularity",
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
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            }
        ],
        "name": "hasWon",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "identityApprover",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "identityContract",
        "outputs": [
            {
                "internalType": "contract Identity",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "identityLevel",
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
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_addedSupply",
                "type": "uint256"
            }
        ],
        "name": "increaseSupply",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "isExistingType",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            }
        ],
        "name": "joinPresale",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "lotteries",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "supply",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "block",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            }
        ],
        "name": "makeBuyOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            }
        ],
        "name": "makeSellOrderFungibles",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "_ids",
                "type": "uint256[]"
            },
            {
                "internalType": "uint8[]",
                "name": "_percentages",
                "type": "uint8[]"
            }
        ],
        "name": "makeSellOrderNonFungibles",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "maxTicketsPerPerson",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
            }
        ],
        "name": "mintFungible",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "_ids",
                "type": "uint256[]"
            }
        ],
        "name": "mintNonFungibles",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "nfMintCounter",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nfNonce",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "nfOwners",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "nfTickets",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "userAddress",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "percentage",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "nfsForSale",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "nonces",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "ownerOf",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "name": "sellingQueue",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "head",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "tail",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "numberTickets",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
            }
        ],
        "name": "setMaxTicketsPerPerson",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "ticketTypeMeta",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "finalizationBlock",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "supply",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "ticketsSold",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "tickets",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "totalInBuying",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "totalInSelling",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_receiver",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "transferValue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
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
        "name": "updateEventMetadata",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "withdrawBuyOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_type",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_quantity",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "_percentage",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "withdrawSellOrderFungible",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "withdrawSellOrderNonFungible",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

export { EVENT_MINTABLE_AFTERMARKET_PRESALE_ABI };
