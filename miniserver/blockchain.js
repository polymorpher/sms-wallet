const config = require('./config')
const { ethers } = require('ethers')
const { Logger } = require('./logger')
const cloneDeep = require('lodash/fp/cloneDeep')
const { backOff } = require('exponential-backoff')
const { rpc } = require('./rpc')
const MiniWallet = require('./abi/MiniWallet.json')
const constants = require('../server/constants')
const networkConfig = config.networks[config.defaultNetwork]

let provider
let miniWallet
const pendingNonces = {}
const signers = []

const init = async () => {
  if (provider && miniWallet && signers.length > 0) {
    throw new Error('Already initialized')
  }
  for (const k of Object.keys(pendingNonces)) {
    delete pendingNonces[k]
  }

  try {
    Logger.log('Initializing blockchain for server')
    Logger.log(`network=${config.defaultNetwork}, ${JSON.stringify(networkConfig)}`)
    provider = ethers.getDefaultProvider(networkConfig.url)
    miniWallet = new ethers.Contract(networkConfig.miniWalletAddress, MiniWallet, provider)
    provider.pollingInterval = config.pollingInterval
    signers.splice(0, signers.length)
    if (networkConfig.mnemonic) {
      for (let i = 0; i < networkConfig.numAccounts; i += 1) {
        const path = constants.WalletPath + i.toString()
        Logger.log(`path: ${path}`)
        const signer = new ethers.Wallet.fromMnemonic(networkConfig.mnemonic, path)
        signers.push(signer.connect(provider))
      }
    } else {
      signers.push(new ethers.Wallet(networkConfig.key, networkConfig.provider))
    }
    Logger.log(`miniWallet.address: ${miniWallet.address}`)
  } catch (ex) {
    console.error(ex)
    console.trace(ex)
  }
  for (const signer of signers) {
    pendingNonces[signer.address] = 0
    Logger.log(`[${config.defaultNetwork}][${signer.address}] Set pending nonce = 0`)
  }
}

const sampleExecutionAddress = () => {
  // TODO: add atomic lock
  const nonces = cloneDeep(pendingNonces)
  const probs = []
  let sum = 0
  for (const signer of signers) {
    const p = 1.0 / Math.exp(nonces[signer.address])
    probs.push(p)
    sum += p
  }
  const r = Math.random() * sum
  let s = 0
  for (let i = 0; i < probs.length; i++) {
    s += probs[i]
    if (s >= r) {
      return i
    }
  }
  return signers.length - 1
}

// basic executor used to send funds
const prepareExecute = (logger = Logger.log, abortUnlessRPCError = true) => async (method, ...params) => {
  console.log(`method: ${method}`)
  console.log(`params: ${JSON.stringify(params)}`)
  const fromIndex = sampleExecutionAddress()
  const from = signers[fromIndex].address
  const miniWalletSigner = miniWallet.connect(signers[fromIndex])
  logger(`Sampled [${fromIndex}] ${from}`)
  const latestNonce = await rpc.getNonce({ address: from, network: config.defaultNetwork })
  const gasPrice = await provider.getGasPrice()
  const snapshotPendingNonces = pendingNonces[from]
  const nonce = latestNonce + snapshotPendingNonces
  pendingNonces[from] += 1
  const t0 = performance.now()
  const elapsed = () => (performance.now() - t0).toFixed(3)
  const printNonceStats = () => `[elapsed=${elapsed()}ms][network=${config.defaultNetwork}][account=${fromIndex}][nonce=${nonce}][snapshot=${snapshotPendingNonces}][current=${pendingNonces[from]}]`
  try {
    logger(`[pending]${printNonceStats()}`)
    let numAttempts = 0
    const tx = await backOff(
      async () => miniWalletSigner[method](...params, {
        nonce,
        gasPrice: gasPrice.mul((numAttempts || 0) + 1),
        value: 0,
      }), {
        retry: (ex, n) => {
          if (ex?.abort) {
            console.error('[error-abort]', ex)
            logger(`[abort][attempts=${n}]${printNonceStats()}`)
            return false
          }
          if (!ex?.receipt && !ex?.response?.data && abortUnlessRPCError) {
            console.error('[error-abort-before-rpc]', ex)
            logger(`[abort-before-rpc][attempts=${n}]${printNonceStats()}`)
            return false
          }
          console.error('[error]', ex?.response?.status, ex)
          numAttempts = n
          logger(`[retry][attempts=${n}]${printNonceStats()}`)
          return true
        }
      })
    logger(`[complete]${printNonceStats()}`, JSON.stringify(tx, null, 2))
    return tx
  } catch (ex) {
    logger(`[error]${printNonceStats()}`, ex)
    throw ex
  } finally {
    pendingNonces[from] -= 1
  }
}

module.exports = {
  init,
  getNetworkConfig: () => networkConfig,
  getProvider: () => provider,
  getSigners: () => signers,
  getMiniWallet: () => miniWallet,
  prepareExecute
}
