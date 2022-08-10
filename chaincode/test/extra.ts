import { expect } from 'chai'
import { ethers, waffle } from 'hardhat'
import {
  prepare,
  deployUpgradeable,
  checkBalance,
  getTxCost
} from './utilities'
const config = require('../config.ts')

const ZERO_ETH = ethers.utils.parseEther('0')
const ONE_ETH = ethers.utils.parseEther('1')
const INITIAL_BALANCE_ETH = ethers.utils.parseEther('10000')

describe('AssetManager', function () {
  before(async function () {
    await prepare(this, [
      'AssetManager',
      'TestERC20',
      'TestERC721',
      'TestERC1155'
    ])
  })

  beforeEach(async function () {
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

  afterEach(async function () {
    await waffle.provider.send('evm_revert', [this.snapshotId])
  })

  describe('extra: Additional AssetManager tests', function () {
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
      await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      assetManagerBalance = assetManagerBalance.add(ONE_ETH)
      tx = await this.assetManager
        .connect(this.alice)
        .approve(this.bob.address, ONE_ETH)
      await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      aliceBalance = aliceBalance.sub(gasUsed)
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
      // Check Alice's Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ZERO_ETH)
    })

    // it('checkEventLogs', async function () {
    //   const tx = await this.assetManager.connect(this.alice).deposit({
    //     value: ONE_ETH
    //   })
    //   const receipt = await tx.wait()
    //
    //   for (const event of receipt.events) {
    //     console.log(`Event ${event.event} with args ${event.args}`)
    //   }
    // })
    // it('checkReverts', async function () {})
  })
})
