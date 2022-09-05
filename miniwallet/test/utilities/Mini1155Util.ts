import config from '../../config'

export async function mini1155configure ({
  mini1155,
  collectionConfig = config.test.mini1155.collection1
}) {
  // set the revenue account
  await mini1155.setRevenueAccount(collectionConfig.revenueAccount)
  // configure standard Token
  await mini1155.setStandardTokenId(collectionConfig.s.tokenId)
  await mini1155.setMaxSupply(collectionConfig.s.tokenId, collectionConfig.s.maxSupply)
  await mini1155.setMaxPersonalCap(collectionConfig.s.tokenId, collectionConfig.s.personalCap)
  // configure rare Token
  await mini1155.setRareTokenId(collectionConfig.r.tokenId)
  await mini1155.setMaxSupply(collectionConfig.r.tokenId, collectionConfig.r.maxSupply)
  await mini1155.setMaxPersonalCap(collectionConfig.r.tokenId, collectionConfig.r.personalCap)
  await mini1155.setRareProbabilityPercentage(collectionConfig.rareProbabilityPercentage)
  // configure exchange rate
  await mini1155.setExchangeRatio(collectionConfig.exchangeRatio)
}

export async function mini1155Mint (mini1155, minter, numTokens) {
  return await mini1155
    .connect(minter)['mint(uint256)'](numTokens)
}

export async function mini1155OwnerMint (mini1155, minter, tokenId, numTokens) {
  return await mini1155.connect(minter)['mint(address,uint256,uint256,bytes)'](minter, tokenId, numTokens, '0x')
}

export async function mini1155SafeTransferFrom (
  mini1155,
  sender,
  receiver,
  tokenId,
  numTokens
) {
  return await mini1155
    .connect(sender)
    .safeTransferFrom(
      sender.address,
      receiver.address,
      tokenId,
      numTokens,
      '0x'
    )
}
