require('dotenv').config()
const BN = require('bn.js')
const DEBUG = process.env.RELAYER_DEBUG === 'true' || process.env.RELAYER_DEBUG === '1'
const config = {
  debug: DEBUG,
  nullAddress: '0x0000000000000000000000000000000000000000',
  verbose: process.env.VERBOSE === 'true' || process.env.VERBOSE === '1',
  https: {
    only: process.env.HTTPS_ONLY === 'true' || process.env.HTTPS_ONLY === '1',
    key: DEBUG ? './certs/test.key' : './certs/privkey.pem',
    cert: DEBUG ? './certs/test.cert' : './certs/fullchain.pem'
  },
  corsOrigins: process.env.CORS,
  secret: process.env.SECRET,
  safeNonce: process.env.SAFE_NONCE === '1' || process.env.SAFE_NONCE === 'true',
  pollingInterval: parseInt(process.env.POLLING_INTERVAL || 1000),
  defaultNetwork: process.env.DEFAULT_NETWORK || 'harmony-mainnet',
  networks: {
    'harmony-testnet': {
      key: process.env.HARMONY_TESTNET_KEY || '',
      url: process.env.TESTNET_RPC || 'https://api.s0.b.hmny.io',
      wss: process.env.TESTNET_WSS,
      mnemonic: process.env.HARMONY_TESTNET_MNEMONIC,
      skip: process.env.SKIP_TESTNET,
      numAccounts: process.env.TESTNET_NUM_ACCOUNTS || 1,
      blockTime: 2,
    },
    'harmony-mainnet': {
      key: process.env.HARMONY_MAINNET_KEY || '',
      beacon: process.env.BEACON_MAINNET_RPC,
      url: process.env.MAINNET_RPC || process.env.BEACON_MAINNET_RPC || 'https://api.s0.t.hmny.io',
      wss: process.env.MAINNET_WSS || process.env.BEACON_MAINNET_WSS,
      mnemonic: process.env.HARMONY_MAINNET_MNEMONIC,
      skip: process.env.SKIP_MAINNET,
      numAccounts: process.env.MAINNET_NUM_ACCOUNTS || 1,
      blockTime: 2,
    },
    'eth-ganache': {
      url: process.env.GANACHE_RPC || 'http://127.0.0.1:7545',
      wss: process.env.GANACHE_WSS,
      key: process.env.ETH_GANACHE_KEY,
      mnemonic: process.env.ETH_GANACHE_MNEMONIC,
      skip: process.env.SKIP_GANACHE,
      numAccounts: process.env.GANACHE_NUM_ACCOUNTS || 1,
    },
  },
  gasLimit: parseInt(process.env.GAS_LIMIT || '12345678'),
  gasPrice: new BN(process.env.GAS_PRICE || '200'),
  cache: process.env.CACHE || 'cache',
  stats: {
    // relevant to relayer root directory
    path: process.env.STATS_PATH || '../data/stats.json'
  },

  datastore: {
    gceProjectId: process.env.GCP_PROJECT,
    cred: !process.env.GCP_CRED_PATH ? {} : require(process.env.GCP_CRED_PATH),
    mock: !process.env.GCP_CRED_PATH,
    mockPort: 9000,
    namespace: process.env.GCP_NAMESPACE || 'sms-wallet-server'
  },

  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM,
  },

  otp: {
    salt: process.env.OTP_SALT,
    interval: parseInt(process.env.OTP_INTERVAL || 60000)
  },
  defaultSignatureValidDuration: 1000 * 60 * 15,
  clientRoot: process.env.CLIENT_ROOT || 'https://smswallet.xyz',
}
module.exports = config
