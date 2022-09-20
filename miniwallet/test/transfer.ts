import { expect } from 'chai'
import { waffle } from 'hardhat'
import {
  prepare,
  deploy,
  deployUpgradeable,
  getBigNumber
} from './utilities'
import { range } from 'lodash'
import config from '../config.test'
import { BigNumber } from 'ethers'

import Constants from './utilities/constants'

const DUMMY_HEX = '0x'

// let snapshotId: string;

describe('MiniWallet', function () {
  before(async function () {
    await prepare(this, [
      'MiniProxy',
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

  describe('transfer: check transfer functionality ', function () {
    it('MW-transfer-0: positive test of ERC20 transfer', async function () {
      await deploy(this, [['erc20', this.TestERC20, [getBigNumber('10000000')]]])

      // transfer 100 M20 to alice
      let tx = await this.erc20.transfer(this.alice.address, BigNumber.from('100'))
      expect(await this.erc20.balanceOf(this.alice.address)).to.equal(100)
      // alice approves 70 to Asset Manager
      tx = await this.erc20.connect(this.alice).increaseAllowance(this.miniWallet.address, BigNumber.from('70'))
      await tx.wait()
      expect(await this.erc20.allowance(this.alice.address, this.miniWallet.address)).to.equal(70)
      tx = await this.erc20.connect(this.alice).transfer(this.bob.address, BigNumber.from('3'))
      await tx.wait()
      expect(await this.erc20.balanceOf(this.alice.address)).to.equal(97)
      expect(await this.erc20.allowance(this.alice.address, this.miniWallet.address)).to.equal(70)
      // Operator transfers 3 of token 0 to Bob
      tx = await this.miniWallet.connect(this.operatorA)
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
      expect(await this.erc20.allowance(this.alice.address, this.miniWallet.address)).to.equal(67)
    })

    it('MW-transfer-1: positive test of ERC721 transfer', async function () {
      // Deploy 721
      await deploy(this, [['erc721', this.TestERC721, [10]]])
      // Transfer some Tokens for Alice
      let tx = await this.erc721.transferFrom(this.deployer.address, this.alice.address, 0)
      await tx.wait()
      tx = await this.erc721.transferFrom(this.deployer.address, this.alice.address, 1)
      await tx.wait()
      tx = await this.erc721.transferFrom(this.deployer.address, this.alice.address, 2)
      await tx.wait()
      expect(await this.erc721.balanceOf(this.alice.address)).to.equal(3)
      // Alice Approves the MiniWallet for the Token
      tx = await this.erc721.connect(this.alice).approve(this.miniWallet.address, 0)
      await tx.wait()
      // Operator transfers the tokens for Alice to Bob
      tx = await this.miniWallet.connect(this.operatorA)
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

    it('MW-transfer-2: positive test of ERC1155 transfer', async function () {
      // Deploy 1155
      await deploy(this, [['erc1155', this.TestERC1155, [
        range(10),
        range(10).map((e: any) => 10) // mint 10 for each
      ]]])
      // Transfer some tokens for Alice
      let tx = await this.erc1155.safeTransferFrom(this.deployer.address, this.alice.address, 0, 7, DUMMY_HEX)
      await tx.wait()
      tx = await this.erc1155.safeTransferFrom(this.deployer.address, this.alice.address, 1, 7, DUMMY_HEX)
      await tx.wait()
      tx = await this.erc1155.safeTransferFrom(this.deployer.address, this.alice.address, 2, 7, DUMMY_HEX)
      await tx.wait()
      expect(await this.erc1155.balanceOf(this.alice.address, 0)).to.equal(7)
      // Alice approves the MiniWallet for the Token
      tx = await this.erc1155.connect(this.alice).setApprovalForAll(this.miniWallet.address, true)
      await tx.wait()
      // Operator transfers the tokens for Alice to Bob
      tx = await this.miniWallet.connect(this.operatorA).transfer(
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
