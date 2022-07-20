const express = require('express')
const config = require('../config')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const { Logger } = require('../logger')
const NodeCache = require('node-cache')
const Cache = new NodeCache()
const { phone } = require('phone')
const Twilio = require('twilio')(config.twilio.sid, config.twilio.token)
const utils = require('../utils')
const { User } = require('../src/data/user')
const { isEqual, pick } = require('lodash')
const w3utils = require('../w3utils')

router.get('/health', async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

const reqCheck = async (req, res, next) => {
  const { phone: unvalidatedPhone, eseed, ekey, address } = req.body
  const { isValid, phoneNumber } = phone(unvalidatedPhone)
  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad phone number' })
  }
  if (!(eseed?.length >= 32) || !ekey || !address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need address, eseed, ekey' })
  }
  req.processedBody = { phoneNumber, eseed: eseed.toLowerCase(), ekey: ekey.toLowerCase(), address: address.toLowerCase() }
  next()
}

const checkExistence = async (req, res, next) => {
  const { phoneNumber, address } = req.processedBody
  let u = await User.findByPhone({ phone: phoneNumber })
  if (u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number already exists' })
  }
  u = await User.findByAddress({ address })
  if (u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'address already exists' })
  }
  next()
}

router.post('/signup', reqCheck, checkExistence, async (req, res) => {
  const { phoneNumber, eseed, ekey, address } = req.processedBody

  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const hash = utils.hexView(utils.keccak(`${phoneNumber}${eseed}${ekey}${address}`))
  console.log('[Received]', { hash, phoneNumber, eseed, ekey })
  const success = Cache.set(hash, { phoneNumber, seed, ekey, hash }, 120)
  if (!success) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'please try again' })
  }

  const code = utils.genOTPStr({ seed, interval: config.otp.interval })
  const message = await Twilio.messages.create({
    body: `SMS Wallet verification code: ${code}`,
    to: phoneNumber,
    from: config.twilio.from
  })
  console.log('[Text]', code, message)
  res.json({ hash })
})

router.post('/verify', reqCheck, checkExistence, async (req, res) => {
  const { phoneNumber, eseed, ekey, address } = req.processedBody
  const { code, signature } = req.body
  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const hash = utils.hexView(utils.keccak(`${phoneNumber}${eseed}${ekey}${address}`))
  const cached = Cache.get(hash)
  if (!cached) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'cannot find record' })
  }
  if (!isEqual({ phoneNumber, seed, ekey, hash }, cached)) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'record is inconsistent with cached' })
  }

  const codeNow = utils.genOTPStr({ seed, interval: config.otp.interval })
  const codePrev = utils.genOTPStr({
    seed,
    interval: config.otp.interval,
    counter: Math.floor(Date.now() / config.otp.interval) - 1
  })
  if (code !== codeNow && code !== codePrev) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'verification code incorrect' })
  }
  const recoveredAddress = w3utils.ecrecover(hash, signature)
  if (!recoveredAddress) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'signature cannot be recovered to address' })
  }
  if (recoveredAddress.toLowerCase() !== address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'signature does not match address' })
  }
  const u = await User.addNew({ phone: phoneNumber, ekey, eseed, address })
  if (!u) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'failed to signup, please try again in 120 seconds' })
  }
  Cache.del(hash)
  res.json({ success: true })
})

router.post('/restore', reqCheck, async (req, res) => {
  const { phoneNumber, eseed } = req.processedBody
  const u = await User.findByPhone({ phone: phoneNumber })
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number is not registered' })
  }
  if (!isEqual(pick(u, ['phoneNumber', 'eseed']), { phoneNumber, eseed })) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'credential with phone number does not exist' })
  }
  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const code = utils.genOTPStr({ seed, interval: config.otp.interval })
  const message = await Twilio.messages.create({
    body: `SMS Wallet verification code: ${code}`,
    to: phoneNumber,
    from: config.twilio.from
  })
  console.log('[Text][Restore]', code, message)
  res.json({ success: true })
})

router.post('/restore-verify', reqCheck, async (req, res) => {
  const { phoneNumber, eseed } = req.processedBody
  const { code } = req.body
  const u = await User.findByPhone({ phone: phoneNumber })
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number is not registered' })
  }
  if (!isEqual(pick(u, ['phoneNumber', 'eseed']), { phoneNumber, eseed })) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'credential with phone number does not exist' })
  }
  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const codeNow = utils.genOTPStr({ seed, interval: config.otp.interval })
  const codePrev = utils.genOTPStr({
    seed,
    interval: config.otp.interval,
    counter: Math.floor(Date.now() / config.otp.interval) - 1
  })
  if (code !== codeNow && code !== codePrev) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'verification code incorrect' })
  }
  res.json({ ekey: u.ekey, address: u.address })
})

// router

module.exports = router
