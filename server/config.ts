import * as dotenv from 'dotenv'
dotenv.config()

const DEBUG = process.env.RELAYER_DEBUG === 'true' || process.env.RELAYER_DEBUG === '1'
const config = {
  debug: DEBUG,
  verbose: process.env.VERBOSE === 'true' || process.env.VERBOSE === '1',
  https: {
    only: process.env.HTTPS_ONLY === 'true' || process.env.HTTPS_ONLY === '1',
    key: DEBUG ? './certs/test.key' : './certs/privkey.pem',
    cert: DEBUG ? './certs/test.cert' : './certs/fullchain.pem'
  },
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
  clientRoot: process.env.CLIENT_ROOT ?? 'https://smswallet.xyz'
}

export default config
