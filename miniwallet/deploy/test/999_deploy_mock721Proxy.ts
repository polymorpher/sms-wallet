import { getConfig } from '../../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer, operatorA } = await getNamedAccounts()
  // Get the deployment configuration
  // TODO Update mock721 contract to parameterize constructor
  //   const config = await getConfig(hre.network.name, 'mock721')
  const userConfig = await getConfig(hre.network.name, 'users')

  const deployedMock721 = await deploy('Mock721', {
    contract: 'Mock721',
    from: deployer,
    proxy: {
      proxyContract: 'MiniProxy',
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

  const mock721 = await hre.ethers.getContractAt('Mock721', deployedMock721.address)

  console.log('Mock721 deployed to  :', mock721.address)
  console.log('Mock721 Name         : ', await mock721.name())
  console.log('Mock721 Symbol       : ', await mock721.symbol())
  // Mint test tokens on networks hardhat and ethLocal
  console.log(`hre.network.name : ${hre.network.name}`)
  if (hre.network.name === 'hardhat' || hre.network.name === 'ethLocal') {
    mock721.connect(operatorA)
    await mock721.safeMint(userConfig.users.operator, '0')
    await mock721.safeMint(userConfig.users.creator, '1')
    await mock721.safeMint(userConfig.users.user, '2')
    console.log(`Token 0 Owner: ${await mock721.ownerOf(0)}`)
    console.log(`Token 1 Owner: ${await mock721.ownerOf(1)}`)
    console.log(`Token 2 Owner: ${await mock721.ownerOf(2)}`)
    console.log(`Token 0 URI  : ${await mock721.tokenURI(0)}`)
    console.log(`Token 1 URI  : ${await mock721.tokenURI(1)}`)
    console.log(`Token 2 URI  : ${await mock721.tokenURI(2)}`)
  }
  await deploy('Mock721', {
    contract: 'Mock721_v2',
    from: deployer,
    args: [],
    proxy: {
      proxyContract: 'MiniProxy',
      proxyArgs: ['{implementation}', '{data}']
    },
    log: true
  })
}

deployFunction.dependencies = []
deployFunction.tags = ['Mock721TestProxy']
export default deployFunction
