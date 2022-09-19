# Proxy Deployment Overview

## Overview

We wish to deploy upgradeable contracts for MiniWallet, MiniID, and optionally MiniNFTS.

This deployment should enable granular control over contracts and addresses created during deployment, so to facilitate auditablity and readabilty. We need control over the proxies so that we will have clear visibility to any potential security risks. To achieve that, control over the deployment scripts is also required.

The high level flow is that the deployment scripts interact natively with both the proxy and the implementation contracts, and persist the necessary information (e.g. version, time, deployer, contract address) needed to understand the deployment, and to maintain and operate these contracts in the future.

## Design

We break this down into four major components. Below, we list those components and reference implementatons:

1. Proxy Logic within Contracts
2. Proxy Contract
3. Deterministic Deployment
4. Deployment Scripts (Contract Interaction)
5. Persistence of Deployment Artifacts.

## Implementation

Following is an overview of how we implement Proxy Functionality

### Proxy Logic With Contracts

We include two Open Zeppelin Contrct Libraries in each contract `UUPSUpgradeable.sol` and `Initializable.sol`. Below is a simple contract generated from the Oppen Zeppelin Contract Wizard. The key components are:

* initialize: Uses `__UUPSUpgradeable_init();`
* _authorizeUpgrade : allows the authorization of a new implementation by the owner.

```
// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Mock721 is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        console.log("In Mock721 constructor");
        _disableInitializers();
    }

    function initialize() public initializer {
        console.log("In Mock721 initialize");
        __ERC721_init("Mock721", "MOK");
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://mock.modulo.so/";
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {
        console.log("In Mock721 _authorizeUpgrade");
    }
}

```

**References**

