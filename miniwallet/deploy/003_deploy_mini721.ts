import config from '../config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy } = deployments
  const { deployer, operatorA } = await getNamedAccounts()
  const chainId = await getChainId()
  let mini721DeployArgs = {}
  let saleIsActive
  let metadataFrozen
  let provenanceFrozen
  let max721Tokens
  let mintPrice
  let maxPerMint
  let baseUri
  let contractUri

  console.log(`chainId: ${chainId}`)
  if (chainId === '1666600000,') {
    console.log('Harmony Mainnet Deploy')
    console.log(`Min721 Deployment Info: ${JSON.stringify(config.mainnet.mini721)}`)
    saleIsActive = config.mainnet.mini721.saleIsActive
    metadataFrozen = config.mainnet.mini721.metadataFrozen
    provenanceFrozen = config.mainnet.mini721.provenanceFrozen
    max721Tokens = config.mainnet.mini721.max721Tokens
    mintPrice = config.mainnet.mini721.mintPrice
    maxPerMint = config.mainnet.mini721.maxPerMint
    baseUri = config.mainnet.mini721.baseUri
    contractUri = config.mainnet.mini721.contractUri
  } else {
    console.log(`Test Deploy on chainId: ${chainId}`)
    console.log(`Min721 Deployment Info: ${JSON.stringify(config.test.mini721)}`)
    mini721DeployArgs = config.test.mini721
    saleIsActive = config.test.mini721.saleIsActive
    metadataFrozen = config.test.mini721.metadataFrozen
    provenanceFrozen = config.test.mini721.provenanceFrozen
    max721Tokens = config.test.mini721.max721Tokens
    mintPrice = config.test.mini721.mintPrice
    maxPerMint = config.test.mini721.maxPerMint
    baseUri = config.test.mini721.baseUri
    contractUri = config.test.mini721.contractUri
  }
  console.log('mini721DeployArgs:', JSON.stringify(mini721DeployArgs))

  const deployedMini721 = await deploy('Mini721', {
    from: deployer,
    gasLimit: 4000000,
    args: [
      saleIsActive, // false,
      metadataFrozen, // false,
      provenanceFrozen, //  false
      max721Tokens, // 1000000000000
      mintPrice, // ethers.utils.parseEther('0')
      maxPerMint, // 1
      baseUri, // "ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/"
      contractUri // 'ipfs://Qmezo5wDKz7kHwAPRUSJby96rnCfvhqgVqDD7Zorx9rqy8'
    ],
    log: true
  })

  const mini721 = await hre.ethers.getContractAt('Mini721', deployedMini721.address)

  console.log('Mini721 deployed to  :', mini721.address)
  console.log('Mini721 Name         : ', await mini721.name())
  console.log('Mini721 Symbol       : ', await mini721.symbol())

  // Mint test tokens
  if (chainId !== '1666600000,') {
    console.log(`operatorA           : ${operatorA}`)
    console.log(`config.test.operator: ${config.test.operator}`)
    await mini721.mintForCommunity(config.test.operator, 1)
    await mini721.mintForCommunity(config.test.user, 1)
    await mini721.mintForCommunity(config.test.creator, 1)
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
deployFunction.tags = ['Mini721', '003', 'deploy']
export default deployFunction
