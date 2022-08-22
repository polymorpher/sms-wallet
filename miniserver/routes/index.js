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
  const from = await User.findByPhone({ phone: senderPhoneNumber })
  const smsParams = smsBody.split(/(\s+)/).filter(e => { return e.trim().length > 0 })
  //   for (let i = 0; i < smsParams.length; i += 1) {
  //     Logger.log(`smsParams[${i}]: ${smsParams[i]}`)
  //     Logger.log(`smsParams.length: ${smsParams.length}`)
  //   }
  if (smsParams.length < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'empty sms command' })
  }
  let recipient = {}
  let recipientPhone
  switch (smsParams[0]) {
    case 'b':
      message.command = 'balance'
      message.from = from
      break
    case 'p':
      message.command = 'pay'
      if (smsParams.length < 2) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'pay request requires a to and an amount' })
      }
      message.from = from
      // TODO review if we want to allow sending to users by address (with no registered phone number)
      // if not then change this to do a User.findByAddress
      if (smsParams[1].substr(0, 2) === '0x') {
        message.recipient = smsParams[1]
      } else {
      // set country and look up user address from Phone Number
        recipientPhone = smsParams[1]
        if (recipientPhone.substr(0, 1) !== '+') {
          const { countryIso3 } = phone(from.phone)
          const { isValid, phoneNumber } = phone(recipientPhone, countryIso3)
          recipientPhone = phoneNumber
          if (!isValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid recipient phone number' })
          }
        }
        recipient = await User.findByPhone({ phone: recipientPhone })
        if (recipient.address) {
          message.recipient = recipient
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
      balance = ethers.utils.formatEther(await assetManager.userBalances(message.from.address))
      MessagingResponse = require('twilio').twiml.MessagingResponse
      response = new MessagingResponse()
      response.message(`phone: ${message.from.phone} address: ${message.from.address}, balance: ${balance} `)
      return res.send(response.toString())
    case 'pay':
      tx = await assetManager.send(message.amount, message.from.address, message.recipient.address)
      MessagingResponse = require('twilio').twiml.MessagingResponse
      response = new MessagingResponse()
      response.message(`from: ${message.from.phone}, from address: ${message.from.address}, to: ${message.recipient.phone}, to address: ${message.recipient.address}, amount: ${ethers.utils.formatEther(message.amount)}, transaction: ${tx.hash}`)
      return res.send(response.toString())
    default:
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid sms command' })
  }
})

module.exports = router
