# Smart Contract Testing Guide

## Overview

Tests in this folder are exclusively for smart contracts (under `chaincode/contracts`) and some core library functions related to small contracts (under `code/lib`). 

Tests for other components, such as the the client and the core server, are provided at separate locations.

### Running the tests

It is recommended that you run tests against a local Hardhat instance. 

The tests have deep logging functionality controlled by the `VERBOSE` flag

* `VERBOSE=1` or `VERBOSE=true` turns on debugging logging
* `VERBOSE=0` or `VERBOSE=false` runs in a quieter mode

You run the following tests the `chaincode` directory


To run the complete set of tests use
```
yarn test
```

To run a specific suite of tests in a file use
```
yarn test test/AssetManager.ts 
```

To run an individual test (without compiling the contract) use
```
yarn test  --no-compile  --grep 'Positive deposit test'
```

## Test Data Overview
Before each test, some wallets are retrieved using `ethers.getSigners`. They are encapsulated in a test data object. See `prepare` functions in `test/utilities/index.ts` for more details. A breakdown of the test users is given below.

### Test Accounts
All accounts are funded with 10,000 native tokens. 

* deployer : this is used to deploy AssetManager and Test Token Contracts. It recieves the role of `DEFAULT_ADMIN` which controls the administrative functions.
* operatorA : An operator whose responsibilities are transferring assets on behalf of users
* operatorB : An operator whose responsibilities are transferring assets on behalf of users
* operatorC : An operator whose responsibilities are transferring assets on behalf of users

* alice: primary user used for testing deposit, withrdrawal, approve and transfer functionality using native tokens, ERC20, ERC721, ERC1155
* bob: primary recipient of tokens from alice
* carol: additional general purpose testing user
* dora: additional general purpose testing user
* ernie: additional general purpose testing user

For transfer testing, the following token contracts are deployed using the deploy in the environment:
* testerc20: ERC20 contract (TestERC20) with 10000000 minted supply, of which 100 tokens are given to alice for transfer testing
* testerc721: ERC721 contract (TestERC721) with 10 different tokens [0,1,2,3,4,5,6,7,8,9]. Token [0,1,2] are given to alice.
* testerc1155: ERC1155 contract (TestERC1155) with 10 tokenId's [0,1,2,3,4,5,6,7,8,9]. They each have a supply of 10 tokens , which are minted ahead of time. Alice is supplied with a quantity of 7 tokens for tokenId's [0,1,2] used for testing.


## Tests Areas

Following is a summary of each testing area:

| File          | Function                                                                                                                                                                                                                               |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| admin.ts           | Administrative functions around setting deposit and approval limits, pausing the contracts and administering operators. |
| deposit.ts         | Deposit native token functionality (user) testing |
| withdraw.ts        | Withdrawal native token functionality (user) testing |
| approve.ts         | Approval native token functionality (user) testing |
| send.ts            | Send native token functionalty (operator) testing |
| transfer.ts        | Transfer functionality (operator) testing  |
| extra.ts           | Any additional test (e.g. complex positive use cases) |
| utilities/index.ts | Utility and helper functions  |

### Writing Smart Contract Tests

Below is an overview of writing tests for a new operation or new test area. For tests extending an existing area, please follow the code conventions and structures in the corresponding file.

**First Postive Use Case** 

First, create a new file and write out how you expect a successful operation to play out. Please feel free to refer to examples in `deposit.ts` and others.

* **Test and Expected Result:** Place this in comments at the top of the test

* **Test Name:** Uniquely identify the test and state what the test is for e.g. `AM-DEPOSIT-0 DEPOSIT: must be able to depoist native tokens`. Here the unique test identifier `AM-DEPOSIT-0 ` allows the test to be run individually.



### Appendix A: Sample Test Results (2022-08-07)
Following is a log produced by running `yarn test`

