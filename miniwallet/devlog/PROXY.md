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

We have created a MiniProxy which leverages two imports from Open Zeppelin.

**[Proxy.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/proxy/Proxy.sol)** 

This abstract contract provides a fallback function that delegates all calls to another contract using the EVM instruction `delegatecall`. We refer to the second contract as the _implementation_ behind the proxy, and it has to be specified by overriding the virtual {_implementation} function.

Additionally, delegation to the implementation can be triggered manually through the {_fallback} function, or to a different contract through the {_delegate} function.
 
 The success and return data of the delegated call will be returned back to the caller of the proxy.

**[ERC1967UpgradeUpgradeable](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol)**

An abstract contract that provides getters and event emitting update functions for [EIP1967](https://eips.ethereum.org/EIPS/eip-1967)slots.

```
// SPDX-License-Identifier: Apache-2.0

// OpenZeppelin Contracts v4.4.1 (proxy/ERC1967/ERC1967Proxy.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol";

/**
 * @dev This contract implements an upgradeable proxy. It is upgradeable because calls are delegated to an
 * implementation address that can be changed. This address is stored in storage in the location specified by
 * https://eips.ethereum.org/EIPS/eip-1967[EIP1967], so that it doesn't conflict with the storage layout of the
 * implementation behind the proxy.
 */
contract MiniProxy is Proxy, ERC1967UpgradeUpgradeable {
    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `_logic`. This will typically be an encoded
     * function call, and allows initializating the storage of the proxy like a Solidity constructor.
     */
    constructor(address _logic, bytes memory _data) payable {
        assert(
            _IMPLEMENTATION_SLOT ==
                bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
        );
        _upgradeToAndCall(_logic, _data, false);
    }

    /**
     * @dev Returns the current implementation address.
     */
    function implementation() public view returns (address impl) {
        return _implementation();
    }

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation()
        internal
        view
        virtual
        override
        returns (address impl)
    {
        return ERC1967UpgradeUpgradeable._getImplementation();
    }
}

```


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
import config from '../config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'
import { checkDeployed, persistDeployment } from '../lib/utils'

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const network = hre.network.name
  // Ensure we haven't already deployed MiniWallet on this network
  const deployed = await checkDeployed(hre, 'MiniWallet')
  if (deployed) { return }

  const OPERATOR_ROLE = ethers.utils.id('OPERATOR_ROLE')

  // Get the deployment configuration
  console.log(`Deploying to network: ${hre.network.name}`)

  const deployedMiniWalletImplementation = await deploy('MiniWallet', {
    from: deployer,
    args: [],
    log: true
  })

  const miniWalletImplementation = await hre.ethers.getContractAt('MiniWallet', deployedMiniWalletImplementation.address)
  console.log('MiniWallet Implementation deployed to  :', miniWalletImplementation.address)

  // Construct calldata for Initialize
  const MiniWalletInitializeCallData = miniWalletImplementation.interface.encodeFunctionData('initialize',
    [
      config[network].miniWallet.initialOperatorThreshold,
      config[network].miniWallet.initialOperators,
      config[network].miniWallet.initialUserLimit,
      config[network].miniWallet.initialAuthLimit
    ])
  console.log(`MiniWallet initialize calldata: ${MiniWalletInitializeCallData}`)
  // Deploy MiniWalletProxy
  const deployedMiniWalletProxy = await deploy('MiniProxy', {
    from: deployer,
    args: [miniWalletImplementation.address, MiniWalletInitializeCallData],
    log: true
  })

  const miniWalletProxy = await hre.ethers.getContractAt('MiniProxy', deployedMiniWalletProxy.address)
  console.log('MiniWalletProxy deployed to  :', miniWalletProxy.address)

  // ==== MiniWallet is the implementation contract attached to the Proxy
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
  // Persist Contract Information
  await persistDeployment(hre, 'MiniWallet', miniWalletImplementation.address, 'MiniProxy', miniWalletProxy.address)
}

deployFunction.dependencies = []
deployFunction.tags = ['MiniWallet', 'deploy', 'MiniWalletDeploy']
export default deployFunction

```

This allows us to 

1. Remove the populate admin slot unnecessarily in MiniWallet and MiniID [see here for details](https://github.com/wighawag/hardhat-deploy/issues/146#issuecomment-1244642086)


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

**Initial Requirements/Feedback from @polymorpher [see here](https://github.com/polymorpher/sms-wallet/pull/12#pullrequestreview-1095436440)**

It's nice to have hardhat do the proxy-deployment in a simple function call, but I am concerned we see too little detail and have too little control. The generated .json files (in deployments/) are pretty hard to read, and may be easily confused with something that can be regenerated. Yet they are unique to the deployment and critical to managing the contract / upgrades in the future.

For each chain, we only need three things: proxy contract, deployed proxy address, and logic contract address. Rather than keeping a bunch of JSON files and irrelevant information in those files, I think it is better to just store these three pieces of information in a file inside a folder (similar to relayer/cache, but can be simpler, e.g. the versions can be hash of contracts instead). When we need to upgrade the contract later, we just read from that file and call relevant functions accordingly (i.e. (1) deploy a new logic contract, (2) redirect proxy to the address of the new logic contract). I have read https://github.com/wighawag/hardhat-deploy#deploying-and-upgrading-proxies and examined underlying types (ProxyOptionsBase, etc.) but I am not sure whether hardhat-deploy library supports manual selection (of logic contract address) during upgrade. It would be nice if it does, but even if it doesn't, it seems not hard to just implement on our own - should be just a few lines)

### Approach
We wanted to support a light weight persisting of artifacts when deploying and upgrading contracts.
To do this we have written two persistence functions to date (see lib/utils.ts)

* `checkDeployed` : Checks if an existing contract has been deployed. The assumption is that once deployed we should not deploy again unless we are doing an upgrade via the proxy. It handles the conditions with the following return
  * true: If this version of the contract (verified by bytecodeHash) has been deployed
  * false: If a different version of the contract (verified by byteCodeHash) has been deployed
  * false: If the contract has not been deployed (no deployment file exists)
  * exits: with any other exception when reading the deployment artifacts
* `persistDeployment`: Persists the contract and proxy information for a contract.

**Example Deployment Artifact**
```
{
    "contract": {
        "name": "MiniWallet",
        "network": "hardhat",
        "implementations": [
            {
                "name": "MiniWallet",
                "version": 1,
                "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                "bytecodeHash": "0x1f7f351a6d7fb20cb7ff9af9341fcd93dc4cb53a5996ed41d1a4d617ebebe5a5"
            }
        ],
        "proxyContract": {
            "name": "MiniProxy",
            "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            "bytecodeHash": "0x9456ef0a00a146827f2250d5706d0213be0bdd1515fc0e2fc38af81013839580"
        }
    }
}
```

**Configuration Notes**
* artifacts directory is configurable in `.config` using `artifactsDirectory`
* Persisting of artifacts for networks is configured in hardhat.config.ts Usually local networks used for development will have `saveDeployments: false` and live networks will have `saveDeployments: true`

**Future Work**
* Enhance the persistence process for upgrades and include versioning



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


