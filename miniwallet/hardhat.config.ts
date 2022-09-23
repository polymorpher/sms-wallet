import 'dotenv/config'
import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'hardhat-deploy'
import 'solidity-coverage'
import '@primitivefi/hardhat-dodoc'
import 'hardhat-abi-exporter'
import '@atixlabs/hardhat-time-n-mine'
import 'hardhat-spdx-license-identifier'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-contract-sizer'

const normalizeHex = (s) => s && s.startsWith('0x') ? s : `0x${s}`

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const hardhatUserconfig: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  namedAccounts: {
    deployer: 0,
    operatorA: 1,
    operatorB: 2,
    operatorC: 3,
    alice: 4,
    bob: 5,
    carol: 6,
    dora: 7,
    ernie: 8
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: {
        count: 200
      },
      mining: {
        auto: true
      },
      saveDeployments: false
    },
    ethlocal: {
      url: process.env.ETH_LOCAL_URL,
      gasPrice: 20000000000,
      gas: 6000000,
      live: false,
      saveDeployments: true,
      tags: ['local']
    },
    localnet: {
      url: process.env.LOCALNET_URL,
      accounts: [normalizeHex(process.env.PRIVATE_KEY)],
      gasPrice: 20000000000,
      gas: 6000000
    },
    devnet: {
      url: process.env.DEVNET_URL,
      accounts: [normalizeHex(process.env.PRIVATE_KEY)],
      chainId: 1666900000,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gas: 2100000,
      gasPrice: 5000000000,
      gasMultiplier: 2
    },
    testnet: {
      url: process.env.TESTNET_URL,
      accounts: [normalizeHex(process.env.PRIVATE_KEY)],
      chainId: 1666700000,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gas: 2100000,
      gasPrice: 5000000000,
      gasMultiplier: 2
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [normalizeHex(process.env.PRIVATE_KEY)],
      chainId: 1666600000
    },
    localgeth: {
      url: process.env.LOCALGETH_URL,
      accounts: [normalizeHex(process.env.PRIVATE_KEY)],
      gasPrice: 20000000000,
      gas: 6000000
    },
    ropsten: {
      url: process.env.ROPSTEN_URL,
      accounts: [normalizeHex(process.env.PRIVATE_KEY)],
      chainId: 3,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gasPrice: 20000000000,
      gas: 6000000,
      gasMultiplier: 2
    },
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [normalizeHex(process.env.PRIVATE_KEY)],
      chainId: 11155111,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gasPrice: 20000000000,
      gas: 6000000,
      gasMultiplier: 2
    },
    ethereum: {
      url: process.env.ETHEREUM_URL,
      accounts: [normalizeHex(process.env.PRIVATE_KEY)],
      gasPrice: 120 * 1000000000,
      chainId: 1
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  dodoc: {
    runOnCompile: true,
    debugMode: false,
    outputDir: 'docs/solidity',
    freshOutput: true
  },
  abiExporter: {
    path: '../miniserver/abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [':MiniWallet$', ':MiniProxy$'],
    format: 'json',
    spacing: 2
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './build'
  },
  mocha: {
    timeout: 20000
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [':MiniWallet$']
  }
}

export default hardhatUserconfig
