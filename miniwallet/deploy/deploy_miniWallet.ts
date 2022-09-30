import config from '../config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'
import { isDeployed, persistDeployment } from '../lib/utils'

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments: { deploy }, getNamedAccounts } = hre
  const { deployer } = await getNamedAccounts()
  const network = hre.network.name
  if (await isDeployed(hre, 'MiniWallet')) {
    console.log('Already deployed MiniWallet. Skipping deployment')
    return
  }
  const OPERATOR_ROLE = ethers.utils.id('OPERATOR_ROLE')
  // Get the deployment configuration
  console.log(`Deploying to network: ${hre.network.name}`)
  const deployedMiniWalletImplementation = await deploy('MiniWallet', {
    from: deployer,
    args: [],
    log: true
  })
  const miniWalletImplementation = await hre.ethers.getContractAt('MiniWallet', deployedMiniWalletImplementation.address)
  console.log('MiniWallet Implementation deployed to  :', miniWalletImplementation.address)

  // Construct calldata for Initialize
  const MiniWalletInitializeCallData = miniWalletImplementation.interface.encodeFunctionData('initialize',
    [
      config[network].miniWallet.initialOperatorThreshold,
      config[network].miniWallet.initialOperators,
      config[network].miniWallet.initialUserLimit,
      config[network].miniWallet.initialAuthLimit
    ])
  console.log(`MiniWallet initialize calldata: ${MiniWalletInitializeCallData}`)
  // Deploy MiniWalletProxy
  const deployedMiniWalletProxy = await deploy('MiniProxy', {
    from: deployer,
    args: [miniWalletImplementation.address, MiniWalletInitializeCallData],
    log: true
  })
  const miniWalletProxy = await hre.ethers.getContractAt('MiniProxy', deployedMiniWalletProxy.address)
  console.log('MiniWalletProxy deployed to  :', miniWalletProxy.address)
  // MiniWallet is the implementation contract attached to the proxy
  const MiniWallet = await ethers.getContractFactory('MiniWallet')
  const miniWallet = MiniWallet.attach(miniWalletProxy.address)
  console.log('MiniWallet deployed to:', miniWallet.address)
  console.log('MiniWallet Operator Threshold:', await miniWallet.operatorThreshold())
  const operatorCount = await miniWallet.getRoleMemberCount(OPERATOR_ROLE)
  for (let i = 0; i < operatorCount; ++i) {
    console.log(`Operator [${i}/${operatorCount}]: ${await miniWallet.getRoleMember(OPERATOR_ROLE, i)}`)
  }
  const globalUserLimit = await miniWallet.globalUserLimit()
  console.log('MiniWallet Global User Limit:', ethers.utils.formatUnits(globalUserLimit.toString()))
  const globalUserAuthLimit = await miniWallet.globalUserAuthLimit()
  console.log('MiniWallet Global User Auth Limit:', ethers.utils.formatUnits(globalUserAuthLimit.toString()))
  await persistDeployment(hre, 'MiniWallet', miniWalletImplementation.address, 'MiniProxy', miniWalletProxy.address)
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniWallet', 'deploy', 'MiniWalletDeploy']
export default deployFunction
