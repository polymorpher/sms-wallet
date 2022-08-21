const config = require('./config')
const { ethers } = require('ethers')
const { Logger } = require('./logger')
const AssetManager = require('../miniwallet/build/contracts/AssetManager.sol/AssetManager.json')

const networks = []
const providers = {}
const signers = {}
const assetManagers = {}

const init = async () => {
  Logger.log('Initializing blockchain for server')
  Object.keys(config.networks).forEach(k => {
    if (config.networks[k].skip) {
      Logger.log(`[${k}] Skipped initialization`)
      return
    }
    const n = config.networks[k]
    if (n.key) {
      try {
        Logger.log(`n.url: ${n.url}`)
        providers[k] = ethers.getDefaultProvider(n.url)
        Logger.log(`n.key: ${n.key}`)
        signers[k] = new ethers.Wallet(n.key, providers[k])
        Logger.log(`am address; ${config.networks[k].assetManagerAddress}`)
        // console.log(`AssetManager.abi: ${JSON.stringify(AssetManager.abi)}`)
        assetManagers[k] = new ethers.Contract(config.networks[k].assetManagerAddress, AssetManager.abi, signers[k])
        Logger.log('AssetManager deployed to:', assetManagers[k].address)
        networks.push(k)
      } catch (ex) {
        console.error(ex)
        console.trace(ex)
      }
    }
  })
  console.log(`networks: ${networks}`)
}

module.exports = {
  init,
  getNetworks: () => networks,
  getProvider: (network) => providers[network],
  getSigner: (network) => signers[network],
  getAssetManager: (network) => assetManagers[network],
}
