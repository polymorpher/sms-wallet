const axios = require('axios')
const Web3 = require('web3')
const config = require('../config')
const BN = require('bn.js')
const headers = ({ secret, network }) => ({
  'X-SECRET': secret,
  'X-NETWORK': network,
})

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
      web3.eth.accounts.wallet.add(key)
    },
    changeNetwork: (network) => {
      // TODO
    }
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
      const { data } = await apiBase.post('/restore', { phone, eseed, code })
      const { ekey, address } = data
      return { ekey, address }
    }
  }
}

export default apis
