import express from 'express'
import config from '../config.ts'
import { StatusCodes } from 'http-status-codes'
import { Logger } from '../logger.ts'
import NodeCache from 'node-cache'
import twilio from 'twilio'
import utils from '../utils.ts'
import { User } from '../src/data/user.ts'
import { isEqual, pick } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { Request as CallRequest } from '../src/data/request.ts'
import { Setting } from '../src/data/setting.ts'
import axios from 'axios'
import {
  mustNotExist,
  hasUserSignedBody,
  parseUserHandle,
  partialReqCheck,
  reqCheck,
  requirePhone
} from './middleware.ts'
// noinspection ES6PreferShortImport
import { type ProcessedBody, UserType } from '../types/index.ts'

const Twilio = twilio(config.twilio.sid, config.twilio.token)
const Cache = new NodeCache()
const router = express.Router()
const BotApiBase = axios.create({ baseURL: config.bot.url, timeout: 15000, headers: { 'X-TG-BOT-API-SECRET': config.bot.serverToBotSecret } })

router.get('/health', async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

router.post('/signup', reqCheck, mustNotExist, async (req, res) => {
  const { userHandle, eseed, ekey, address, userType } = req.processedBody as ProcessedBody
  if (userType !== UserType.Phone) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid user handler type' })
  }
  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const hash = utils.hexView(utils.keccak(`${userHandle}${eseed}${ekey}${address}`))
  console.log('[Received]', { hash, userHandle, eseed, ekey })
  const success = Cache.set(hash, { userHandle, seed: utils.hexView(seed), ekey, hash }, 120)
  if (!success) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'please try again' })
  }

  const code = utils.genOTPStr({ seed, interval: config.otp.interval })[0]
  try {
    const message = await Twilio.messages.create({
      body: `SMS Wallet verification code: ${code}`,
      to: userHandle ?? '',
      from: config.twilio.from
    })
    console.log('[Text]', code, message)
    res.json({ hash })
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'cannot process request' })
  }
})

router.post('/verify', reqCheck, mustNotExist, async (req, res) => {
  const { userType, userHandle, eseed, ekey, address } = req.processedBody as ProcessedBody
  if (userType !== UserType.Phone) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid user handler type' })
  }
  const { code, signature } = req.body
  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const hash = utils.hexView(utils.keccak(`${userHandle}${eseed}${ekey}${address}`))
  const cached = Cache.get(hash)
  if (!cached) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'cannot find record' })
  }
  if (!isEqual({ userHandle, seed: utils.hexView(seed), ekey, hash }, cached)) {
    console.log('[/verify] mismatch with cache', cached, { userHandle, seed: utils.hexView(seed), ekey, hash })
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
  const recoveredAddress = utils.ecrecover(hash, signature)
  if (!recoveredAddress) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'signature cannot be recovered to address' })
  }
  if (recoveredAddress.toLowerCase() !== address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'signature does not match address' })
  }
  const u = await User.addNew({ phone: userHandle, ekey, eseed, address })
  if (!u) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'failed to signup, please try again in 120 seconds' })
  }
  Cache.del(hash)
  res.json({ success: true })
})

router.post('/restore', partialReqCheck, async (req, res) => {
  const { userHandle, eseed } = req.processedBody
  const u = await User.findByUserHandle(userHandle)
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number is not registered' })
  }
  if (!isEqual(pick(u, ['phone', 'eseed']), { phone: userHandle, eseed })) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'credential with phone number does not exist' })
  }
  const seed = utils.keccak(`${config.otp.salt}${eseed}`)
  const code = utils.genOTPStr({ seed, interval: config.otp.interval })[0]
  const body = `SMS Wallet verification code: ${code}`

  try {
    if (User.isTgUser(userHandle)) {
      const id = User.getTgUserId(userHandle)
      await BotApiBase.post('/msg', { body, id })
      console.log('[Text][Restore][TG]', code, id)
      res.json({ success: true })
    } else {
      const message = await Twilio.messages.create({
        body,
        to: userHandle ?? '',
        from: config.twilio.from
      })
      console.log('[Text][Restore][SMS]', code, message)
      res.json({ success: true })
    }
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'cannot process request' })
  }
})

