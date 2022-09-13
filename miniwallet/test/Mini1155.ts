import { expect } from 'chai'
import { ethers, network } from 'hardhat'
import config from '../config'
import Constants from './utilities/constants'

import { mini1155configure } from './utilities'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// Deployment configuration
const deploymentConfig = config.test.mini1155.deploy
const c1 = config.test.mini1155.collection1
const c2 = config.test.mini1155.collection2

describe('Mini1155', function () {
  before(async function (this) {
    this.signers = await ethers.getSigners()
    this.deployer = this.signers[0]
    this.royalties = this.signers[1]
    this.minter = this.signers[2]
    this.alice = this.signers[3]
    this.bob = this.signers[4]
    this.carol = this.signers[5]
    this.Mini1155 = await ethers.getContractFactory('Mini1155')
  })

  beforeEach(async function (this) {
    this.snapshotId = await ethers.provider.send('evm_snapshot', [])
    const Mini1155 = await ethers.getContractFactory('Mini1155')
    this.mini1155 = await Mini1155.deploy(
      deploymentConfig.saleIsActive,
      deploymentConfig.metadataFrozen,
      deploymentConfig.mintPrice,
      deploymentConfig.maxPerMint,
      deploymentConfig.s.tokenId,
      deploymentConfig.r.tokenId,
      deploymentConfig.exchangeRatio,
      deploymentConfig.rareProbabilityPercentage,
      deploymentConfig.salt,
      deploymentConfig.baseUri,
      deploymentConfig.contractUri
    )
    console.log('finished deploy')
    await this.mini1155.deployed()
    // set the revenue account
    await this.mini1155.setRevenueAccount(deploymentConfig.revenueAccount)
    // set the standard and rare maxSupply
    await this.mini1155.setMaxSupply(deploymentConfig.s.tokenId, deploymentConfig.s.maxSupply) // standard tokenId (Access Pass)
    await this.mini1155.setMaxSupply(deploymentConfig.r.tokenId, deploymentConfig.r.maxSupply) // rare TokenId (Collector Pass)
    // set the standard and rare maxPersonalCap
    await this.mini1155.setMaxPersonalCap(deploymentConfig.s.tokenId, deploymentConfig.s.personalCap) // standard tokenId (Access Pass)
    await this.mini1155.setMaxPersonalCap(deploymentConfig.r.tokenId, deploymentConfig.r.personalCap) // rare TokenId (Collector Pass)
    await this.mini1155.setNameSymbol(deploymentConfig.name, deploymentConfig.symbol)
  })

  afterEach(async function (this) {
    // console.log(`Reverting Snapshot : ${snapshotId}`);
    await network.provider.send('evm_revert', [this.snapshotId])
  })

  describe('Mini1155Tests', function (this) {
    // Deployment Tests
    it('Mini1155-1 Deployment Validation', async function () {
      expect(await this.mini1155.address).to.equal(
        '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      )
      // Test View Functions
      const owner = await this.mini1155.owner()
      const tid = 1
      expect(owner).to.equal(this.deployer.address)
      expect(await this.mini1155.balanceOf(owner, tid)).to.equal(0)
      expect((await this.mini1155.balanceOfBatch([owner, owner], [1, 2])).map(x => x.toString())).to.deep.equal(['0', '0'])
      expect(await this.mini1155.baseUri()).to.equal(deploymentConfig.baseUri)
      expect(await this.mini1155.contractURI()).to.equal(deploymentConfig.contractUri)
      expect(await this.mini1155.exchangeRatio()).to.equal(deploymentConfig.exchangeRatio)
      expect(await this.mini1155.exists(deploymentConfig.s.tokenId)).to.equal(false)
      expect(await this.mini1155.getRaribleV2Royalties(1)).to.deep.equal([])
      expect(await this.mini1155.isApprovedForAll(this.alice.address, owner)).to.equal(false)
      expect(await this.mini1155.maxPerMint()).to.equal(deploymentConfig.maxPerMint)
      expect(await this.mini1155.maxPersonalCap(deploymentConfig.s.tokenId)).to.equal(deploymentConfig.s.personalCap)
      expect(await this.mini1155.maxSupply(deploymentConfig.s.tokenId)).to.equal(deploymentConfig.s.maxSupply)
      expect(await this.mini1155.metadataFrozen()).to.equal(false)
      expect(await this.mini1155.metadataUris(deploymentConfig.s.tokenId)).to.equal('')
      expect(await this.mini1155.mintPrice()).to.equal(deploymentConfig.mintPrice)
      expect(await this.mini1155.name()).to.equal(deploymentConfig.name)
      expect(await this.mini1155.owner()).to.equal(this.deployer.address)
      expect(await this.mini1155.paused()).to.equal(false)
      expect(await this.mini1155.rareProbabilityPercentage()).to.equal(deploymentConfig.rareProbabilityPercentage)
      expect(await this.mini1155.revenueAccount()).to.equal(deploymentConfig.revenueAccount)
      // expect(await this.mini1155.royalties(1, 1)).to.equal(0, this.deployer.address)
      // expect(await this.mini1155.royaltyInfo(1, 1)).to.equal(this.deployer.address, 0)
      expect(await this.mini1155.saleIsActive()).to.equal(deploymentConfig.saleIsActive)
      expect(await this.mini1155.saleStarted()).to.equal(false)
      expect(await this.mini1155.salt()).to.equal(deploymentConfig.salt)
      expect(await this.mini1155.standardTokenId()).to.equal(deploymentConfig.s.tokenId)
      expect(await this.mini1155.supportsInterface(Constants.InterfaceId.ERC2981_NFT_ROYALTY_STANDARD)).to.equal(true)
      expect(await this.mini1155.symbol()).to.equal(deploymentConfig.symbol)
      expect(await this.mini1155.totalSupply(deploymentConfig.s.tokenId)).to.equal(0)
      expect(await this.mini1155.uri(deploymentConfig.s.tokenId)).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/1')
    })

    it('Mini1155-2 Configuration Validation', async function () {
      // Set Standard and Rare Tokens
      // await mini1155configure({ mini1155: this.mini1155, revenueAccount: await this.mini1155.owner() })
      await mini1155configure({ mini1155: this.mini1155, collectionConfig: c1 })
      // Check all readOnlyFunctions
      expect(this.mini1155.address).to.equal(
        '0x5FbDB2315678afecb367f032d93F642f64180aa3'
      )
      // Test Token Configuration
      expect(await this.mini1155.owner()).to.equal(this.deployer.address)
      expect(await this.mini1155.metadataFrozen()).to.equal(false)
      expect(await this.mini1155.standardTokenId()).to.equal(c1.s.tokenId)
      expect(await this.mini1155.maxSupply(c1.s.tokenId)).to.equal(c1.s.maxSupply)
      expect(await this.mini1155.maxPersonalCap(c1.s.tokenId)).to.equal(c1.s.personalCap)
      expect(await this.mini1155.uri(c1.s.tokenId)).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/1')
      expect(await this.mini1155.rareTokenId()).to.equal(c1.r.tokenId)
      expect(await this.mini1155.maxSupply(c1.r.tokenId)).to.equal(c1.r.maxSupply)
      expect(await this.mini1155.maxPersonalCap(c1.r.tokenId)).to.equal(c1.r.personalCap)
      expect(await this.mini1155.uri(2)).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/2')
      // Although configured tokens don't exist till minted
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(false)
      expect(await this.mini1155.exists(c1.r.tokenId)).to.equal(false)
      // Test View Functions
      const owner = await this.mini1155.owner()
      // const tid = 1
      expect(await this.mini1155.balanceOf(owner, c1.s.tokenId)).to.equal(0)
      expect((await this.mini1155.balanceOfBatch([owner, owner], [1, 2])).map(x => x.toString())).to.deep.equal(['0', '0'])
      expect(await this.mini1155.baseUri()).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/')
      expect(await this.mini1155.contractURI()).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/contract.json')
      expect(await this.mini1155.exchangeRatio()).to.equal(0)
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(false)
      expect(await this.mini1155.getRaribleV2Royalties(c1.s.tokenId)).to.deep.equal([])
      expect(await this.mini1155.isApprovedForAll(this.alice.address, owner)).to.equal(false)
      expect(await this.mini1155.maxPerMint()).to.equal(10)
      expect(await this.mini1155.maxPersonalCap(c1.s.tokenId)).to.equal(c1.s.personalCap)
      expect(await this.mini1155.maxSupply(c1.s.tokenId)).to.equal(c1.s.maxSupply)
      expect(await this.mini1155.metadataFrozen()).to.equal(false)
      expect(await this.mini1155.metadataFrozen()).to.equal(false)
      expect(await this.mini1155.metadataUris(c1.s.tokenId)).to.equal('')
      expect(await this.mini1155.mintPrice()).to.equal(c1.mintPrice)
      expect(await this.mini1155.owner()).to.equal(this.deployer.address)
      expect(await this.mini1155.paused()).to.equal(false)
      expect(await this.mini1155.rareProbabilityPercentage()).to.equal(1)
      expect(await this.mini1155.revenueAccount()).to.equal(c1.revenueAccount)
      // expect(await this.mini1155.royalties(1, 1)).to.equal(0, this.deployer.address)
      // expect(await this.mini1155.royaltyInfo(1, 1)).to.equal(this.deployer.address, 0)
      expect(await this.mini1155.saleIsActive()).to.equal(false)
      expect(await this.mini1155.saleStarted()).to.equal(false)
      expect(await this.mini1155.salt()).to.equal(deploymentConfig.salt)
      expect(await this.mini1155.standardTokenId()).to.equal(c1.s.tokenId)
      expect(await this.mini1155.supportsInterface(Constants.InterfaceId.ERC2981_NFT_ROYALTY_STANDARD)).to.equal(true)
      expect(await this.mini1155.totalSupply(c1.s.tokenId)).to.equal(0)
      expect(await this.mini1155.uri(1)).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/1')
    })

    it('Mini1155-3 Sale Validation', async function () {
      // await mini1155configure({ mini1155: this.mini1155, revenueAccount: await this.mini1155.owner() })
      await mini1155configure({ mini1155: this.mini1155, collectionConfig: c1 })
      let numTokens = 1
      // const mintPrice = await this.mini1155.mintPrice()
      // Can only mint when sale is active
      await expect(
        this.mini1155.connect(this.alice).mint(numTokens, {
          value: c1.mintPrice.mul(numTokens)
        })
      ).to.be.revertedWith('sale not active')
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(false)
      // set sale to active
      await this.mini1155.toggleSaleState()
      // * Mints a ERC1155 token
      await this.mini1155.connect(this.alice).mint(numTokens, {
        value: c1.mintPrice.mul(numTokens)
      })
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(true)
      expect(await this.mini1155.totalSupply(c1.s.tokenId)).to.equal(1)
      numTokens = 10
      await expect(
        this.mini1155.connect(this.alice).mint(numTokens, {
          value: c1.mintPrice.mul(numTokens)
        })
      ).to.be.revertedWith('standard token personal cap exceeded')
      // Validate Sale Changes
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(true)
      expect(await this.mini1155.saleIsActive()).to.equal(true)
      expect(await this.mini1155.saleStarted()).to.equal(true)
      expect(await this.mini1155.totalSupply(c1.s.tokenId)).to.equal(1)
      // Test View Functions
      const owner = await this.mini1155.owner()
      // const tid = 1
      expect(await this.mini1155.balanceOf(owner, c1.s.tokenId)).to.equal(0)
      expect((await this.mini1155.balanceOfBatch([owner, owner], [1, 2])).map(x => x.toString())).to.deep.equal(['0', '0'])
      expect(await this.mini1155.baseUri()).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/')
      expect(await this.mini1155.contractURI()).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/contract.json')
      expect(await this.mini1155.exchangeRatio()).to.equal(0)
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(true)
      expect(await this.mini1155.getRaribleV2Royalties(c1.s.tokenId)).to.deep.equal([])
      expect(await this.mini1155.isApprovedForAll(this.alice.address, owner)).to.equal(false)
      expect(await this.mini1155.maxPerMint()).to.equal(10)
      expect(await this.mini1155.maxPersonalCap(c1.s.tokenId)).to.equal(c1.s.personalCap)
      expect(await this.mini1155.maxSupply(c1.s.tokenId)).to.equal(c1.s.maxSupply)
      expect(await this.mini1155.metadataFrozen()).to.equal(false)
      expect(await this.mini1155.metadataFrozen()).to.equal(false)
      expect(await this.mini1155.metadataUris(c1.s.tokenId)).to.equal('')
      expect(await this.mini1155.mintPrice()).to.equal(c1.mintPrice)
      expect(await this.mini1155.owner()).to.equal(this.deployer.address)
      expect(await this.mini1155.paused()).to.equal(false)
      expect(await this.mini1155.rareProbabilityPercentage()).to.equal(1)
      expect(await this.mini1155.revenueAccount()).to.equal(c1.revenueAccount)
      expect(await this.mini1155.saleIsActive()).to.equal(true)
      expect(await this.mini1155.saleStarted()).to.equal(true)
      expect(await this.mini1155.salt()).to.equal(deploymentConfig.salt)
      expect(await this.mini1155.standardTokenId()).to.equal(c1.s.tokenId)
      expect(await this.mini1155.supportsInterface(Constants.InterfaceId.ERC2981_NFT_ROYALTY_STANDARD)).to.equal(true)
      expect(await this.mini1155.totalSupply(c1.s.tokenId)).to.equal(1)
      expect(await this.mini1155.uri(1)).to.equal('ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/1')
    })

    it('Mini1155-4 Owner Validation', async function () {
      const standardURI = 'ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/3.json'
      const rareURI = 'ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/4.json'
      const royaltyPercentage = 10
      await mini1155configure({ mini1155: this.mini1155, collectionConfig: c1 })
      let numTokens = 1
      // set sale to active
      await this.mini1155.toggleSaleState()

      // Owner Tests

      // Setting all flags
      // set the revenue account
      await this.mini1155.setRevenueAccount(c1.revenueAccount)
      // configure standard Token
      await this.mini1155.setStandardTokenId(c1.s.tokenId)
      await this.mini1155.setMaxSupply(c1.s.tokenId, c1.s.maxSupply)
      await this.mini1155.setMaxPersonalCap(c1.s.tokenId, c1.s.personalCap)
      await this.mini1155.setUri(c1.s.tokenId, standardURI)
      // configure rare Token
      await this.mini1155.setRareTokenId(c1.r.tokenId)
      await this.mini1155.setMaxSupply(c1.r.tokenId, c1.r.maxSupply)
      await this.mini1155.setMaxPersonalCap(c1.r.tokenId, c1.r.personalCap)
      await this.mini1155.setUri(c1.r.tokenId, rareURI)
      await this.mini1155.setRareProbabilityPercentage(c1.rareProbabilityPercentage)
      // configure exchange rate
      await this.mini1155.setExchangeRatio(c1.exchangeRatio)

      // test other setters
      await this.mini1155.setBaseUri(deploymentConfig.baseUri)
      await this.mini1155.setContractUri(deploymentConfig.contractUri)
      await this.mini1155.setMaxPerMint(c1.maxPerMint)
      await this.mini1155.setMintPrice(c1.mintPrice)
      await this.mini1155.setRareProbabilityPercentage(c1.rareProbabilityPercentage)
      await this.mini1155.setRoyalties(c1.s.tokenId, this.royalties.address, royaltyPercentage)
      await this.mini1155.setSalt(deploymentConfig.salt)
      await this.mini1155.pause()
      await this.mini1155.unpause()
      await this.mini1155.freezeMetadata()
      await this.mini1155.toggleSaleState()

      // Owner Minting and Burning and Exchange
      // "function mintAsOwner(address,uint256,uint256)",
      await this.mini1155.toggleSaleState()
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(false)
      await this.mini1155['mintAsOwner(address,uint256,uint256)'](this.deployer.address, c1.s.tokenId, 40)
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(true)
      expect(await this.mini1155.totalSupply(c1.s.tokenId)).to.equal(40)
      await this.mini1155['mintAsOwner(address,uint256,uint256)'](this.deployer.address, c1.s.tokenId, 60)
      expect(await this.mini1155.totalSupply(c1.s.tokenId)).to.equal(100)
      // "function mint(uint256) payable",
      numTokens = 11 // amount exceeding mint limit
      await expect(
        this.mini1155.mint(numTokens)
      ).to.be.revertedWith('exceeded per mint limit')

      // Batch Functions
      const owner = await this.mini1155.owner()
      const tid1 = 10
      const tid2 = 11
      // TODO "function mintBatch(address,uint256[],uint256[],bytes)",
      await this.mini1155.mintAsOwner(owner, tid1, 1000)
      await this.mini1155.mintAsOwner(owner, tid2, 100)
      expect((await this.mini1155.balanceOfBatch([owner, owner], [tid1, tid2])).map(x => x.toString())).to.deep.equal(['1000', '100'])
      await this.mini1155.burnBatch(owner, [tid1, tid2], [100, 10])
      expect((await this.mini1155.balanceOfBatch([owner, owner], [tid1, tid2])).map(x => x.toString())).to.deep.equal(['900', '90'])
      await this.mini1155.safeBatchTransferFrom(owner, this.alice.address, [tid1, tid2], [70, 7], '0x')
      expect((await this.mini1155.balanceOfBatch([owner, owner, this.alice.address, this.alice.address], [tid1, tid2, tid1, tid2])).map(x => x.toString())).to.deep.equal(['830', '83', '70', '7'])
      await this.mini1155.burn(owner, tid1, 200)
      expect((await this.mini1155.balanceOfBatch([owner], [tid1])).map(x => x.toString())).to.deep.equal(['630'])
      await this.mini1155.safeTransferFrom(owner, this.alice.address, tid1, 100, '0x')
      expect((await this.mini1155.balanceOfBatch([owner, this.alice.address], [tid1, tid1])).map(x => x.toString())).to.deep.equal(['530', '170'])
    })

    it('Mini1155-5 User Validation', async function () {

    })

    it('Mini1155-6 Negative Use Case Validation', async function () {
      // Ensure community can't use owner functions
      await expect(
        this.mini1155
          .connect(this.alice)['mintAsOwner(address,uint256,uint256)'](this.deployer.address, 1, 500)
      ).to.be.revertedWith('Ownable: caller is not the owner')

      // One User should not be able to mint and exchange all the tokens
      await mini1155configure({ mini1155: this.mini1155, collectionConfig: c1 })
      const numTokens = 10
      // set sale to active
      await this.mini1155.toggleSaleState()
      // Should never have exchangeRatio set when sales is active otherwise users can mint and exchange to exceed personal limits
      await this.mini1155.setExchangeRatio(10)
      for (let i = 0; i < 77; i++) {
        // Mint 10 exchange them for rare and then
        await this.mini1155.connect(this.bob).mint(numTokens, {
          value: c1.mintPrice.mul(numTokens)
        })
        await this.mini1155.connect(this.bob).exchange()
      }
      // Validate Sale Changes
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(false)
      expect(await this.mini1155.exists(c1.r.tokenId)).to.equal(true)
      expect(await this.mini1155.saleIsActive()).to.equal(true)
      expect(await this.mini1155.saleStarted()).to.equal(true)
      expect(await this.mini1155.totalSupply(c1.s.tokenId)).to.equal(0)
      expect(await this.mini1155.totalSupply(c1.r.tokenId)).to.equal(77)
      expect(await this.mini1155.balanceOf(this.bob.address, c1.s.tokenId)).to.equal(0)
      expect(await this.mini1155.balanceOf(this.bob.address, c1.r.tokenId)).to.equal(77)
    })

    it('Mini1155-7 Event Validation', async function () {

    })

    it('Mini1155-8 Second Edition Validation', async function () {
      const owner = await this.mini1155.owner()
      // Deploy (Owner done in before each)
      // Configure Collection 1 (Owner)
      await mini1155configure({ mini1155: this.mini1155, collectionConfig: c1 })

      // Start Sale (Owner)
      await this.mini1155.toggleSaleState()
      let contractBalance = await ethers.provider.getBalance(this.mini1155.address)
      expect(contractBalance).to.equal(ethers.utils.parseEther('0'))

      // mint Tokens (Community)
      for (let i = 1; i <= 77; i++) {
        // console.log(`i: ${i}`)
        // Mint 10 tokens
        for (let j = 1; j <= 4; j++) {
          await this.mini1155.connect(this.signers[i]).mint(j, {
            value: c1.mintPrice.mul(j)
          })
        }
      }
      console.log('Collection 1')
      console.log(`Total Minted Standard Token          : ${await this.mini1155.totalSupply(c1.s.tokenId)}`)
      console.log(`Total Minted Rare Token              : ${await this.mini1155.totalSupply(c1.r.tokenId)}`)

      // End the Sale and check token exists and mintAsOwner remaining Tokens
      await this.mini1155.toggleSaleState()
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(true)
      expect(await this.mini1155.exists(c1.s.tokenId)).to.equal(true)
      let remainingStandard = (await this.mini1155.maxSupply(c1.s.tokenId)).sub(await this.mini1155.totalSupply(c1.s.tokenId))
      let remainingRare = (await this.mini1155.maxSupply(c1.r.tokenId)).sub(await this.mini1155.totalSupply(c1.r.tokenId))
      await this.mini1155.mintAsOwner(this.deployer.address, c1.s.tokenId, remainingStandard)
      await this.mini1155.mintAsOwner(this.deployer.address, c1.r.tokenId, remainingRare)
      expect(await this.mini1155.balanceOf(owner, c1.s.tokenId)).to.equal(remainingStandard)
      expect(await this.mini1155.balanceOf(owner, c1.r.tokenId)).to.equal(remainingRare)

      // Exchange the Tokens (Community)
      let exchangeRatio = 10
      await this.mini1155.setExchangeRatio(exchangeRatio)
      for (let i = 1; i <= 70; i++) {
        // console.log(`Exchange i: ${i}`)
        const standardCount = await this.mini1155.balanceOf(this.signers[i].address, c1.s.tokenId)
        // console.log(`Minted Rare Token      : ${rareCount}`)
        if (standardCount.toNumber() >= exchangeRatio) {
        // Exchange standard tokens for rare
          await this.mini1155.connect(this.signers[i]).exchange()
          // console.log(`Exchanged`)
        }
      }
      console.log(`Total Standard Token after exchange  : ${await this.mini1155.totalSupply(c1.s.tokenId)}`)
      console.log(`Total Rare Token after exchange      : ${await this.mini1155.totalSupply(c1.r.tokenId)}`)

      // Redeem the tokens for Collectibles (Owner)
      // Withdraw Proceedes from the Sale using to the owner and the revenue account
      let revenueAccount = await this.mini1155.revenueAccount()
      contractBalance = await ethers.provider.getBalance(this.mini1155.address)
      let ownerBalance = await ethers.provider.getBalance(owner)
      let revenueBalance = await ethers.provider.getBalance(revenueAccount)
      expect(contractBalance).to.be.above(ethers.utils.parseEther('1'))
      expect(ownerBalance).to.be.above(ethers.utils.parseEther('9999'))
      expect(revenueBalance).to.equal(ethers.utils.parseEther('0'))
      await this.mini1155.withdraw(ethers.utils.parseEther('1'), true)
      expect(await ethers.provider.getBalance(this.mini1155.address)).to.equal(contractBalance.sub(ethers.utils.parseEther('1')))
      expect(await ethers.provider.getBalance(owner)).to.be.below(ownerBalance) // we paid a little gas to withdraw
      expect(await ethers.provider.getBalance(revenueAccount)).to.equal(ethers.utils.parseEther('1'))
      await this.mini1155.withdraw(contractBalance.sub(ethers.utils.parseEther('1')), false)
      expect(await ethers.provider.getBalance(this.mini1155.address)).to.equal(ethers.BigNumber.from(0))
      expect(await ethers.provider.getBalance(owner)).to.be.above(ownerBalance) // we withdrew the funds and paid a little gas to withdraw
      expect(await ethers.provider.getBalance(revenueAccount)).to.equal(ethers.utils.parseEther('1'))

      // TODO Withrdraw Royalties (Owner)

      // ==== LAUNCH A NEW COLLECTION ====
      // Configure Collection2 (Owner)
      await mini1155configure({ mini1155: this.mini1155, collectionConfig: c2 })

      // Start Sale (Owner)
      await this.mini1155.toggleSaleState()
      contractBalance = await ethers.provider.getBalance(this.mini1155.address)
      expect(contractBalance).to.equal(ethers.utils.parseEther('0'))

      // mint Tokens (Community)
      for (let i = 1; i <= 77; i++) {
        // console.log(`i: ${i}`)
        // Mint 10 tokens
        for (let j = 1; j <= 4; j++) {
          await this.mini1155.connect(this.signers[i]).mint(j, {
            value: c2.mintPrice.mul(j)
          })
        }
      }
      console.log('Collection 2')
      console.log(`Total Minted Standard Token          : ${await this.mini1155.totalSupply(c2.s.tokenId)}`)
      console.log(`Total Minted Rare Token              : ${await this.mini1155.totalSupply(c2.r.tokenId)}`)

      // End the Sale and check token exists and mintAsOwner remaining Tokens
      await this.mini1155.toggleSaleState()
      expect(await this.mini1155.exists(c2.s.tokenId)).to.equal(true)
      expect(await this.mini1155.exists(c2.s.tokenId)).to.equal(true)
      remainingStandard = (await this.mini1155.maxSupply(c2.s.tokenId)).sub(await this.mini1155.totalSupply(c2.s.tokenId))
      remainingRare = (await this.mini1155.maxSupply(c2.r.tokenId)).sub(await this.mini1155.totalSupply(c2.r.tokenId))
      await this.mini1155.mintAsOwner(this.deployer.address, c2.s.tokenId, remainingStandard)
      await this.mini1155.mintAsOwner(this.deployer.address, c2.r.tokenId, remainingRare)
      expect(await this.mini1155.balanceOf(owner, c2.s.tokenId)).to.equal(remainingStandard)
      expect(await this.mini1155.balanceOf(owner, c2.r.tokenId)).to.equal(remainingRare)

      // Exchange the Tokens (Community)
      exchangeRatio = 20
      await this.mini1155.setExchangeRatio(exchangeRatio)
      for (let i = 1; i <= 140; i++) {
        // console.log(`Exchange i: ${i}`)
        const standardCount = await this.mini1155.balanceOf(this.signers[i].address, c2.s.tokenId)
        // console.log(`Minted Rare Token      : ${rareCount}`)
        if (standardCount.toNumber() >= exchangeRatio) {
        // Exchange standard tokens for rare
          await this.mini1155.connect(this.signers[i]).exchange()
          // console.log(`Exchanged`)
        }
      }
      console.log(`Total Standard Token after exchange  : ${await this.mini1155.totalSupply(c2.s.tokenId)}`)
      console.log(`Total Rare Token after exchange      : ${await this.mini1155.totalSupply(c2.r.tokenId)}`)

      // Redeem the tokens for Collectibles (Owner)
      // Withdraw Proceedes from the Sale using to the owner and the revenue account
      revenueAccount = await this.mini1155.revenueAccount()
      contractBalance = await ethers.provider.getBalance(this.mini1155.address)
      ownerBalance = await ethers.provider.getBalance(owner)
      revenueBalance = await ethers.provider.getBalance(revenueAccount)
      expect(contractBalance).to.be.above(ethers.utils.parseEther('1'))
      expect(ownerBalance).to.be.above(ethers.utils.parseEther('9999'))
      expect(revenueBalance).to.equal(ethers.utils.parseEther('1')) // Revenue Transfer from Previous Collection
      await this.mini1155.withdraw(ethers.utils.parseEther('1'), true)
      expect(await ethers.provider.getBalance(this.mini1155.address)).to.equal(contractBalance.sub(ethers.utils.parseEther('1')))
      expect(await ethers.provider.getBalance(owner)).to.be.below(ownerBalance) // we paid a little gas to withdraw
      expect(await ethers.provider.getBalance(revenueAccount)).to.equal(ethers.utils.parseEther('2'))
      await this.mini1155.withdraw(contractBalance.sub(ethers.utils.parseEther('1')), false)
      expect(await ethers.provider.getBalance(this.mini1155.address)).to.equal(ethers.BigNumber.from(0))
      expect(await ethers.provider.getBalance(owner)).to.be.above(ownerBalance) // we withdrew the funds and paid a little gas to withdraw
      expect(await ethers.provider.getBalance(revenueAccount)).to.equal(ethers.utils.parseEther('2'))

      // TODO Withrdraw Royalties (Owner)
      // Issue Non-sale Token (Owner) TokenId 5 with a quantity of 10
      const nonSaleTokenId = 5
      const nonSaleTokenQuantity = 10
      expect(await this.mini1155.exists(nonSaleTokenId)).to.equal(false)
      await this.mini1155.mintAsOwner(this.deployer.address, nonSaleTokenId, nonSaleTokenQuantity)
      expect(await this.mini1155.exists(nonSaleTokenId)).to.equal(true)

      // Pause Contract (Owner)
      await this.mini1155.pause()
      await this.mini1155.unpause()

      // Freeze Metadata (Owner)
      await this.mini1155.freezeMetadata()
    })
  })
})
