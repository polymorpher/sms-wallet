import { getConfig } from '../../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  // Get the deployment configuration
  const config = await getConfig(hre.network.name, 'miniNFTs')
  const userConfig = await getConfig(hre.network.name, 'users')

  const deployedMini1155 = await deploy('Mini1155', {
    from: deployer,
    gasLimit: 4000000,
    args: [
      config.mini1155.deploy.saleIsActive,
      config.mini1155.deploy.metadataFrozen,
      config.mini1155.deploy.mintPrice,
      config.mini1155.deploy.maxPerMint,
      config.mini1155.deploy.s.tokenId,
      config.mini1155.deploy.r.tokenId,
      config.mini1155.deploy.exchangeRatio,
      config.mini1155.deploy.rareProbabilityPercentage,
      config.mini1155.deploy.salt,
      config.mini1155.deploy.baseUri,
      config.mini1155.deploy.contractUri
    ],
    log: true
  })
  console.log('Deployed Mini1155')

  const mini1155 = await hre.ethers.getContractAt('Mini1155', deployedMini1155.address)

  console.log('Mini1155 deployed to  :', mini1155.address)
  console.log('Mini1155 Name         : ', await mini1155.name())
  console.log('Mini1155 Symbol       : ', await mini1155.symbol())

  // Mint test tokens on networks hardhat and ethLocal
  if (hre.network.name === 'hardhat' || hre.network.name === 'ethLocal') {
    await mini1155.mintAsOwner(userConfig.users.creator, 0, 1) // Operator Friend Token to creator
    await mini1155.mintAsOwner(userConfig.users.user, 0, 1) // Operator Friend Token to User
    await mini1155.mintAsOwner(userConfig.users.user, 1, 1) // Creator Friend Token to User

    console.log(`Operator Token 0 User Balance   : ${await mini1155.balanceOf(userConfig.users.user, 0)}`)
    console.log(`Operator Token 0 Creator Balance: ${await mini1155.balanceOf(userConfig.users.creator, 0)}`)
    console.log(`Creator  Token 1 User Balance   : ${await mini1155.balanceOf(userConfig.users.user, 1)}`)
  }
  console.log('Mini1155 maxSupply 0    : ', (await mini1155.maxSupply(0)).toString())
  console.log('Mini1155 totalSupply 0  : ', (await mini1155.totalSupply(0)).toString())
  console.log('Mini1155 uri 0          : ', (await mini1155.uri(0)))
  console.log('Mini1155 maxSupply 1    : ', (await mini1155.maxSupply(1)).toString())
  console.log('Mini1155 totalSupply 1  : ', (await mini1155.totalSupply(1)).toString())
  console.log('Mini1155 uri 1          : ', (await mini1155.uri(1)))
  console.log('Mini1155 maxSupply 2    : ', (await mini1155.maxSupply(2)).toString())
  console.log('Mini1155 totalSupply 2  : ', (await mini1155.totalSupply(2)).toString())
  console.log('Mini1155 uri 2          : ', (await mini1155.uri(2)))
  console.log('Mini1155 mintPrice      : ', (await mini1155.mintPrice()).toString())
  console.log('Mini1155 saleIsActive   : ', await mini1155.saleIsActive())
  console.log('Mini1155 maxPerMint     : ', (await mini1155.maxPerMint()).toString())
}

deployFunction.dependencies = []
deployFunction.tags = ['Mini1155V0', 'deployV0']
export default deployFunction
