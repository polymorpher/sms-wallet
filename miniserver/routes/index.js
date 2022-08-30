const express = require('express')
const config = require('../config')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const { Logger } = require('../logger')
const { phone } = require('phone')
const Twilio = require('twilio')
// const { User } = require('../src/data/user')
const { User } = require('../../server/src/data/user')
const { toNumber } = require('lodash')
const blockchain = require('../blockchain')
const { ethers } = require('ethers')
const utils = require('../utils')
const { parseError } = utils

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
  const messagingResponse = Twilio.twiml.MessagingResponse
  const response = new messagingResponse()
  try {
    let command
    const requestor = await User.findByPhone({ phone: senderPhoneNumber })
    if (smsParams.length < 1) {
      response.message('error: empy sms command')
      return res.send(response.toString())
    }
    if (smsParams[0] === 'b') {
      command = 'balance'
      req.processedBody = { ...req.processedBody, command, requestor }
    } else if (smsParams[0] === 'p') {
      command = 'pay'
      let funder
      let amount
      if (smsParams.length < 2) {
        response.message('error: pay request requires funder and an amount. example request "p +14158401999 0.1"')
        return res.send(response.toString())
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
            response.message(`error: invalid recipient phone number ${smsParams[1]}. example request "p +14158401999 0.1"`)
            return res.send(response.toString())
          }
        }
        funder = await User.findByPhone({ phone: funderPhone })
        if (funder ? !funder.address : true) {
          response.message(`error: funders phone number is not a registered wallet: ${smsParams[1]}. example request "p +14158401999 0.1"`)
          return res.send(response.toString())
        }
      }

      if (toNumber(smsParams[2]) > 0) {
        amount = ethers.utils.parseEther(smsParams[2])
      } else {
        response.message(`error: pay request requires a valid amount': ${smsParams[2]} example request "p +14158401999 0.1"`)
        return res.send(response.toString())
      }
      req.processedBody = { ...req.processedBody, command, requestor, funder, amount }
    } else {
      response.message('error: invalid sms command. example payment request "p +14158401999 0.1"')
      return res.send(response.toString())
    }
  } catch (ex) {
    console.error(ex)
    const { code, error, success } = parseError(ex)
    response.message(`An exception occured. success: ${success} code: ${code} error: ${error.substr(0, 100)} `)
    return res.send(response.toString())
  }
  next()
}

router.post('/sms', checkfromTwilio, parseSMS, async (req, res) => {
  const messagingResponse = Twilio.twiml.MessagingResponse
  const response = new messagingResponse()
  // Look up the from Phone Number to get the address
  const { command, requestor, funder, amount } = req.processedBody
  Logger.log(`req.body: ${JSON.stringify(req.processedBody)}`)
  const miniWallets = blockchain.getMiniWallets()
  const miniWallet = miniWallets[1]

  const logger = (...args) => Logger.log('[/sms]', ...args)
  const executor = blockchain.prepareExecute(logger)

  Logger.log(`miniWallet.address: ${miniWallet.address}`)
  try {
    if (command === 'balance') {
      const balance = ethers.utils.formatEther(await miniWallet.userBalances(requestor.address))
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
      const messagingResponse = Twilio.twiml.MessagingResponse
      const response = new messagingResponse()
      response.message(`from: ${funder.phone}, from address: ${funder.address}, to: ${requestor.phone}, to address: ${requestor.address}, amount: ${ethers.utils.formatEther(amount)}, transaction: ${receipt.hash}`)
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
