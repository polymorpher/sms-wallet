# Overview

When registering their phone number for sms-wallet we would like to issue an NFT to users and creators which they can use later for identity Verification.

In terms of Decentralized Identity. SMS-Wallet is attesting to the digital identity of the creators and users.

## Registration Flow
A semi-protected API can be added on miniwallet server for this. The API can be called by the client, but the client should provide its address and a valid signature. The miniwallet server can then call the server backend (or simply lookup from datastore) and verify the address is indeed a registered user, before issuing the NFT. [comment is here](https://github.com/polymorpher/sms-wallet/issues/10#issuecomment-1236012684)

Alternate approach (validating signature optional)
When registering the server calls the miniserver endpoint apicreate with the phone number of the registered user. Miniserver queries the datastore to get the address of the user. It checks that the user does not have an existing NFTId (`tokensOfOwner(address) = 0`). Generates Metadata and Persist an image. Mints a new token to the address.

## Airdrop Flow
All registered users are read from the datastore. There addresses are collected. Metadata and Images are persisted for each address. A multicall `CommunityMint` is called to iterate through the users minting tokens.

## Technical Components

### Frontend

* Make DummyNFT's configurable [here](https://github.com/polymorpher/sms-wallet/blob/main/client/src/pages/NFT.jsx#L295)
* Add MiniID to DummyNFT's 

### Contract
  * No Limit on Number of NFT Tokens
  * Operator Logic added and Minting of Tokens can only be done by Operator
  * Minting allows only one token per address
  * Approval Mechanism for allowing other users to use your identity
  * Remove Sales Logic
  * Provenance is never frozen
  * Metadata is never frozen

### Contract Configuration
```
NAME=MiniID
SYMBOL=NFTID
TEST_MINI721_DEPLOY_SALES_IS_ACTIVE=false
TEST_MINI721_DEPLOY_METADATA_FROZEN=false
TEST_MINI721_DEPLOY_PROVENANCE_FROZEN=false
TEST_MINI721_DEPLOY_MAX721_TOKENS=1000000000000
TEST_MINI721_DEPLOY_MINT_PRICE=0
TEST_MINI721_DEPLOY_MAX_PER_MINT=1
TEST_MINI721_DEPLOY_BASE_URI=ipfs://QmPcY4yVQu4J2z3ztHWziWkoUEugpzdfftbGH8xD49DvRx/
TEST_MINI721_DEPLOY_CONTRACT_URI=ipfs://Qmezo5wDKz7kHwAPRUSJby96rnCfvhqgVqDD7Zorx9rqy8
```

### Metadata
  * Country 
  * Region

### Image/Avatar 
(Options to generate images include)
* Creation of a QR Code with their address
* Avatar is generated using an [npm module](https://www.google.com/search?q=npm+module+to+generate+avatar)

### Persistence
* [Pintata API](https://docs.pinata.cloud/pinata-api)
* [Pinata Pin File or Directory](https://docs.pinata.cloud/pinata-api/pinning/pin-file-or-directory)
* [Pinata Update Metadata](https://docs.pinata.cloud/pinata-api/pinning/update-metadata)


### MiniServer
* /nftCreate endpoint 
* Signature Verification [see Demo Signature code](https://github.com/polymorpher/sms-wallet/blob/main/demo/src/pages/SignatureDemo.jsx)

# References
  * [Decentralized Identity](https://ethereum.org/en/decentralized-identity/)
  * [SpruceID](https://www.spruceid.dev/) [Wayne Chang](https://www.linkedin.com/in/waynebuilds/)
 



