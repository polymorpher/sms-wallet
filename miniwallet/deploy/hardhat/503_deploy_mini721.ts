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

  //   console.log('mini721DeployArgs:', JSON.stringify(config.mini721))

  const deployedMini721 = await deploy('Mini721', {
    from: deployer,
    args: [
      config.mini721.saleIsActive, // false,
      config.mini721.metadataFrozen, // false,
      config.mini721.provenanceFrozen, //  false
      config.mini721.max721Tokens, // 1000000000000
      config.mini721.mintPrice, // ethers.utils.parseEther('0')
      config.mini721.maxPerMint, // 1
      config.mini721.baseUri, // "ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/"
      config.mini721.contractUri // 'ipfs://Qmezo5wDKz7kHwAPRUSJby96rnCfvhqgVqDD7Zorx9rqy8'
    ],
    log: true
  })

  const mini721 = await hre.ethers.getContractAt('Mini721', deployedMini721.address)

  console.log('Mini721 deployed to  :', mini721.address)
  console.log('Mini721 Name         : ', await mini721.name())
  console.log('Mini721 Symbol       : ', await mini721.symbol())

  // Mint test tokens on networks hardhat and ethLocal
  if (hre.network.name === 'hardhat' || hre.network.name === 'ethLocal') {
    await mini721.mintForCommunity(userConfig.users.operator, 1)
    await mini721.mintForCommunity(userConfig.users.creator, 1)
    await mini721.mintForCommunity(userConfig.users.user, 1)
    console.log(`Token 0 Owner: ${await mini721.ownerOf(0)}`)
    console.log(`Token 1 Owner: ${await mini721.ownerOf(1)}`)
    console.log(`Token 2 Owner: ${await mini721.ownerOf(2)}`)
  }
  console.log('Mini721 maxMiniTokens: ', (await mini721.maxMiniTokens()).toString())
  console.log('Mini721 totalSupply  : ', (await mini721.totalSupply()).toString())
  console.log('Mini721 mintPrice    : ', (await mini721.mintPrice()).toString())
  console.log('Mini721 saleIsActive : ', await mini721.saleIsActive())
  console.log('Mini721 maxPerMint   : ', (await mini721.maxPerMint()).toString())
}

deployFunction.dependencies = []
deployFunction.tags = ['Mini721V0', 'deployVO']
export default deployFunction
