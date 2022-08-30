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
      'MiniWallet',
      'TestERC20',
      'TestERC721',
      'TestERC1155'
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

  describe('approve: check approval functionality', function () {
    it('AM-approve-0: Positive approval test', async function () {
      const provider = waffle.provider

      // check Initial Balance
      await checkBalance(this.alice, '10000')
      let aliceBalance = await this.alice.getBalance()
      const bobBalance = await this.bob.getBalance()
      const miniWalletBalance = await provider.getBalance(
        this.miniWallet.address
      )

      const tx = await this.miniWallet
        .connect(this.alice)
        .approve(this.bob.address, ONE_ETH)
      const gasUsed = await getTxCost(tx.hash)
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
      await tx.wait()
      // Check Alice's Balance and Auth on MiniWallet
      await expect(
        await this.miniWallet.userBalances(this.alice.address)
      ).to.equal(ZERO_ETH)
      expect(
        await this.miniWallet.allowance(this.alice.address, this.bob.address)
      ).to.equal(ONE_ETH)
    })
  })
})
