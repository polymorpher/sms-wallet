import * as dotenv from 'dotenv'
dotenv.config()
dotenv.config({ path: './.env.wallet' })
const DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG === '1'
const config = {
  debug: DEBUG,
  provider: process.env.DEFAULT_RPC ?? 'https://api.harmony.one',
  wallet: {
    server: process.env.WALLET_SERVER ?? 'https://backend.smswallet.xyz',
    client: process.env.WALLET_CLIENT ?? 'https://smswallet.xyz',
    permittedWalletServerIps: JSON.parse(process.env.PERMITTED_WALLET_SERVER_IPS ?? '[]') as string[],
    serverToBotSecret: process.env.SERVER_TO_BOT_SECRET ?? '',
    botToServerSecret: process.env.BOT_TO_SERVER_SECRET ?? '',
  },
  bot: {
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
