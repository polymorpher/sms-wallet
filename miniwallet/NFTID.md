# Overview

When registering their phone number for sms-wallet we would like to issue an NFT to users and creators which they can use later for identity Verification.

In terms of Decentralized Identity. SMS-Wallet is attesting to the digital identity of the creators and users.

## Requirements/Considerations
* Gas Payment (should the user pay for the mint cost)?
* Use of MultiSig Wallets for the Operators
* NFT Contract supports Multiple Operators Minting NFT's
* Image would be useful to support encoding information like chainId and address in qrcode
* Metadata : could store country and region
* NFT Contract should be upgradeable


## Registration Flow
A semi-protected API can be added on miniwallet server for this. The API can be called by the client, but the client should provide its address and a valid signature. The miniwallet server can then call the server backend (or simply lookup from datastore) and verify the address is indeed a registered user, before issuing the NFT. [comment is here](https://github.com/polymorpher/sms-wallet/issues/10#issuecomment-1236012684)

Alternate approach (validating signature optional)
When registering the server calls the miniserver endpoint apicreate with the phone number of the registered user. Miniserver queries the datastore to get the address of the user. It checks that the user does not have an existing NFTId (`tokensOfOwner(address) = 0`). Generates Metadata and Persist an image. Mints a new token to the address.

## Airdrop Flow
All registered users are read from the datastore. There addresses are collected. Metadata and Images are persisted for each address. A multicall `CommunityMint` is called to iterate through the users minting tokens.



# Phase 1 Implementation and Data 

## Actors

We model three actors

**Operator**(+1 737 232 7333): The SMS Operator has multiple operator accounts for test purposes. However it’s unique identifier in the system is it’s phone number and the registered address associated with it. 

**Creator**(+1 650 547 3175): The Creator has one account and requests authorizations from users via the miniwallet and asks operators to make payments

**Community Member**(+1 415 840 1410): Community Member authorizes 

## Tokens

**MiniID**: [Soulbound](https://vitalik.ca/general/2022/01/26/soulbound.html) Token (assigned to Phone Number, can not be transferred) 1 per phone number. QR Code (TokenId, Phone, Address, Country)

**Mini721**: These are NFT collections airdropped by Operators to each Registered User. For Initial Phase we will use [Minion Images](https://pngimg.com/images/heroes/minions). Attributes (TokenId, Phone, Address, Country)

**Mini1155**: Minted by MiniID Holders to friends/fans 1 to 1 correlation between MiniID TokenId and Mini1155 TokenId (can issue many 1155s to Addresses). Think of it as a friends list. Could also be event based an issued and burned by the Owner before and after an event. Attributes (IssuerTokenId, IssuerPhone, IssuerAddress, IssuerCountry)

**Mini721C**: These are NFT collections created by Creators (could have it’s own factory) For Initial Phase we will use [Minion Images](https://pngimg.com/images/heroes/minions)

**Mini1155C**: These are NFT Access Passes Given by Creators (could have it’s own factory)

## [Attestations](https://ethereum.org/en/decentralized-identity/#what-are-attestations)

Each MiniId is effectively an [on-chain attestation](https://ethereum.org/en/decentralized-identity/#onchain-attestations) by the operator that this token is owned by this phone number. 

Each Mini1155 is effectively an on-chain attestation that the Mini1155 holder is a friend/fan of the MiniID owner.

Additional [off-chain attestations](https://ethereum.org/en/decentralized-identity/#offchain-attestations-with-persistent-access) can be developed as the ecosystem evolves.

## **Local Test Data**

**Operator**(+1 737 232 7333) 0

**Community Member**(+1 415 840 1410) 1 (johnwhitton)

**Creator**(+1 650 547 3175) 2 (john.a.whitton)

[Minions Images](https://gateway.pinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx) : [https://gateway.pinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx](https://gateway.pinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx)

## Sample Metadata

[MinID](https://gateway.pinata.cloud/ipfs/QmZ1iHDogTnoEVSFPo1yYYYuPzLhTWuA9pd77C9b5h6cot/MiniID) (Image URL to be replaced with QR Code)
ipfs://QmZ1iHDogTnoEVSFPo1yYYYuPzLhTWuA9pd77C9b5h6cot/MiniID

```
{
    "description": "MiniID +1 737 232 7333 (Soulbound)",
    "external_url": "https://sms-wallet.xyz/miniID/0",
    "image": "https://gateway.pinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/0.png",
    "name": "MiniID +1 737 232 7333",
    "attributes": [
        {
            "trait_type": "TokenId",
            "value": "0"
        },
        {
            "trait_type": "Phone",
            "value": "+1 737 232 7333 "
        }
        {
            "trait_type": "Address",
            "value": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        }
        {
            "trait_type": "Country",
            "value": "US"
        }
    ]
}
```

[Min721](https://gateway.pinata.cloud/ipfs/QmZ1iHDogTnoEVSFPo1yYYYuPzLhTWuA9pd77C9b5h6cot/Mini721) 

ipfs://QmZ1iHDogTnoEVSFPo1yYYYuPzLhTWuA9pd77C9b5h6cot/Mini721

```
{
    "description": "Collectible +1 737 232 7333",
    "external_url": "https://sms-wallet.xyz/mini721/0",
    "image": "https://gateway.pinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/0.png",
    "name": "Collectible +1 737 232 7333",
    "attributes": [
        {
            "trait_type": "TokenId",
            "value": "0"
        },
        {
            "trait_type": "Phone",
            "value": "+1 737 232 7333 "
        }
        {
            "trait_type": "Address",
            "value": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        }
        {
            "trait_type": "Country",
            "value": "US"
        }
    ]
}
```

[Mini1155](https://gateway.pinata.cloud/ipfs/QmZ1iHDogTnoEVSFPo1yYYYuPzLhTWuA9pd77C9b5h6cot/Mini1155) (Image URL to be replaced with QR Code)

[https://gateway.pinata.cloud/ipfs/QmZ1iHDogTnoEVSFPo1yYYYuPzLhTWuA9pd77C9b5h6cot/Mini1155](https://gateway.pinata.cloud/ipfs/QmZ1iHDogTnoEVSFPo1yYYYuPzLhTWuA9pd77C9b5h6cot/Mini1155)

```
{
    "description": "MiniID +1 737 232 7333 (Soulbound)",
    "external_url": "https://sms-wallet.xyz/miniID/0",
    "image": "https://gateway.pinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/0.png",
    "name": "MiniID +1 737 232 7333",
    "attributes": [
        {
            "trait_type": "TokenId",
            "value": "0"
        },
        {
            "trait_type": "Phone",
            "value": "+1 737 232 7333 "
        }
        {
            "trait_type": "Address",
            "value": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        }
        {
            "trait_type": "Country",
            "value": "US"
        }
    ]
}
```

## Technical Components

### Frontend

* Make DummyNFT's configurable [here](https://github.com/polymorpher/sms-wallet/blob/main/client/src/pages/NFT.jsx#L295)
* Add MiniID to DummyNFT's 

### Contract
Contract base can be generated using [OpenZepplin Solidity Wizard](https://wizard.openzeppelin.com/#erc721) and then enhanced for the following
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
  * [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
  * [Chainlink NFT Tutorial](https://blog.chain.link/build-deploy-and-sell-your-own-dynamic-nft/)
  * [Sample NFT Generation CodeBase](https://github.com/PatrickAlphaC/dungeons-and-dragons-nft)



