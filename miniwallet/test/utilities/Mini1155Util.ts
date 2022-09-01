// import { expect } from 'chai'
import { ethers, network } from 'hardhat'

// import { userMint1155, safeTransferFrom1155 } from './utilities'

export async function mini1155configure ({
  mini1155,
  config = {
    revenueAccount: '0xa636a88102a7821b7e42292a4A3920A25a5d49b5',
    maxPerMint: 10,
    mintPrice: ethers.utils.parseEther('0.042'),
    exchangeRatio: 0, // will be 20 after sale
    rareProbabilityPercentage: 1,
    // standard token configuration
    s: {
      tokenId: 1,
      maxSupply: 770,
      personalCap: 10
    },
    // rare token configuration
    r: {
      tokenId: 2,
      maxSupply: 7, // will be 84 after Sale
      personalCap: 1
    }
  }
}) {
  // set the revenue account
  await mini1155.setRevenueAccount(config.revenueAccount)
  // configure standard Token
  await mini1155.setStandardTokenId(config.s.tokenId)
  await mini1155.setMaxSupply(config.s.tokenId, config.s.maxSupply)
  await mini1155.setMaxPersonalCap(config.s.tokenId, config.s.personalCap)
  // await mini1155.setUri(standardTokenId, standardURI)
  // configure rare Token
  await mini1155.setRareTokenId(config.r.tokenId)
  await mini1155.setMaxSupply(config.r.tokenId, config.r.maxSupply)
  await mini1155.setMaxPersonalCap(config.r.tokenId, config.r.personalCap)
  // await mini1155.setUri(rareTokenId, rareURI)
  await mini1155.setRareProbabilityPercentage(config.rareProbabilityPercentage)
  // configure exchange rate
  await mini1155.setExchangeRatio(config.exchangeRatio)
}

export async function mini1155Mint (mini1155, minter, numTokens) {
  const tx = await mini1155
    .connect(minter)['mint(uint256)'](numTokens)
  return tx
}

export async function mini1155OwnerMint (mini1155, minter, tokenId, numTokens) {
  const tx = await mini1155.connect(minter)['mint(address,uint256,uint256,bytes)'](minter, tokenId, numTokens, '0x')
  return tx
}

export async function mini1155SafeTransferFrom (
  mini1155,
  sender,
  receiver,
  tokenId,
  numTokens
) {
  const tx = await mini1155
    .connect(sender)
    .safeTransferFrom(
      sender.address,
      receiver.address,
      tokenId,
      numTokens,
      '0x'
    )
  return tx
}
