import express, { type NextFunction, type Request, type Response } from 'express'
import config from '../config.ts'
import { StatusCodes } from 'http-status-codes'
import NodeCache from 'node-cache'
import utils from '../utils.ts'
import { User } from '../src/data/user.ts'
import { partialReqCheck } from './middleware.ts'
import { isEqual, pick } from 'lodash-es'
const Cache = new NodeCache()
const router = express.Router()

async function isFromBot (req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = (req.clientIp ?? '').replace(/^.*:/, '')
  if (!config.bot.permittedBotIps.includes(ip ?? '*')) {
    console.error(`[tg][authed] Access denied for ip ${ip}`)
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'ip disallowed' })
    return
  }
  const secret = req.header('X-SMS-WALLET-SECRET')
  if (config.bot.botToServerSecret.length > 0 && secret !== config.bot.botToServerSecret) {
    console.error(`[tg][authed] Access denied for secret ${secret}`)
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'bad secret' })
    return
  }
  next()
}

interface TGSignupConfig {
  eseed: string
  ekey: string
  address: string
  sessionId: string
  signature: string
  userId: string
}

router.post('/signup', async (req, res) => {
  const { eseed, ekey, address, sessionId, signature, userId } = req.body as TGSignupConfig
  console.log('[tg][/signup]', { eseed, ekey, address, sessionId, signature })
  const tgId = Cache.get<string>(sessionId)
  if (!tgId) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'invalid session' })
    return
  }
  if (`tg:${userId}` !== tgId) {
    console.error('[tg][/signup] mismatch user id', { userId, tgId })
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'user id mismatch' })
    return
  }
  const message = `${tgId}${eseed}${ekey}${address}`.toLowerCase()
  const recoveredAddress = utils.recover(message, signature)?.toLowerCase()
  if (!recoveredAddress) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'signature cannot be recovered to address' })
  }
  if (!utils.isSameAddress(recoveredAddress, address)) {
    console.error('[tg][/signup] mismatch address', { recoveredAddress, address })
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'signature does not match address' })
  }

  const u0 = await User.findByUserHandle(tgId)
  if (u0) {
    return res.json({ success: false, error: 'You already signed up before. Please recover your wallet using recovery secret' })
  }

  const u = await User.addNew({ phone: tgId, ekey, eseed, address })
  if (!u) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'failed to signup, please try again in 120 seconds' })
  }
  console.log('[tg][/signup]', `Created account ${tgId} ${address}. Deleting session ${sessionId}`)
  Cache.del(sessionId)
  res.json({ success: true })
})

router.post('/new-session', isFromBot, async (req, res) => {
  const session = String(req.body.session ?? '')
  const deadline = Number(req.body.deadline ?? 0)
  const tgId = String(req.body.tgId)
  console.log('[/new-session]', { session, tgId, deadline })
  if (!session) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'require session id' })
    return
  }
  const now = Date.now()
  if (deadline < now) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad deadline', deadline, now })
    return
  }
  Cache.set(session, `tg:${tgId}`, deadline - now)
  res.json({ success: true })
})

router.post('/restore', partialReqCheck, async (req, res) => {
  const { userHandle, eseed } = req.processedBody
  const { sessionId } = req.body
  console.log('[tg][/restore]', { eseed, userHandle, sessionId })
  const tgId = Cache.get<string>(sessionId)
  if (!tgId) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'invalid session' })
    return
  }
  if (`tg:${userHandle}` !== tgId) {
    console.error('[tg][/restore] mismatch user id', { userHandle, tgId })
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'user id does not match session' })
    return
  }

  const u = await User.findByUserHandle(User.makeTgUserHandle(userHandle))
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Telegram account is not registered' })
  }
  if (!isEqual(pick(u, ['phone', 'eseed']), { phone: userHandle, eseed })) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Recovery secret is incorrect' })
  }

  res.json({ ekey: u.ekey, address: u.address })
})

export default router
