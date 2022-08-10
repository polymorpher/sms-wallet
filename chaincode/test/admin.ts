import { expect } from 'chai'
import { ethers, waffle } from 'hardhat'
import {
  prepare,
  deployUpgradeable
} from './utilities'
const config = require('../src/config.ts')
const OPERATOR_ROLE = ethers.utils.id('OPERATOR_ROLE')
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

// let snapshotId: string;

describe('AssetManager Admin', function () {
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

  describe('Administrator: role view functions', function () {
    it('AM-DEFAULT_ADMIN_ROLE-0: check the administrator role', async function () {
      expect(await this.assetManager.DEFAULT_ADMIN_ROLE()).to.equal(DEFAULT_ADMIN_ROLE)
    })
    it('AM-OPERATOR_ROLE-0: check the operator role', async function () {
      expect(await this.assetManager.OPERATOR_ROLE()).to.equal(OPERATOR_ROLE)
    })
    it('AM-getRoleAdmin-0: check Roleadmin role for OPERATOR_ROLE and DEFAULT_ADMIN_ROLE', async function () {
      expect(await this.assetManager.getRoleAdmin(DEFAULT_ADMIN_ROLE)).to.equal(DEFAULT_ADMIN_ROLE)
      expect(await this.assetManager.getRoleAdmin(OPERATOR_ROLE)).to.equal(DEFAULT_ADMIN_ROLE)
    })
    it('AM-getRoleMemberCount-0: check the administator and operator count', async function () {
      expect(await this.assetManager.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.equal(1)
      expect(await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)).to.equal(3)
    })
    it('AM-getRoleMember-0: check the administrator is deployer and operators are correct', async function () {
      expect(await this.assetManager.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(this.deployer.address)
      const operatorCount = await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)
      for (let i = 0; i < operatorCount; ++i) {
        expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, i)).to.equal(config.test.initialOperators[i])
      }
    })
  })

  describe('Administrator: admin role management using standard functions', function () {
    it('AM-grantRole-0: change administrator', async function () {
      await expect(this.assetManager.grantRole(DEFAULT_ADMIN_ROLE, this.operatorA.address))
        .to.emit(this.assetManager, 'RoleGranted')
        .withArgs(DEFAULT_ADMIN_ROLE, this.operatorA.address, this.deployer.address)
      expect(await this.assetManager.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.equal(2)
      await expect(await this.assetManager.revokeRole(DEFAULT_ADMIN_ROLE, this.deployer.address))
        .to.emit(this.assetManager, 'RoleRevoked')
        .withArgs(DEFAULT_ADMIN_ROLE, this.deployer.address, this.deployer.address)
      expect(await this.assetManager.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.equal(1)
      expect(await this.assetManager.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(this.operatorA.address)
    })
    it('AM-revokeRole-0: revoke operator', async function () {
      await expect(await this.assetManager.revokeRole(OPERATOR_ROLE, this.operatorC.address))
        .to.emit(this.assetManager, 'RoleRevoked')
        .withArgs(OPERATOR_ROLE, this.operatorC.address, this.deployer.address)
      expect(await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)).to.equal(2)
      expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, 0)).to.equal(this.operatorA.address)
      expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, 1)).to.equal(this.operatorB.address)
      await expect(this.assetManager.grantRole(OPERATOR_ROLE, this.operatorC.address))
        .to.emit(this.assetManager, 'RoleGranted')
        .withArgs(OPERATOR_ROLE, this.operatorC.address, this.deployer.address)
      expect(await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)).to.equal(3)
      const operatorCount = await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)
      for (let i = 0; i < operatorCount; ++i) {
        expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, i)).to.equal(config.test.initialOperators[i])
      }
    })
    it('AM-revokeRole-1: revert if attempting to revoke operator from non admin account', async function () {
      await expect(this.assetManager.connect(this.operatorA).revokeRole(OPERATOR_ROLE, this.operatorC.address))
        .to.be.revertedWith('AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000')
    })
  })

  describe('Administrator: changing Administrator using renounceAdmin', function () {
    it('AM-renounceAdmin-0: admin change administrator', async function () {
      const tx = await this.assetManager.renounceAdmin(this.operatorA.address)
      await expect(tx)
        .to.emit(this.assetManager, 'RoleGranted')
        .withArgs(DEFAULT_ADMIN_ROLE, this.operatorA.address, this.deployer.address)
        .to.emit(this.assetManager, 'RoleRevoked')
        .withArgs(DEFAULT_ADMIN_ROLE, this.deployer.address, this.deployer.address)
    })
    it('AM-renounceAdmin-1: admin cannot renounce self', async function () {
      await expect(this.assetManager.renounceAdmin(this.deployer.address)).to.be.revertedWith('cannot renounce self')
    })
    it('AM-renounceAdmin-2: renounceAdmin reverts if called by non admin', async function () {
      await expect(this.assetManager.connect(this.operatorA).renounceAdmin(this.operatorC.address))
        .to.be.revertedWith('sender doesn\'t have admin role')
    })
  })

  describe('Administrator: admin role management using admin functions', function () {
    it('AM-adminRemoveOperators-0: remove operator', async function () {
      await expect(await this.assetManager.adminRemoveOperators([this.operatorA.address, this.operatorC.address]))
        .to.emit(this.assetManager, 'OperatorsRemoved')
        .withArgs([this.operatorA.address, this.operatorC.address])
      expect(await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)).to.equal(1)
      expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, 0)).to.equal(this.operatorB.address)
    })
    it('AM-adminRemoveOperators-1: remove operator revert if when removing non-operator', async function () {
      await expect(this.assetManager.adminRemoveOperators([this.ernie.address]))
        .to.be.revertedWith('removing non-operator')
    })
    it('AM-adminRemoveOperators-2: remove operator reverts if called by non admin', async function () {
      await expect(this.assetManager.connect(this.operatorA).adminRemoveOperators([this.operatorC.address]))
        .to.be.revertedWith('sender doesn\'t have admin role')
    })
    it('AM-adminAddOperators-0: add operator', async function () {
      await expect(await this.assetManager.adminRemoveOperators([this.operatorA.address, this.operatorC.address]))
        .to.emit(this.assetManager, 'OperatorsRemoved')
        .withArgs([this.operatorA.address, this.operatorC.address])
      await expect(await this.assetManager.adminAddOperators([this.operatorA.address, this.operatorC.address]))
        .to.emit(this.assetManager, 'OperatorsAdded')
        .withArgs([this.operatorA.address, this.operatorC.address])
      const operatorCount = await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)
      expect(operatorCount).to.equal(3)
      expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, 0)).to.equal(this.operatorB.address)
      expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, 1)).to.equal(this.operatorA.address)
      expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, 2)).to.equal(this.operatorC.address)
    })
    it('AM-adminAddOperators-1: add operator revert if already and operator', async function () {
      await expect(this.assetManager.adminAddOperators([this.operatorB.address]))
        .to.be.revertedWith('already has operator role')
    })
    it('AM-adminAddOperators-2: add operator reverts if called by non admin', async function () {
      await expect(this.assetManager.connect(this.operatorA).adminAddOperators([this.operatorC.address]))
        .to.be.revertedWith('sender doesn\'t have admin role')
    })
  })

  describe('Administrator: OperatorThreshold management', function () {
    it('AM-operatorThreshold-0: check the operatorThreshold', async function () {
      expect((await this.assetManager.operatorThreshold()).toString()).to.equal((config.test.initialOperatorThreshold))
    })
    it('AM-getRoleMemberCount-1: check operator count', async function () {
      expect(await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)).to.equal(3)
    })
    it('AM-getRoleMember-1: check the administrator is deployer and operators are correct', async function () {
      const operatorCount = await this.assetManager.getRoleMemberCount(OPERATOR_ROLE)
      for (let i = 0; i < operatorCount; ++i) {
        expect(await this.assetManager.getRoleMember(OPERATOR_ROLE, i)).to.equal(config.test.initialOperators[i])
      }
    })
    it('AM-adminChangeOperatorThreshold-0: update OperatorThreshold', async function () {
      await expect(await this.assetManager.adminChangeOperatorThreshold(20))
        .to.emit(this.assetManager, 'OperatorThresholdChanged')
        .withArgs(20)
      expect(await this.assetManager.operatorThreshold()).to.equal(20)
    })
    it('AM-adminChangeOperatorThreshold-1: update OperatorThreshold fails if called by non Admin', async function () {
      await expect(this.assetManager.connect(this.operatorA).adminChangeOperatorThreshold(10000))
        .to.be.revertedWith('sender doesn\'t have admin role')
    })
  })
  describe('Administrator: user limit management', function () {
    it('AM-globalUserLimit-0: check the globalUserLimit', async function () {
      expect(await this.assetManager.globalUserLimit()).to.equal(config.test.initialUserLimit)
    })
    it('AM-adminChangeGlobalUserLimit-0: update globalUserLimit', async function () {
      await expect(await this.assetManager.adminChangeGlobalUserLimit(10000))
        .to.emit(this.assetManager, 'GlobalUserLimitChanged')
        .withArgs(10000)
      expect(await this.assetManager.globalUserLimit()).to.equal(10000)
    })
    it('AM-adminChangeGlobalUserLimit-1: update globalUserLimit fails if called by non Admin', async function () {
      await expect(this.assetManager.connect(this.operatorA).adminChangeGlobalUserLimit(10000))
        .to.be.revertedWith('sender doesn\'t have admin role')
    })
  })

  describe('Administrator: user auth limit management', function () {
    it('AM-globalUserAuthLimit-0: check the globalUserAuthLimit', async function () {
      expect(await this.assetManager.globalUserAuthLimit()).to.equal(config.test.initialAuthLimit)
    })
    it('AM-adminChangeGlobalUserAuthLimit-0: update globalUserAuthLimit', async function () {
      await expect(await this.assetManager.adminChangeGlobalUserAuthLimit(1000))
        .to.emit(this.assetManager, 'GlobalUserAuthLimitChanged')
        .withArgs(1000)
      expect(await this.assetManager.globalUserAuthLimit()).to.equal(1000)
    })
    it('AM-adminChangeGlobalUserAuthLimit-1: update globalUserAuthLimit fails if called by non Admin', async function () {
      await expect(this.assetManager.connect(this.operatorA).adminChangeGlobalUserAuthLimit(1000))
        .to.be.revertedWith('sender doesn\'t have admin role')
    })
  })

  describe('Administrator: pause functionality', function () {
    it('AM-paused-0: check the if contract is paused', async function () {
      expect(await this.assetManager.paused()).to.equal(false)
    })
    it('AM-adminPauseAssetManager-0: pause assetManager', async function () {
      await expect(await this.assetManager.adminPauseAssetManager())
        .to.emit(this.assetManager, 'Paused')
        .withArgs(this.deployer.address)
      expect(await this.assetManager.paused()).to.equal(true)
    })
    it('AM-adminPauseAssetManager-1: pause assetManager fails if already paused', async function () {
      await this.assetManager.adminPauseAssetManager()
      await expect(this.assetManager.adminPauseAssetManager())
        .to.be.revertedWith('Pausable: paused')
    })
    it('AM-adminPauseAssetManager-2: adminPauseAssetManager fails if called by non Admin', async function () {
      await expect(this.assetManager.connect(this.operatorA).adminPauseAssetManager())
        .to.be.revertedWith('sender doesn\'t have admin role')
    })
    it('AM-adminUnpauseAssetManager-0: unpause assetManager', async function () {
      await this.assetManager.adminPauseAssetManager()
      await expect(await this.assetManager.adminUnpauseAssetManager())
        .to.emit(this.assetManager, 'Unpaused')
        .withArgs(this.deployer.address)
      expect(await this.assetManager.paused()).to.equal(false)
    })
    it('AM-adminUnpauseAssetManager-1: unpause assetManager fails if not paused', async function () {
      await expect(this.assetManager.adminUnpauseAssetManager())
        .to.be.revertedWith('Pausable: not paused')
    })
    it('AM-adminUnpauseAssetManager-2: adminUnpauseAssetManager fails if called by non Admin', async function () {
      await expect(this.assetManager.connect(this.operatorA).adminUnpauseAssetManager())
        .to.be.revertedWith('sender doesn\'t have admin role')
    })
  })
})
