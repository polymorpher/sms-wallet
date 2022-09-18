# Overview

We would like to issue an NFT to users when they sign up for SMS Wallet, and associate their phone number to the NFT. The NFT may be used later for identity Vvrification. SMS Wallet could be attesting to the digital identity of the creators and users.

## Considerations

* Should the user pay for the gas costs for minting?
* Use of multisig wallets for the operators
* Supporting multiple operators minting the NFTs
* Information encoded in the QR code image, such as chainId and wallet address
* Information in metadata, such as country and region
* Upgradeability for minting and NFT contracts


## Sign up flow

A semi-protected API can be added on miniwallet server for this. The API can be called by the client, but the client should provide its address and a valid time-limited signature. The miniwallet server can then call the server backend (or simply lookup from datastore) and verify the address is indeed a registered user, before issuing the NFT. [comment is here](https://github.com/polymorpher/sms-wallet/issues/10#issuecomment-1236012684)

An alternate approach is the following, where validating signatures become optional: duration registeration, the server calls a miniserver endpoint API to create the NFT associated with the phone number of the registered user. Miniserver queries the datastore to get the address of the user. The miniserver checks that the user does not have an existing NFTId (`tokensOfOwner(address) = 0`), and if so, it generates the corresponding metadata and persists the information in an image, before minting a new token to the address.

## Airdrop flow

For existing users, the NFTs can be airdropped using a script that does the following:

1. Read registered users from the datastore and collect all addresses.
2. Create and persist metadata and images for each address.
3. Create a multicall batching multiple calls of `CommunityMint` where each call mints the NFT for each user's address.



# Phase 1 Implementation and Data 

## Actors

We model three actors

**Operator**(+1 737 232 7333): The SMS Operator has multiple operator accounts for test purposes. However it’s unique identifier in the system is it’s phone number and the registered address associated with it.

![The Operator](https://modulo.mypinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/0.png)


**Creator**(+1 650 547 3175): The Creator has one account and requests authorizations from users via the miniwallet and asks operators to make payments

![The Creator](https://modulo.mypinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/1.png)

**Community Member**(+1 415 840 1410): Community Member uses SMS Wallet to hold various tokens and NFTs. They can deposit funds and NFTs in the miniwallet and approve operators to automatically transfer those funds (e.g. to creators) when needed.

![The First Community Member](https://modulo.mypinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/2.png)

## Tokens

**MiniID**: [Soulbound](https://vitalik.ca/general/2022/01/26/soulbound.html) Token (assigned to a phone number, cannot be transferred), 1 per phone number. Displayable as a QR Code which encapsulates information including TokenId, Phone, Address, Country.

**Notes(@polymorpher)**: need to take care of privacy issues here and not to disclose user's information publicly unless they explicit indicate they want to. Same concern applies for all tokens below where private information is encoded in the token.

**Mini721**: These are NFT collections airdropped by Operators to each Registered User. For Initial Phase we will use [Minion Images](https://pngimg.com/images/heroes/minions). Attributes (TokenId, Phone, Address, Country)

**Mini1155**: Minted by MiniID Holders to friends/fans 1 to 1 correlation between MiniID TokenId and Mini1155 TokenId (one can issue multiple Mini1155 tokens of the same token ID to any address). Think of it as a friends list. It could also be event based, i.e. issued by the Owner before an event, and burned afterwards. Metadata attributes may include: IssuerTokenId, IssuerPhone, IssuerAddress, IssuerCountry

**Mini721C**: These are NFT collections created by Creators (could have its own factory). For Initial Phase we will use [Minion Images](https://pngimg.com/images/heroes/minions)

**Mini1155C**: These are NFT Access Passes Given by Creators (could have its own factory)

## [Attestations](https://ethereum.org/en/decentralized-identity/#what-are-attestations)

Each MiniId is effectively an [on-chain attestation](https://ethereum.org/en/decentralized-identity/#onchain-attestations) by the operator that this token is owned by this phone number. 

Each Mini1155 is effectively an on-chain attestation that the Mini1155 holder is a friend or fan of the MiniID owner.

Additional [off-chain attestations](https://ethereum.org/en/decentralized-identity/#offchain-attestations-with-persistent-access) can be developed as the ecosystem evolves.

## **Local Test Data**

**Operator**(+1 737 232 7333) 0

**Community Member**(+1 415 840 1410) 1 (johnwhitton)

**Creator**(+1 650 547 3175) 2 (john.a.whitton)

[Minions Images](https://gateway.pinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx)

**Notes on Test Data**

For our user (+14158401410 address 0x864966c7483155C090BB07AB3Fb130c159c18daf) we have issued the following Tokens

1. MiniID: There Soulbound Identity
2. Mini721: A collectible issued to them (Minion Image)
3. Mini1155: A friends or fans token issued from the operator
4. Mini1155: A friends or fans token issued by the creator

The sms-wallet UI looks as follows (on a phone it shows the first image and then you can scroll up and down)

**Notes(@polymorpher)**: Take a screenshot using mobile view?

![Screenshot 2022-09-10 at 11 51 05 AM](https://user-images.githubusercontent.com/1572027/189497841-7b218e3f-8286-4dcb-854e-7f19ba52722e.png)

For our creator (+16505473175 address 0x7A78C8A0F61a9015440ac970D390f596836C9872) we have issued the following Tokens:

1. MiniID: There Soulbound Identity
2. Mini721: A collectible issued to them (Minion Image)
3. Mini1155: A friends or fans token issued from the operator

![Screenshot 2022-09-10 at 12 04 45 PM](https://user-images.githubusercontent.com/1572027/189498200-571c7baf-6488-40b2-b477-6cc5475833d1.png)


## Sample Metadata

[MinID](https://gateway.pinata.cloud/ipfs/Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/MiniID/2) (Image URL to be replaced with QR Code)

**Notes(@polymorpher)**: These metadata needs to be redeployed. Use IPFS URI for links instead of HTTPS pointing to a specific gateway, otherwise once the gateway is gone or hacked, the metadata is no longer reliable.

```
{
    "description": "MiniID +1 415 840 1410 (Soulbound)",
    "external_url": "https://sms-wallet.xyz/miniID/2",
    "image": "https://1wallet.mypinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/2.png",
    "name": "MiniID +1 415 840 1410",
    "attributes": [
        {
            "trait_type": "TokenId",
            "value": "2"
        },
        {
            "trait_type": "Phone",
            "value": "+1 415 840 1410"
        },
        {
            "trait_type": "Address",
            "value": "0x864966c7483155C090BB07AB3Fb130c159c18daf"
        },
        {
            "trait_type": "Country",
            "value": "US"
        }
    ]
}
```

[Min721](https://gateway.pinata.cloud/ipfs/Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini721/2) 

https://gateway.pinata.cloud/ipfs/Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini721

```
{
    "description": "Collectible +1 415 840 1410",
    "external_url": "https://sms-wallet.xyz/mini721/2",
    "image": "https://1wallet.mypinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/2.png",
    "name": "Collectible +1 450 840 1410",
    "attributes": [
        {
            "trait_type": "TokenId",
            "value": "0"
        },
        {
            "trait_type": "Phone",
            "value": "+1 415 840 1410"
        },
        {
            "trait_type": "Address",
            "value": "0x864966c7483155C090BB07AB3Fb130c159c18daf"
        },
        {
            "trait_type": "Country",
            "value": "US"
        }
    ]
}
```

[Mini1155](https://gateway.pinata.cloud/ipfs/Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155/2) (Image URL to be replaced with QR Code)

https://gateway.pinata.cloud/ipfs/Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/Mini1155

```
{
    "description": "Friend of  +1 415 840 1410(Transferable)",
    "external_url": "https://sms-wallet.xyz/mini1155/2",
    "image": "https://1wallet.mypinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/2.png",
    "name": "Friend of +1 415 840 1410",
    "attributes": [
        {
            "trait_type": "TokenId",
            "value": "2"
        },
        {
            "trait_type": "Phone",
            "value": "+1 415 840 1410"
        },
        {
            "trait_type": "Address",
            "value": "0x864966c7483155C090BB07AB3Fb130c159c18daf"
        },
        {
            "trait_type": "Country",
            "value": "US"
        }
    ]
}
```

## Technical Components

### Frontend

* Make DummyNFTs configurable [here](https://github.com/polymorpher/sms-wallet/blob/main/client/src/pages/NFT.jsx#L295)
* Add MiniID to DummyNFTs 

### Contract

Contract base can be generated using [OpenZepplin Solidity Wizard](https://wizard.openzeppelin.com/#erc721) and then enhanced for the following

* No limit on the number of NFT tokens
* Operator logic added; Limit token minting to operator only
* Minting capped at only one token per address
* Approval mechanism for allowing other users to use your identity
* Remove sales logic
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



