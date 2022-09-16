import { getConfig } from '../../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'
const MOCK721 = require('../../build/contracts/mocks/Mock721.sol/Mock721.json')
const { abi: MOCK721ABI } = MOCK721
// console.log(`MOCK721ABI: ${JSON.stringify(MOCK721ABI)}`)
const Mock721Initialize = '0x8129fc1c'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  // Get the deployment configuration
  // TODO Update mock721 contract to parameterize constructor
  //   const config = await getConfig(hre.network.name, 'mock721')
  const userConfig = await getConfig(hre.network.name, 'users')

  const deployedMock721Implementation = await deploy('Mock721', {
    from: deployer,
    args: [],
    log: true
  })

  // ==== Deploy mock721Implementation ====
  const mock721Implementation = await hre.ethers.getContractAt('Mock721', deployedMock721Implementation.address)
  console.log('Mock721 Implementation deployed to  :', mock721Implementation.address)
  console.log('Mock721Implementation Name         : ', await mock721Implementation.name())

  // ==== Deploy mock721Proxy ====
  const deployedMock721Proxy = await deploy('MiniProxy', {
    from: deployer,
    args: [mock721Implementation.address, Mock721Initialize],
    log: true
  })
  const mock721Proxy = await hre.ethers.getContractAt('MiniProxy', deployedMock721Proxy.address)
  console.log('Mock721Proxy deployed to  :', mock721Proxy.address)

  // ==== Mock721 is the implementation contract attached to the Proxy
  const Mock721 = await ethers.getContractFactory('Mock721')
  const mock721 = Mock721.attach(mock721Proxy.address)
  console.log('Mock721 Name         : ', await mock721.name())

  // ==== Deploy mock721ImplementationV2 ====
  const deployedMock721ImplementationV2 = await deploy('Mock721_v2', {
    from: deployer,
    args: [],
    log: true
  })
  const mock721ImplementationV2 = await hre.ethers.getContractAt('Mock721_v2', deployedMock721ImplementationV2.address)
  console.log('Mock721 Implementation V2 deployed to  :', mock721ImplementationV2.address)

  // ==== Call Mock721 to authorize the upgrade ====
  const tx = await mock721.upgradeTo(mock721ImplementationV2.address)
  const receipt = await tx.wait()
  console.log(`Mock721_v2 Upgrade Transaction: ${JSON.stringify(receipt)}`)

  console.log('Mock721_v2 Name         : ', await mock721.name())
  console.log('Mock721_v2 Symbol       : ', await mock721.symbol())
  // Mint test tokens on networks hardhat and ethLocal
  console.log(`hre.network.name : ${hre.network.name}`)
  if (hre.network.name === 'hardhat' || hre.network.name === 'ethLocal') {
    // mock721Proxy.connect(operatorA)
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
}

deployFunction.dependencies = []
deployFunction.tags = ['Mock721Test']
export default deployFunction
