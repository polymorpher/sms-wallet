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
  const mini1155DeployArgs = {}
  let saleIsActive
  let metadataFrozen
  let mintPrice
  let maxPerMint
  let standardTokenId
  let rareTokenId
  let exchangeRatio
  let rareProbabilityPercentage
  let salt
  let baseUri
  let contractUri

  console.log(`chainId: ${chainId}`)
  if (chainId === '1666600000,') {
    console.log('Harmony Mainnet Deploy')
    console.log(`Min1155 Deployment Info: ${JSON.stringify(config.mainnet.mini1155.deploy)}`)
    saleIsActive = config.mainnet.mini1155.deploy.saleIsActive
    metadataFrozen = config.mainnet.mini1155.deploy.metadataFrozen
    mintPrice = config.mainnet.mini1155.deploy.mintPrice
    maxPerMint = config.mainnet.mini1155.deploy.maxPerMint
    standardTokenId = config.mainnet.mini1155.deploy.s.tokenId
    rareTokenId = config.mainnet.mini1155.deploy.s.tokenId
    exchangeRatio = config.mainnet.mini1155.deploy.exchangeRatio
    rareProbabilityPercentage = config.mainnet.mini1155.deploy.rareProbabilityPercentage
    salt = config.mainnet.mini1155.deploy.salt
    baseUri = config.mainnet.mini1155.deploy.baseUri
    contractUri = config.mainnet.mini1155.deploy.contractUri
  } else {
    console.log(`Test Deploy on chainId: ${chainId}`)
    console.log(`Min1155 Deployment Info: ${JSON.stringify(config.test.mini1155.deploy)}`)
    saleIsActive = config.test.mini1155.deploy.saleIsActive
    metadataFrozen = config.test.mini1155.deploy.metadataFrozen
    mintPrice = config.test.mini1155.deploy.mintPrice
    maxPerMint = config.test.mini1155.deploy.maxPerMint
    standardTokenId = config.test.mini1155.deploy.s.tokenId
    rareTokenId = config.test.mini1155.deploy.s.tokenId
    exchangeRatio = config.test.mini1155.deploy.exchangeRatio
    rareProbabilityPercentage = config.test.mini1155.deploy.rareProbabilityPercentage
    salt = config.test.mini1155.deploy.salt
    baseUri = config.test.mini1155.deploy.baseUri
    contractUri = config.test.mini1155.deploy.contractUri
  }
  console.log('mini1155DeployArgs:', JSON.stringify(mini1155DeployArgs))

  const deployedMini1155 = await deploy('Mini1155', {
    from: deployer,
    gasLimit: 4000000,
    args: [
      saleIsActive,
      metadataFrozen,
      mintPrice,
      maxPerMint,
      standardTokenId,
      rareTokenId,
      exchangeRatio,
      rareProbabilityPercentage,
      salt,
      baseUri,
      contractUri
    ],
    log: true
  })

  const mini1155 = await hre.ethers.getContractAt('Mini1155', deployedMini1155.address)

  console.log('Mini1155 deployed to  :', mini1155.address)
  console.log('Mini1155 Name         : ', await mini1155.name())
  console.log('Mini1155 Symbol       : ', await mini1155.symbol())

  // Mint test tokens
  if (chainId !== '1666600000,') {
    console.log(`operatorA           : ${operatorA}`)
    console.log(`config.test.operator: ${config.test.operator}`)
    await mini1155.mintAsOwner(config.test.user, 0, 1)
    await mini1155.mintAsOwner(config.test.creator, 0, 1)
    await mini1155.mintAsOwner(config.test.user, 2, 1)

    console.log(`Operator Token 0 User Balance   : ${await mini1155.balanceOf(config.test.user, 0)}`)
    console.log(`Operator Token 0 Creator Balance: ${await mini1155.balanceOf(config.test.creator, 0)}`)
    console.log(`Creator  Token 2 User Balance   : ${await mini1155.balanceOf(config.test.user, 2)}`)
  }
  console.log('Mini1155 maxSupply 0    : ', (await mini1155.maxSupply(0)).toString())
  console.log('Mini1155 totalSupply 0  : ', (await mini1155.totalSupply(0)).toString())
  console.log('Mini1155 maxSupply 1    : ', (await mini1155.maxSupply(1)).toString())
  console.log('Mini1155 totalSupply 1  : ', (await mini1155.totalSupply(1)).toString())
  console.log('Mini1155 maxSupply 0    : ', (await mini1155.maxSupply(2)).toString())
  console.log('Mini1155 totalSupply 0  : ', (await mini1155.totalSupply(2)).toString())
  console.log('Mini1155 mintPrice      : ', (await mini1155.mintPrice()).toString())
  console.log('Mini1155 saleIsActive   : ', await mini1155.saleIsActive())
  console.log('Mini1155 maxPerMint     : ', (await mini1155.maxPerMint()).toString())
}

deployFunction.dependencies = []
deployFunction.tags = ['Mini1155', '003', 'deploy']
export default deployFunction
