const Web3 = require('web3')
// const crypto = require('crypto')
const web3 = new Web3()

const utils = {
  ecrecover: (message, signature) => {
    try {
      return web3.eth.accounts.recover(message, signature)
    } catch (ex) {
      console.error(ex)
      return null
    }
  },
  checkSumAddress: (address) => {
    try {
      return web3.utils.toChecksumAddress(address)
    } catch (ex) {
      console.error(ex)
      return null
    }
  },
  isValidAddress: (address) => {
    try {
      return web3.utils.isAddress(address)
    } catch (ex) {
      console.error(ex)
      return false
    }
  },
  isSameAddress: (address1, address2) => {
    if (!address1 || !address2) {
      return false
    }
    return address1.toLowerCase() === address2.toLowerCase()
  },

}

module.exports = utils
