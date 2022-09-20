import { expect } from 'chai'
import { ethers, waffle } from 'hardhat'
import {
  prepare,
  deployUpgradeable,
  checkBalance,
  getTxCost
} from './utilities'
import config from '../config.test'

const ZERO_ETH = ethers.utils.parseEther('0')
const ONE_ETH = ethers.utils.parseEther('1')
const INITIAL_BALANCE_ETH = ethers.utils.parseEther('10000')

describe('MiniWallet', function () {
  before(async function () {
    await prepare(this, [
      'MiniProxy',
      'MiniWallet'
    ])
  })

  beforeEach(async function () {
    this.snapshotId = await waffle.provider.send('evm_snapshot', [])
    await deployUpgradeable(this, [
      [
        'miniWallet',
        this.MiniWallet,
        [
          config.test.miniWallet.initialOperatorThreshold,
          config.test.miniWallet.initialOperators,
          config.test.miniWallet.initialUserLimit,
          config.test.miniWallet.initialAuthLimit
        ]
      ]
    ])
  })

  afterEach(async function () {
    await waffle.provider.send('evm_revert', [this.snapshotId])
  })

  describe('extra: Additional MiniWallet tests', function () {
    it('Positive walk-through, deposit, withdraw, approve, send', async function () {
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      let bobBalance = await this.bob.getBalance()
      let miniWalletBalance = await provider.getBalance(
        this.miniWallet.address
      )
      expect(aliceBalance).to.equal(INITIAL_BALANCE_ETH)
      expect(bobBalance).to.equal(INITIAL_BALANCE_ETH)
      expect(miniWalletBalance).to.equal(ZERO_ETH)

      // ===== DEPOSIT POSITIVE TEST =====
      // Alice Deposit one native token
      let tx = await this.miniWallet.connect(this.alice).deposit({
        value: ONE_ETH
      })
      let gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      miniWalletBalance = miniWalletBalance.add(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.miniWallet.address)
      ).to.equal(miniWalletBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.miniWallet, 'DepositSuccessful')
        .withArgs(this.alice.address, ONE_ETH, ONE_ETH)
      // Check Alice's Balance and Auth on MiniWallet
      await expect(
        await this.miniWallet.userBalances(this.alice.address)
      ).to.equal(ONE_ETH)
      expect(
        await this.miniWallet.allowance(this.alice.address, this.bob.address)
      ).to.equal(ZERO_ETH)

      // ==== APPROVAL POSITIVE TEST ====
      // Alice approves one native token
      tx = await this.miniWallet
        .connect(this.alice)
        .approve(this.bob.address, ONE_ETH)
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(gasUsed)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.miniWallet.address)
      ).to.equal(miniWalletBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.miniWallet, 'Approval')
        .withArgs(this.alice.address, this.bob.address, ONE_ETH)
      // Log all receipts
      // Check Alice's Balance and Auth on MiniWallet
      await expect(
        await this.miniWallet.userBalances(this.alice.address)
      ).to.equal(ONE_ETH)
      expect(
        await this.miniWallet.allowance(this.alice.address, this.bob.address)
      ).to.equal(ONE_ETH)

      // ==== WITHDRAWAL POSITIVE TEST ====
      // Alice Withdraws all her native tokens
      tx = await this.miniWallet.connect(this.alice).withdraw(0)
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.add(ONE_ETH).sub(gasUsed)
      miniWalletBalance = miniWalletBalance.sub(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.miniWallet.address)
      ).to.equal(miniWalletBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.miniWallet, 'WithdrawalSuccessful')
        .withArgs(this.alice.address, ONE_ETH, ZERO_ETH)
      // Check Alice's Balance and Auth on MiniWallet
      await expect(
        await this.miniWallet.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.miniWallet.allowance(this.alice.address, this.bob.address)
      ).to.equal(ONE_ETH)

      // ==== DEPOSIT, approve AND SEND POSITIVE TEST ====
      // Alice deposits and approves one token which the operator sends to Bob
      tx = await this.miniWallet.connect(this.alice).deposit({
        value: ONE_ETH
      })
      await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      miniWalletBalance = miniWalletBalance.add(ONE_ETH)
      tx = await this.miniWallet
        .connect(this.alice)
        .approve(this.bob.address, ONE_ETH)
      await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      aliceBalance = aliceBalance.sub(gasUsed)
      tx = await this.miniWallet
        .connect(this.operatorA)
        .send(ONE_ETH, this.alice.address, this.bob.address)
      await tx.wait()
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      bobBalance = bobBalance.add(ONE_ETH)
      miniWalletBalance = miniWalletBalance.sub(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(await this.bob.getBalance()).to.equal(bobBalance)
      await expect(
        await provider.getBalance(this.miniWallet.address)
      ).to.equal(miniWalletBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.miniWallet, 'SendSuccessful')
        .withArgs(
          this.alice.address,
          this.bob.address,
          ONE_ETH,
          ZERO_ETH,
          ZERO_ETH
        )
      // Check Alice's Balance and Auth on MiniWallet
      await expect(
        await this.miniWallet.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.miniWallet.allowance(this.alice.address, this.bob.address)
      ).to.equal(ZERO_ETH)
    })

    // it('checkEventLogs', async function () {
    //   const tx = await this.miniWallet.connect(this.alice).deposit({
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
