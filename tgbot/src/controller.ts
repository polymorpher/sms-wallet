import axios from 'axios'
import crypto from 'crypto'
import config from '../config.ts'

const Base = axios.create({ baseURL: config.controller.apiBase, timeout: 15000 })

export async function newSession (tgId: string): Promise<string> {
  const session = crypto.randomBytes(32).toString('hex')
  const deadline = Date.now() + 1000 * 120
  try {
    await Base.post('/new-session', { session, tgId, deadline })
    return session
  } catch (ex: any) {
    console.error(ex)
    return ''
  }
}
