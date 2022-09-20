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

  describe('withdraw: check withdraw functionality', function () {
    it('MW-withdraw-0: Positive withdrawal test', async function () {
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      let miniWalletBalance = await provider.getBalance(
        this.miniWallet.address
      )
      let tx = await this.miniWallet.connect(this.alice).deposit({
        value: ONE_ETH
      })
      await tx.wait()
      let gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.sub(ONE_ETH).sub(gasUsed)
      miniWalletBalance = miniWalletBalance.add(ONE_ETH)
      tx = await this.miniWallet.connect(this.alice).withdraw(0)
      gasUsed = await getTxCost(tx.hash)
      // Calculate and check new balances
      aliceBalance = aliceBalance.add(ONE_ETH).sub(gasUsed)
      miniWalletBalance = miniWalletBalance.sub(ONE_ETH)
      await expect(await this.alice.getBalance()).to.equal(aliceBalance)
      await expect(
        await provider.getBalance(this.miniWallet.address)
      ).to.equal(miniWalletBalance)
      // Check events emitted
      await expect(tx)
        .to.emit(this.miniWallet, 'WithdrawalSuccessful')
        .withArgs(this.alice.address, ONE_ETH, ZERO_ETH)
      // Log all receipts
      await tx.wait()
      // Check Alices Balance and Auth on MiniWallet
      await expect(
        await this.miniWallet.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
    })
  })
})
