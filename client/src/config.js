// require('dotenv-webpack').config()

const NFTS = [{
  contractAddress: '0x426dD435EE83dEdb5af8eDa2729a9064C415777B',
  tokenId: '1',
  tokenType: 'ERC721',
}, {
  contractAddress: '0x426dD435EE83dEdb5af8eDa2729a9064C415777B',
  tokenId: '2',
  tokenType: 'ERC721',
}, {
  contractAddress: '0x6b2d0691dfF5eb5Baa039b9aD9597B9169cA44d0',
  tokenId: '1',
  tokenType: 'ERC1155',
}, {
  contractAddress: '0x6b2d0691dfF5eb5Baa039b9aD9597B9169cA44d0',
  tokenId: '2',
  tokenType: 'ERC1155',
}]

const TEST_NFTS = [{
  contractAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  tokenId: '1',
  tokenType: 'ERC721'
}, {
  contractAddress: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  tokenId: '1',
  tokenType: 'ERC721'
}, {
  contractAddress: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
  tokenId: '2',
  tokenType: 'ERC1155'
}]

const config = {
  priceRefreshInterval: 60 * 1000,
  appId: 'sms-wallet',
  debug: process.env.DEBUG,
  ipfs: {
    // gateway: process.env.IPFS_GATEWAY || 'https://ipfs.infura.io/ipfs/{{hash}}'
    // gateway: process.env.IPFS_GATEWAY || 'https://dweb.link/ipfs/{{hash}}'
    // gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/{{hash}}'
    // gateway: process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/{{hash}}'
    gateway: process.env.IPFS_GATEWAY || 'https://modulo.mypinata.cloud/ipfs/{{hash}}'
  },
  gasPrice: process.env.GAS_PRICE || 1000,
  networkId: process.env.NETWORK_ID || 1666600000,
  chainId: process.env.CHAIN_ID || 1666600000,
  rpc: process.env.RPC || 'https://api.s0.t.hmny.io',
  rootUrl: process.env.ROOT_URL || 'https://smswallet.xyz',
  explorer: process.env.EXPLORER_URL || 'https://explorer.harmony.one/#/tx/{{txId}}',
  explorerHistory: process.env.EXPLORER_URL || 'https://explorer.harmony.one/#/address/{{address}}',
  server: process.env.SERVER_URL || 'https://localhost:8443',
  secret: process.env.SERVER_SECRET || 'none',
  network: process.env.SERVER_NETWORK || 'harmony',
  transak: {
    staging: {
      apiKey: '50f1c430-7807-4760-a337-57583de69f73',
      defaultCurrency: 'USD',
      environment: 'STAGING'
    },
    production: {
      apiKey: '28c4ba82-b701-4d05-a44c-1466fbb99265',
      defaultCurrency: 'USD',
      environment: 'PRODUCTION'
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
  mainnet: {
    nfts: JSON.parse(process.env.NFTS || JSON.stringify(NFTS))
  },
  test: {
    nfts: JSON.parse(process.env.TEST_NFTS || JSON.stringify(TEST_NFTS))
  }
}

export default config
