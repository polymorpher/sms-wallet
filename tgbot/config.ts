import * as dotenv from 'dotenv'
dotenv.config()

const DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG === '1'
const config = {
  debug: DEBUG,
  provider: process.env.DEFAULT_RPC ?? 'https://api.harmony.one',
  tg: {
    apiId: Number(process.env.API_ID ?? 0),
    apiHash: process.env.API_HASH ?? '',
    botToken: process.env.BOT_TOKEN ?? ''
  },
  verbose: process.env.VERBOSE === 'true' || process.env.VERBOSE === '1',
  https: {
    only: process.env.HTTPS_ONLY === 'true' || process.env.HTTPS_ONLY === '1',
    key: DEBUG ? './certs/test.key' : './certs/privkey.pem',
    cert: DEBUG ? './certs/test.cert' : './certs/fullchain.pem'
  },
  corsOrigins: process.env.CORS ?? ''
}
export default config
