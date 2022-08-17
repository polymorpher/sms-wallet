const config = {
  priceRefreshInterval: 60 * 1000,
  appId: 'sms-wallet',
  debug: process.env.DEBUG,
  ipfs: {
    gateway: process.env.IPFS_GATEWAY || 'https://ipfs.infura.io/ipfs/{{hash}}'
    // gateway: process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/{{hash}}'
    // gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/{{hash}}'
    // gateway: process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/{{hash}}'
    // gateway: process.env.IPFS_GATEWAY || 'https://1wallet.mypinata.cloud/ipfs/{{hash}}'
  },
  gasPrice: process.env.GAS_PRICE || 1000,
  rpc: process.env.RPC || 'https://api.s0.t.hmny.io',
  rootUrl: process.env.ROOT_URL || 'https://smswallet.xyz',
  explorer: process.env.EXPLORER_URL || 'https://explorer.harmony.one/#/tx/{{txId}}',
  explorerHistory: process.env.EXPLORER_URL || 'https://explorer.harmony.one/#/address/{{address}}',
  server: process.env.SERVER_URL || 'https://localhost:8443',
  secret: process.env.SERVER_SECRET || 'none',
  network: process.env.SERVER_NETWORK || 'harmony',
  transak: {
    staging: {
      apiKey: process.env.TRANSAK_STAGING_API_KEY,
      defaultCurrency: process.env.TRANSAK_STAGING_DEFAULT_CURRENCY || 'USD',
      environment: process.env.TRANSAK_STAGING_ENVIRONMENT || 'STAGING'
    },
    production: {
      apiKey: process.env.TRANSAK_PRODUCTION_API_KEY,
      defaultCurrency: process.env.TRANSAK_PRODUCTION_DEFAULT_CURRENCY || 'USD',
      environment: process.env.TRANSAK_PRODUCTION_ENVIRONMENT || 'PRODUCTION'
    },
    currencies: ['USD', 'NZD', 'AUD', 'EUR', 'GBP', 'CHF', 'SEK', 'PLN', 'NOK', 'MXN', 'DKK', 'CAD', 'ARS', 'BRL', 'CLP', 'CRC', 'DOP', 'IDR', 'ILS', 'JPY', 'KRW', 'MYR', 'PYG', 'PEN', 'PHP', 'SGD', 'ZAR', 'TZS', 'THB', 'TRY', 'BBD', 'BMD', 'BGN', 'HRK', 'CZK', 'FKP', 'FJD', 'GIP', 'HUF', 'ISK', 'JMD', 'KES', 'MDL', 'RON'],
    countries: [
      'US',
      'NZ', 'AU', 'EU', 'GB', 'CH', 'SE',
      'PL', 'NO', 'MX', 'DK', 'CA', 'AR',
      'BR', 'CL', 'CR', 'DO', 'ID', 'IL',
      'JP', 'KR', 'MY', 'PY', 'PE', 'PH',
      'SG', 'ZA', 'TZ', 'TH', 'TR', 'BB',
      'BM', 'BG', 'HR', 'CZ', 'FK', 'FJ',
      'GI', 'HU', 'IS', 'JM', 'KE', 'MD',
      'RO'
    ]

  },
  scanDelay: 250,
  defaultSignatureValidDuration: 1000 * 60 * 15,
}

export default config
