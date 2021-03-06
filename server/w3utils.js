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

}

module.exports = utils
