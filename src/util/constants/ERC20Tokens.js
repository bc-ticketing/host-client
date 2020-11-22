const ETH = "0x0000000000000000000000000000000000000000";
const ETH_DECIMALS = 18;
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const DAI_DECIMALS = 18;
// const ERC20TESTTOKEN = "0x3F5D696221A756E4Cc5842A2f2069230Ce72F8b1";
const ERC20TESTTOKEN = "0xf88D4b83Aa41d7E810d7235cC19365F0e522730C"; // docker
const ERC20TESTTOKEN_DECIMALS = 18;

export { ETH, ETH_DECIMALS, DAI, DAI_DECIMALS, ERC20TESTTOKEN, ERC20TESTTOKEN_DECIMALS };

const erc20TokenMap = {ETH: ETH, DAI: DAI, "ERC20 Test Token": ERC20TESTTOKEN};

export function getCurrencySymbol(tokenAddress) {
  return Object.keys(erc20TokenMap).find(key => erc20TokenMap[key] === tokenAddress);
}

export function getCurrencyDecimals(tokenAddress) {
  if (tokenAddress === ERC20TESTTOKEN) {
    return ERC20TESTTOKEN_DECIMALS;
  } else if (tokenAddress === DAI) {
    return DAI_DECIMALS;
  }
  return ETH_DECIMALS;
}
