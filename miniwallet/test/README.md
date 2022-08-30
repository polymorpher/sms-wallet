# Smart Contract Testing Guide

## Overview

Tests in this folder are exclusively for smart contracts (under `../contracts`) and related libraries (under `code/lib`). 

### Running the tests

To run the complete set of tests, run:

```
yarn test
```

It is recommended that you run tests against a local Hardhat instance (default).

To run a specific test set, run:

```
yarn test test/MiniWallet.ts 
```

To run an individual test (without compiling the contract), run

```
yarn test  --no-compile  --grep 'Positive deposit test'
```

## Test Data and Config

Before each test, some wallets are retrieved using `ethers.getSigners`. They are encapsulated in a test data object. See `prepare` functions in `test/utilities/index.ts` for more details. A breakdown of the test users is given below.

### Test Accounts

All accounts are funded with 10,000 native tokens. 

* deployer : an account that deploys MiniWallet and test token Contracts. The address recieves the role of `DEFAULT_ADMIN` which controls the administrative functions, such as assigning operators and adjusting limits 
* operatorA, operatorB, operatorC : operators who are responsible for regular smart contract interactions, such as transferring assets on behalf of users

* alice: primary user used for testing deposit, withrdrawal, approve and transfer functionality using native tokens, ERC20, ERC721, ERC1155
* bob: primary recipient of tokens from alice
* carol, dora, ernie: additional general purpose testing user

For transfer testing, the following token contracts are deployed using the deploy in the environment:
* testerc20: ERC20 contract (TestERC20) with 10000000 minted supply, of which 100 tokens are given to alice for transfer testing
* testerc721: ERC721 contract (TestERC721) with 10 different tokens [0,1,2,3,4,5,6,7,8,9]. Token [0,1,2] are given to alice.
* testerc1155: ERC1155 contract (TestERC1155) with 10 tokenId's [0,1,2,3,4,5,6,7,8,9]. They each have a supply of 10 tokens , which are minted ahead of time. Alice is supplied with a quantity of 7 tokens for tokenId's [0,1,2] used for testing.


## Tests Areas

Following is a summary of each testing area:

| File          | Function                                                                                                                                                                                                                               |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| admin.ts           | Administrative functions around setting deposit and approval limits, pausing the contracts and administering operators. |
| deposit.ts         | Deposit of native tokens (from a user) |
| withdraw.ts        | Withdrawal of native tokens (from user) |
| approve.ts         | Approval of native tokens (from user) |
| send.ts            | Sending native token (via operators) |
| transfer.ts        | Transferring tokens (via operators) |
| extra.ts           | Additional tests (e.g. complex positive use cases) |
| utilities/index.ts | Utility and helper functions  |

### Writing Smart Contract Tests

Below is an overview of writing tests for a new operation or new test area. For tests extending an existing area, please follow the code conventions and structures in the corresponding file.

**First Postive Use Case** 

First, create a new file and write out how you expect a successful operation to play out. Please feel free to refer to examples in `deposit.ts` and others.

* **Test and Expected Result:** Place this in comments at the top of the test

