import config from '../../config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const network = hre.network.name
  const OPERATOR_ROLE = ethers.utils.id('OPERATOR_ROLE')
  const deployedMiniWalletImplementation = await deploy('MiniWallet', { from: deployer, args: [], log: true })
  const miniWalletImplementation = await hre.ethers.getContractAt('MiniWallet', deployedMiniWalletImplementation.address)
  console.log('MiniWallet implementation deployed to:', miniWalletImplementation.address)
  console.log(`MiniWallet operatorCount: ${await miniWalletImplementation.getRoleMemberCount(OPERATOR_ROLE)}`)
  const MiniWalletInitializeCallData = miniWalletImplementation.interface.encodeFunctionData('initialize',
    [
      config[network].miniWallet.initialOperatorThreshold,
      config[network].miniWallet.initialOperators,
      config[network].miniWallet.initialUserLimit,
      config[network].miniWallet.initialAuthLimit
    ])
  console.log(`MiniWallet initialize calldata: ${MiniWalletInitializeCallData}`)
  const deployedMiniWalletProxy = await deploy('MiniProxy', {
    from: deployer,
    args: [miniWalletImplementation.address, MiniWalletInitializeCallData],
    log: true
  })
  const miniWalletProxy = await hre.ethers.getContractAt('MiniProxy', deployedMiniWalletProxy.address)
  console.log('MiniWalletProxy deployed to:', miniWalletProxy.address)
  const MiniWallet = await ethers.getContractFactory('MiniWallet')
  const miniWallet = MiniWallet.attach(miniWalletProxy.address)
  console.log(`MiniWallet operatorCount: ${await miniWallet.getRoleMemberCount(OPERATOR_ROLE)}`)

  // further testing upgrade capabilities
  const deployedMiniWalletImplementationV2 = await deploy('MiniWallet_v2', {
    from: deployer,
    args: [],
    log: true
  })
  const miniWalletImplementationV2 = await hre.ethers.getContractAt('MiniWallet_v2', deployedMiniWalletImplementationV2.address)
  console.log('MiniWallet Implementation V2 deployed to  :', miniWalletImplementationV2.address)
  const receipt = await (await miniWallet.upgradeTo(miniWalletImplementationV2.address)).wait()
  console.log(`MiniWallet_v2 Upgrade Transaction: ${JSON.stringify(receipt)}`)
  console.log('MiniWallet deployed to:', miniWallet.address)
  console.log('MiniWallet Operator Threshold:', await miniWallet.operatorThreshold())
  const operatorCount = await miniWallet.getRoleMemberCount(OPERATOR_ROLE)
  console.log(`operatorCount : ${operatorCount}`)
  for (let i = 0; i < operatorCount; ++i) {
    console.log(`Operator [${i}]: ${await miniWallet.getRoleMember(OPERATOR_ROLE, i)}`)
  }
  const globalUserLimit = await miniWallet.globalUserLimit()
  console.log('MiniWallet Global User Limit:', ethers.utils.formatUnits(globalUserLimit.toString()))
  const globalUserAuthLimit = await miniWallet.globalUserAuthLimit()
  console.log('MiniWallet Global User Auth Limit:', ethers.utils.formatUnits(globalUserAuthLimit.toString()))
}

deployFunction.dependencies = []
deployFunction.tags = ['test_MiniWallet', 'test', 'test_MiniWalletDeployAndUpgrade']
export default deployFunction
