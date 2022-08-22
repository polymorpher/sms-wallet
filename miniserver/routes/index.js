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

/**
* @openapi
* /sms:
*   post:
*     description: Process sms requests sent to the twilio operator Number
*     responses:
*       200:
*         description: Request has been processed
*/
router.post('/sms', async (req, res) => {
  // check valid Twilio Request
  if (!Twilio.validateRequest(config.twilio.token, req.headers['x-twilio-signature'], ('https://' + req.get('host') + '/sms'), req.body)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'request not from twilio' })
  }
  // Look up the from Phone Number to get the address
  const { From: phoneNumber, Body: message } = req.body
  //   Logger.log(`req.body: ${JSON.stringify(req.body)}`)
  //   Logger.log(`phoneNumber: ${phoneNumber}`)
  const u = await User.findByPhone({ phone: phoneNumber })
  //   Logger.log(`u: ${JSON.stringify(u)}`)
  // TODO Improve parsing logic and remove hard coding
  const recipient = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  const amount = ethers.utils.parseEther('1')
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number does not exist' })
  }
  const assetManager = blockchain.getAssetManager('eth-ganache')
  if (message === 'balance') {
    const balance = ethers.utils.formatEther(await assetManager.userBalances(u.address))
    return res.json({ userAddress: u.address, balance: balance })
  } else if (message === 'pay') {
    const tx = await assetManager.send(amount, u.address, recipient)
    return res.json({ from: u.address, recipient: recipient, amount: ethers.utils.formatEther(amount), transaction: tx.hash })
  }
})

module.exports = router