- [Open Zeppelin Contracts Wizard](https://docs.openzeppelin.com/contracts/4.x/wizard)
- [UUPSUpgradeable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/utils/UUPSUpgradeable.sol)
- [Initializable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/utils/Initializable.sol)
- [Writing Upgradeable Contracts](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable)
- [Proxy Upgradeable Pattern](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies)

### Proxy Contract

Initially we have used a copy of the ERC1967 Contract from Hardhat Deploy and have deployed an upgraded both MiniWallet and MiniID using this proxy and the hardhat deploy functionality as of [this commit](https://github.com/polymorpher/sms-wallet/tree/38a01cb97e48bc6ebe33d51bca88bcb797daf48c/miniwallet).

However this has two limitations

1. Needed to populate admin slot unnecessarily in MiniWallet and MiniID [see here for details](https://github.com/wighawag/hardhat-deploy/issues/146#issuecomment-1244642086)
2. This proxy is a little opaque and does not completely align with [EIP-1822: Universal Upgradeable Proxy Standard (UUPS)](https://eips.ethereum.org/EIPS/eip-1822)

**TODO / Work In Progress**

We are currently cloning a version of [UUPSUpgradeable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/utils/UUPSUpgradeable.sol) to our own `UUPSProxy.sol` and using this for the `proxyContract` in the deployment scripts. This has the following issues / action items.

**1. Error with proxiableUUID**

`Error: function "proxiableUUID" will shadow "proxiableUUID". Please update code to avoid conflict.`

We produce this by running `npx hardhat deploy --tags 'MiniIDTest'

The issue is raised by [hardhat-deploy mergeABIs function](https://github.com/wighawag/hardhat-deploy/blob/master/src/utils.ts#L544)

UUPSProxy.sol overrides this function from [draft-IERC822Upgradeable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/interfaces/draft-IERC1822Upgradeable.sol#L19) 

**Next Steps**
Need to determinine whether this is an issue with UUPSProxy which we need to modify or if we can workaround this by using other deployment tools.

**Notes(@polymorpher)**: can you check which contract's proxiableUUID function is being shadowed? UUPSUpgradeable.sol seems fine. Is hardhat-deploy creating a custom contract on top of the supplied `proxyContract`? Perhaps it is best to just use vanilla `deploy` without specifying those parameters 

**References**

- [Open Zeppelin: Proxies Docs](https://docs.openzeppelin.com/contracts/4.x/api/proxy)
- [EIP173: Hardhat Deploy](https://github.com/wighawag/hardhat-deploy/blob/master/solc_0.8/proxy/EIP173Proxy.sol): The default proxy
- [ERC1967: Hardhat Deploy](https://github.com/wighawag/hardhat-deploy/tree/master/solc_0.8/openzeppelin/proxy/ERC1967): UUPS Proxy
 - [ERC1697: Open Zeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol): This abstract contract provides getters and event emitting update functions for [EIP1967](https://eips.ethereum.org/EIPS/eip-1967) slots.
 - [UUPSUpgradeable.test.js: Open Zeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/test/proxy/utils/UUPSUpgradeable.test.js) These tests show how a mock UUPS upgradeable contract interacts with ERC1967Proxy
- [UUPSUpgradeableMockUpgradeable.sol: Open Zeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/mocks/UUPS/UUPSUpgradeableMockUpgradeable.sol) Open Zeppelin Mock Implementation of UUPSProxy
- [UUPSUpgradeable: Open Zeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/utils/UUPSUpgradeable.sol)
- [ProxyAdmin: Hardhat Deploy](https://github.com/wighawag/hardhat-deploy/blob/master/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol): This is an auxiliary contract meant to be assigned as the admin of a {TransparentUpgradeableProxy}.
- [draft-IERC822Upgradeable.sol](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/interfaces/draft-IERC1822Upgradeable.sol#L19)
- [Open Zeppelin: Storage Gaps](https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps)

**Ethereum Improvement Proposals**

- [EIP-173: Contract Ownership Standard](https://eips.ethereum.org/EIPS/eip-173)
- [EIP-1014: Skinny CREATE2](https://eips.ethereum.org/EIPS/eip-1014)
- [EIP-1967: Standard Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)
- [EIP-1822: Universal Upgradeable Proxy Standard (UUPS)](https://eips.ethereum.org/EIPS/eip-1822)
- [EIP-2535: Diamonds, Multi-Facet Proxy](https://eips.ethereum.org/EIPS/eip-2535)


## Deterministic Deployment

(TODO)

**References**

- [EIP-1014: Skinny CREATE2](https://eips.ethereum.org/EIPS/eip-1014)
- [Hardhat Deploy specifing a deployment factory](https://github.com/wighawag/hardhat-deploy#4-deterministicdeployment-ability-to-specify-a-deployment-factory)
- [OpenZepplin Deploying Smart Contracts Using CREATE2](https://docs.openzeppelin.com/cli/2.8/deploying-with-create2)
- [0xsequence create3](https://github.com/0xsequence/create3)
- [Zoltu Deterministic Deploy Proxy](https://github.com/Zoltu/deterministic-deployment-proxy)

## Deployment Scripts (Contract Interaction)

The high level flow for deploying a contract is

1. Deploy the Implementation Contract
2. Deploy the Proxy Contract passing the callData for the Implementations Initialize Function
3. Connect the Implementation Contract to the Proxy
4. Execute any other deployment tasks

**Sample Code**

```
import { getConfig } from '../config/getConfig'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'
const ContractPath = '../build/contracts/miniWallet/miniWallet.sol/MiniWallet.json'
const ContractJSON = require(ContractPath)
const { abi } = ContractJSON
const OPERATOR_ROLE = ethers.utils.id('OPERATOR_ROLE')

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // Get the deployment configuration
  console.log(`Deploying to network: ${hre.network.name}`)
  const config = await getConfig(hre.network.name, 'miniWallet')

  const deployedMiniWalletImplementation = await deploy('MiniWallet', {
    from: deployer,
    args: [],
    log: true
  })

  const miniWalletImplementation = await hre.ethers.getContractAt('MiniWallet', deployedMiniWalletImplementation.address)
  console.log('MiniWallet Implementation deployed to  :', miniWalletImplementation.address)

  // Construct calldata for Initialize
  const iface = new ethers.utils.Interface(abi)
  const calldata = iface.encodeFunctionData('initialize', [
    config.miniWallet.initialOperatorThreshold,
    config.miniWallet.initialOperators,
    config.miniWallet.initialUserLimit,
    config.miniWallet.initialAuthLimit])
  console.log(`calldata: ${calldata}`)

  const deployedMiniWalletProxy = await deploy('MiniProxy', {
    from: deployer,
    args: [miniWalletImplementation.address, calldata],
    log: true
  })

  const miniWalletProxy = await hre.ethers.getContractAt('MiniProxy', deployedMiniWalletProxy.address)
  console.log('MiniWalletProxy deployed to  :', miniWalletProxy.address)

  const MiniWallet = await ethers.getContractFactory('MiniWallet')
  const miniWallet = MiniWallet.attach(miniWalletProxy.address)
  console.log('MiniWallet deployed to:', miniWallet.address)
  console.log(
    'MiniWallet Operator Threshold:',
    await miniWallet.operatorThreshold()
  )

  const operatorCount = await miniWallet.getRoleMemberCount(OPERATOR_ROLE)
  console.log(`operatorCount : ${operatorCount}`)
  for (let i = 0; i < operatorCount; ++i) {
    console.log(`Operator [${i}]: ${await miniWallet.getRoleMember(OPERATOR_ROLE, i)}`)
  }

  const globalUserLimit = await miniWallet.globalUserLimit()
  console.log(
    'MiniWallet Global User Limit:',
    ethers.utils.formatUnits(globalUserLimit.toString())
  )

  const globalUserAuthLimit = await miniWallet.globalUserAuthLimit()
  console.log(
    'MiniWallet Global User Auth Limit:',
    ethers.utils.formatUnits(globalUserAuthLimit.toString())
  )
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniWallet', 'deploy', 'MiniWalletDeploy']
export default deployFunction
```

**References**
- [Open Zeppelin: Upgrades Plugins Docs](https://docs.openzeppelin.com/upgrades-plugins/1.x/)

- [hardhat-deploy UUPS Proxy Support issue](https://github.com/wighawag/hardhat-deploy/issues/146)
- [hardhat-deploy UUPS Deploy Example](https://github.com/wighawag/template-ethereum-contracts/blob/examples/openzeppelin-proxies/deploy/005_deploy_erc20_via_openzeppelin_uups.ts)
- Code
  - [hardhat-deploy](https://github.com/wighawag/hardhat-deploy/blob/master/src/index.ts)
  - [hardhat-deploy: utils code](https://github.com/wighawag/hardhat-deploy/blob/master/src/utils.ts#L544)
  - [open-zeppelin-upgrades](https://github.com/OpenZeppelin/openzeppelin-upgrades)
  - [one-wallet: loader.js](https://github.com/polymorpher/one-wallet/blob/master/code/extensions/loader.js)
  - [one-wallet: flattened](https://github.com/polymorpher/one-wallet/tree/master/code/flattened)


## Persistence of Deployment Artifacts.

(TODO)

**References**
- [Hardhat Compilation Artifacts (docs)](https://hardhat.org/hardhat-runner/docs/advanced/artifacts)
- [Hardhat Packages (code)](https://github.com/NomicFoundation/hardhat/tree/main/packages)
- [OpenZeppelin Upgrades: Hardhat Plugin (code)](https://github.com/OpenZeppelin/openzeppelin-upgrades/tree/master/packages/plugin-hardhat/src)
  - [deploy.ts (plugin-hardhat)](https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/plugin-hardhat/src/utils/deploy.ts)
  - [deployments.ts (core)](https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/core/src/deployment.ts)
- [Hardhat Deploy extended Artifacts (code)](https://github.com/wighawag/hardhat-deploy/tree/master/extendedArtifacts)
- [one-wallet (code)](https://github.com/polymorpher/one-wallet)
  - [loadContracts (extensions)](https://github.com/polymorpher/one-wallet/blob/master/code/extensions/loader.js#L15) 
  - [initCachedContracts (relayer)](https://github.com/polymorpher/one-wallet/blob/master/code/relayer/blockchain.js#L43)


