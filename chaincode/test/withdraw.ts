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

describe('AssetManager', function () {
  before(async function () {
    await prepare(this, [
      'AssetManager'
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

  describe('withdraw: check withdraw functionality', function () {
    it('AM-withdraw-0: Positive withdrawal test', async function () {
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
})
