# Proxy Deployment Overview

## Overview

We have used hardhat deploy and a proxy type of EIP173 (the default hardhat proxy). 
There are two deployment scripts
* 001_deploy_miniWallet.ts: Does initial Deployof the MiniWallet Proxy and Implementation.
* 002_upgrade_miniWallet.ts: Deploys a new implementation contract and updates the MiniWallet Proxy to point to the new implementation.

See [Sample Deployments](#sample-deployments) below

**Notes**
1. Contract addresses for each chain are held in the deployments folder ` "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",`
2. Upgrade logic reads these addresses 
3. When testing upgrades locally you need to set `ethLocal` to `` in `hardhat.config.ts`
```
    ethLocal: {
      url: process.env.ETH_LOCAL_URL,
      gasPrice: 20000000000,
      gas: 6000000,
      live: false,
      saveDeployments: true,
      tags: ['local']
    },
``` 

## Deployments

`yarn deploy --network ethLocal` : Does initial Deployof the MiniWallet Proxy and Implementation.

`yarn deploy-upgrade --network ethLocal` : Deploys a new implementation contract and updates the MiniWallet Proxy to point to the new implementation.


## Improvements

### Improve transparency and readabilty
A cleaner solution was proposed in [Pull Request #12](https://github.com/polymorpher/sms-wallet/pull/12#pullrequestreview-1095436440)
For each chain, we only need three things: proxy contract, deployed proxy address, and logic contract address. Rather than keeping a bunch of JSON files and irrelevant information in those files, I think it is better to just store these three pieces of information in a file inside a folder (similar to relayer/cache, but can be simpler, e.g. the versions can be hash of contracts instead). When we need to upgrade the contract later, we just read from that file and call relevant functions accordingly (i.e. (1) deploy a new logic contract, (2) redirect proxy to the address of the new logic contract). I have read https://github.com/wighawag/hardhat-deploy#deploying-and-upgrading-proxies and examined underlying types (ProxyOptionsBase, etc.) but I am not sure whether hardhat-deploy library supports manual selection (of logic contract address) during upgrade. It would be nice if it does, but even if it doesn't, it seems not hard to just implement on our own - should be just a few lines.

To Implement this we need to do the following
1. Create our own MiniWalletProxy.sol (which can based of any of the Proxy Contract below, suggest using EIP173 from Hardhat Deploy). This would enhance readabilty.
2. Update the Deployment scripts to use this proxy ` proxyContract: 'MiniWalletProxy',`
3. Capture the MiniWalletProxy and MiniWallet Logic contract deployed addresses in the Deployment Scripts and persist them under a separate folder (e.g. `cache`).
4. Update the upgrade script to call MiniWallet Deploy and MiniWalletProxy.upgradeTo explicitly.
5. Use [deterministicDeployment](https://github.com/wighawag/hardhat-deploy#deploymentsdeployname-options) `  deterministicDeployment? boolean | string; // if true, it will deploy the contract at a deterministic address based on bytecode and constructor arguments. The address will be the same across all network. It use create2 opcode for that, if it is a string, the string will be used as the salt.`

### Improve Modularity (NFT Identity)
As we develop NFT Identity we may want to have the MiniWallet Proxy point to multiple (MiniWallet and Mini721 and Mini1155) contracts (facets). We can support this using [EIP-2535: Diamonds, Multi-Facet Proxy](https://eips.ethereum.org/EIPS/eip-2535) as implemented in [Hardhat Deploy: Built-In Support for Diamonds](https://github.com/wighawag/hardhat-deploy#builtin-in-support-for-diamonds-eip2535.) 


### NFT Factory Support
If we decide we want to provide the ability for Creators to deploy their own contract we can implement this using the [Clones Proxy](https://docs.openzeppelin.com/contracts/4.x/api/proxy#Clones)



## References

- [Proxy Overview by Open Zeppelin](https://docs.openzeppelin.com/contracts/4.x/api/proxy)
- [Hardhat Deploy: Deploying and Upgrading Proxies](https://github.com/wighawag/hardhat-deploy#deploying-and-upgrading-proxies)
- [Hardhat Deploy: Examples of Deploying Open Zeppelin Proxies](https://github.com/wighawag/template-ethereum-contracts/tree/examples/openzeppelin-proxies/deploy)

- Proxy Contracts Source Code
  - [EIP173: Hardhat Deploy](https://github.com/wighawag/hardhat-deploy/blob/master/solc_0.8/proxy/EIP173Proxy.sol): The default proxy
  - [ERC1967: Hardhat Deploy](https://github.com/wighawag/hardhat-deploy/tree/master/solc_0.8/openzeppelin/proxy/ERC1967): UUPS Proxy
  - [ERC1697: Open Zeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol): This abstract contract provides getters and event emitting update functions for [EIP1967](https://eips.ethereum.org/EIPS/eip-1967) slots.
  - [UUPSUpgradeable: Open Zeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/utils/UUPSUpgradeable.sol)
  - [ProxyAdmin: Hardhat Deploy](https://github.com/wighawag/hardhat-deploy/blob/master/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol): This is an auxiliary contract meant to be assigned as the admin of a {TransparentUpgradeableProxy}.


- Ethereum Improvement Proposals
  - [EIP-173: Contract Ownership Standard](https://eips.ethereum.org/EIPS/eip-173)
  - [EIP-1967: Standard Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)
  - [EIP-1822: Universal Upgradeable Proxy Standard (UUPS)](https://eips.ethereum.org/EIPS/eip-1822)
  - [EIP-2535: Diamonds, Multi-Facet Proxy](https://eips.ethereum.org/EIPS/eip-2535)


## Sample Deployments

### EIP173
```
johnlaptop miniwallet (miniV0) $ yarn deploy --network ethLocal
yarn run v1.22.19
warning ../../../package.json: No license field
$ npx hardhat deploy --tags deploy --network ethLocal
Nothing to compile
No need to generate any newer typings.
✅ Generated documentation for 53 contracts
 ·-----------------|--------------|----------------·
 |  Contract Name  ·  Size (KiB)  ·  Change (KiB)  │
 ··················|··············|·················
 |  MiniWallet     ·       9.128  ·                │
 ·-----------------|--------------|----------------·
chainId: 1337
operators: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","0x70997970C51812dc3A010C7d01b50e0d17dc79C8","0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC","0x90F79bf6EB2c4f870365E785982E1f101E93b906"]
deploying "MiniWallet_Implementation" (tx: 0xd44c9c54ccc53dd82c064381048acd7f17ee179b3b8c5bfc8520b91cbbb5bd80)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 2071284 gas
deploying "MiniWallet_Proxy" (tx: 0x3b2a5ae1dae25c879c78c6611c57e6b08a9c1371f99a2ecdf702d9c37e1e32b2)...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 with 1137279 gas
MiniWallet deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
MiniWallet Operator Threshold: 10
operatorCount : 4
Operator [0]: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Operator [1]: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Operator [2]: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Operator [3]: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
MiniWallet Global User Auth Limit: 1000000.0
MiniWallet Global User Auth Limit: 100000.0
✨  Done in 8.70s.
```
### EIP173 Upgrade
```
johnlaptop miniwallet (miniV0) $ yarn deploy-upgrade --network ethLocal
yarn run v1.22.19
warning ../../../package.json: No license field
$ npx hardhat deploy --tags upgrade --network ethLocal
Nothing to compile
No need to generate any newer typings.
✅ Generated documentation for 53 contracts
 ·-----------------|--------------|----------------·
 |  Contract Name  ·  Size (KiB)  ·  Change (KiB)  │
 ··················|··············|·················
 |  MiniWallet     ·       9.128  ·                │
 ·-----------------|--------------|----------------·
chainId: 1337
operators: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","0x70997970C51812dc3A010C7d01b50e0d17dc79C8","0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC","0x90F79bf6EB2c4f870365E785982E1f101E93b906"]
deploying "MiniWallet_Implementation" (tx: 0x53920c94944923fa427919e6b12c44a032c72038b54d65a82fe5fea1dd222700)...: deployed at 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 with 2071284 gas
executing MiniWallet.upgradeTo (tx: 0x63bcfd3b262d0126a2c523015bcc2f78c917cc24f11dcf9a10b9670993b73eba) ...: performed with 30538 gas
MiniWallet_v2 deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
MiniWallet_v2 Operator Threshold: 10
operatorCount : 4
Operator [0]: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Operator [1]: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Operator [2]: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Operator [3]: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
MiniWallet_v2 Global User Auth Limit: 1000000.0
MiniWallet_v2 Global User Auth Limit: 100000.0
✨  Done in 8.31s.
```

### Transparent Proxy
```
$ npx hardhat deploy --tags deploy
Nothing to compile
No need to generate any newer typings.
✅ Generated documentation for 53 contracts
 ·-----------------|--------------|----------------·
 |  Contract Name  ·  Size (KiB)  ·  Change (KiB)  │
 ··················|··············|·················
 |  MiniWallet     ·       9.128  ·                │
 ·-----------------|--------------|----------------·
chainId: 31337
Local Testing Deploy
operators: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","0x70997970C51812dc3A010C7d01b50e0d17dc79C8","0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC","0x90F79bf6EB2c4f870365E785982E1f101E93b906"]
deploying "DefaultProxyAdmin" (tx: 0x2ed786fc77f31d787afda812b568e819e2272e7da6873e20b2b1fef018aacb94)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 643983 gas
deploying "MiniWallet_Implementation" (tx: 0x3e629375db5c4500892cb9123a1c64c62bca768958a29a35c58c3ca4f6d8cca4)...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 with 2071284 gas
deploying "MiniWallet_Proxy" (tx: 0xcf8731798c9fdcb2817956f144d341806c081474897a306d996d60429bf360cb)...: deployed at 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 with 1142610 gas
MiniWallet deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
MiniWallet Operator Threshold: 10
operatorCount : 3
Operator [0]: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Operator [1]: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Operator [2]: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
MiniWallet Global User Auth Limit: 1000.0
MiniWallet Global User Auth Limit: 100.0
✨  Done in 13.70s.
```