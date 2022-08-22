const express = require('express')
const config = require('../config')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const { Logger } = require('../logger')
const NodeCache = require('node-cache')
const Cache = new NodeCache()
const { phone } = require('phone')
const Twilio = require('twilio')
const utils = require('../utils')
const { User } = require('../src/data/user')
const { isEqual, pick } = require('lodash')
const stringify = require('json-stable-stringify')
const { Setting } = require('../src/data/setting')
const { Request } = require('../src/data/request')
const blockchain = require('../blockchain')
const { ethers } = require('ethers')

/**
* @openapi
* /health:
*   get:
*     description: Checks the health of the miniwallet-server
*     responses:
*       200:
*         description: OK indicates server is running
*/
router.get('/health', async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

const checkfromTwilio = async (req, res, next) => {
  // check valid Twilio Request
  if (!Twilio.validateRequest(config.twilio.token, req.headers['x-twilio-signature'], ('https://' + req.get('host') + '/sms'), req.body)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'request not from twilio' })
  }
  next()
}

function isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

const parseSMS = async (req, res, next) => {
  const message = {}
  const { From: senderPhoneNumber, Body: smsBody } = req.body
  const requestor = await User.findByPhone({ phone: senderPhoneNumber })
  message.requestor = requestor
  const smsParams = smsBody.split(/(\s+)/).filter(e => { return e.trim().length > 0 })
  //   for (let i = 0; i < smsParams.length; i += 1) {
  //     Logger.log(`smsParams[${i}]: ${smsParams[i]}`)
  //     Logger.log(`smsParams.length: ${smsParams.length}`)
  //   }
  if (smsParams.length < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'empty sms command' })
  }
  let funder = {}
  let funderPhone
  switch (smsParams[0]) {
    case 'b':
      message.command = 'balance'
      break
    case 'p':
      message.command = 'pay'
      if (smsParams.length < 2) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'pay request requires a to and an amount' })
      }
      // TODO review if we want to allow sending to users by address (with no registered phone number)
      // if not then change this to do a User.findByAddress
      if (smsParams[1].substr(0, 2) === '0x') {
        message.recipient = smsParams[1]
      } else {
      // set country and look up user address from Phone Number
        funderPhone = smsParams[1]
        if (funderPhone.substr(0, 1) !== '+') {
          const { countryIso3 } = phone(requestor.phone)
          const { isValid, phoneNumber } = phone(funderPhone, countryIso3)
          funderPhone = phoneNumber
          if (!isValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid recipient phone number' })
          }
        }
        funder = await User.findByPhone({ phone: funderPhone })
        if (funder.address) {
          message.funder = funder
        } else {
          return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid recipient' })
        }
      }
      if (!isNumeric(smsParams[2])) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'pay request requires a valid amount' })
      } else {
        message.amount = ethers.utils.parseEther(smsParams[2])
      }
      break
    default:
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid sms command' })
  }
  req.processedBody = { ...req.processedBody, message }
  next()
}

/**
* @openapi
* /sms:
*   post:
*     description: Process sms requests sent to the twilio operator Number
*     responses:
*       200:
*         description: Request has been processed
*/
router.post('/sms', checkfromTwilio, parseSMS, async (req, res) => {
  // Look up the from Phone Number to get the address
  const { message } = req.processedBody
  //   Logger.log(`req.body: ${JSON.stringify(req.processedBody)}`)
  //   Logger.log(`message: ${JSON.stringify(message)}`)
  const assetManager = blockchain.getAssetManager('eth-ganache')
  let balance
  let tx
  let MessagingResponse
  let response
  switch (message.command) {
    case 'balance':
      balance = ethers.utils.formatEther(await assetManager.userBalances(message.requestor.address))
      MessagingResponse = require('twilio').twiml.MessagingResponse
      response = new MessagingResponse()
      response.message(`phone: ${message.requestor.phone} address: ${message.requestor.address}, balance: ${balance} `)
      return res.send(response.toString())
    case 'pay':
      tx = await assetManager.send(message.amount, message.funder.address, message.requestor.address)
      MessagingResponse = require('twilio').twiml.MessagingResponse
      response = new MessagingResponse()
      response.message(`from: ${message.funder.phone}, from address: ${message.funder.address}, to: ${message.requestor.phone}, to address: ${message.requestor.address}, amount: ${ethers.utils.formatEther(message.amount)}, transaction: ${tx.hash}`)
      return res.send(response.toString())
    default:
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid sms command' })
  }
})

module.exports = router
