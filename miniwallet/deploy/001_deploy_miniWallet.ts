import config from '../config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const OPERATOR_ROLE = ethers.utils.id('OPERATOR_ROLE')

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
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
  } else {
    console.log(`Test Deploy on chainId: ${chainId}`)
    initialOperatorThreshold = config.test.miniWallet.initialOperatorThreshold
    initialOperators = config.test.miniWallet.initialOperators
    initialUserLimit = config.test.miniWallet.initialUserLimit
    initialAuthLimit = config.test.miniWallet.initialAuthLimit
  }

  console.log('operators:', JSON.stringify(initialOperators))
  const deployedContract = await deploy('MiniWallet', {
    contract: 'MiniWallet',
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'EIP173Proxy',
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
  const miniWallet = await hre.ethers.getContractAt('MiniWallet', deployedContract.address)

  console.log('MiniWallet deployed to:', miniWallet.address)
  console.log(
    'MiniWallet Operator Threshold:',
    await miniWallet.operatorThreshold()
  )

  const operatorCount = await miniWallet.getRoleMemberCount(OPERATOR_ROLE)
  console.log(`operatorCount : ${operatorCount}`)
  for (let i = 0; i < operatorCount; ++i) {
    console.log(`Operator [${i}]: ${await miniWallet.getRoleMember(OPERATOR_ROLE, i)}`)
  }

  const globalUserLimit = await miniWallet.globalUserLimit()
  console.log(
    'MiniWallet Global User Limit:',
    ethers.utils.formatUnits(globalUserLimit.toString())
  )

  const globalUserAuthLimit = await miniWallet.globalUserAuthLimit()
  console.log(
    'MiniWallet Global User Auth Limit:',
    ethers.utils.formatUnits(globalUserAuthLimit.toString())
  )
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniWallet', '001', 'deploy', 'MiniWalletDeploy']
export default deployFunction
