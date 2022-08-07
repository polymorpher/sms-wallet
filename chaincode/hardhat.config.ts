import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'hardhat-deploy'
import 'solidity-coverage'
import '@primitivefi/hardhat-dodoc'
import 'hardhat-abi-exporter'
import '@atixlabs/hardhat-time-n-mine'
import 'hardhat-spdx-license-identifier'
import '@openzeppelin/hardhat-upgrades'

const config = require('./config.js')

const HARMONY_PRIVATE_KEY = process.env.PRIVATE_KEY
// const PROJECT_ID = process.env.INFURA_PROJECT_ID;
// const ROPSTEN_URL = `https://ropsten.infura.io/v3/${PROJECT_ID}`

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
        runs: 50000
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
      mining: {
        auto: true
      }
    },
    hardhatNode: {
      url: config.hardhatURL,
      accounts: [`0x${config.privateKey}`],
      gasPrice: 20000000000,
      gas: 6000000
    },
    localnet: {
      url: config.localnetURL,
      accounts: [`0x${config.privateKey}`],
      gasPrice: 20000000000,
      gas: 6000000
    },
    devnet: {
      url: config.devnetURL,
      accounts: [`0x${config.privateKey}`],
      chainId: 1666900000,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gas: 2100000,
      gasPrice: 5000000000,
      gasMultiplier: 2
    },
    testnet: {
      url: config.testnetURL,
      accounts: [`0x${config.privateKey}`],
      chainId: 1666700000,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gas: 2100000,
      gasPrice: 5000000000,
      gasMultiplier: 2
    },
    mainnet: {
      url: config.mainnetURL,
      accounts: [`0x${config.privateKey}`]
    },
    localgeth: {
      url: config.localgethURL,
      accounts: [`0x${config.privateKey}`],
      gasPrice: 20000000000,
      gas: 6000000
    },
    ropsten: {
      url: config.ropstenURL,
      accounts: [`0x${config.privateKey}`],
      chainId: 3,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gasPrice: 20000000000,
      gas: 6000000,
      gasMultiplier: 2
    },
    sepolia: {
      url: config.sepoliaURL,
      accounts: [`0x${config.privateKey}`],
      chainId: 11155111,
      live: true,
      saveDeployments: true,
      tags: ['staging'],
      gasPrice: 20000000000,
      gas: 6000000,
      gasMultiplier: 2
    },
    ethereum: {
      url: config.ethereumURL,
      accounts: [`0x${config.privateKey}`],
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
    path: './data/abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true
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
  }
}

export default hardhatUserconfig
