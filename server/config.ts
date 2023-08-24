import * as dotenv from 'dotenv'
import { createRequire } from 'node:module'
dotenv.config()
const require = createRequire(import.meta.url)

const DEBUG = process.env.RELAYER_DEBUG === 'true' || process.env.RELAYER_DEBUG === '1'
const config = {
  debug: DEBUG,
  verbose: process.env.VERBOSE === 'true' || process.env.VERBOSE === '1',
  https: {
    only: process.env.HTTPS_ONLY === 'true' || process.env.HTTPS_ONLY === '1',
    key: DEBUG ? './certs/test.key' : './certs/privkey.pem',
    cert: DEBUG ? './certs/test.cert' : './certs/fullchain.pem'
  },
  archiveWaitDuration: Number(process.env.ARCHIVE_WAIT_DURATION ?? 60 * 1000 * 60 * 24),
  corsOrigins: process.env.CORS ?? '',
  secret: process.env.SECRET ?? '',
  cache: process.env.CACHE ?? 'cache',
  datastore: {
    gceProjectId: process.env.GCP_PROJECT,
    cred: !process.env.GCP_CRED_PATH ? {} : require(process.env.GCP_CRED_PATH),
    mock: !process.env.GCP_CRED_PATH,
    mockPort: 9000,
    namespace: process.env.GCP_NAMESPACE ?? 'sms-wallet-server'
  },

  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM
  },

  otp: {
    salt: process.env.OTP_SALT,
    interval: Number(process.env.OTP_INTERVAL ?? 60000)
  },
  defaultSignatureValidDuration: 1000 * 60 * 15,
  clientRoot: process.env.CLIENT_ROOT ?? 'https://smswallet.xyz',

  tg: {
    // bot server's IP
    whitelistIps: JSON.parse(process.env.TG_WHITELIST_IPS ?? '[]') as string[],

    // for access-control of APIs on this server, which are meant to be called by the bot server
    secret: process.env.TG_SECRET ?? '',

    // for sending requests to the bot. It must match the secret set at the bot server
    botApiSecret: process.env.TG_BOT_API_SECRET ?? '',
    botApiBase: process.env.TG_BOT_API_BASE ?? ''
  }
}

export default config
