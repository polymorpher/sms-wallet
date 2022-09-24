const express = require('express')
const config = require('../config')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const { Logger } = require('../logger')
const { phone } = require('phone')
const Twilio = require('twilio')
const { User } = require('../../server/src/data/user')
const { toNumber } = require('lodash')
const blockchain = require('../blockchain')
const { ethers } = require('ethers')
const { isValidAddress, checkSumAddress } = require('../../server/w3utils')

router.get('/health', async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

const twilioValidation = async (req, res, next) => {
  // if not in debug mode check valid Twilio Request
  if (config.debug) {
    return next()
  }
  if (Twilio.validateRequest(config.twilio.token, req.headers['x-twilio-signature'], (req.protocol + req.get('host') + req.path), req.body)) {
    return next()
  }
  return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Twilio signature validation failure' })
}

// parseSMS parses a message and returns command, requester, funder, amount
// Balance Example : smsBody = 'b' returns balance requester.address
// Payment Example : smsbody = 'p 4158401410 0.1' returns pay requester.address funder.address 0.1
const parseSMS = async (req, res, next) => {
  const { From: senderPhoneNumber, Body: smsBody } = req.body
  const smsParams = smsBody.split(/(\s+)/).filter(e => { return e.trim().length > 0 })
  const respond = (text, status = StatusCodes.OK) => {
    const response = new Twilio.twiml.MessagingResponse()
    response.message(text)
    res.status(status).send(response.toString())
  }
  try {
    const { address: fromAddress } = (await User.findByPhone({ phone: senderPhoneNumber })) || {}
    if (!fromAddress) {
      return respond('You are not registered. Signup at https://smswallet.xyz')
    }
    if (smsParams.length < 1) {
      return respond('error: empty sms command')
    }
    if (smsParams[0] === 'b') {
      req.processedBody = { ...req.processedBody, command: 'balance', fromAddress }
      return next()
    }
    if (smsParams[0] === 'p') {
      if (smsParams.length < 2) {
        return respond('error: pay request requires recipient and an amount. example request "p +16505473175 0.1"')
      }
      if (!(toNumber(smsParams[2]) > 0)) {
        return respond(`error: pay request requires a valid amount': ${smsParams[2]} example request "p +116505473175 0.1"`)
      }
      const amount = ethers.utils.parseEther(smsParams[2])
      let toAddress
      // Allow sending of funds to users by address (without checking registered phone number)
      if (smsParams[1].substr(0, 2) === '0x') {
        if (!isValidAddress(smsParams[1])) {
          return respond(`error: invalid recipient address ${smsParams[1]}. example request "p 0x58bB8c7D2c90dF970fb01a5cD29c4075C41d3FFB 0.1"`)
        }
        toAddress = checkSumAddress(smsParams[1])
      } else {
        const { isValid, phoneNumber } = phone(smsParams[1], smsParams[1] === '+' ? undefined : phone(u.phone).countryIso3)
        if (!isValid) {
          return respond(`error: invalid recipient phone number ${smsParams[1]}. example request "p +16505473175 0.1"`)
        }
        const u2 = await User.findByPhone({ phone: phoneNumber })
        if (!u2?.address) {
          return respond(`error: recipients phone number is not a registered wallet: ${smsParams[1]}. example request "p +16505473175 0.1"`)
        }
        toAddress = u2.address
      }
      req.processedBody = { ...req.processedBody, command: 'pay', fromAddress, toAddress, amount }
      return next()
    }
    return respond('error: invalid sms command. example payment request "p +16505473175 0.1"')
  } catch (ex) {
    console.error(ex)
    return respond('An unexpected occurred. Please contact support.')
  }
}

router.post('/sms', twilioValidation, parseSMS, async (req, res) => {
  const respond = (text, status = StatusCodes.OK) => {
    const response = new Twilio.twiml.MessagingResponse()
    response.message(text)
    res.status(status).send(response.toString())
  }
  const { command, fromAddress, toAddress, amount } = req.processedBody
  Logger.log(`[/sms] req.body: ${JSON.stringify(req.processedBody)}`)
  const miniWallet = blockchain.getMiniWallet()
  const executor = blockchain.prepareExecute()
  try {
    if (command === 'balance') {
      const balance = ethers.utils.formatEther(await miniWallet.userBalances(fromAddress))
      return respond(`Your balance is ${balance} (address: ${fromAddress})`)
    } else if (command === 'pay') {
      const receipt = await executor('send', amount, fromAddress, toAddress)
      return respond(`Sent ${ethers.utils.formatEther(amount)} (from: ${fromAddress}, to ${toAddress}, transaction:${receipt.hash})`)
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid command' })
    }
  } catch (ex) {
    console.error(ex)
    return respond('An unexpected occurred. Please contact support.')
  }
})

module.exports = router