* **Test Name:** Uniquely identify the test and state what the test is for e.g. `MW-DEPOSIT-0 DEPOSIT: must be able to depoist native tokens`. Here the unique test identifier `MW-DEPOSIT-0 ` allows the test to be run individually.



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
 |  MiniWallet   ·       9.131  ·                │
 ·-----------------|--------------|----------------·


  MiniWallet Admin
    Administrator: role view functions
      ✔ MW-DEFAULT_ADMIN_ROLE-0: check the administrator role
      ✔ MW-OPERATOR_ROLE-0: check the operator role
      ✔ MW-getRoleAdmin-0: check Roleadmin role for OPERATOR_ROLE and DEFAULT_ADMIN_ROLE
      ✔ MW-getRoleMemberCount-0: check the administator and operator count
      ✔ MW-getRoleMember-0: check the administrator is deployer and operators are correct (49ms)
    Administrator: admin role management using standard functions
      ✔ MW-grantRole-0: change administrator (63ms)
      ✔ MW-revokeRole-0: revoke operator (95ms)
      ✔ MW-revokeRole-1: revert if attempting to revoke operator from non admin account (65ms)
    Administrator: changeing Administrator using renounceAdmin
      ✔ MW-renounceAdmin-0: admin change administrator
      ✔ MW-renounceAdmin-1: admin cannot renounce self
      ✔ MW-renounceAdmin-2: renounceAdmin reverts if called by non admin
    Administrator: admin role management using admin functions
      ✔ MW-adminRemoveOperators-0: remove operator
      ✔ MW-adminRemoveOperators-1: remove operator revert if when removing non-operator
      ✔ MW-adminRemoveOperators-2: remove operator reverts if called by non admin
      ✔ MW-adminAddOperators-0: add operator (72ms)
      ✔ MW-adminAddOperators-1: add operator revert if already and operator
      ✔ MW-adminAddOperators-2: add operator reverts if called by non admin
    Administrator: OperatorThreshold management
      ✔ MW-operatorThreshold-0: check the operatorThreshold
      ✔ MW-getRoleMemberCount-1: check the administator and operator count
      ✔ MW-getRoleMember-1: check the administrator is deployer and operators are correct
      ✔ MW-adminChangeOperatorThreshold-0: update OperatorThreshold
      ✔ MW-adminChangeOperatorThreshold-1: update OperatorThreshold fails if called by non Admin
    Administrator: user limit management
      ✔ MW-globalUserLimit-0: check the globalUserLimit
      ✔ MW-adminChangeGlobalUserLimit-0: update globalUserLimit
      ✔ MW-adminChangeGlobalUserLimit-1: update globalUserLimit fails if called by non Admin
    Administrator: user auth limit management
      ✔ MW-globalUserAuthLimit-0: check the globalUserAuthLimit
      ✔ MW-adminChangeGlobalUserAuthLimit-0: update globalUserAuthLimit
      ✔ MW-adminChangeGlobalUserAuthLimit-1: update globalUserAuthLimit fails if called by non Admin
    Administrator: pause functionality
      ✔ MW-paused-0: check the if contract is paused
      ✔ MW-adminPauseMiniWallet-0: pause miniWallet
      ✔ MW-adminPauseMiniWallet-1: pause miniWallet fails if already paused
      ✔ MW-adminPauseMiniWallet-2: adminPauseMiniWallet fails if called by non Admin
      ✔ MW-adminUnpauseMiniWallet-0: unpause miniWallet
      ✔ MW-adminUnpauseMiniWallet-1: unPause miniWallet fails if not paused
      ✔ MW-adminUnpauseMiniWallet-2: adminUnpauseMiniWallet fails if called by non Admin

  MiniWallet
    approve: check approval functionality
      ✔ MW-approve-0: Positive approval test (41ms)

  MiniWallet
    deposit: check deposit functionality
      ✔ MW-deposit-0: Positive deposit test (39ms)
      ✔ MW-deposit-1: Negative deposit test amount greater global user limit
      ✔ MW-deposit-2: Negative deposit test amount two deposits greater global user limit

  MiniWallet
    extra: Additional MiniWallet tests
      ✔ Positive walk-through, deposit, withdraw, approve, send (173ms)
      ✔ checkEventLogs
      ✔ checkReverts

  MiniWallet
    send: check send functionality
      ✔ MW-send-0: Positive send test (65ms)

  MiniWallet
    transfer: check transfer functionality
      ✔ MW-transfer-0: positive test of ERC20 transfer (126ms)
      ✔ MW-transfer-1: positive test of ERC721 transfer (246ms)
      ✔ MW-transfer-2: positive test of ERC1155 transfer (224ms)

  MiniWallet
    withdraw: check withdraw functionality
      ✔ MW-withdraw-0: Positive withdrawal test (43ms)


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

> MiniWallet.sol
> debug/TestTokens.sol
> Enums.sol
> lib/SafeCast.sol

Compilation:
============

Warning: Contract code size exceeds 24576 bytes (a limit introduced in Spurious Dragon). This contract may not be deployable on mainnet. Consider enabling the optimizer (with a low "runs" value!), turning off revert strings, or using libraries.
  --> contracts/MiniWallet.sol:28:1:
   |
