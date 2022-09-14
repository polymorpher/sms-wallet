import { getConfig } from '../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer, operatorA } = await getNamedAccounts()
  // Get the deployment configuration
  // TODO Update miniID contract to parameterize constructor
  //   const config = await getConfig(hre.network.name, 'miniID')
  const userConfig = await getConfig(hre.network.name, 'users')

  const deployedMiniID = await deploy('MiniID', {
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
  // Mint test tokens on networks hardhat and ethLocal
  console.log(`hre.network.name : ${hre.network.name}`)
  if (hre.network.name === 'hardhat' || hre.network.name === 'ethLocal') {
    miniID.connect(operatorA)
    await miniID.safeMint(userConfig.users.operator, '')
    await miniID.safeMint(userConfig.users.creator, '')
    await miniID.safeMint(userConfig.users.user, '')
    console.log(`Token 0 Owner: ${await miniID.ownerOf(0)}`)
    console.log(`Token 1 Owner: ${await miniID.ownerOf(1)}`)
    console.log(`Token 2 Owner: ${await miniID.ownerOf(2)}`)
    console.log(`Token 0 URI  : ${await miniID.tokenURI(0)}`)
    console.log(`Token 1 URI  : ${await miniID.tokenURI(1)}`)
    console.log(`Token 2 URI  : ${await miniID.tokenURI(2)}`)
  }
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniID', '004', 'deploy']
export default deployFunction
