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

  const mock721Implementation = await hre.ethers.getContractAt('Mock721', deployedMock721Implementation.address)
  console.log('Mock721 Implementation deployed to  :', mock721Implementation.address)
  const mock721Interface = new ethers.utils.Interface(MOCK721ABI)
  //   console.log(`mock721Interface: ${JSON.stringify(mock721Interface)}`)
  for (const fragment of mock721Interface.fragments) {
    if (fragment.type === 'function') {
      console.log(`fragment name: ${fragment.name}`)
      console.log(`fragment parameters: ${fragment.format()}`)
      console.log(`fragment sighash: ${mock721Interface.getSighash(fragment.name)}`)
    }
  }

  console.log('Mock721Implementation Name         : ', await mock721Implementation.name())

  const deployedMock721Proxy = await deploy('MiniProxy', {
    from: deployer,
    args: [mock721Implementation.address, Mock721Initialize],
    log: true
  })

  const mock721Proxy = await hre.ethers.getContractAt('MiniProxy', deployedMock721Proxy.address)
  console.log('Mock721Proxy deployed to  :', mock721Proxy.address)
  const Mock721 = await ethers.getContractFactory('Mock721')
  const mock721 = Mock721.attach(mock721Proxy.address)
  console.log('Mock721 Name         : ', await mock721.name())
  console.log('Mock721 Symbol       : ', await mock721.symbol())
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