28 | contract MiniWallet is Initializable, PausableUpgradeable, AccessControlEnumerableUpgradeable {
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
  --> contracts/MiniWallet.sol:28:1:
   |
28 | contract MiniWallet is Initializable, PausableUpgradeable, AccessControlEnumerableUpgradeable {
   | ^ (Relevant source part starts here and spans across multiple lines).


Generating typings for: 36 artifacts in dir: typechain for target: ethers-v5
Successfully generated 57 typings!
Compiled 33 Solidity files successfully
✅ Generated documentation for 36 contracts


  MiniWallet Admin
    Administrator: role view functions
      ✔ MW-DEFAULT_ADMIN_ROLE-0: check the administrator role
      ✔ MW-OPERATOR_ROLE-0: check the operator role
      ✔ MW-getRoleAdmin-0: check Roleadmin role for OPERATOR_ROLE and DEFAULT_ADMIN_ROLE
      ✔ MW-getRoleMemberCount-0: check the administator and operator count
      ✔ MW-getRoleMember-0: check the administrator is deployer and operators are correct (39ms)
    Administrator: admin role management using standard functions
      ✔ MW-grantRole-0: change administrator (61ms)
      ✔ MW-revokeRole-0: revoke operator (105ms)
      ✔ MW-revokeRole-1: revert if attempting to revoke operator from non admin account (82ms)
    Administrator: changeing Administrator using renounceAdmin
      ✔ MW-renounceAdmin-0: admin change administrator
      ✔ MW-renounceAdmin-1: admin cannot renounce self
      ✔ MW-renounceAdmin-2: renounceAdmin reverts if called by non admin
    Administrator: admin role management using admin functions
      ✔ MW-adminRemoveOperators-0: remove operator (48ms)
      ✔ MW-adminRemoveOperators-1: remove operator revert if when removing non-operator
      ✔ MW-adminRemoveOperators-2: remove operator reverts if called by non admin
      ✔ MW-adminAddOperators-0: add operator (90ms)
      ✔ MW-adminAddOperators-1: add operator revert if already and operator
      ✔ MW-adminAddOperators-2: add operator reverts if called by non admin
    Administrator: OperatorThreshold management
      ✔ MW-operatorThreshold-0: check the operatorThreshold
      ✔ MW-getRoleMemberCount-1: check the administator and operator count
      ✔ MW-getRoleMember-1: check the administrator is deployer and operators are correct
      ✔ MW-adminChangeOperatorThreshold-0: update OperatorThreshold
      ✔ MW-adminChangeOperatorThreshold-1: update OperatorThreshold fails if called by non Admin
    Administrator: user limit management
      ✔ MW-globalUserLimit-0: check the globalUserLimit
      ✔ MW-adminChangeGlobalUserLimit-0: update globalUserLimit
      ✔ MW-adminChangeGlobalUserLimit-1: update globalUserLimit fails if called by non Admin
    Administrator: user auth limit management
      ✔ MW-globalUserAuthLimit-0: check the globalUserAuthLimit
      ✔ MW-adminChangeGlobalUserAuthLimit-0: update globalUserAuthLimit
      ✔ MW-adminChangeGlobalUserAuthLimit-1: update globalUserAuthLimit fails if called by non Admin
    Administrator: pause functionality
      ✔ MW-paused-0: check the if contract is paused
      ✔ MW-adminPauseMiniWallet-0: pause miniWallet
      ✔ MW-adminPauseMiniWallet-1: pause miniWallet fails if already paused
      ✔ MW-adminPauseMiniWallet-2: adminPauseMiniWallet fails if called by non Admin
      ✔ MW-adminUnpauseMiniWallet-0: unpause miniWallet
      ✔ MW-adminUnpauseMiniWallet-1: unPause miniWallet fails if not paused
      ✔ MW-adminUnpauseMiniWallet-2: adminUnpauseMiniWallet fails if called by non Admin

  MiniWallet
    approve: check approval functionality
      ✔ MW-approve-0: Positive approval test (42ms)

  MiniWallet
    deposit: check deposit functionality
      ✔ MW-deposit-0: Positive deposit test (47ms)
      ✔ MW-deposit-1: Negative deposit test amount greater global user limit
      ✔ MW-deposit-2: Negative deposit test amount two deposits greater global user limit

  MiniWallet
    extra: Additional MiniWallet tests
      ✔ Positive walk-through, deposit, withdraw, approve, send (176ms)
      ✔ checkEventLogs
      ✔ checkReverts

  MiniWallet
    send: check send functionality
      ✔ MW-send-0: Positive send test (76ms)

  MiniWallet
    transfer: check transfer functionality
      ✔ MW-transfer-0: positive test of ERC20 transfer (191ms)
      ✔ MW-transfer-1: positive test of ERC721 transfer (308ms)
      ✔ MW-transfer-2: positive test of ERC1155 transfer (305ms)

  MiniWallet
    withdraw: check withdraw functionality
      ✔ MW-withdraw-0: Positive withdrawal test (42ms)


  47 passing (6s)

-------------------|----------|----------|----------|----------|----------------|
File               |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------|----------|----------|----------|----------|----------------|
 contracts/        |      100 |    68.42 |      100 |       92 |                |
  MiniWallet.sol |      100 |    68.42 |      100 |       92 |... 436,479,496 |
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
