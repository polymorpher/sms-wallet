import config from '../config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers, upgrades } from 'hardhat'

// import config from '../config'

const OPERATOR_ROLE = ethers.utils.id('OPERATOR_ROLE')

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  let initialOperatorThreshold
  let initialOperators
  let initialUserLimit
  let initialAuthLimit

  if (hre.network.config.chainId === 31337) {
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
  const MiniWallet = await ethers.getContractFactory('MiniWallet')
  const miniWallet = await upgrades.deployProxy(
    MiniWallet,
    [
      initialOperatorThreshold,
      initialOperators,
      initialUserLimit,
      initialAuthLimit
    ],
    { initializer: 'initialize', unsafeAllow: ['external-library-linking'] }
  )

  await miniWallet.deployed()
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
    'MiniWallet Global User Auth Limit:',
    ethers.utils.formatUnits(globalUserLimit.toString())
  )

  const globalUserAuthLimit = await miniWallet.globalUserAuthLimit()
  console.log(
    'MiniWallet Global User Auth Limit:',
    ethers.utils.formatUnits(globalUserAuthLimit.toString())
  )
}
deployFunction.dependencies = []
deployFunction.tags = ['MiniWallet']
export default deployFunction
