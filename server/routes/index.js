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
const stringify = require('json-stable-stringify')
const { Setting } = require('../src/data/setting')
const { Request } = require('../src/data/request')
const { partialReqCheck, reqCheck, checkExistence, hasUserSignedBody } = require('./middleware')

router.get('/health', async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

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
  const message = `${phoneNumber} ${Math.floor(Date.now() / (config.defaultSignatureValidDuration)) * config.defaultSignatureValidDuration}`
  // console.log(message, signature)
  const expectedAddress = w3utils.ecrecover(message, signature)
  if (expectedAddress !== address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const u = await User.findByPhone({ phone: phoneNumber })
  if (!u) {
    return res.json({ address: '' })
  }
  const s = await Setting.get(u.id)
  if (s?.hide) {
    return res.json({ address: '' })
  }
  return res.json({ address: u.address })
})

// this allows a user to retrieve or update its current config. For retrieval, just pass in an empty object for `newConfig`
// we may want to impose stronger security requirement on this, once we have some sensitive configurations. Right now the only configuration is `hide`, which determines whether another user can look up this user's address by its phone number.
router.post('/settings', hasUserSignedBody, async (req, res) => {
  const { body } = req.body
  const filteredNewSetting = pick(body, ['hide'])
  const u = req.user
  const isUpdate = Object.keys(filteredNewSetting).length >= 0
  if (isUpdate) {
    const updatedSetting = await Setting.update(u.id, { ...filteredNewSetting })
    return res.json(updatedSetting)
  }
  const s = await Setting.get(u.id)
  return res.json({ setting: s })
})

router.post('/request', async (req, res) => {
  const { request, address: inputAddress, phone: unvalidatedPhone } = req.body
  const { isValid, phoneNumber } = unvalidatedPhone ? phone(unvalidatedPhone) : {}
  if (!inputAddress && !isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need either address or phone' })
  }
  if (inputAddress && isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'cannot provide both address and phone' })
  }
  let user = null
  if (isValid) {
    user = await User.findByPhone({ phone: phoneNumber })
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'user does not exist' })
    }
  } else {
    if (!w3utils.isValidAddress(inputAddress)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad address' })
    }
    user = await User.findByAddress({ address: inputAddress })
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'user does not exist' })
    }
  }
  const fRequest = pick(request, ['caller', 'comment', 'callback', 'amount', 'dest', 'calldata'])
  if (typeof fRequest.calldata !== 'string') {
    fRequest.calldata = Buffer.from(stringify(fRequest.calldata)).toString('base64')
  }
  if (Object.values(fRequest).filter(e => typeof e !== 'string').length > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad request format' })
  }
  const { id, hash } = await Request.add({ request: fRequest, address: user.address })
  const caller = fRequest.caller || 'An app'
  const reason = fRequest.comment ? ` (${fRequest.comment})` : ''
  try {
    const message = await Twilio.messages.create({
      body: `SMS Wallet: ${caller} requests you to approve a transaction${reason}. Review and approve at: ${config.clientRoot}/request/${id}`,
      to: user.phone,
      from: config.twilio.from
    })
    console.log('[Request][Text]', message)
    return res.json({ id, hash })
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ex.toString() })
  }
})

router.post('/request-view', async (req, res) => {
  const { id, signature, address } = req.body
  if (!id || !signature || !address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need id, signature, address' })
  }
  if (!w3utils.isValidAddress(address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid address' })
  }
  const recoveredAddress = w3utils.ecrecover(id, signature)
  if (!w3utils.isSameAddress(recoveredAddress, address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const r = await Request.get(id)
  if (!r) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'transaction request not found' })
  }
  if (r.txHash) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'transaction already completed' })
  }
  if (!w3utils.isSameAddress(r.address, address)) {
    console.log(r.address, address)
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'transaction belongs to different address' })
  }
  try {
    const u = await User.findByAddress({ address })
    const { hash, requestStr } = r
    const request = JSON.parse(requestStr)
    return res.json({ request, hash, phone: u.phone })
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ex.toString() })
  }
})

router.post('/request-complete', async (req, res) => {
  const { id, txHash, signature, address } = req.body
  if (!id || !signature || !address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need id, signature, address' })
  }
  if (!w3utils.isValidAddress(address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid address' })
  }
  const message = `${id} ${txHash}`
  const recoveredAddress = w3utils.ecrecover(message, signature)
  if (!w3utils.isSameAddress(recoveredAddress, address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const r = await Request.get(id)
  if (!r) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'transaction request not found' })
  }
  if (r.txHash) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'transaction already completed' })
  }
  if (!w3utils.isSameAddress(r.address, address)) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'transaction belongs to different address' })
  }
  try {
    await Request.complete({ id, txHash })
    return res.json({ success: true })
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ex.toString() })
  }
})

module.exports = router
