import express, { type NextFunction, type Request, type Response } from 'express'
import config from '../config.ts'
import { StatusCodes } from 'http-status-codes'
import NodeCache from 'node-cache'
import utils from 'utils.ts.ts'
import { User } from 'src/data/user.ts.ts'
const Cache = new NodeCache()
const router = express.Router()

async function isFromBot (req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!config.tg.whitelistIps.includes(req.clientIp ?? '*')) {
    console.error(`[tg][authed] Access denied for ip ${req.clientIp}`)
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'ip disallowed' })
    return
  }
  const secret = req.header('x-sms-wallet-secret')
  if (config.tg.secret.length > 0 && secret !== config.tg.secret) {
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
  session: string
  signature: string
}

router.post('/signup', async (req, res) => {
  const { eseed, ekey, address, session, signature } = req.body as TGSignupConfig
  console.log('[tg][/signup]', { eseed, ekey, address, session, signature })
  const tgId = Cache.get<string>(session)
  if (!tgId) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'invalid session' })
    return
  }
  const hash = utils.hexView(utils.keccak(`${tgId}${eseed}${ekey}${address}`))
  const recoveredAddress = utils.ecrecover(hash, signature)
  if (!recoveredAddress) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'signature cannot be recovered to address' })
  }
  if (recoveredAddress.toLowerCase() !== address) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'signature does not match address' })
  }
  const u = await User.addNew({ phone: tgId, ekey, eseed, address })
  if (!u) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'failed to signup, please try again in 120 seconds' })
  }
  console.log('[tg][/signup]', `Created account ${tgId} ${address}. Deleting session ${session}`)
  Cache.del(session)
  res.json({ success: true })
})

router.post('/new-session', isFromBot, async (req, res) => {
  const session = String(req.body.session ?? '')
  const deadline = Number(req.body.deadline ?? 0)
  const tgId = String(req.body.tgId)
  if (!session) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'require session id' })
    return
  }
  const now = Date.now()
  if (deadline < now) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad deadline', deadline, now })
    return
  }
  Cache.set(session, `tg:${tgId}`, now - deadline)
  res.json({ success: true })
})

export default router
