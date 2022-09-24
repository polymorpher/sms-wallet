# Overview

This document (work-in-progress) describes the features and commits associated with them, so far for work associated with MiniWallet, NFTIDs, and NFT launch templates. 

Each feature has a mock branch that can be reviewed. You will also find sections describing testing and deployment.

# Features

This section gives an overview of the features and github branches and pull requests associated with them.

## Github Current State

**Issues**

- MiniWallet - Launch Task List [#13](https://github.com/polymorpher/sms-wallet/issues/13) has been used to track work streams open PR's and completed Items. It also has some development logs and status updates.

**Pull Requests**

- Miniv0 [#14](https://github.com/polymorpher/sms-wallet/pull/14): Contains the latest reviewed code. The latest complete review was performed by @polymorpher on Septebmer 12th. It is thought that this 

**Branches**

- [miniV0](https://github.com/polymorpher/sms-wallet/tree/miniV0): This branch has the latest reviewed code. It can be reverted to a specific commit and then pruned for miniwallet only functionality. It is though that [commit 7f3c01b](https://github.com/polymorpher/sms-wallet/pull/14/commits/7f3c01bef26b9ba484ed47d1cc4704425d95443b) which is the latest commit before the full review on September 12th is a good starting Baseline.
- [jw-proxy-tmp](https://github.com/polymorpher/sms-wallet/tree/jw-proxy-tmp): This holds the latest code, including work from all streams. It can be used to `cherry-pick` commits or manually merge code for each of the workstreams into their own branches.


**Approach**

Below is an approach for review and discussion:
1. Identify Baseline: It is proposed that [commit 7f3c01b](https://github.com/polymorpher/sms-wallet/pull/14/commits/7f3c01bef26b9ba484ed47d1cc4704425d95443b) which is the latest commit before the full review on September 12th is a good starting Baseline.
2. The MiniV0 can be reverted to that commit. (For the purposes of this document we have created seperate branches using this commit as the starting point)
3. Below you will find a write up of the different workstreams, features they include and the branches and commits required.
4. We will take the existing code base and prune it to just have mini wallet as a starting point (the complete code base is under jw-proxy-tmp)
4. Applying any mini wallet changes and then handing that over for review and merge.
5. Continue finalizing any work for the other streams on jw-proxy-tmp
6. After mini wallet is merged creating new PRs as needed on new branches.

## Work Streams

### Core mini-wallet (server, contract, tests) 

These are ready for merge

**Key Features**

- MiniWallet Contract: Allows users to deposit, withdraw and approve native tokens for creators. Creators can request operators to send approved funds and transfer approved nfts from users.
- MiniWallet Server: Allows users and creators to check their balances. Allows creators to request operators to send approved funds from users.
- MiniWallet Tests: Coverage of all MiniWallet features.

**Branch and commits v0**

- Branch is [ws-miniwallet-v0](https://github.com/polymorpher/sms-wallet/tree/ws-miniwallet-v0)
- Commits
  - Starting Baseline [commit 7f3c01b](https://github.com/polymorpher/sms-wallet/pull/14/commits/7f3c01bef26b9ba484ed47d1cc4704425d95443b)
  - Copying of devlog [commit 6b246cb](https://github.com/polymorpher/sms-wallet/commit/6b246cb6fb09ff4d088e0f955a0cb1430dcf100a)
  - ignore deployments folder [commit 6da449f](https://github.com/polymorpher/sms-wallet/commit/6da449f3e90797e473b9131f7a7870fd2c779892)
  - Pruning of MiniId and MiniNFTs [commit 959ae0f](https://github.com/polymorpher/sms-wallet/commit/959ae0f650014cfc014e9db72403da0241fa6e19)

**Branch and commits v0.1**
- Branch is [ws-miniwallet-v0.1](https://github.com/polymorpher/sms-wallet/tree/ws-miniwallet-v0.1)
- Pull Request is [ws-miniwallet-v0.1 MiniWallet Functionality](https://github.com/polymorpher/sms-wallet/pull/17) 
- Commit Summary
  - Ensure MiniWallet and MiniServer can be validated against ethLocal
  - Update config so testing and deploy work on hardhat
  - Improve Proxy based on Feedback and ensure tests use Proxies
  - Feeback on PR
    - Automatic population of contract ABIs for miniserver
    - Rewriting test contracts
    - Removal of dummy URL's in test contrcts

**Outstanding Items**

* Replace Deployment with [native deployment](https://github.com/polymorpher/sms-wallet/blob/jw-proxy-tmp/miniwallet/deploy/001_deploy_miniWallet.ts) will allow us to remove the unnecessary population of [ADMIN_SLOT](https://github.com/polymorpher/sms-wallet/blob/jw-proxy-tmp/miniwallet/contracts/miniWallet/MiniWallet.sol#L377)
* Review MiniProxy.sol to ensure that we are happy with this UUPS compliant proxy. If we decide to change the proxy at a later point we will need to update contract addresses in miniserver and potentially other deployments.

**Future Work**

* Multi-call functionality for support of multiple transactions such as approvals.
* Update contract testing to include administrative functions and what happens under different scenarios such as miniWallet paused.

**Refactor Notes**

```
# Create Initial Branch
git checkout -b ws-miniwallet-v0 7f3c01b
rm -rf miniwallet/contracts/deployments/
rm -rf miniwallet/deployments/ethLocal/solcInputs/a0b2c6f4b5ebb656f9859f4e71546fc4.json
rm -rf miniwallet/env/
gs
git push --set-upstream origin ws-miniwallet-v0
```

### mini-wallet deployment and upgrade scripts

There needs to be some improvement over the level of control on the deploy and upgrade processes. Most likely, we will be unable to simply just use hardhat calls or plugins. We should also store the addresses of proxy, logic contract, and storage slots, instead of merely logging them.

**Key Features**

- Deterministic Deployments - For Proxy Contracts
- LightWeight Persistence of Artifacts 
- Multichain/MultiContract Deployment Process

**Branch and commits**

**Outstanding Items**

* [PROXY Enhancements](https://github.com/polymorpher/sms-wallet/blob/ws-miniwallet-v0/miniwallet/devlog/PROXY.md): Including Deterministic Deployments and Persistence of artifacts.
* [Configuration Enhancements](https://github.com/polymorpher/sms-wallet/blob/main/miniwallet/devlog/CONFIGURATION.md): ability to independently deploy (on multiple chains) and test each work stream.
* Parameterizing callData for tests
* Directly generating calldata using abi encoding similar to what is done in one-wallet lib


### mini1155, 721, and related deployment scripts and tests

There needs to be some sanitization and maybe some simplification on tests. It is ready for merging.

**Key Features**

* Airdropping NFT Collectibles by the operators using Mini721: these are NFT collections airdropped by Operators to each registered user. For the initial phase we will use minion images, and metadata attributes including tokenId, phone numbers, addresses, and country codes.

* Friends and Fans: these NFTs can be minted by MiniID NFT holders to friends and fans. There is an 1-to-1 correlation between MiniID tokenId and Mini1155 tokenId. A user may issue multiple Mini1155 tokens using the same token ID to any address. The functionality could be thought as a friends list. It may be used in events, where owners may issue these tokens ahead of the event, and burn them afterwards. The metadata attributes of these tokens could include token Id, phone numbers, addresses, and country codes.

* Creator NFT Collections: these are NFT collections (Mini721C) created by creators, which could have its own smart contract factory. For the initial phase, we will use minion images as the placeholder.

* Creator Access Passes: these are NFT Access Passes (Mini1155C) sent to users by creators, which could have its own smart contract factory.

**Branch and commits**

[TODO: this section is incomplete]

**Outstanding Items**

### miniID related and other WIP stuff

[TODO: this section is incomplete]

**Key Features**

MiniID: Soulbound Token (assigned to a phone number, cannot be transferred), 1 per phone number. 
* Displayable as a QR Code which encapsulates information including TokenId, Phone, Address, Country.

**Branch and commits**

[TODO: this section is incomplete]

**Outstanding Items**
* [Signup Flow](https://github.com/polymorpher/sms-wallet/blob/main/miniwallet/devlog/NFTID.md#sign-up-flow)
* [Airdrop Flow](https://github.com/polymorpher/sms-wallet/blob/main/miniwallet/devlog/NFTID.md#airdrop-flow)
* QR Code Generation for displaying miniID in frontend UI

### Documentations (NFTID.md, PROXY.md)

[TODO: this section is incomplete]

# Deployment

## Infrastructure

For local testing, one can use the following emulators

* [Twilio](https://console.twilio.com/?frameUrl=%2Fconsole%3Fx-target-region%3Dus1)
* [Google Cloud Datastore](https://console.cloud.google.com/datastore/entities;kind=nft_dev;ns=sms-wallet/query/kind?project=sms-wallet-00)

One could also use the following tools which have frontend UIs.

* [Metamask](chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html) : Used to fund the sms-wallets from the admin account deployed with Ganache `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
* [sms-wallet](https://localhost:3100/): Used for user and creator frontend testing
* [sms-demo](https://localhost:3099/): used to create miniwallet approvals and funding requests

## Sample Aliases from John's Bash Profile

```
# Ganache 
alias ganachem='ganache -m "test test test test test test test test test test test junk"'

# twilio aliases
alias tmb='twilio api:core:messages:create --from "+14158401410" --to "+1
alias tmp='twilio api:core:messages:create --from "+14158401410" --to "+17372327333" --body "p 6505473175 0.1"'

# one-wallet aliases
alias cdo="cd /Users/john/one-wallet; pwd"
alias cdow="cd /Users/john/one-wallet/one-wallet; pwd"
alias cdos="cd /Users/john/one-wallet/sms-wallet; pwd"

# git commands
alias gitll='git log --pretty=oneline'
alias ga="git add ."
alias gb="git branch -a"
alias gcm="git commit -m"
alias gm="git checkout master"
alias gd="git diff"
alias gll="git log --pretty=oneline"
alias gfu="git fetch upstream"
alias gp="git push"
alias gs="git status"
alias grv="git remote -v"
alias gmu="git checkout master; git fetch upstream; git merge upstream/master; git status"

```

## Local deployment

Tips: tools such as iterm2 could be helpful for creating separate windows for each tool and each test process.

### gancache, port:8545

```
cdos
ganachem
#deploy miniwallet (separate window) and check settings in .env (miniserver)
cdos
cd miniwallet
yarn deploy --network ethlocal
```

### MetaMask

You could import testing accounts to MetaMask to manage the funds

### Google Datastore, port:9000

```
# https://cloud.google.com/datastore/docs/tools/datastore-emulator#starting_the_emulator
# https://stackoverflow.com/questions/61006211/cannot-view-data-from-gcp-datastore-firestore-in-browser-when-using-emulator

gcloud beta emulators datastore start --host-port=localhost:9000

# Set and unset the environment variables so sms-wallet writes locally
gcloud beta emulators datastore env-init

gcloud beta emulators datastore env-unset

# Deleting the local gcloud db 
cd /Users/john/.config/gcloud/emulators/datastore
rm -rf WEB-INF
```

### sms-wallet miniserver, http port:3101 https port:8444

```
cdos
cd miniserver 
yarn debug
```


### sms-wallet server, http port:3000 https port:8443

```
cdos
cd server 
yarn debug
```

### sms-wallet client, https port: 3100

```
cdos
cd client
yarn debug
```

### sms-wallet demo, https: port 3099

```
cdos
cd demo
cd yarn debug
```

### ngrok, allows inbound requests to local sms-server

```
cd /Applications
./ngrok http 3101
```

### twilio, connect incoming messages to local server

```
cd /Applications
twilio phone-numbers:update +17372327333 --sms-url https://04ac-2601-647-4701-35c0-00-4c88.ngrok.io/sms
```

## Testing

Here is an overview of the tests usually performed during the development

**Smart Contract Testing**

- `yarn deploy`: Tests deployment to hardhat
- `yarn test`: runs smart contract tests (MiniWallet, MiniId, Mini721, Mini1155)
- `yarn coverage`: runs smart contract testing coverage 

**Deploy local infrastructure**

- Deploy all the local infrastucture [see above]

**End-to-End Testing**

- `yarn deploy ethlocal` : Deploy all the contracts and mint test NFT's 
- Reset metamask funding account
- Transfer 40 ETH from admin to sms-wallet user `0x143A933E79931006b3Eb89cBc938587546faF159`
- Transfer 5 ETH fROM user to creator
- [user deposits 10 ETH and approves 1 ETH for creator](https://localhost:3100/call?amount=10&callback=aHR0cHM6Ly9sb2NhbGhvc3Q6MzA5OS9jYWxsYmFjaw%3D%3D&calldata=eyJtZXRob2QiOiJhcHByb3ZlKGFkZHJlc3MsdWludDI1NikiLCJwYXJhbWV0ZXJzIjpbeyJuYW1lIjoic3BlbmRlciIsInR5cGUiOiJhZGRyZXNzIiwidmFsdWUiOiIweDU4YkI4YzdEMmM5MGRGOTcwZmIwMWE1Y0QyOWM0MDc1QzQxZDNGRkIifSx7Im5hbWUiOiJhbW91bnQiLCJ0eXBlIjoidWludDI1NiIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9XX0%3D&caller=Token%20Warrior&comment=Fund%20MiniWallet%2010%20ETH%20and%20approve%201%20ETH%20for%20creator%200x58bB8c7D2c90dF970fb01a5cD29c4075C41d3FFB&dest=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512) 
- `tmb` checks users balance, responses can be viewed in the [twilio monitoring console](https://console.twilio.com/us1/monitor/logs/sms?frameUrl=%2Fconsole%2Fsms%2Flogs%3Fx-target-region%3Dus1&currentFrameUrl=%2Fconsole%2Fsms%2Flogs%3F__override_layout__%3Dembed%26bifrost%3Dtrue%26x-target-region%3Dus1)
- `tmp` user sends funds to the creator from the user's mini wallet. The responses can be viewed in the [twilio monitoring console](https://console.twilio.com/us1/monitor/logs/sms?frameUrl=%2Fconsole%2Fsms%2Flogs%3Fx-target-region%3Dus1&currentFrameUrl=%2Fconsole%2Fsms%2Flogs%3F__override_layout__%3Dembed%26bifrost%3Dtrue%26x-target-region%3Dus1)
- Transfer 5 ETH from user to creator using the miniwallet
- Add the miniID, mini721 and mini1155 tokens to both the user and creator UI (note: you can use the browser in separate sandboxes, one for the user, and another for the creator) 


