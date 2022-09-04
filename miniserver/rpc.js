const axios = require('axios')
const config = require('./config')
const { ethers } = require('ethers')
const utils = require('../server/utils')
const { hexStringToBytes } = utils

const rpc = {
  getNonce: async ({ address, network, qualifier = 'latest' }) => {
    const { data: { result } } = await axios.post(config.networks[network].url, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount', // eth_getAccountNonce also works but is nonstandard (Harmony only)
      params: [
        address,
        qualifier
      ],
      id: 1
    })
    const bn = ethers.BigNumber.from(result.slice(2))
    return bn.toNumber()
  },
  getCode: async ({ address, network, qualifier = 'latest' }) => {
    const { data: { result } } = await axios.post(config.networks[network].url, {
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [
        address,
        qualifier
      ],
      id: 1
    })
    return hexStringToBytes(result)
  },
  gasPrice: async ({ network }) => {
    const url = config.networks[network].url
    const { data: { result } } = await axios.post(url, {
      jsonrpc: '2.0',
      method: 'eth_gasPrice', // eth_getAccountNonce also works but is nonstandard (Harmony only)
      params: [],
      id: 1
    })
    const bn = ethers.BigNumber.from(result.slice(2))
    return bn.toNumber()
  }
}

module.exports = { rpc }
