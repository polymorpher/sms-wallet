import { expect } from 'chai'
import { ethers, waffle } from 'hardhat'
import {
  prepare,
  deploy,
  deployUpgradeable,
  checkBalance,
  getBigNumber,
  getTxCost
} from './utilities'
import { range } from 'lodash'
const config = require('../config.js')
const { BigNumber } = require('ethers')
const Constants = require('./utilities/constants')

const ZERO_ETH = ethers.utils.parseEther('0')
const ONE_ETH = ethers.utils.parseEther('1')
const INITIAL_BALANCE_ETH = ethers.utils.parseEther('10000')
const INITIAL_USER_LIMIT = ethers.utils.parseEther('1000')
const INITIAL_AUTH_LIMIT = ethers.utils.parseEther('100')
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
          config.initialOperatorThreshold,
          config.operators,
          INITIAL_USER_LIMIT,
          INITIAL_AUTH_LIMIT
        ]
      ]
    ])
  })

  afterEach(async function (this) {
    await waffle.provider.send('evm_revert', [this.snapshotId])
  })

  describe('checkDeposit', function () {
    it('Positive deposit test', async function () {
      // ===== DEPOSIT POSITIVE TEST =====
      // Alice Deposit one native token
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      const bobBalance = await this.bob.getBalance()
      let assetManagerBalance = await provider.getBalance(
        this.assetManager.address
      )
      const tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH
      })
      const gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      assetManagerBalance = assetManagerBalance.add(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.assetManager.address)
      ).to.equal(assetManagerBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.assetManager, 'DepositSuccessful')
        .withArgs(this.alice.address, ONE_ETH, ONE_ETH)
      await tx.wait()
      // Check Alice's Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ONE_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ZERO_ETH)
    })
    it('Negative deposit test amount greater global user limit', async function () {
      // ===== DEPOSIT NEGATIVE TEST =====
      // Alice Deposit amount greater than limit of native token
      // check Initial Balance
      await checkBalance(this.alice, '10000')
      const aliceBalance = await this.alice.getBalance()
      const depositAmount = INITIAL_USER_LIMIT.add(ONE_ETH)
      await expect(
        this.assetManager.connect(this.alice).deposit({
          value: depositAmount
        })
      ).to.be.reverted
      // Check that alice did not lose her funds when the transaction was reverted (note she did pay gas fees)
      const aliceNewBalance = await this.alice.getBalance()
      expect(aliceNewBalance).to.be.gt(aliceBalance.sub(depositAmount))
    })
    it('Negative deposit test amount two deposits greater global user limit', async function () {
      // ===== DEPOSIT NEGATIVE TEST =====
      // Alice Deposit limit of  native token (she has deposited 1 token above)
      let tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH
      })
      await tx.wait()
      await expect(
        (tx = this.assetManager.connect(this.alice).deposit({
          value: INITIAL_USER_LIMIT
        }))
      ).to.be.reverted
    })
  })

  describe('checkApproval', function () {
    it('Positive approval test', async function () {
      // ==== APPROVAL POSITIVE TEST ====
      // Alice approves one native token
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      const bobBalance = await this.bob.getBalance()
      const assetManagerBalance = await provider.getBalance(
        this.assetManager.address
      )

      const tx = await this.assetManager
        .connect(this.alice)
        .approve(this.bob.address, ONE_ETH)
      const gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(gasUsed)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.assetManager.address)
      ).to.equal(assetManagerBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.assetManager, 'Approval')
        .withArgs(this.alice.address, this.bob.address, ONE_ETH)
      await tx.wait()
      // Check Alice's Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ONE_ETH)
    })
  })

  describe('checkWithdrawal', function () {
    it('Positive withdrawal test', async function () {
      // ==== WITHDRAWAL POSITIVE TEST ====
      // Alice Withdraws all her native tokens
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      let assetManagerBalance = await provider.getBalance(
        this.assetManager.address
      )
      let tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH
      })
      await tx.wait()
      let gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      assetManagerBalance = assetManagerBalance.add(ONE_ETH)
      tx = await this.assetManager.connect(this.alice).withdraw(0)
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.add(ONE_ETH).sub(gasUsed)
      assetManagerBalance = assetManagerBalance.sub(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(
        await provider.getBalance(this.assetManager.address)
      ).to.equal(assetManagerBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.assetManager, 'WithdrawalSuccessful')
        .withArgs(this.alice.address, ONE_ETH, ZERO_ETH)
      // Log all receipts
      await tx.wait()
      // Check Alices Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
    })
  })

  describe('checkTransfer', function () {
    it('Positive transfer test', async function () {
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      let bobBalance = await this.bob.getBalance()
      let assetManagerBalance = await provider.getBalance(
        this.assetManager.address
      )
      // Alice Deposit one native token
      let tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH
      })
      let gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      assetManagerBalance = assetManagerBalance.add(ONE_ETH)
      // Alice approves one native token
      tx = await this.assetManager
        .connect(this.alice)
        .approve(this.bob.address, ONE_ETH)
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(gasUsed)

      // The operator sends to Bob
      tx = await this.assetManager
        .connect(this.operatorA)
        .send(ONE_ETH, this.alice.address, this.bob.address)
      await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      bobBalance = bobBalance.add(ONE_ETH)
      assetManagerBalance = assetManagerBalance.sub(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.assetManager.address)
      ).to.equal(assetManagerBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.assetManager, 'SendSuccessful')
        .withArgs(
          this.alice.address,
          this.bob.address,
          ONE_ETH,
          ZERO_ETH,
          ZERO_ETH
        )
      // Log all receipts
      await tx.wait()
      // Check Alices Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ONE_ETH)
    })
  })

  describe('checkAssetManager', function () {
    it('Positive walk-through, deposit, withdraw, approve, send', async function () {
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      let bobBalance = await this.bob.getBalance()
      let assetManagerBalance = await provider.getBalance(
        this.assetManager.address
      )
      expect(aliceBalance).to.equal(INITIAL_BALANCE_ETH)
      expect(bobBalance).to.equal(INITIAL_BALANCE_ETH)
      expect(assetManagerBalance).to.equal(ZERO_ETH)

      // ===== DEPOSIT POSITIVE TEST =====
      // Alice Deposit one native token
      let tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH
      })
      let gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      assetManagerBalance = assetManagerBalance.add(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.assetManager.address)
      ).to.equal(assetManagerBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.assetManager, 'DepositSuccessful')
        .withArgs(this.alice.address, ONE_ETH, ONE_ETH)
      // Log all receipts
      let receipt = await tx.wait()
      for (const event of receipt.events) {
        console.log(`Event ${event.event} with args ${event.args}`)
      }
      // Check Alice's Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ONE_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ZERO_ETH)

      // ==== APPROVAL POSITIVE TEST ====
      // Alice approves one native token
      tx = await this.assetManager
        .connect(this.alice)
        .approve(this.bob.address, ONE_ETH)
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(gasUsed)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.assetManager.address)
      ).to.equal(assetManagerBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.assetManager, 'Approval')
        .withArgs(this.alice.address, this.bob.address, ONE_ETH)
      // Log all receipts
      receipt = await tx.wait()
      for (const event of receipt.events) {
        console.log(`Event ${event.event} with args ${event.args}`)
      }
      // Check Alice's Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ONE_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ONE_ETH)

      // ==== WITHDRAWAL POSITIVE TEST ====
      // Alice Withdraws all her native tokens
      tx = await this.assetManager.connect(this.alice).withdraw(0)
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.add(ONE_ETH).sub(gasUsed)
      assetManagerBalance = assetManagerBalance.sub(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.assetManager.address)
      ).to.equal(assetManagerBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.assetManager, 'WithdrawalSuccessful')
        .withArgs(this.alice.address, ONE_ETH, ZERO_ETH)
      // Log all receipts
      receipt = await tx.wait()
      for (const event of receipt.events) {
        console.log(`Event ${event.event} with args ${event.args}`)
      }
      // Check Alice's Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ONE_ETH)

      // ==== DEPOSIT, approve AND SEND POSITIVE TEST ====
      // Alice deposits and approves one token which the operator sends to Bob
      tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH
      })
      receipt = await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      assetManagerBalance = assetManagerBalance.add(ONE_ETH)
      tx = await this.assetManager
        .connect(this.alice)
        .approve(this.bob.address, ONE_ETH)
      receipt = await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      aliceBalance = aliceBalance.sub(gasUsed)
      tx = await this.assetManager
        .connect(this.operatorA)
        .send(ONE_ETH, this.alice.address, this.bob.address)
      receipt = await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      bobBalance = bobBalance.add(ONE_ETH)
      assetManagerBalance = assetManagerBalance.sub(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.assetManager.address)
      ).to.equal(assetManagerBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.assetManager, 'SendSuccessful')
        .withArgs(
          this.alice.address,
          this.bob.address,
          ONE_ETH,
          ZERO_ETH,
          ZERO_ETH
        )
      // Log all receipts
      receipt = await tx.wait()
      for (const event of receipt.events) {
        console.log(`Event ${event.event} with args ${event.args}`)
      }
      // Check Alices Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ONE_ETH)
    })

    it('checkTransferERC20', async function () {
      await deploy(this, [
        ['erc20', this.TestERC20, [getBigNumber('10000000')]]
      ])

      // transfer 100 M20 to alice
      let tx = await this.erc20.transfer(
        this.alice.address,
        BigNumber.from('100')
      )
      await tx.wait()
      console.log(
        `AliceBalance: ${await this.erc20.balanceOf(this.alice.address)}`
      )
      // alice approves 70 to Asset Manager
      tx = await this.erc20
        .connect(this.alice)
        .increaseAllowance(this.assetManager.address, BigNumber.from('70'))
      await tx.wait()
      console.log(
        `AliceAssetManagerAllowance: ${await this.erc20.allowance(
          this.alice.address,
          this.assetManager.address
        )}`
      )
      tx = await this.erc20
        .connect(this.alice)
        .transfer(this.bob.address, BigNumber.from('3'))
      await tx.wait()
      console.log(
        `AliceBalance: ${await this.erc20.balanceOf(this.alice.address)}`
      )
      console.log(
        `AliceAssetManagerAllowance: ${await this.erc20.allowance(
          this.alice.address,
          this.assetManager.address
        )}`
      )
      // Operator Sends 3 of token 0 to Bob
      tx = await this.assetManager
        .connect(this.operatorA)
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
      console.log(
        `AliceBalance: ${await this.erc20.balanceOf(this.alice.address)}`
      )
      console.log(
        `AliceAssetManagerAllowance: ${await this.erc20.allowance(
          this.alice.address,
          this.assetManager.address
        )}`
      )
    })

    it('checkTransferERC721', async function () {
      // Deploy 721
      await deploy(this, [
        [
          'erc721',
          this.TestERC721,
          [range(10), range(10).map((e: any) => `ipfs://test721/${e}`)]
        ]
      ])
      console.log(`erc721.address: ${this.erc721.address}`)
      // Transfer some Tokens for Alice
      let tx = await this.erc721.transferFrom(
        this.deployer.address,
        this.alice.address,
        0
      )
      await tx.wait()
      tx = await this.erc721.transferFrom(
        this.deployer.address,
        this.alice.address,
        1
      )
      await tx.wait()
      tx = await this.erc721.transferFrom(
        this.deployer.address,
        this.alice.address,
        2
      )
      await tx.wait()
      console.log(
        `AliceBalance: ${await this.erc721.balanceOf(this.alice.address)}`
      )
      // Alice Approves the AssetManager for the Token
      tx = await this.erc721
        .connect(this.alice)
        .approve(this.assetManager.address, 0)
      await tx.wait()
      // Operator sends the tokens for Alice to Bob
      tx = await this.assetManager
        .connect(this.operatorA)
        .transfer(
          BigNumber.from('1'),
          Constants.TokenType.ERC721,
          0,
          this.erc721.address,
          this.alice.address,
          this.bob.address
        )
      await tx.wait()
      console.log(
        `AliceBalance: ${await this.erc721.balanceOf(this.alice.address)}`
      )
      console.log(
        `BobBalance: ${await this.erc721.balanceOf(this.bob.address)}`
      )
    })
    it('checkTransferERC1155', async function () {
      // Deploy 1155
      await deploy(this, [
        [
          'erc1155',
          this.TestERC1155,
          [
            range(10),
            range(10).map((e: any) => 10), // mint 10 for each
            range(10).map((e: any) => `ipfs://test1155/${e}`)
          ]
        ]
      ])
      console.log(`erc1155.address: ${this.erc1155.address}`)
      // Transfer some Tokens for Alice
      let tx = await this.erc1155.safeTransferFrom(
        this.deployer.address,
        this.alice.address,
        0,
        7,
        DUMMY_HEX
      )
      await tx.wait()
      tx = await this.erc1155.safeTransferFrom(
        this.deployer.address,
        this.alice.address,
        1,
        7,
        DUMMY_HEX
      )
      await tx.wait()
      tx = await this.erc1155.safeTransferFrom(
        this.deployer.address,
        this.alice.address,
        2,
        7,
        DUMMY_HEX
      )
      await tx.wait()
      console.log(
        `AliceBalance: ${await this.erc1155.balanceOf(this.alice.address, 0)}`
      )
      // Alice Approves the AssetManager for the Token
      tx = await this.erc1155
        .connect(this.alice)
        .setApprovalForAll(this.assetManager.address, true)
      await tx.wait()
      // Operator sends the tokens for Alice to Bob
      tx = await this.assetManager
        .connect(this.operatorA)
        .transfer(
          BigNumber.from('3'),
          Constants.TokenType.ERC1155,
          0,
          this.erc1155.address,
          this.alice.address,
          this.bob.address
        )
      await tx.wait()
      console.log(
        `AliceBalance: ${await this.erc1155.balanceOf(this.alice.address, 0)}`
      )
      console.log(
        `BobBalance: ${await this.erc1155.balanceOf(this.bob.address, 0)}`
      )
    })
    it('checkEventLogs', async function () {
      const tx = await this.assetManager.connect(this.alice).deposit({
        value: ONE_ETH
      })
      const receipt = await tx.wait()

      for (const event of receipt.events) {
        console.log(`Event ${event.event} with args ${event.args}`)
      }
    })
    it('checkReverts', async function () {})
  })
})
