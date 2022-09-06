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
  console.log(`chainId: ${chainId}`)

  const deployedContract = await deploy('MiniWallet', {
    contract: 'MiniWallet_v2',
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: 'EIP173Proxy'
    },
    log: true
  })

  console.log('Deploy Finished')
  const miniWallet = await hre.ethers.getContractAt('MiniWallet_v2', deployedContract.address)

  console.log('MiniWallet_v2 deployed to:', miniWallet.address)
  console.log(
    'MiniWallet_v2 Operator Threshold:',
    await miniWallet.operatorThreshold()
  )

  const operatorCount = await miniWallet.getRoleMemberCount(OPERATOR_ROLE)
  console.log(`operatorCount : ${operatorCount}`)
  for (let i = 0; i < operatorCount; ++i) {
    console.log(`Operator [${i}]: ${await miniWallet.getRoleMember(OPERATOR_ROLE, i)}`)
  }

  const globalUserLimit = await miniWallet.globalUserLimit()
  console.log(
    'MiniWallet_v2 Global User Limit:',
    ethers.utils.formatUnits(globalUserLimit.toString())
  )

  const globalUserAuthLimit = await miniWallet.globalUserAuthLimit()
  console.log(
    'MiniWallet_v2 Global User Auth Limit:',
    ethers.utils.formatUnits(globalUserAuthLimit.toString())
  )
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniWallet_v2', '002', 'upgrade', 'MiniWalletUpgrade']
export default deployFunction
