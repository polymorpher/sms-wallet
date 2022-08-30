const express = require('express')
const config = require('../config')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const { Logger } = require('../logger')
const { phone } = require('phone')
const Twilio = require('twilio')
const { User } = require('../src/data/user')
const { toNumber } = require('lodash')
const blockchain = require('../blockchain')
const { ethers } = require('ethers')

router.get('/health', async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

const checkfromTwilio = async (req, res, next) => {
  // if not in debug mode check valid Twilio Request
  if (config.debug ? false : !Twilio.validateRequest(config.twilio.token, req.headers['x-twilio-signature'], (req.protocol + req.get('host') + req.path), req.body)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'request not from twilio' })
  }
  next()
}

// parseSMS parses a message and returns command, requestor, funder, amount
// Balance Example : smsBody = 'b' returns balance requestor.address
// Payment Example : smsbody = 'p 4158401410 0.1' returns pay requestor.address funder.address 0.1
const parseSMS = async (req, res, next) => {
  const { From: senderPhoneNumber, Body: smsBody } = req.body
  const smsParams = smsBody.split(/(\s+)/).filter(e => { return e.trim().length > 0 })

  let command
  const requestor = await User.findByPhone({ phone: senderPhoneNumber })

  if (smsParams.length < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'empty sms command' })
  }
  if (smsParams[0] === 'b') {
    command = 'balance'
    req.processedBody = { ...req.processedBody, command, requestor }
  } else if (smsParams[0] === 'p') {
    command = 'pay'
    let funder
    let amount
    if (smsParams.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'pay request requires a to and an amount' })
    }
    // Allow requesting of funds from users by address (without checking registered phone number)
    if (smsParams[1].substr(0, 2) === '0x') {
      funder.address = smsParams[1]
    } else {
      // set country and look up user address from Phone Number
      let funderPhone = smsParams[1]
      if (funderPhone.substr(0, 1) !== '+') {
        const { countryIso3 } = phone(requestor.phone)
        const { isValid, phoneNumber } = phone(funderPhone, countryIso3)
        funderPhone = phoneNumber
        if (!isValid) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid recipient phone number' })
        }
      }
      funder = await User.findByPhone({ phone: funderPhone })
      console.log(`funder: ${JSON.stringify(funder)}`)
      if (funder ? !funder.address : true) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid recipient' })
      }
    }

    if (toNumber(smsParams[2]) > 0) {
      console.log('good request')
      amount = ethers.utils.parseEther(smsParams[2])
    } else {
      console.log('bad request')
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'pay request requires a valid amount' })
    }
    req.processedBody = { ...req.processedBody, command, requestor, funder, amount }
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid sms command' })
  }
  next()
}

router.post('/sms', checkfromTwilio, parseSMS, async (req, res) => {
  // Look up the from Phone Number to get the address
  const { command, requestor, funder, amount } = req.processedBody
  Logger.log(`req.body: ${JSON.stringify(req.processedBody)}`)
  const assetManagers = blockchain.getAssetManagers()
  const assetManager = assetManagers[1]

  const logger = (...args) => Logger.log('[/sms]', ...args)
  const executor = blockchain.prepareExecute(logger)

  Logger.log(`assetManager.address: ${assetManager.address}`)
  if (command === 'balance') {
    const balance = ethers.utils.formatEther(await assetManager.userBalances(requestor.address))
    const messagingResponse = Twilio.twiml.MessagingResponse
    const response = new messagingResponse()
    response.message(`phone: ${requestor.phone} address: ${requestor.address}, balance: ${balance} `)
    return res.send(response.toString())
  } else if (command === 'pay') {
    const method = 'send'
    const params = [
      amount,
      funder.address,
      requestor.address
    ]
    const receipt = await executor(method, params)
    const messagingResponse = require('twilio').twiml.MessagingResponse
    const response = new messagingResponse()
    response.message(`from: ${funder.phone}, from address: ${funder.address}, to: ${requestor.phone}, to address: ${requestor.address}, amount: ${ethers.utils.formatEther(amount)}, transaction: ${receipt.hash}`)
    return res.send(response.toString())
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid sms command' })
  }
})

module.exports = router
