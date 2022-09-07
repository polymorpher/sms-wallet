// import config from '../config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
// import { ethers } from 'hardhat'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()

  console.log(`chainId: ${chainId}`)

  const deployedMiniID = await deploy('MiniID_via_UUPS', {
    contract: 'MiniID',
    from: deployer,
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

  const miniID = await hre.ethers.getContractAt('MiniID', deployedMiniID.address)

  console.log('MiniID deployed to  :', miniID.address)
  console.log('MiniID Name         : ', await miniID.name())
  console.log('MiniID Symbol       : ', await miniID.symbol())
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniID', '004', 'deploy']
export default deployFunction
