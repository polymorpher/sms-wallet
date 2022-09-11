const express = require('express')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const { Logger } = require('../logger')
const Twilio = require('twilio')
const blockchain = require('../blockchain')
const { ethers } = require('ethers')
const utils = require('../../server/utils')
const { parseError } = utils
const { checkFromTwilio, parseSMS } = require('./middleware')

router.get('/health', async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

router.post('/sms', checkFromTwilio, parseSMS, async (req, res) => {
  const messagingResponse = Twilio.twiml.MessagingResponse
  const response = new messagingResponse()
  // Look up the from Phone Number to get the address
  const { command, requestor, funder, amount } = req.processedBody
  Logger.log(`req.body: ${JSON.stringify(req.processedBody)}`)
  const miniWallet = blockchain.getMiniWallet()
  //   const miniWallet = miniWallets[1]

  const logger = (...args) => Logger.log('[/sms]', ...args)
  const executor = blockchain.prepareExecute(logger)

  Logger.log(`miniWallet.address: ${miniWallet.address}`)
  try {
    if (command === 'balance') {
      const balance = ethers.utils.formatEther(await miniWallet.userBalances(requestor.address))
      const response = new Twilio.twiml.MessagingResponse()
      response.message(`Your balance is ${balance} (address: ${requestor.address})`)
      return res.send(response.toString())
    } else if (command === 'pay') {
      const method = 'send'
      const params = [
        amount,
        funder.address,
        requestor.address
      ]
      const receipt = await executor(method, params)
      const response = new Twilio.twiml.MessagingResponse()
      response.message(`Payment Succesful\nfrom: ${funder.phone} (address: ${funder.address})\nto: ${requestor.phone} (address: ${requestor.address})\namount: ${ethers.utils.formatEther(amount)}\ntransaction: ${receipt.hash}`)
      return res.send(response.toString())
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid sms command' })
    }
  } catch (ex) {
    console.error(ex)
    const { code, error, success } = parseError(ex)
    response.message(`An exception occured. success: ${success} code: ${code} error: ${error.substr(0, 100)} `)
    return res.send(response.toString())
  }
})

module.exports = router
