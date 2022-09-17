# Overview
This document describes the features and commits associated with them.
Each Feature has a mock branch that can be reviewed.You will also find sections describing testing and deployment.

# Features
This section gives an overview of the features and github branches and pull requests associated with them.

## Github Current State

**Issues**
- MiniWallet - Launch Task List [#13](https://github.com/polymorpher/sms-wallet/issues/13)] has been used to track work streams open PR's and completed Items. It also has some development logs and status updates.

**Pull Requests**
- Miniv0 [#14](https://github.com/polymorpher/sms-wallet/pull/14): Contains the latest reviewed code. The latest complete review was performed by @polymorpher on Septebmer 12th. It is thought that this 
**Branches**
- [MiniV0](https://github.com/polymorpher/sms-wallet/tree/miniV0): This branch has the latest reviewed code. It can be reverted to a specific commit and then pruned for miniwallet only functionality. It is though that [commit 7f3c01b](https://github.com/polymorpher/sms-wallet/pull/14/commits/7f3c01bef26b9ba484ed47d1cc4704425d95443b) which is the latest commit before the full review on September 12th is a good starting Baseline.
- [jw-proxy-tmp](https://github.com/polymorpher/sms-wallet/tree/jw-proxy-tmp): This holds the latest code, including work from all streams. It can be used to `cherry-pick` commits or manually merge code for each of the workstreams into their own branches.


**Approach**
Below is an approach for review and discussion
1. Identify Baseline: It is though that [commit 7f3c01b](https://github.com/polymorpher/sms-wallet/pull/14/commits/7f3c01bef26b9ba484ed47d1cc4704425d95443b) which is the latest commit before the full review on September 12th is a good starting Baseline.
2. The MiniV0 can be reverted to that commit. (For the purposes of this document we have created seperate branches using this commit as the starting point)
3. Below you will find a write up of the different workstreams, features they include and the branches and commits required.
4. We will take the existing code base and prune it to just have mini wallet as a starting point (the complete code base is under jw-proxy-tmp)
4. Applying any mini wallet changes and then handing that over for review and merge.
5. Continue finalizing any work for the other streams on jw-proxy-tmp
6. After mini wallet is merged creating new PRs as needed on new branches.

## Features / Work Streams

### core mini-wallet (server, contract, tests) 
These are ready for merge

**Key Features**
- MiniWallet Contract
- MiniWallet Server
- MiniWallet Tests

**Branch and commits**
- Branch is [ws-miniwallet-v0]
- Commits
  - Starting Baseline [commit 7f3c01b](https://github.com/polymorpher/sms-wallet/pull/14/commits/7f3c01bef26b9ba484ed47d1cc4704425d95443b)
  - Copying of devlog [commit]
  - Pruning of MiniId and MiniNFTs [commit]
  - Adding in Proxy Changes [commit]
  - Additional cleanup [commit]

**Outstanding Items**

**Future Work**

### mini-wallet deployment and upgrade scripts
These needs some improvement on fine-control over deploy and upgrade process (most likely can't just use simple hardhat calls / plugins anymore) and storing (not just logging) the addresses of proxy, logic, and storage

**Key Features**

**Branch and commits**

**Outstanding Items**


### mini1155, 721, and related deployment scripts and tests
These need some sanitization and maybe some simplification on tests. They are pretty much ready for merge

**Key Features**

**Branch and commits**

**Outstanding Items**

### miniID related and other WIP stuff
These are incomplete
**Key Features**

**Branch and commits**

**Outstanding Items**

### documentations (NFTID.md, PROXY.md)
These need further review and some revision 

**Key Features**

**Branch and commits**

**Outstanding Items**


# Deployment

## Infrastructure

For Local Testing you can register for the following accounts

* [Twilio](https://console.twilio.com/?frameUrl=%2Fconsole%3Fx-target-region%3Dus1)
* [Google Cloud Datastore](https://console.cloud.google.com/datastore/entities;kind=nft_dev;ns=sms-wallet/query/kind?project=sms-wallet-00)

Typically when testing locally you can use the following UI's
* [Metamask](chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html) : Used to fund the sms-wallets from the admin account deployed with Ganache `0x8875fc2A47E35ACD1784bB5f58f563dFE86A8451`
* [sms-wallet](https://localhost:3100/): Used for user and creator frontend testing
* [sms-demo](https://localhost:3099/): used to create miniwallet approvals and funding requests

## Sample Aliases from John's Bash Profile

```
# Ganache 
alias ganachem='ganache -m "test test test test test test test test test test test junk"'

# twilio aliases
alias tmb='twilio api:core:messages:create --from "+14158401410" --to "+17372327333" --body "b"'
alias tmp='twilio api:core:messages:create --from "+16505473175" --to "+17372327333" --body "p 4158401410 0.1"'
alias tmps='twilio api:core:messages:create --from "+14158401410" --to "+17372327333" --body "p 4158401410 0.1"'
alias tmpbp='twilio api:core:messages:create --from "+14158401410" --to "+17372327333" --body "p 4158401999 0.1"'

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

## Launching the infrastructure
If running this locally on a mac you can use a tool like iterm2 with separate windows for each instance.

### gancache port:8545
```
cdos
ganachem
#deploy miniwallet (separate window) and check settings in .env (miniserver)
cdos
cd miniwallet
yarn deploy --network ethLocal
```

### Reset metamask account and fund wallet

### Google DataStore Locally port:9000
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

### sms-wallet miniserver http port:3101 https port:8444
```
cdos
cd miniserver 
yarn debug
```

### sms-wallet server http port:3000 https port:8443
```
cdos
cd server 
yarn debug
```

### sms-wallet client https port: 3100
```
cdos
cd client
yarn debug
```

### sms-wallet demo https: port 3099
```
cdos
cd demo
cd yarn debug
```

### ngrok allows inbound requests to local sms-server
```
cd /Applications
./ngrok http 3101
```

### twilio connect incoming messages to local server
```
cd /Applications
twilio phone-numbers:update +17372327333 --sms-url https://c802-2601-647-4701-35c0-00-4c88.ngrok.io/sms
```

## Testing
Following is an overview of the tests usually done

**Smart Contract Testing**

- `yarn deploy`: Tests deployment to hardhat
- `yarn test`: runs smart contract tests (MiniWallet, MiniId, Mini721, Mini1155)
- `yarn coverage`: runs smart contract testing coverage 

**Deploy local infrastructure**
- Deploy all the local infrastucture [see above]

**End to End Testing**
- `yarn deploy ethLocal` : Deploy all the contracts and mint test NFT's 
- Reset metamask funding account
- Transfer 20 ETH to sms-wallet user
- Transfer 20 ETH to sms-wallet creator
- sms-user approves and funds miniwallet
- `tmb` checks users balance, responses can be viewed in the [twilio monitoring console](https://console.twilio.com/us1/monitor/logs/sms?frameUrl=%2Fconsole%2Fsms%2Flogs%3Fx-target-region%3Dus1&currentFrameUrl=%2Fconsole%2Fsms%2Flogs%3F__override_layout__%3Dembed%26bifrost%3Dtrue%26x-target-region%3Dus1)
- `tmp` creator requests user to fund them,, responses can be viewed in the [twilio monitoring console](https://console.twilio.com/us1/monitor/logs/sms?frameUrl=%2Fconsole%2Fsms%2Flogs%3Fx-target-region%3Dus1&currentFrameUrl=%2Fconsole%2Fsms%2Flogs%3F__override_layout__%3Dembed%26bifrost%3Dtrue%26x-target-region%3Dus1)
- Add the miniID, mini721 and mini1155 tokens to both the user and creator UI (note: you can use google chrome with separate windows and profiles one for the user another for the creator) 


