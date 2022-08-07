require('dotenv').config()

module.exports = {
  localnetPrivateKey: process.env.LOCALNET_PRIVATE_KEY,
  localgethPrivateKey: process.env.LOCALGETH_PRIVATE_KEY,
  hardhatPrivateKey: process.env.HARDHAT_PRIVATE_KEY,
  hardhatURL: process.env.HARDHAT_URL,
  localnetURL: process.env.LOCALNET_URL,
  devnetURL: process.env.DEVNET_URL,
  testnetURL: process.env.TESTNET_URL,
  mainnetURL: process.env.MAINNET_URL,
  localgethURL: process.env.LOCALGETH_URL,
  ropstenURL: process.env.ROPSTEN_URL,
  sepoliaURL: process.env.SEPOLIA_URL,
  ethereumURL: process.env.ETHEREUM_URL,
  etherscanAPI: process.env.ETHERSCAN_API_KEY,
  privateKey: process.env.PRIVATE_KEY,
  hmyURL: process.env.HMY_URL,
  ethURL: process.env.ETH_URL,
  gasLimit: process.env.GAS_LIMIT,
  gasPrice: process.env.GAS_PRICE,
  verbose: process.env.VERBOSE === 'true' || process.env.VERBOSE === '1',
  reportGas: false,
  initialOperatorThreshold: process.env.INITIAL_OPERATOR_THRESHOLD,
  // use JSON.parse to parse the array of relayers
  operators: JSON.parse(process.env.OPERATORS)
}