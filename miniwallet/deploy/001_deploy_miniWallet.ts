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
  if (chainId === '31337') {
    console.log('Local Testing Deploy')
    initialOperatorThreshold = config.test.initialOperatorThreshold
    initialOperators = config.test.initialOperators
    initialUserLimit = config.test.initialUserLimit
    initialAuthLimit = config.test.initialAuthLimit
  } else {
    initialOperatorThreshold = config.initialOperatorThreshold
    initialOperators = config.initialOperators
    initialUserLimit = config.initialUserLimit
    initialAuthLimit = config.initialAuthLimit
  }

  console.log('operators:', JSON.stringify(config.initialOperators))
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
deployFunction.tags = ['MiniWallet', '002', 'deploy']
export default deployFunction
