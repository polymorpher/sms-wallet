import { expect } from 'chai'
import { ethers, waffle } from 'hardhat'
import {
  prepare,
  deployUpgradeable,
  checkBalance,
  getTxCost
} from './utilities'
import config from '../src/config'

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

  describe('send: check send functionality', function () {
    it('AM-send-0: Positive send test', async function () {
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
      await tx.wait()
      // Check Alices Balance and Auth on AssetManager
      await expect(
        await this.assetManager.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.assetManager.allowance(this.alice.address, this.bob.address)
      ).to.equal(ZERO_ETH)
    })
  })
})
