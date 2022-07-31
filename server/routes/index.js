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
const stringify = require('json-stringify-deterministic')
const { Setting } = require('../src/data/setting')

router.get('/health', async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

const partialReqCheck = async (req, res, next) => {
  const { phone: unvalidatedPhone, eseed } = req.body
  const { isValid, phoneNumber } = phone(unvalidatedPhone)
  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad phone number' })
  }
  if (!(eseed?.length >= 32)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid eseed' })
  }
  req.processedBody = { ...req.processedBody, phoneNumber, eseed: eseed.toLowerCase() }
  next()
}

const reqCheck = async (req, res, next) => {
  return partialReqCheck(req, res, () => {
    const { ekey, address } = req.body

    if (!ekey || !address) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need eseed, ekey' })
    }
    req.processedBody = { ...req.processedBody, ekey: ekey.toLowerCase(), address: address.toLowerCase() }
    next()
  })
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
  const success = Cache.set(hash, { phoneNumber, seed: utils.hexView(seed), ekey, hash }, 120)
  if (!success) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'please try again' })
  }

  const code = utils.genOTPStr({ seed, interval: config.otp.interval })[0]
  try {
    const message = await Twilio.messages.create({
      body: `SMS Wallet verification code: ${code}`,
      to: phoneNumber,
      from: config.twilio.from
    })
    console.log('[Text]', code, message)
    res.json({ hash })
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ex.toString() })
  }
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
  if (!isEqual({ phoneNumber, seed: utils.hexView(seed), ekey, hash }, cached)) {
    console.log(cached, { phoneNumber, seed: utils.hexView(seed), ekey, hash })
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'record is inconsistent with cached' })
  }

  const codeNow = utils.genOTPStr({ seed, interval: config.otp.interval })[0]
  const codePrev = utils.genOTPStr({
    seed,
    interval: config.otp.interval,
    counter: Math.floor(Date.now() / config.otp.interval) - 1
  })[0]
  if (code !== codeNow && code !== codePrev) {
    console.log({ code, codeNow, codePrev })
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

router.post('/restore', partialReqCheck, async (req, res) => {
  const { phoneNumber, eseed } = req.processedBody
  const u = await User.findByPhone({ phone: phoneNumber })
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number is not registered' })
  }
  if (!isEqual(pick(u, ['phone', 'eseed']), { phone: phoneNumber, eseed })) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'credential with phone number does not exist' })
  }
  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const code = utils.genOTPStr({ seed, interval: config.otp.interval })[0]
  try {
    const message = await Twilio.messages.create({
      body: `SMS Wallet verification code: ${code}`,
      to: phoneNumber,
      from: config.twilio.from
    })
    console.log('[Text][Restore]', code, message)
    res.json({ success: true })
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ex.toString() })
  }
})

router.post('/restore-verify', partialReqCheck, async (req, res) => {
  const { phoneNumber, eseed } = req.processedBody
  const { code } = req.body
  const u = await User.findByPhone({ phone: phoneNumber })
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number is not registered' })
  }
  if (!isEqual(pick(u, ['phone', 'eseed']), { phone: phoneNumber, eseed })) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'credential with phone number does not exist' })
  }
  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const codeNow = utils.genOTPStr({ seed, interval: config.otp.interval })[0]
  const codePrev = utils.genOTPStr({
    seed,
    interval: config.otp.interval,
    counter: Math.floor(Date.now() / config.otp.interval) - 1
  })[0]
  if (code !== codeNow && code !== codePrev) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'verification code incorrect' })
  }
  res.json({ ekey: u.ekey, address: u.address })
})

// allows an existing user to lookup another user's address by their phone number, iff the phone number exists and the target user does not choose to hide its phone-address mapping (under `hide` parameter in settings)
router.post('/lookup', async (req, res) => {
  const { address, signature, destPhone } = req.body
  if (!address || !signature || !destPhone) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'require address, signature, destPhone' })
  }
  if (!w3utils.isValidAddress(address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid address' })
  }
  const { isValid, phoneNumber } = phone(destPhone)
  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad phone number' })
  }
  const expectedAddress = w3utils.ecrecover(phoneNumber, signature)
  if (expectedAddress !== address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const u = await User.findByPhone({ phone: phoneNumber })
  if (!u) {
    return res.json({ address: '' })
  }
  const s = await Setting.get(u.id)
  if (!s || s.hide) {
    return res.json({ address: '' })
  }
  return res.json({ address: u.address })
})

// this allows a user to retrieve or update its current config. For retrieval, just pass in an empty object for `newConfig`
// we may want to impose stronger security requirement on this, once we have some sensitive configurations. Right now the only configuration is `hide`, which determines whether another user can look up this user's address by its phone number.
router.post('/settings', async (req, res) => {
  const { address, signature, newConfig } = req.body
  const msg = stringify(newConfig)
  const expectedAddress = w3utils.ecrecover(msg, signature)
  if (!address || !expectedAddress || address !== expectedAddress) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const filteredNewConfig = pick(['hide'], newConfig)
  const u = await User.findByAddress({ address })
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'user does not exist' })
  }
  const isUpdate = Object.keys(filteredNewConfig).length >= 0
  if (isUpdate) {
    const newSetting = await Setting.update(u.id, { ...filteredNewConfig })
    return res.json(newSetting)
  }
  return Setting.get(u.id)
})

// router

module.exports = router
