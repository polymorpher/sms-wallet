import { getConfig } from '../../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  // Get the deployment configuration
  // TODO Update miniID contract to parameterize constructor
  //   const config = await getConfig(hre.network.name, 'miniID')
  const userConfig = await getConfig(hre.network.name, 'users')

  const deployedMiniIDImplementation = await deploy('MiniID', {
    from: deployer,
    args: [],
    log: true
  })

  const miniIDImplementation = await hre.ethers.getContractAt('MiniID', deployedMiniIDImplementation.address)
  console.log('MiniID Implementation deployed to  :', miniIDImplementation.address)
  //   const tx = await miniIDImplementation.initialize()
  //   const receipt = await tx.wait()
  //   console.log(`receipt: ${JSON.stringify(receipt)}`)
  console.log('MiniID Implementation Name         : ', await miniIDImplementation.name())

  const deployedMinidProxy = await deploy('ERC1967Proxy', {
    from: deployer,
    args: [miniIDImplementation.address, '0x8129fc1c'],
    log: true
  })

  const miniIDProxy = await hre.ethers.getContractAt('ERC1967Proxy', deployedMinidProxy.address)
  console.log('MiniIDProxy deployed to  :', miniIDProxy.address)
  //   const miniIDProxyL = deployedMiniID.attach(miniIDProxy.address)
  //   const miniIDProxyL = miniIDLogic.attach(miniIDProxy.address)
  const MiniID = await ethers.getContractFactory('MiniID')
  const miniID = MiniID.attach(miniIDProxy.address)
  console.log('MiniID Name         : ', await miniID.name())
  console.log('MiniID Symbol       : ', await miniID.symbol())
  // Mint test tokens on networks hardhat and ethLocal
  console.log(`hre.network.name : ${hre.network.name}`)
  if (hre.network.name === 'hardhat' || hre.network.name === 'ethLocal') {
    // miniIDProxy.connect(operatorA)
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
deployFunction.tags = ['MiniIDTest2']
export default deployFunction
