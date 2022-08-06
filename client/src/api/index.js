import { utils } from '../utils'
import axios from 'axios'
import Web3 from 'web3'
import config from '../config'
import BN from 'bn.js'

const headers = ({ secret, network }) => ({
  'X-SECRET': secret,
  'X-NETWORK': network,
})

console.log(config)

const TIMEOUT = 60000
const apiBase = axios.create({
  baseURL: config.server,
  headers: headers({ secret: config.secret, network: config.network }),
  timeout: TIMEOUT,
})

const web3 = new Web3(config.rpc)

const apis = {
  web3: {
    web3,
    changeAccount: (key) => {
      web3.eth.accounts.wallet.clear()
      if (key) {
        const { address } = web3.eth.accounts.wallet.add(key)
        web3.eth.defaultAccount = address
      } else {
        web3.eth.defaultAccount = ''
      }
    },
    changeNetwork: (network) => {
      // TODO
    },
    getAddress: (key) => {
      if (typeof key !== 'string') {
        key = utils.hexString(key)
      }
      return web3.eth.accounts.privateKeyToAccount(key).address
    },
    isValidAddress: (address) => {
      try {
        return web3.utils.isAddress(address)
      } catch (ex) {
        console.error(ex)
        return false
      }
    },
    signWithNonce: (msg, key) => {
      const nonce = Math.floor(Date.now() / (config.defaultSignatureValidDuration)) * config.defaultSignatureValidDuration
      const message = `${msg} ${nonce}`
      return web3.eth.accounts.sign(message, key).signature
    },
  },
  blockchain: {
    getBalance: async ({ address }) => {
      const b = await web3.eth.getBalance(address)
      return new BN(b)
    }
  },
  server: {
    signup: async ({ phone, eseed, ekey, address }) => {
      const { data } = await apiBase.post('/signup', { phone, eseed, ekey, address })
      const { hash } = data
      return hash
    },
    verify: async ({ phone, eseed, ekey, address, code, signature }) => {
      const { data } = await apiBase.post('/verify', { phone, eseed, ekey, address, code, signature })
      const { success } = data
      return success
    },
    restore: async ({ phone, eseed }) => {
      const { data } = await apiBase.post('/restore', { phone, eseed })
      const { success } = data
      return success
    },
    restoreVerify: async ({ phone, eseed, code }) => {
      const { data } = await apiBase.post('/restore-verify', { phone, eseed, code })
      const { ekey, address } = data
      return { ekey, address }
    },
    lookup: async ({ destPhone, address, signature }) => {
      const { data } = await apiBase.post('/lookup', { destPhone, address, signature })
      const { address: destAddress } = data
      return destAddress
    },
    settings: async ({ address, signature, newSetting = {} }) => {
      const { data } = await apiBase.post('/settings', { newSetting, address, signature })
      const { address: destAddress } = data
      return destAddress
    },
    requestView: async ({ address, signature, id }) => {
      const { data } = await apiBase.post('/request-view', { address, signature, id })
      const { request, hash } = data
      return { request, hash }
    },
    requestComplete: async ({ address, signature, id, txHash }) => {
      const { data } = await apiBase.post('/request-complete', { address, signature, id, txHash })
      const { success } = data
      return success
    }
  }
}
if (window) {
  window.apis = apis
}
export default apis
