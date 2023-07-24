import express, { type NextFunction, type Request, type Response } from 'express'
import config from '../config.ts'
import { StatusCodes } from 'http-status-codes'
import NodeCache from 'node-cache'
const Cache = new NodeCache()
const router = express.Router()

async function authed (req: Request, res: Response, next: NextFunction): Promise<void> {
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

router.get('session', async (req, res) => {
  const session = req.query.session ?? ''
  // if(Cache.session)
})

router.post('/session', authed, async (req, res) => {
  const session = req.body.session ?? ''
  const deadline = Number(req.body.deadline ?? 0)
  if (!session) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'require session id' })
    return
  }
  const now = Date.now()
  if (deadline < now) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad deadline', deadline, now })
    return
  }
  Cache.set(session, true, now - deadline)
  res.json({ success: true })
})

export default router
