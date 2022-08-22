const config = require('./config')
const { ethers } = require('ethers')
const { Logger } = require('./logger')
const AssetManager = require('../miniwallet/build/contracts/AssetManager.sol/AssetManager.json')

const chainInfo = {}

const init = async () => {
  Logger.log('Initializing blockchain for server')
  try {
    Logger.log(`config.defaultNetwork: ${config.defaultNetwork}`)
    chainInfo.network = config.networks[config.defaultNetwork]
    // Logger.log(`network: ${JSON.stringify(chainInfo.network)}`)
    chainInfo.provider = ethers.getDefaultProvider(chainInfo.network.url)
    chainInfo.signer = new ethers.Wallet(chainInfo.network.key, chainInfo.provider)
    chainInfo.assetManager = new ethers.Contract(chainInfo.network.assetManagerAddress, AssetManager.abi, chainInfo.signer)
  } catch (ex) {
    console.error(ex)
    console.trace(ex)
  }
//   Logger.log(`network: ${JSON.stringify(chainInfo.network)}`)
}

module.exports = {
  init,
  getchainInfo: () => chainInfo,
  getNetwork: () => chainInfo.network,
  getProvider: () => chainInfo.provider,
  getSigner: () => chainInfo.signer,
  getAssetManager: () => chainInfo.assetManager,
}
