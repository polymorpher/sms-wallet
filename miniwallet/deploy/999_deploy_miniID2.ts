import { getConfig } from '../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

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
    from: deployer,
    args: [],
    log: true
  })

  const miniIDLogic = await hre.ethers.getContractAt('MiniID', deployedMiniID.address)
  console.log('MiniID deployed to  :', miniIDLogic.address)

  const deployedMinidProxy = await deploy('ERC1967Proxy', {
    from: deployer,
    args: [miniIDLogic.address, []],
    log: true
  })

  const miniIDProxy = await hre.ethers.getContractAt('ERC1967Proxy', deployedMinidProxy.address)
  console.log('MiniIDProxy deployed to  :', miniIDProxy.address)
  //   const miniIDProxyL = deployedMiniID.attach(miniIDProxy.address)
  //   const miniIDProxyL = miniIDLogic.attach(miniIDProxy.address)
  const miniIDLogicFactory = await ethers.getContractFactory('MiniID')
  const miniIDProxyL = miniIDLogicFactory.attach(miniIDProxy.address)
  console.log('MiniID Name         : ', await miniIDProxyL.name())
  console.log('MiniID Symbol       : ', await miniIDProxyL.symbol())
  // Mint test tokens on networks hardhat and ethLocal
  console.log(`hre.network.name : ${hre.network.name}`)
  if (hre.network.name === 'hardhat' || hre.network.name === 'ethLocal') {
    // miniIDProxy.connect(operatorA)
    await miniIDProxyL.safeMint(userConfig.users.operator, '')
    await miniIDProxyL.safeMint(userConfig.users.creator, '')
    await miniIDProxy.safeMint(userConfig.users.user, '')
    console.log(`Token 0 Owner: ${await miniIDProxyL.ownerOf(0)}`)
    console.log(`Token 1 Owner: ${await miniIDProxyL.ownerOf(1)}`)
    console.log(`Token 2 Owner: ${await miniIDProxyL.ownerOf(2)}`)
    console.log(`Token 0 URI  : ${await miniIDProxyL.tokenURI(0)}`)
    console.log(`Token 1 URI  : ${await miniIDProxyL.tokenURI(1)}`)
    console.log(`Token 2 URI  : ${await miniIDProxyL.tokenURI(2)}`)
  }
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniIDTest2']
export default deployFunction
