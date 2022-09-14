import { getConfig } from '../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // Get the deployment configuration
  const config = await getConfig(hre.network.name, 'miniWallet')
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
            config.miniWallet.initialOperatorThreshold,
            config.miniWallet.initialOperators,
            config.miniWallet.initialUserLimit,
            config.miniWallet.initialAuthLimit
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