```
$ yarn test
yarn run v1.22.19
warning ../../../package.json: No license field
$ npx hardhat test
No need to generate any newer typings.
✅ Generated documentation for 36 contracts
 ·-----------------|--------------|----------------·
 |  Contract Name  ·  Size (KiB)  ·  Change (KiB)  │
 ··················|··············|·················
 |  AssetManager   ·       9.131  ·                │
 ·-----------------|--------------|----------------·


  AssetManager Admin
    Administrator: role view functions
      ✔ AM-DEFAULT_ADMIN_ROLE-0: check the administrator role
      ✔ AM-OPERATOR_ROLE-0: check the operator role
      ✔ AM-getRoleAdmin-0: check Roleadmin role for OPERATOR_ROLE and DEFAULT_ADMIN_ROLE
      ✔ AM-getRoleMemberCount-0: check the administator and operator count
      ✔ AM-getRoleMember-0: check the administrator is deployer and operators are correct (49ms)
    Administrator: admin role management using standard functions
      ✔ AM-grantRole-0: change administrator (63ms)
      ✔ AM-revokeRole-0: revoke operator (95ms)
      ✔ AM-revokeRole-1: revert if attempting to revoke operator from non admin account (65ms)
    Administrator: changeing Administrator using renounceAdmin
      ✔ AM-renounceAdmin-0: admin change administrator
      ✔ AM-renounceAdmin-1: admin cannot renounce self
      ✔ AM-renounceAdmin-2: renounceAdmin reverts if called by non admin
    Administrator: admin role management using admin functions
      ✔ AM-adminRemoveOperators-0: remove operator
      ✔ AM-adminRemoveOperators-1: remove operator revert if when removing non-operator
      ✔ AM-adminRemoveOperators-2: remove operator reverts if called by non admin
      ✔ AM-adminAddOperators-0: add operator (72ms)
      ✔ AM-adminAddOperators-1: add operator revert if already and operator
      ✔ AM-adminAddOperators-2: add operator reverts if called by non admin
    Administrator: OperatorThreshold management
      ✔ AM-operatorThreshold-0: check the operatorThreshold
      ✔ AM-getRoleMemberCount-1: check the administator and operator count
      ✔ AM-getRoleMember-1: check the administrator is deployer and operators are correct
      ✔ AM-adminChangeOperatorThreshold-0: update OperatorThreshold
      ✔ AM-adminChangeOperatorThreshold-1: update OperatorThreshold fails if called by non Admin
    Administrator: user limit management
      ✔ AM-globalUserLimit-0: check the globalUserLimit
      ✔ AM-adminChangeGlobalUserLimit-0: update globalUserLimit
      ✔ AM-adminChangeGlobalUserLimit-1: update globalUserLimit fails if called by non Admin
    Administrator: user auth limit management
      ✔ AM-globalUserAuthLimit-0: check the globalUserAuthLimit
      ✔ AM-adminChangeGlobalUserAuthLimit-0: update globalUserAuthLimit
      ✔ AM-adminChangeGlobalUserAuthLimit-1: update globalUserAuthLimit fails if called by non Admin
    Administrator: pause functionality
      ✔ AM-paused-0: check the if contract is paused
      ✔ AM-adminPauseAssetManager-0: pause assetManager
      ✔ AM-adminPauseAssetManager-1: pause assetManager fails if already paused
      ✔ AM-adminPauseAssetManager-2: adminPauseAssetManager fails if called by non Admin
      ✔ AM-adminUnpauseAssetManager-0: unpause assetManager
      ✔ AM-adminUnpauseAssetManager-1: unPause assetManager fails if not paused
      ✔ AM-adminUnpauseAssetManager-2: adminUnpauseAssetManager fails if called by non Admin

  AssetManager
    approve: check approval functionality
      ✔ AM-approve-0: Positive approval test (41ms)

  AssetManager
    deposit: check deposit functionality
      ✔ AM-deposit-0: Positive deposit test (39ms)
      ✔ AM-deposit-1: Negative deposit test amount greater global user limit
      ✔ AM-deposit-2: Negative deposit test amount two deposits greater global user limit

  AssetManager
    extra: Additional AssetManager tests
      ✔ Positive walk-through, deposit, withdraw, approve, send (173ms)
      ✔ checkEventLogs
      ✔ checkReverts

  AssetManager
    send: check send functionality
      ✔ AM-send-0: Positive send test (65ms)

  AssetManager
    transfer: check transfer functionality
      ✔ AM-transfer-0: positive test of ERC20 transfer (126ms)
      ✔ AM-transfer-1: positive test of ERC721 transfer (246ms)
      ✔ AM-transfer-2: positive test of ERC1155 transfer (224ms)

  AssetManager
    withdraw: check withdraw functionality
      ✔ AM-withdraw-0: Positive withdrawal test (43ms)


  47 passing (5s)

✨  Done in 13.02s.
```
### Appendix A: Sample Coverage Report (2022-08-07)
Following is a log produced by running `yarn coverage`