router.post('/restore-verify', partialReqCheck, async (req, res) => {
  const { userHandle, eseed } = req.processedBody
  const { code } = req.body
  const u = await User.findByUserHandle(userHandle)
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number is not registered' })
  }
  if (!isEqual(pick(u, ['phone', 'eseed']), { phone: userHandle, eseed })) {
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
  if (!utils.isValidAddress(address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid address' })
  }
  const { isValid, userHandle } = parseUserHandle(destPhone)
  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad phone number' })
  }
  const message = `${userHandle} ${Math.floor(Date.now() / (config.defaultSignatureValidDuration)) * config.defaultSignatureValidDuration}`
  // console.log(message, signature)
  const expectedAddress = utils.ecrecover(message, signature)
  if (expectedAddress !== address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const u = await User.findByUserHandle(userHandle)
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
  const { request, address: inputAddress, phone: unvalidatedUserHandle } = req.body
  if (!unvalidatedUserHandle) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need phone' })
  }
  const { isValid, userHandle } = parseUserHandle(unvalidatedUserHandle)
  if (!inputAddress && !isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need either address or phone' })
  }
  if (inputAddress && isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'cannot provide both address and phone' })
  }
  let user: any = null
  if (isValid) {
    user = await User.findByUserHandle(userHandle)
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'user does not exist' })
    }
  } else {
    if (!utils.isValidAddress(inputAddress)) {
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
  const { id, hash } = await CallRequest.add({ request: fRequest, address: user.address })
  const caller = fRequest.caller || 'An app'
  const reason = fRequest.comment ? ` (${fRequest.comment})` : ''
  try {
    const message = await Twilio.messages.create({
      body: `SMS Wallet: ${caller} requests you to approve a transaction${reason}. Review and approve at: ${config.clientRoot}/request/${id}`,
      to: user.phone ?? '',
      from: config.twilio.from
    })
    console.log('[Request][Text]', message)
    return res.json({ id, hash })
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'cannot process request' })
  }
})

router.post('/request-view', async (req, res) => {
  const { id, signature, address } = req.body
  if (!id || !signature || !address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need id, signature, address' })
  }
  if (!utils.isValidAddress(address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid address' })
  }
  const recoveredAddress = utils.ecrecover(id, signature)
  if (!utils.isSameAddress(recoveredAddress, address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const r = await CallRequest.get(id)
  if (!r) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'transaction request not found' })
  }
  if (r.txHash) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'transaction already completed' })
  }
  if (!utils.isSameAddress(r.address, address)) {
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'cannot process request' })
  }
})

router.post('/request-complete', async (req, res) => {
  const { id, txHash, signature, address } = req.body
  if (!id || !signature || !address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need id, signature, address' })
  }
  if (!utils.isValidAddress(address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid address' })
  }
  const message = `${id} ${txHash}`
  const recoveredAddress = utils.ecrecover(message, signature)
  if (!utils.isSameAddress(recoveredAddress, address)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const r = await CallRequest.get(id)
  if (!r) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'transaction request not found' })
  }
  if (r.txHash) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'transaction already completed' })
  }
  if (!utils.isSameAddress(r.address, address)) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'transaction belongs to different address' })
  }
  try {
    await CallRequest.complete({ id, txHash })
    return res.json({ success: true })
  } catch (ex) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'cannot process request' })
  }
})

// TODO: rate limit on this + number of SMS dispatched to a user within a duration
router.post('/archive', requirePhone, async (req, res) => {
  const { userHandle } = req.processedBody
  const u = await User.findByUserHandle(userHandle)
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number is not registered' })
  }
  const seed = utils.keccak(`${config.otp.salt}${u.eseed}`)
  const code = utils.genOTPStr({ seed, interval: config.otp.interval })[0]
  const body = `[Archive Wallet] SMS Wallet verification code: ${code}`
  try {
    if (User.isTgUser(userHandle)) {
      const id = User.getTgUserId(userHandle)
      await BotApiBase.post('/msg', { body, id })
      console.log('[Text][Restore][TG]', code, id)
      res.json({ success: true })
    } else {
      const message = await Twilio.messages.create({
        body,
        to: userHandle,
        from: config.twilio.from
      })
      console.log('[Text][Archive]', code, message)
      res.json({ success: true })
    }
  } catch (ex: any) {
    console.error(ex)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'cannot process request' })
  }
})

router.post('/archive-verify', requirePhone, async (req, res) => {
  const { userHandle } = req.processedBody
  const { code } = req.body
  const u = await User.findByUserHandle(userHandle)
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number is not registered' })
  }
  const seed = utils.keccak(`${config.otp.salt}${u.eseed}`)
  const codeNow = utils.genOTPStr({ seed, interval: config.otp.interval })[0]
  const codePrev = utils.genOTPStr({
    seed,
    interval: config.otp.interval,
    counter: Math.floor(Date.now() / config.otp.interval) - 1
  })[0]
  if (code !== codeNow && code !== codePrev) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'verification code incorrect' })
  }
  if (u.resetTime) {
    const timeRemain = parseInt(u.resetTime) - Date.now()
    if (!(timeRemain < 0)) {
      return res.json({ timeRemain })
    } else {
      await User.finalizeReset(u.id)
      return res.json({ archived: true, timeRemain })
    }
  }
  const u2 = await User.startReset(u.id)
  if (!u2) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal error. Please contact support.' })
  }
  return res.json({ reset: true, timeRemain: parseInt(u2.resetTime) - Date.now() })
})

export default router
