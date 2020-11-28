const ETH = "0x0000000000000000000000000000000000000000";
const ETH_DECIMALS = 18;
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const DAI_DECIMALS = 18;
const ERC20TESTTOKEN = "0xBFd25cac00F0E9a0cdFA634bdaED379FdC69E24d";
const ERC20TESTTOKEN_DECIMALS = 18;

export { ETH, ETH_DECIMALS, DAI, DAI_DECIMALS, ERC20TESTTOKEN, ERC20TESTTOKEN_DECIMALS };

const erc20TokenMap = {ETH: ETH, DAI: DAI, "ERC20": ERC20TESTTOKEN};

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
