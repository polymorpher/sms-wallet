import { getConfig } from '../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'
const ContractPath = '../build/contracts/miniWallet/miniWallet.sol/MiniWallet.json'
const ContractJSON = require(ContractPath)
const { abi } = ContractJSON
const OPERATOR_ROLE = ethers.utils.id('OPERATOR_ROLE')

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // Get the deployment configuration
  console.log(`Deploying to network: ${hre.network.name}`)
  const config = await getConfig(hre.network.name, 'miniWallet')

  const deployedMiniWalletImplementation = await deploy('MiniWallet', {
    from: deployer,
    args: [],
    log: true
  })

  const miniWalletImplementation = await hre.ethers.getContractAt('MiniWallet', deployedMiniWalletImplementation.address)
  console.log('MiniWallet Implementation deployed to  :', miniWalletImplementation.address)

  // Construct calldata for Initialize
  const iface = new ethers.utils.Interface(abi)
  const calldata = iface.encodeFunctionData('initialize', [
    config.miniWallet.initialOperatorThreshold,
    config.miniWallet.initialOperators,
    config.miniWallet.initialUserLimit,
    config.miniWallet.initialAuthLimit])
  console.log(`calldata: ${calldata}`)

  const deployedMiniWalletProxy = await deploy('ERC1967Proxy', {
    from: deployer,
    args: [miniWalletImplementation.address, calldata],
    log: true
  })

  const miniWalletProxy = await hre.ethers.getContractAt('ERC1967Proxy', deployedMiniWalletProxy.address)
  console.log('MiniWalletProxy deployed to  :', miniWalletProxy.address)

  const MiniWallet = await ethers.getContractFactory('MiniWallet')
  const miniWallet = MiniWallet.attach(miniWalletProxy.address)
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
deployFunction.tags = ['MiniWallet', 'deploy', 'MiniWalletDeploy']
export default deployFunction
