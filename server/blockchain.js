const config = require('./config')
const { ethers } = require('ethers')
const { Logger } = require('./logger')
const AssetManager = require('../miniwallet/build/contracts/AssetManager.sol/AssetManager.json')

const networks = []
const providers = {}
const signers = {}
const assetManager = {}

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
        providers[k] = ethers.getDefaultProvider(n.url)
        signers[k] = new ethers.Wallet(n.key, providers[k])
        assetManager[k] = new ethers.Contract(config.networks[k].assetManagerAddress, AssetManager.abi, signers[k])
        Logger.log('AssetManager deployed to:', assetManager[k].address)
        networks.push(k)
      } catch (ex) {
        console.error(ex)
        console.trace(ex)
      }
    }
  })
  Object.keys(config.networks).forEach(k => {
  })
}

module.exports = {
  init
}