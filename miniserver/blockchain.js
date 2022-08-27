const config = require('./config')
const { ethers } = require('ethers')
const { Logger } = require('./logger')
const AssetManager = require('../miniwallet/build/contracts/AssetManager.sol/AssetManager.json')

let networkConfig = {}
let provider
const signers = []
const assetManagers = []
const walletPath = 'm/44\'/60\'/0\'/0/' // https://docs.ethers.io/v5/api/signer/#Wallet.fromMnemonic'

const init = async () => {
  Logger.log('Initializing blockchain for server')
  try {
    Logger.log(`config.defaultNetwork: ${config.defaultNetwork}`)
    networkConfig = config.networks[config.defaultNetwork]
    Logger.log(`network: ${JSON.stringify(networkConfig)}`)
    provider = ethers.getDefaultProvider(networkConfig.url)
    provider.pollingInterval = config.pollingInterval
    if (networkConfig.mnemonic) {
      for (let i = 0; i < networkConfig.numAccounts; i += 1) {
        const path = walletPath + i.toString()
        Logger.log(`path: ${path}`)
        const signer = new ethers.Wallet.fromMnemonic(networkConfig.mnemonic, path)
        signers[i] = signer.connect(provider)
      }
    } else {
      signers[0] = new ethers.Wallet(networkConfig.key, networkConfig.provider)
    }
    for (let i = 0; i < signers.length; i += 1) {
      Logger.log(`signers[${i}].address; ${JSON.stringify(signers[i].address)}`)
      assetManagers[i] = new ethers.Contract(networkConfig.assetManagerAddress, AssetManager.abi, signers[i])
    }
  } catch (ex) {
    console.error(ex)
    console.trace(ex)
  }
}

module.exports = {
  init,
  getNetworkConfig: () => networkConfig,
  getProvider: () => provider,
  getSigners: () => signers,
  getAssetManagers: () => assetManagers,
}
