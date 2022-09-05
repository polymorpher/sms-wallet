import { expect } from 'chai'
import { ethers, network } from 'hardhat'
import { ADDRESS_ZERO, prepare721, userMint721, communityMint721 } from './utilities'
import { BigNumber } from 'ethers'
import Constants from './utilities/constants'

// let snapshotId: string;

describe('Mini721', function () {
  before(async function (this) {
    await prepare721(this, [])
  })

  beforeEach(async function (this) {
    this.snapshotId = await ethers.provider.send('evm_snapshot', [])
    // console.log(`New Snapshot beforeEach: ${snapshotId}`);
    this.mini721 = await this.Mini721.deploy(
      false, // saleIsActive
      false, // metadataFrozen
      false, // provenanceFrozen
      10000, // maxMiniTokens
      ethers.utils.parseEther('0.1'), // mintPrice 0.1 ETH
      10, // maxPerMint
      '', // "ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/", // baseUri
      '' // "ipfs://Qmf8WkAVZtkBwngG4mTrPk23vDd6z8dZW2UshV9ywWGyB9/contract.json" // _contractUri
    )
    await this.mini721.deployed()
    // console.log("Mini721 contract", this.mini721.address);
  })

  afterEach(async function (this) {
    // console.log(`Reverting Snapshot : ${snapshotId}`);
    await network.provider.send('evm_revert', [this.snapshotId])
  })
  // TODO
  // NFT Build Process (Images, Metadata, Provenance Hash)

  // Deployment Tests
  describe('validate Initial Deploy', function (this) {
    it('Mini721 contract should be created', async function () {
      await expect(this.mini721.address).to.be.properAddress

      // Public Variables
      expect(await this.mini721.maxMiniTokens()).to.equal(10000)
      expect(await this.mini721.mintPrice()).to.equal(
        ethers.utils.parseEther('0.1')
      ) // 0.1 ETH
      expect(await this.mini721.maxPerMint()).to.equal(10)
      expect(await this.mini721.startIndex()).to.equal(0)
      expect(await this.mini721.provenanceHash()).to.equal('')
      expect(await this.mini721.offsetValue()).to.equal(0)
      expect(await this.mini721.metadataFrozen()).to.equal(false)
      expect(await this.mini721.provenanceFrozen()).to.equal(false)
      expect(await this.mini721.saleIsActive()).to.equal(false)
      expect(await this.mini721.saleStarted()).to.equal(false)
      expect(await this.mini721.temporaryTokenUri()).to.equal('')

      // Public Functions Mini721
      await expect(this.mini721.tokenURI(0)).to.be.revertedWith(
        'URIQueryForNonexistentToken()'
      )
      expect(await this.mini721.supportsInterface(Constants.InterfaceId.ERC2981_NFT_ROYALTY_STANDARD)).to.equal(true)
      expect(await this.mini721.exists(18)).to.equal(false)
      expect(await this.mini721.contractURI()).to.equal('')
      // Token should hold no eth initially
      // Alices is the owner and there should be nothing to withdraw
      await this.mini721.withdraw(ethers.utils.parseEther('0'), false)
      expect(await this.mini721.tokensOfOwner(this.alice.address)).to.deep.equal(
        []
      )

      // Public Functions HRC721
      expect(await this.mini721.totalSupply()).to.equal(0)
      expect(await this.mini721.name()).to.equal('MiniWallet NFT')
      expect(await this.mini721.symbol()).to.equal('Mini721')
      // Public Functions HRC721 (Tokens)
      await expect(this.mini721.tokenByIndex(0)).to.be.revertedWith(
        'TokenIndexOutOfBounds()'
      )
      await expect(this.mini721.ownerOf(0)).to.be.revertedWith(
        'OwnerQueryForNonexistentToken()'
      )
      await expect(this.mini721.tokenURI(0)).to.be.revertedWith(
        'URIQueryForNonexistentToken()'
      )
      // expect(await this.mini721.getApproved(0)).to.equal("");
      // Public Functions HRC721 (Users)
      expect(await this.mini721.balanceOf(this.alice.address)).to.equal(0)
      expect(
        await this.mini721.isApprovedForAll(this.alice.address, this.bob.address)
      ).to.equal(false)
      // Public Functions HRC721 (User and Tokens)
      await expect(this.mini721.tokenOfOwnerByIndex(this.alice.address, 0)
      ).to.be.revertedWith('OwnerIndexOutOfBounds()')

      // Public Functions RoyaltiesV2
      expect(await this.mini721.getRaribleV2Royalties(0)).to.deep.equal([])
    })
  })

  // Air Drop of 1000 Tokens using communityMint721
  describe('Mini721AirDropToOG', function (this) {
    it('Minting 1000 Tokens for OG', async function () {
      // Set the random start Index
      await this.mini721.setTemporaryTokenUri(
        'ipfs://TemporaryTokenUriPlaceHolder/'
      )
      await this.mini721.setStartIndex()

      // Mint 1000 tokens for airdrop to OG
      let releaseCount
      releaseCount = 100
      await communityMint721(this, this.alice.address, releaseCount)
      releaseCount = 200
      await communityMint721(this, this.bob.address, releaseCount)
      releaseCount = 1895
      await communityMint721(this, this.carol.address, releaseCount)
      releaseCount = 5
      await communityMint721(this, this.dev.address, releaseCount)
      await this.mini721.setOffsetValue(2200)

      // Public Variables
      expect(await this.mini721.maxMiniTokens()).to.equal(10000)
      expect(await this.mini721.mintPrice()).to.equal(
        ethers.utils.parseEther('0.1')
      ) // 0.1 ETH
      expect(await this.mini721.maxPerMint()).to.equal(10)
      expect(await this.mini721.provenanceHash()).to.equal('')
      expect(await this.mini721.startIndex()).to.not.equal(0)
      console.log(`startIndex: ${await this.mini721.startIndex()}`)
      expect(await this.mini721.offsetValue()).to.equal(2200)
      expect(await this.mini721.metadataFrozen()).to.equal(false)
      expect(await this.mini721.provenanceFrozen()).to.equal(false)
      expect(await this.mini721.saleIsActive()).to.equal(false)
      expect(await this.mini721.saleStarted()).to.equal(false)
      expect(await this.mini721.temporaryTokenUri()).to.equal(
        'ipfs://TemporaryTokenUriPlaceHolder/'
      )

      // Public Functions Mini721
      expect(await this.mini721.tokenURI(2198)).to.equal(
        'ipfs://TemporaryTokenUriPlaceHolder/'
      )

      // TODO review supportsInterface logic
      expect(await this.mini721.supportsInterface(Constants.InterfaceId.ERC2981_NFT_ROYALTY_STANDARD)).to.equal(true)
      expect(await this.mini721.exists(2198)).to.equal(true)
      expect(await this.mini721.contractURI()).to.equal('')
      // Token should hold no eth initially
      // Alices is the owner and there should be nothing to withdraw
      await this.mini721.withdraw(ethers.utils.parseEther('0'), false)
      expect(await this.mini721.tokensOfOwner(this.dev.address)).to.deep.equal([
        BigNumber.from(2195),
        BigNumber.from(2196),
        BigNumber.from(2197),
        BigNumber.from(2198),
        BigNumber.from(2199)
      ])

      // Public Functions HRC721
      expect(await this.mini721.totalSupply()).to.equal(2200)
      expect(await this.mini721.name()).to.equal('MiniWallet NFT')
      expect(await this.mini721.symbol()).to.equal('Mini721')

      // Public Functions HRC721 (Tokens)
      expect(await this.mini721.tokenByIndex(2198)).to.equal(2198)
      expect(await this.mini721.ownerOf(2198)).to.equal(this.dev.address)
      expect(await this.mini721.tokenURI(2198)).to.equal(
        'ipfs://TemporaryTokenUriPlaceHolder/'
      )
      expect(await this.mini721.getApproved(2198)).to.equal(ADDRESS_ZERO)
      // Public Functions HRC721 (Users)
      expect(await this.mini721.balanceOf(this.dev.address)).to.equal(5)
      expect(
        await this.mini721.isApprovedForAll(this.alice.address, this.bob.address)
      ).to.equal(false)
      // Public Functions HRC721 (User and Tokens)
      expect(
        await this.mini721.tokenOfOwnerByIndex(this.dev.address, 3)
      ).to.equal(2198)

      // Public Functions RoyaltiesV2
      expect(await this.mini721.getRaribleV2Royalties(0)).to.deep.equal([])
    })
  })

  // User Mints (1,5,10) and negative use cases
  describe('Mini721UserMint', function (this) {
    it('Mini721 tokens should be minted by Users', async function () {
      // do airdrop first
      let releaseCount
      releaseCount = 100
      await communityMint721(this, this.alice.address, releaseCount)
      releaseCount = 200
      await communityMint721(this, this.bob.address, releaseCount)
      releaseCount = 1895
      await communityMint721(this, this.carol.address, releaseCount)
      releaseCount = 5
      await communityMint721(this, this.dev.address, releaseCount)
      await this.mini721.setOffsetValue(2200)
      // set state variables
      await this.mini721.toggleSaleState()
      // Set the random start Index
      await this.mini721.setTemporaryTokenUri(
        'ipfs://TemporaryTokenUriPlaceHolder/'
      )
      await this.mini721.setStartIndex()
      expect(await this.mini721.saleIsActive()).to.equal(true)
      expect(await this.mini721.totalSupply()).to.equal(2200)
      expect(await this.mini721.exists(0)).to.equal(true)
      // mint tokens
      releaseCount = 1
      await userMint721(this, this.alice, releaseCount)

      expect(await this.mini721.totalSupply()).to.equal(2201)
      releaseCount = 5
      await userMint721(this, this.bob, releaseCount)

      expect(await this.mini721.totalSupply()).to.equal(2206)
      releaseCount = 10
      await userMint721(this, this.carol, releaseCount)

      releaseCount = 1
      expect(await this.mini721.totalSupply()).to.equal(2216)
      expect(await this.mini721.maxMiniTokens()).to.equal(10000)
      await userMint721(this, this.alice, releaseCount)

      // turn sale off and check user can no longer mint
      await this.mini721.toggleSaleState()
      expect(await this.mini721.saleIsActive()).to.equal(false)
      await expect(
        this.mini721.connect(this.alice).mintMini(releaseCount, {
          value: ethers.utils.parseEther('0.1').mul(releaseCount)
        })
      ).to.be.revertedWith('Mini721: Sale is not active')

      // Public Variables
      expect(await this.mini721.maxMiniTokens()).to.equal(10000)
      expect(await this.mini721.mintPrice()).to.equal(
        ethers.utils.parseEther('0.1')
      ) // 0.1 ETH
      expect(await this.mini721.maxPerMint()).to.equal(10)
      expect(await this.mini721.provenanceHash()).to.equal('')
      expect(await this.mini721.startIndex()).to.not.equal(0)
      console.log(`startIndex: ${await this.mini721.startIndex()}`)
      expect(await this.mini721.offsetValue()).to.equal(2200)
      expect(await this.mini721.metadataFrozen()).to.equal(false)
      expect(await this.mini721.provenanceFrozen()).to.equal(false)
      expect(await this.mini721.saleIsActive()).to.equal(false)
      expect(await this.mini721.saleStarted()).to.equal(true)
      expect(await this.mini721.temporaryTokenUri()).to.equal(
        'ipfs://TemporaryTokenUriPlaceHolder/'
      )

      // Public Functions Mini721
      expect(await this.mini721.tokenURI(12)).to.equal(
        'ipfs://TemporaryTokenUriPlaceHolder/'
      )

      // TODO review supportsInterface logic
      expect(await this.mini721.supportsInterface(Constants.InterfaceId.ERC2981_NFT_ROYALTY_STANDARD)).to.equal(true)
      expect(await this.mini721.exists(12)).to.equal(true)
      expect(await this.mini721.contractURI()).to.equal('')
      // Token should hold 1.7 ETH from the 17 mints
      // Alice is the owner and there should be 1.7 ETH to withdraw
      await expect(
        this.mini721.withdraw(ethers.utils.parseEther('1.8'), false)
      ).to.be.revertedWith('')
      await this.mini721.withdraw(ethers.utils.parseEther('0.7'), false)
      await this.mini721.setRevenueAccount(this.bob.address)
      await this.mini721
        .connect(this.bob)
        .withdraw(ethers.utils.parseEther('1.0'), true)

      // Public Functions HRC721
      expect(await this.mini721.totalSupply()).to.equal(2217)
      expect(await this.mini721.name()).to.equal('MiniWallet NFT')
      expect(await this.mini721.symbol()).to.equal('Mini721')

      // Public Functions HRC721 (Tokens)
      expect(await this.mini721.tokenByIndex(2212)).to.equal(2212)
      expect(await this.mini721.ownerOf(2212)).to.equal(this.carol.address)
      expect(await this.mini721.tokenURI(2212)).to.equal(
        'ipfs://TemporaryTokenUriPlaceHolder/'
      )
      expect(await this.mini721.getApproved(12)).to.equal(ADDRESS_ZERO)
      // Public Functions HRC721 (Users)
      expect(await this.mini721.balanceOf(this.carol.address)).to.equal(1905)
      expect(
        await this.mini721.isApprovedForAll(
          this.alice.address,
          this.carol.address
        )
      ).to.equal(false)
      // Public Functions HRC721 (User and Tokens)
      expect(
        await this.mini721.tokenOfOwnerByIndex(this.carol.address, 3)
      ).to.equal(303)

      // Public Functions RoyaltiesV2
      expect(await this.mini721.getRaribleV2Royalties(0)).to.deep.equal([])
    })
  })

  // Minting Negative Use Cases
  describe('Mini721MintNegativeUseCases', function (this) {
    it('Mini721 minting negative use Cases', async function () {
      // do airdrop first
      let releaseCount
      releaseCount = 100
      await communityMint721(this, this.alice.address, releaseCount)
      releaseCount = 200
      await communityMint721(this, this.bob.address, releaseCount)
      releaseCount = 1895
      await communityMint721(this, this.carol.address, releaseCount)
      releaseCount = 5
      await communityMint721(this, this.dev.address, releaseCount)
      await this.mini721.setOffsetValue(2200)
      await this.mini721.toggleSaleState()
      // Test minting negative use cases
      const mintPrice = await this.mini721.mintPrice()
      const lowMintPrice = mintPrice.div(2)
      const maxPerMint = await this.mini721.maxPerMint()
      const highPerMint = maxPerMint.add(1)
      const maxMiniTokens = await this.mini721.maxMiniTokens()
      const highMiniTokens = maxMiniTokens.add(1)
      // Test minting too many Mini tokens
      await expect(
        this.mini721.mintMini(highMiniTokens, {
          value: mintPrice.mul(highMiniTokens)
        })
      ).to.be.revertedWith('Mini721: Purchase would exceed cap')
      // Test minting too many in a mint
      await expect(
        this.mini721.mintMini(highPerMint, {
          value: mintPrice.mul(highPerMint)
        })
      ).to.be.revertedWith('Mini721: Amount exceeds max per mint')
      // Test mint with insufficient amount
      await expect(
        this.mini721.mintMini(1, {
          value: lowMintPrice
        })
      ).to.be.revertedWith('Mini721: Ether value sent is not correct')
      // Test Mint with excess amount gets refunded
      // mint 3 tokens parsing 1 eth
      await this.mini721.connect(this.bob).mintMini(3, {
        value: ethers.utils.parseEther('1')
      })
      // bobs balance should be less 0.3 eth + gas

      // Test Mini Community minting negative use cases
      releaseCount = 1
      // Test minting to many Mini tokens
      await expect(
        this.mini721.mintForCommunity(this.alice.address, highMiniTokens)
      ).to.be.revertedWith('Mini721: Minting would exceed cap')
      // Test minting to zero address
      await expect(
        this.mini721.mintForCommunity(ADDRESS_ZERO, releaseCount)
      ).to.be.revertedWith('Mini721: Cannot mint to zero address.')
    })
  })

  // NFT Sale Closed
  describe('Mini721CloseCollection', function (this) {
    it('Mini721 Close Collection', async function () {
      // set state variables

      // Collection closed is set at time of last token minted (i.e. 10,000th)
      // Currently using Provenance Hash from Bored Apes https://ipfs.io/ipfs/Qme57kZ2VuVzcj5sC3tVHFgyyEgBTmAnyTK45YVNxKf6hi
      // https://boredapeyachtclub.com/#/provenance
      // https://medium.com/coinmonks/the-elegance-of-the-nft-provenance-hash-solution-823b39f99473

      // Mint 2200 tokens for airdrop to OG
      let releaseCount
      releaseCount = 100
      await communityMint721(this, this.alice.address, releaseCount)
      releaseCount = 200
      await communityMint721(this, this.bob.address, releaseCount)
      releaseCount = 1895
      await communityMint721(this, this.carol.address, releaseCount)
      releaseCount = 5
      await communityMint721(this, this.dev.address, releaseCount)
      await this.mini721.setOffsetValue(2200)

      // Do User Minting
      await this.mini721.toggleSaleState()
      releaseCount = 1
      await userMint721(this, this.alice, releaseCount)
      releaseCount = 5
      await userMint721(this, this.bob, releaseCount)
      releaseCount = 10
      await userMint721(this, this.carol, releaseCount)
      releaseCount = 1
      await userMint721(this, this.alice, releaseCount)

      // turn sale off and check user can no longer mint
      await this.mini721.toggleSaleState()

      // setProvenenceHash()
      await this.mini721.setProvenanceHash(
        'cc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf'
      )

      // setBaseUri (Metadata)
      const baseUri = 'ipfs://Qmf8WkAVZtkBwngG4mTrPk23vDd6z8dZW2UshV9ywWGyB9/'
      await this.mini721.setBaseUri(baseUri)

      // setContractUri
      await this.mini721.setContractUri(
        'ipfs://Qmf8WkAVZtkBwngG4mTrPk23vDd6z8dZW2UshV9ywWGyB9/contract.json'
      )

      // Set Contract URI
      expect(await this.mini721.provenanceHash()).to.equal(
        'cc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf'
      )

      // Removce the TemporaryTokenUri
      await this.mini721.setTemporaryTokenUri('')

      // Set the random start Index
      await this.mini721.setStartIndex()

      // freezeProvenance()
      await this.mini721.freezeProvenance()
      await expect(this.mini721.setProvenanceHash('badHash')).to.be.revertedWith(
        'Mini721: Provenance is frozen'
      )
      expect(await this.mini721.provenanceHash()).to.equal(
        'cc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf'
      )

      // freezeMetaData()
      await this.mini721.freezeMetadata()
      await expect(this.mini721.setBaseUri('badURI')).to.be.revertedWith(
        'Mini721: Metadata is frozen'
      )

      // Public Variables
      expect(await this.mini721.maxMiniTokens()).to.equal(10000)
      expect(await this.mini721.mintPrice()).to.equal(
        ethers.utils.parseEther('0.1')
      ) // 0.1 ETH
      expect(await this.mini721.maxPerMint()).to.equal(10)
      expect(await this.mini721.provenanceHash()).to.equal(
        'cc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf'
      )
      expect(await this.mini721.startIndex()).to.not.equal(0)
      console.log(`startIndex: ${await this.mini721.startIndex()}`)
      expect(await this.mini721.offsetValue()).to.equal(2200)
      expect(await this.mini721.metadataFrozen()).to.equal(true)
      expect(await this.mini721.provenanceFrozen()).to.equal(true)
      expect(await this.mini721.saleIsActive()).to.equal(false)
      expect(await this.mini721.saleStarted()).to.equal(true)
      expect(await this.mini721.temporaryTokenUri()).to.equal('')

      // Public Functions Mini721
      const offsetValue = parseInt(await this.mini721.offsetValue())
      const startIndex = parseInt(await this.mini721.startIndex())
      const maxMiniTokens = parseInt(await this.mini721.maxMiniTokens())
      let tokenId = 12
      let tokenUriSuffix = tokenId
      if (tokenId > offsetValue) {
        tokenUriSuffix =
          ((tokenId + startIndex - offsetValue) % (maxMiniTokens - offsetValue)) +
          offsetValue
      }
      let tokenUri = baseUri + tokenUriSuffix
      expect(await this.mini721.tokenURI(12)).to.equal(tokenUri)
      console.log(`tokenURI[12]: ${tokenUri}`)

      // TODO review supportsInterface logic
      expect(await this.mini721.supportsInterface(Constants.InterfaceId.ERC2981_NFT_ROYALTY_STANDARD)).to.equal(true)
      expect(await this.mini721.exists(12)).to.equal(true)
      expect(await this.mini721.contractURI()).to.equal(
        'ipfs://Qmf8WkAVZtkBwngG4mTrPk23vDd6z8dZW2UshV9ywWGyB9/contract.json'
      )
      // Token should hold 1.7 ETH from the 17 mints
      expect(await ethers.provider.getBalance(this.mini721.address)).to.equal(
        ethers.utils.parseEther('1.7')
      )
      // Alice is the owner and there should be 1.7 ETH to withdraw
      // expect(await ethers.provider.getBalance(this.alice.address)).to.equal(
      //   ethers.utils.parseEther("9999.784320346204536024")
      // );
      await expect(
        this.mini721.withdraw(ethers.utils.parseEther('1.8'), false)
      ).to.be.revertedWith('')
      await this.mini721.withdraw(ethers.utils.parseEther('1.7'), false)
      // expect(await ethers.provider.getBalance(this.alice.address)).to.equal(
      //   ethers.utils.parseEther("10001.484254922290212431")
      // );
      expect(await this.mini721.tokensOfOwner(this.dev.address)).to.deep.equal([
        BigNumber.from(2195),
        BigNumber.from(2196),
        BigNumber.from(2197),
        BigNumber.from(2198),
        BigNumber.from(2199)
      ])

      // Public Functions HRC721
      expect(await this.mini721.totalSupply()).to.equal(2217)
      expect(await this.mini721.name()).to.equal('MiniWallet NFT')
      expect(await this.mini721.symbol()).to.equal('Mini721')

      // Public Functions HRC721 (Tokens)
      tokenId = 2212
      tokenUriSuffix = tokenId
      if (tokenId > offsetValue) {
        tokenUriSuffix =
          ((tokenId + startIndex - offsetValue) %
            (maxMiniTokens - offsetValue)) +
          offsetValue
      }
      tokenUri = baseUri + tokenUriSuffix
      expect(await this.mini721.tokenByIndex(tokenId)).to.equal(tokenId)
      expect(await this.mini721.ownerOf(tokenId)).to.equal(this.carol.address)
      expect(await this.mini721.tokenURI(tokenId)).to.equal(tokenUri)
      console.log(`tokenURI[2212]: ${tokenUri}`)
      expect(await this.mini721.getApproved(tokenId)).to.equal(ADDRESS_ZERO)
      // Public Functions HRC721 (Users)
      expect(await this.mini721.balanceOf(this.carol.address)).to.equal(1905)
      expect(
        await this.mini721.isApprovedForAll(
          this.alice.address,
          this.carol.address
        )
      ).to.equal(false)
      // Public Functions HRC721 (User and Tokens)
      expect(
        await this.mini721.tokenOfOwnerByIndex(this.carol.address, 3)
      ).to.equal(303)

      // Public Functions RoyaltiesV2
      expect(await this.mini721.getRaribleV2Royalties(0)).to.deep.equal([])
    })
  })

  // NFT (Transfer Ownership and Approval Testing
  describe('Mini721TransferOwnership', function (this) {
    it('Mini721 Transfer Ownership', async function () {
      // Mint 2200 tokens for airdrop to OG
      let releaseCount
      releaseCount = 100
      await communityMint721(this, this.alice.address, releaseCount)
      releaseCount = 200
      await communityMint721(this, this.bob.address, releaseCount)
      releaseCount = 1895
      await communityMint721(this, this.carol.address, releaseCount)
      releaseCount = 5
      await communityMint721(this, this.dev.address, releaseCount)
      await this.mini721.setOffsetValue(2200)
      // Do User Minting
      await this.mini721.toggleSaleState()
      releaseCount = 1
      await userMint721(this, this.alice, releaseCount)
      releaseCount = 5
      await userMint721(this, this.bob, releaseCount)
      releaseCount = 10
      await userMint721(this, this.carol, releaseCount)
      releaseCount = 1
      await userMint721(this, this.alice, releaseCount)
      // Airdrop
      releaseCount = 20
      await communityMint721(this, this.bob.address, releaseCount)
      // setProvenenceHash()
      await this.mini721.setProvenanceHash(
        'cc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf'
      )
      // setBaseUri (Metadata)
      await this.mini721.setBaseUri(
        'ipfs://Qmf8WkAVZtkBwngG4mTrPk23vDd6z8dZW2UshV9ywWGyB9/'
      )
      // Transfer from Carol to Bob and back
      expect(await this.mini721.ownerOf(2209)).to.equal(this.carol.address)
      expect(await this.mini721.getApproved(2209)).to.equal(ADDRESS_ZERO)
      await this.mini721
        .connect(this.carol)
        .transferFrom(this.carol.address, this.bob.address, 2209)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.bob.address)
      await this.mini721
        .connect(this.bob)
        .transferFrom(this.bob.address, this.carol.address, 2209)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.carol.address)

      // Carol gives approval to Bob and he transfers the token
      await this.mini721.connect(this.carol).approve(this.bob.address, 2209)
      expect(await this.mini721.getApproved(2209)).to.equal(this.bob.address)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.carol.address)
      await this.mini721
        .connect(this.bob)
        .transferFrom(this.carol.address, this.bob.address, 2209)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.bob.address)
      expect(await this.mini721.getApproved(2209)).to.equal(ADDRESS_ZERO)
      await this.mini721.connect(this.bob).approve(this.carol.address, 2209)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.bob.address)
      expect(await this.mini721.getApproved(2209)).to.equal(this.carol.address)
      await this.mini721
        .connect(this.carol)
        .transferFrom(this.bob.address, this.carol.address, 2209)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.carol.address)
      expect(await this.mini721.getApproved(2209)).to.equal(ADDRESS_ZERO)

      // Carol gives approval to Bob for all tokens and he does the transfer
      await this.mini721
        .connect(this.carol)
        .setApprovalForAll(this.bob.address, true)
      expect(await this.mini721.getApproved(2209)).to.equal(ADDRESS_ZERO)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.carol.address)
      expect(
        await this.mini721.isApprovedForAll(this.carol.address, this.bob.address)
      ).to.equal(true)
      await this.mini721
        .connect(this.bob)
        .transferFrom(this.carol.address, this.bob.address, 2209)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.bob.address)
      expect(await this.mini721.getApproved(2209)).to.equal(ADDRESS_ZERO)
      expect(
        await this.mini721.isApprovedForAll(this.carol.address, this.bob.address)
      ).to.equal(true)
      await this.mini721
        .connect(this.bob)
        .setApprovalForAll(this.carol.address, true)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.bob.address)
      expect(await this.mini721.getApproved(2209)).to.equal(ADDRESS_ZERO)
      expect(
        await this.mini721.isApprovedForAll(this.bob.address, this.carol.address)
      ).to.equal(true)
      await this.mini721
        .connect(this.carol)
        .transferFrom(this.bob.address, this.carol.address, 2209)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.carol.address)
      expect(await this.mini721.getApproved(2209)).to.equal(ADDRESS_ZERO)
      expect(
        await this.mini721.isApprovedForAll(this.bob.address, this.carol.address)
      ).to.equal(true)
    })
  })

  // NFT Updating of Metadata Testing
  describe('Mini721UpdateMetadataOfIndividualTokens', function (this) {
    it('Mini721 Update Metadata Of Individual Tokens', async function () {
      // setOffsetValue(13)
      // Mint 2200 tokens for airdrop to OG
      let releaseCount
      releaseCount = 100
      await communityMint721(this, this.alice.address, releaseCount)
      releaseCount = 200
      await communityMint721(this, this.bob.address, releaseCount)
      releaseCount = 1895
      await communityMint721(this, this.carol.address, releaseCount)
      releaseCount = 5
      await communityMint721(this, this.dev.address, releaseCount)
      await this.mini721.setOffsetValue(2200)
      // do user and community mint testing
      await this.mini721.setOffsetValue(2200)
      await this.mini721.toggleSaleState()
      releaseCount = 1
      await userMint721(this, this.alice, releaseCount)
      releaseCount = 5
      await userMint721(this, this.bob, releaseCount)

      // Set the random start Index
      await this.mini721.setStartIndex()
      expect(await this.mini721.startIndex()).to.not.equal(0)
      console.log(`startIndex: ${await this.mini721.startIndex()}`)
      // setBaseUri (Metadata)
      const baseUri = 'ipfs://Qmf8WkAVZtkBwngG4mTrPk23vDd6z8dZW2UshV9ywWGyB9/'
      await this.mini721.setBaseUri(baseUri)

      // Check the token
      const offsetValue = parseInt(await this.mini721.offsetValue())
      const startIndex = parseInt(await this.mini721.startIndex())
      const maxMiniTokens = parseInt(await this.mini721.maxMiniTokens())
      const tokenId = 3
      let tokenUriSuffix = tokenId
      if (tokenId > offsetValue) {
        tokenUriSuffix =
          ((tokenId + startIndex - offsetValue) %
            (maxMiniTokens - offsetValue)) +
          offsetValue
      }
      const tokenUri = baseUri + tokenUriSuffix
      expect(await this.mini721.tokenURI(tokenId)).to.equal(tokenUri)

      // Update the tokens metadata
      expect(await this.mini721.metadataFrozen()).to.equal(false)
      const updatedBaseUri = 'ipfs://bestupdateduri/'
      const updatedTokenUri = updatedBaseUri + tokenUriSuffix
      await this.mini721.setUri(3, updatedTokenUri)
      expect(await this.mini721.tokenURI(tokenId)).to.equal(updatedTokenUri)
      // Freeze metadata and then Updating the tokens metadata should fail
      await this.mini721.freezeMetadata()
      expect(await this.mini721.metadataFrozen()).to.equal(true)
      await expect(
        this.mini721.setUri(tokenId, updatedTokenUri)
      ).to.be.revertedWith('')
    })
  })

  // NFT Burning Testing
  describe('Mini721Burn', function (this) {
    it('Mini721 Test Burning of Tokens', async function () {
      // Mint 2200 tokens for airdrop to OG
      let releaseCount
      releaseCount = 100
      await communityMint721(this, this.alice.address, releaseCount)
      releaseCount = 200
      await communityMint721(this, this.bob.address, releaseCount)
      releaseCount = 1895
      await communityMint721(this, this.carol.address, releaseCount)
      releaseCount = 5
      await communityMint721(this, this.dev.address, releaseCount)
      await this.mini721.setOffsetValue(2200)
      // Do User Minting
      await this.mini721.toggleSaleState()
      releaseCount = 1
      await userMint721(this, this.alice, releaseCount)
      releaseCount = 5
      await userMint721(this, this.bob, releaseCount)
      releaseCount = 10
      await userMint721(this, this.carol, releaseCount)
      releaseCount = 1
      await userMint721(this, this.alice, releaseCount)
      // Airdrop
      releaseCount = 20
      await communityMint721(this, this.bob.address, releaseCount)
      // setProvenenceHash()
      await this.mini721.setProvenanceHash(
        'cc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf'
      )
      // setBaseUri (Metadata)
      await this.mini721.setBaseUri(
        'ipfs://Qmf8WkAVZtkBwngG4mTrPk23vDd6z8dZW2UshV9ywWGyB9/'
      )

      // Check current State
      expect(await this.mini721.totalSupply()).to.equal(2237)
      expect(await this.mini721.ownerOf(2209)).to.equal(this.carol.address)
      expect(await this.mini721.balanceOf(this.carol.address)).to.equal(1905)
      expect(
        await this.mini721.tokenOfOwnerByIndex(this.carol.address, 3)
      ).to.equal(303)
      // Burn a token
      await this.mini721.burn(9)
      // Check current State
      expect(await this.mini721.totalSupply()).to.equal(2236)
      expect(await this.mini721.balanceOf(this.carol.address)).to.equal(1905)
      expect(
        await this.mini721.tokenOfOwnerByIndex(this.carol.address, 3)
      ).to.equal(303)

      // Burn some tokens
      await this.mini721.batchBurn([7, 12, 14])
      // Check current State
      expect(await this.mini721.totalSupply()).to.equal(2233)
      // await expect(this.mini721.ownerOf(2212)).to.be.revertedWith(
      //   "OwnerQueryForNonexistentToken()"
      // );
      expect(await this.mini721.balanceOf(this.carol.address)).to.equal(1905)
      expect(
        await this.mini721.tokenOfOwnerByIndex(this.carol.address, 3)
      ).to.equal(303)
    })
  })

  // NFT (Transfer Ownership)
  describe('Mini721NFTTransferOwnership', function (this) {
    it('Mini721 tokens should be transferred by users', async function () {
      // Mint 2200 tokens for airdrop to OG
      let releaseCount
      releaseCount = 100
      await communityMint721(this, this.alice.address, releaseCount)
      releaseCount = 200
      await communityMint721(this, this.bob.address, releaseCount)
      releaseCount = 1895
      await communityMint721(this, this.carol.address, releaseCount)
      releaseCount = 5
      await communityMint721(this, this.dev.address, releaseCount)
      await this.mini721.setOffsetValue(2200)
      await this.mini721.toggleSaleState()
      releaseCount = 10
      await userMint721(this, this.bob, releaseCount)
      expect(await this.mini721.ownerOf(2201)).to.equal(this.bob.address)
      await this.mini721
        .connect(this.bob)
        ['safeTransferFrom(address,address,uint256)'](
          this.bob.address,
          this.carol.address,
          2201
        )
      expect(await this.mini721.ownerOf(2201)).to.equal(this.carol.address)
      await this.mini721
        .connect(this.carol)
        .transferFrom(this.carol.address, this.alice.address, 2201)
      expect(await this.mini721.ownerOf(1)).to.equal(this.alice.address)
    })
  })
})
