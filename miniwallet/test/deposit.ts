import { expect } from 'chai'
import { ethers, waffle } from 'hardhat'
import {
  prepare,
  deployUpgradeable,
  checkBalance,
  getTxCost
} from './utilities'
import config from '../config'

const ZERO_ETH = ethers.utils.parseEther('0')
const ONE_ETH = ethers.utils.parseEther('1')

describe('MiniWallet', function () {
  before(async function () {
    await prepare(this, [
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

  describe('deposit: check deposit functionality', function () {
    it('AM-deposit-0: Positive deposit test', async function () {
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      const bobBalance = await this.bob.getBalance()
      let miniWalletBalance = await provider.getBalance(
        this.miniWallet.address
      )
      const tx = await this.miniWallet.connect(this.alice).deposit({
        value: ONE_ETH
      })
      await tx.wait()
      const gasUsed = await getTxCost(tx.hash)
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
    })

    it('AM-deposit-1: Negative deposit test amount greater global user limit', async function () {
      await checkBalance(this.alice, '10000')
      const aliceBalance = await this.alice.getBalance()
      const depositAmount = config.test.initialUserLimit.add(ONE_ETH)
      await expect(
        this.miniWallet.connect(this.alice).deposit({
          value: depositAmount
        })
      ).to.be.reverted
      // Check that alice did not lose her funds when the transaction was reverted (note she did pay gas fees)
      const aliceNewBalance = await this.alice.getBalance()
      expect(aliceNewBalance).to.be.gt(aliceBalance.sub(depositAmount))
    })

    it('AM-deposit-2: Negative deposit test amount two deposits greater global user limit', async function () {
      let tx = await this.miniWallet.connect(this.alice).deposit({
        value: ONE_ETH
      })
      await tx.wait()
      await expect(
        (tx = this.miniWallet.connect(this.alice).deposit({
          value: config.test.initialUserLimit
        }))
      ).to.be.reverted
    })
  })
})
