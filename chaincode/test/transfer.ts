import { expect } from 'chai'
import { ethers, waffle } from 'hardhat'
import {
  prepare,
  deploy,
  deployUpgradeable,
  getBigNumber
} from './utilities'
import { range } from 'lodash'
const config = require('../config.ts')
const { BigNumber } = require('ethers')
const Constants = require('./utilities/constants')

const DUMMY_HEX = '0x'

// let snapshotId: string;

describe('AssetManager', function (this) {
  before(async function (this) {
    await prepare(this, [
      'AssetManager',
      'TestERC20',
      'TestERC721',
      'TestERC1155'
    ])
  })

  beforeEach(async function (this) {
    this.snapshotId = await waffle.provider.send('evm_snapshot', [])
    await deployUpgradeable(this, [
      [
        'assetManager',
        this.AssetManager,
        [
          config.test.initialOperatorThreshold,
          config.test.initialOperators,
          config.test.initialUserLimit,
          config.test.initialAuthLimit
        ]
      ]
    ])
  })

  afterEach(async function (this) {
    await waffle.provider.send('evm_revert', [this.snapshotId])
  })

  describe('transfer: check transfer functionality ', function () {
    it('AM-transfer-0: positive test of ERC20 transfer', async function () {
      await deploy(this, [['erc20', this.TestERC20, [getBigNumber('10000000')]]])

      // transfer 100 M20 to alice
      let tx = await this.erc20.transfer(this.alice.address, BigNumber.from('100'))
      expect(await this.erc20.balanceOf(this.alice.address)).to.equal(100)
      // alice approves 70 to Asset Manager
      tx = await this.erc20.connect(this.alice).increaseAllowance(this.assetManager.address, BigNumber.from('70'))
      await tx.wait()
      expect(await this.erc20.allowance(this.alice.address, this.assetManager.address)).to.equal(70)
      tx = await this.erc20.connect(this.alice).transfer(this.bob.address, BigNumber.from('3'))
      await tx.wait()
      expect(await this.erc20.balanceOf(this.alice.address)).to.equal(97)
      expect(await this.erc20.allowance(this.alice.address, this.assetManager.address)).to.equal(70)
      // Operator Trasnfers 3 of token 0 to Bob
      tx = await this.assetManager.connect(this.operatorA)
        .transfer(
          BigNumber.from('3'),
          Constants.TokenType.ERC20,
          0,
          this.erc20.address,
          this.alice.address,
          this.bob.address
        )
      await tx.wait()
      // check alice's and bob's balances
      expect(await this.erc20.balanceOf(this.alice.address)).to.equal(94)
      expect(await this.erc20.allowance(this.alice.address, this.assetManager.address)).to.equal(67)
    })

    it('AM-transfer-1: positive test of ERC721 transfer', async function () {
      // Deploy 721
      await deploy(this, [['erc721', this.TestERC721, [range(10), range(10).map((e: any) => `ipfs://test721/${e}`)]]])
      // Transfer some Tokens for Alice
      let tx = await this.erc721.transferFrom(this.deployer.address, this.alice.address, 0)
      await tx.wait()
      tx = await this.erc721.transferFrom(this.deployer.address, this.alice.address, 1)
      await tx.wait()
      tx = await this.erc721.transferFrom(this.deployer.address, this.alice.address, 2)
      await tx.wait()
      expect(await this.erc721.balanceOf(this.alice.address)).to.equal(3)
      // Alice Approves the AssetManager for the Token
      tx = await this.erc721.connect(this.alice).approve(this.assetManager.address, 0)
      await tx.wait()
      // Operator transfers the tokens for Alice to Bob
      tx = await this.assetManager.connect(this.operatorA)
        .transfer(
          BigNumber.from('1'),
          Constants.TokenType.ERC721,
          0,
          this.erc721.address,
          this.alice.address,
          this.bob.address
        )
      await tx.wait()
      expect(await this.erc721.balanceOf(this.alice.address)).to.equal(2)
      expect(await this.erc721.balanceOf(this.bob.address)).to.equal(1)
    })

    it('AM-transfer-2: positive test of ERC1155 transfer', async function () {
      // Deploy 1155
      await deploy(this, [['erc1155', this.TestERC1155, [
        range(10),
        range(10).map((e: any) => 10), // mint 10 for each
        range(10).map((e: any) => `ipfs://test1155/${e}`)
      ]]])
      // Transfer some Tokens for Alice
      let tx = await this.erc1155.safeTransferFrom(this.deployer.address, this.alice.address, 0, 7, DUMMY_HEX)
      await tx.wait()
      tx = await this.erc1155.safeTransferFrom(this.deployer.address, this.alice.address, 1, 7, DUMMY_HEX)
      await tx.wait()
      tx = await this.erc1155.safeTransferFrom(this.deployer.address, this.alice.address, 2, 7, DUMMY_HEX)
      await tx.wait()
      expect(await this.erc1155.balanceOf(this.alice.address, 0)).to.equal(7)
      // Alice Approves the AssetManager for the Token
      tx = await this.erc1155.connect(this.alice).setApprovalForAll(this.assetManager.address, true)
      await tx.wait()
      // Operator transfers the tokens for Alice to Bob
      tx = await this.assetManager.connect(this.operatorA).transfer(
        BigNumber.from('3'),
        Constants.TokenType.ERC1155,
        0,
        this.erc1155.address,
        this.alice.address,
        this.bob.address
      )
      await tx.wait()
      expect(await this.erc1155.balanceOf(this.alice.address, 0)).to.equal(4)
      expect(await this.erc1155.balanceOf(this.bob.address, 0)).to.equal(3)
    })
  })
})