```
$ yarn coverage
yarn run v1.22.19
warning ../../../package.json: No license field
$ npx hardhat coverage

Version
=======
> solidity-coverage: v0.7.21

Instrumenting for coverage...
=============================

> AssetManager.sol
> debug/TestTokens.sol
> Enums.sol
> lib/SafeCast.sol

Compilation:
============

Warning: Contract code size exceeds 24576 bytes (a limit introduced in Spurious Dragon). This contract may not be deployable on mainnet. Consider enabling the optimizer (with a low "runs" value!), turning off revert strings, or using libraries.
  --> contracts/AssetManager.sol:28:1:
   |
28 | contract AssetManager is Initializable, PausableUpgradeable, AccessControlEnumerableUpgradeable {
   | ^ (Relevant source part starts here and spans across multiple lines).


Generating typings for: 36 artifacts in dir: typechain for target: ethers-v5
Successfully generated 57 typings!
Compiled 33 Solidity files successfully
✅ Generated documentation for 36 contracts

Network Info
============
> HardhatEVM: v2.10.1
> network:    hardhat

Warning: Contract code size exceeds 24576 bytes (a limit introduced in Spurious Dragon). This contract may not be deployable on mainnet. Consider enabling the optimizer (with a low "runs" value!), turning off revert strings, or using libraries.
  --> contracts/AssetManager.sol:28:1:
   |
28 | contract AssetManager is Initializable, PausableUpgradeable, AccessControlEnumerableUpgradeable {
   | ^ (Relevant source part starts here and spans across multiple lines).


Generating typings for: 36 artifacts in dir: typechain for target: ethers-v5
Successfully generated 57 typings!
Compiled 33 Solidity files successfully
✅ Generated documentation for 36 contracts


  AssetManager Admin
    Administrator: role view functions
      ✔ AM-DEFAULT_ADMIN_ROLE-0: check the administrator role
      ✔ AM-OPERATOR_ROLE-0: check the operator role
      ✔ AM-getRoleAdmin-0: check Roleadmin role for OPERATOR_ROLE and DEFAULT_ADMIN_ROLE
      ✔ AM-getRoleMemberCount-0: check the administator and operator count
      ✔ AM-getRoleMember-0: check the administrator is deployer and operators are correct (39ms)
    Administrator: admin role management using standard functions
      ✔ AM-grantRole-0: change administrator (61ms)
      ✔ AM-revokeRole-0: revoke operator (105ms)
      ✔ AM-revokeRole-1: revert if attempting to revoke operator from non admin account (82ms)
    Administrator: changeing Administrator using renounceAdmin
      ✔ AM-renounceAdmin-0: admin change administrator
      ✔ AM-renounceAdmin-1: admin cannot renounce self
      ✔ AM-renounceAdmin-2: renounceAdmin reverts if called by non admin
    Administrator: admin role management using admin functions
      ✔ AM-adminRemoveOperators-0: remove operator (48ms)
      ✔ AM-adminRemoveOperators-1: remove operator revert if when removing non-operator
      ✔ AM-adminRemoveOperators-2: remove operator reverts if called by non admin
      ✔ AM-adminAddOperators-0: add operator (90ms)
      ✔ AM-adminAddOperators-1: add operator revert if already and operator
      ✔ AM-adminAddOperators-2: add operator reverts if called by non admin
    Administrator: OperatorThreshold management
      ✔ AM-operatorThreshold-0: check the operatorThreshold
      ✔ AM-getRoleMemberCount-1: check the administator and operator count
      ✔ AM-getRoleMember-1: check the administrator is deployer and operators are correct
      ✔ AM-adminChangeOperatorThreshold-0: update OperatorThreshold
      ✔ AM-adminChangeOperatorThreshold-1: update OperatorThreshold fails if called by non Admin
    Administrator: user limit management
      ✔ AM-globalUserLimit-0: check the globalUserLimit
      ✔ AM-adminChangeGlobalUserLimit-0: update globalUserLimit
      ✔ AM-adminChangeGlobalUserLimit-1: update globalUserLimit fails if called by non Admin
    Administrator: user auth limit management
      ✔ AM-globalUserAuthLimit-0: check the globalUserAuthLimit
      ✔ AM-adminChangeGlobalUserAuthLimit-0: update globalUserAuthLimit
      ✔ AM-adminChangeGlobalUserAuthLimit-1: update globalUserAuthLimit fails if called by non Admin
    Administrator: pause functionality
      ✔ AM-paused-0: check the if contract is paused
      ✔ AM-adminPauseAssetManager-0: pause assetManager
      ✔ AM-adminPauseAssetManager-1: pause assetManager fails if already paused
      ✔ AM-adminPauseAssetManager-2: adminPauseAssetManager fails if called by non Admin
      ✔ AM-adminUnpauseAssetManager-0: unpause assetManager
      ✔ AM-adminUnpauseAssetManager-1: unPause assetManager fails if not paused
      ✔ AM-adminUnpauseAssetManager-2: adminUnpauseAssetManager fails if called by non Admin

  AssetManager
    approve: check approval functionality
      ✔ AM-approve-0: Positive approval test (42ms)

  AssetManager
    deposit: check deposit functionality
      ✔ AM-deposit-0: Positive deposit test (47ms)
      ✔ AM-deposit-1: Negative deposit test amount greater global user limit
      ✔ AM-deposit-2: Negative deposit test amount two deposits greater global user limit

  AssetManager
    extra: Additional AssetManager tests
      ✔ Positive walk-through, deposit, withdraw, approve, send (176ms)
      ✔ checkEventLogs
      ✔ checkReverts

  AssetManager
    send: check send functionality
      ✔ AM-send-0: Positive send test (76ms)

  AssetManager
    transfer: check transfer functionality
      ✔ AM-transfer-0: positive test of ERC20 transfer (191ms)
      ✔ AM-transfer-1: positive test of ERC721 transfer (308ms)
      ✔ AM-transfer-2: positive test of ERC1155 transfer (305ms)

  AssetManager
    withdraw: check withdraw functionality
      ✔ AM-withdraw-0: Positive withdrawal test (42ms)


  47 passing (6s)

-------------------|----------|----------|----------|----------|----------------|
File               |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------|----------|----------|----------|----------|----------------|
 contracts/        |      100 |    68.42 |      100 |       92 |                |
  AssetManager.sol |      100 |    68.42 |      100 |       92 |... 436,479,496 |
  Enums.sol        |      100 |      100 |      100 |      100 |                |
 contracts/debug/  |    26.32 |        0 |    13.64 |    24.39 |                |
  TestTokens.sol   |    26.32 |        0 |    13.64 |    24.39 |... 125,129,133 |
 contracts/lib/    |       25 |     12.5 |       25 |       25 |                |
  SafeCast.sol     |       25 |     12.5 |       25 |       25 |7,8,12,13,17,18 |
-------------------|----------|----------|----------|----------|----------------|
All files          |    70.69 |       45 |    48.84 |    65.32 |                |
-------------------|----------|----------|----------|----------|----------------|

> Istanbul reports written to ./coverage/ and ./coverage.json
✨  Done in 23.73s.
```
