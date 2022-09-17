require('dotenv').config()
const ethers = require('ethers')
const DEBUG = process.env.MINISERVER_DEBUG === 'true' || process.env.MINISERVER_DEBUG === '1'
const config = {
  debug: DEBUG,
  url: process.env.SERVER_URL || 'https://localhost',
  port: process.env.PORT || 3000,
  httpsPort: process.env.HTTPS_PORT || 8443,
  verbose: process.env.VERBOSE === 'true' || process.env.VERBOSE === '1',
  https: {
    only: process.env.HTTPS_ONLY === 'true' || process.env.HTTPS_ONLY === '1',
    key: DEBUG ? './certs/test.key' : './certs/privkey.pem',
    cert: DEBUG ? './certs/test.cert' : './certs/fullchain.pem'
  },
  corsOrigins: process.env.CORS,
  secret: process.env.SECRET,
  pollingInterval: parseInt(process.env.POLLING_INTERVAL || 1000),
  defaultNetwork: process.env.DEFAULT_NETWORK || 'eth-local',
  networks: {
    'harmony-testnet': {
      key: process.env.HARMONY_TESTNET_KEY || '',
      url: process.env.TESTNET_RPC || 'https://api.s0.b.hmny.io',
      wss: process.env.TESTNET_WSS,
      mnemonic: process.env.HARMONY_TESTNET_MNEMONIC,
      skip: process.env.SKIP_TESTNE || true,
      numAccounts: process.env.TESTNET_NUM_ACCOUNTS || 1,
      blockTime: 2,
      miniWalletAddress: process.env.TESTNET_MINI_WALLET,
    },
    'harmony-mainnet': {
      key: process.env.HARMONY_MAINNET_KEY || '',
      beacon: process.env.BEACON_MAINNET_RPC,
      url: process.env.MAINNET_RPC || process.env.BEACON_MAINNET_RPC || 'https://api.s0.t.hmny.io',
      wss: process.env.MAINNET_WSS || process.env.BEACON_MAINNET_WSS,
      mnemonic: process.env.HARMONY_MAINNET_MNEMONIC,
      skip: process.env.SKIP_MAINNET || true,
      numAccounts: process.env.MAINNET_NUM_ACCOUNTS || 1,
      blockTime: 2,
      miniWalletAddress: process.env.MAINNET_MINI_WALLET,
    },
    'eth-local': {
      url: process.env.ETH_LOCAL_RPC || 'http://127.0.0.1:8545',
      wss: process.env.ETH_LOCAL_WSS,
      key: process.env.ETH_LOCAL_KEY,
      mnemonic: process.env.ETH_LOCAL_MNEMONIC,
      skip: process.env.SKIP_ETH || true,
      numAccounts: process.env.ETH_LOCAL_NUM_ACCOUNTS || 1,
      miniWalletAddress: process.env.ETH_LOCAL_MINI_WALLET,
    },
  },
  gasLimit: parseInt(process.env.GAS_LIMIT || '12345678'),
  gasPrice: ethers.BigNumber.from(process.env.GAS_PRICE || '200'),

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

  defaultSignatureValidDuration: 1000 * 60 * 15,
}
module.exports = config
