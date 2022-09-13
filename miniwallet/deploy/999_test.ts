import config from '../config'
import { ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
// import { parseEther } from 'ethers/lib/utils'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const chainId = await getChainId()
  let initialOperatorThreshold
  let initialOperators
  let initialUserLimit
  let initialAuthLimit

  console.log(`chainId: ${chainId}`)
  if (chainId === '1666600000,') {
    console.log('Harmony Mainnet Deploy')
    initialOperatorThreshold = config.mainnet.miniWallet.initialOperatorThreshold
    initialOperators = config.mainnet.miniWallet.initialOperators
    initialUserLimit = config.mainnet.miniWallet.initialUserLimit
    initialAuthLimit = config.mainnet.miniWallet.initialAuthLimit
    console.log(`Min721 Deployment Info: ${JSON.stringify(config.mainnet.mini721)}`)
  } else {
    console.log(`Test Deploy on chainId: ${chainId}`)
    initialOperatorThreshold = config.test.miniWallet.initialOperatorThreshold
    initialOperators = config.test.miniWallet.initialOperators
    initialUserLimit = config.test.miniWallet.initialUserLimit
    initialAuthLimit = config.test.miniWallet.initialAuthLimit
    console.log(`Min721 Deployment Info: ${JSON.stringify(config.test.mini721)}`)
  }

  console.log('operators:', JSON.stringify(initialOperators))
  await deploy('MiniWallet', {
    contract: 'MiniWallet',
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'ERC1967Proxy',
      proxyArgs: ['{implementation}', '{data}'],
      execute: {
        init: {
          methodName: 'initialize',
          args: [
            initialOperatorThreshold,
            initialOperators,
            initialUserLimit,
            initialAuthLimit
          ]
        }
      }
    },
    log: true
  })

  await deploy('MiniID', {
    contract: 'MiniID',
    from: deployer,
    args: [],
    proxy: {
      proxyContract: 'ERC1967Proxy',
      proxyArgs: ['{implementation}', '{data}'],
      execute: {
        init: {
          methodName: 'initialize',
          args: []
        }
      }
    },
    log: true
  })

  await deploy('MiniWallet', {
    contract: 'MiniWallet_v2',
    from: deployer,
    args: [],
    proxy: {
      proxyContract: 'ERC1967Proxy',
      proxyArgs: ['{implementation}', '{data}']
    },
    log: true
  })

  await deploy('MiniID', {
    contract: 'MiniID_v2',
    from: deployer,
    args: [],
    proxy: {
      proxyContract: 'ERC1967Proxy',
      proxyArgs: ['{implementation}', '{data}']
    },
    log: true
  })
}

export default func
func.tags = ['Test999']
