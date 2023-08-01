import express from 'express'
import utils from '../utils.ts'
import { StatusCodes } from 'http-status-codes'
import { NFT } from '../src/data/nft.ts'
import sharedUtils from '../../shared/utils.ts'
import { hasUserSignedBody } from './middleware.ts'

const router = express.Router()
router.post('/track', hasUserSignedBody, async (req, res) => {
  const { body: nfts } = req.body
  const u = req.user
  if (!(nfts?.length > 0)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need to track more than one' })
  }
  for (const nft of nfts) {
    const {
      contractAddress,
      tokenId,
      tokenType
    } = nft
    if (!utils.isValidAddress(contractAddress) || !sharedUtils.isValidTokenType(tokenType) || !sharedUtils.isValidTokenId(tokenId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `bad nft entry: ${JSON.stringify(nft)}` })
    }
  }
  try {
    const tracked = await NFT.batchTrack({ address: u.address, nfts })
    return res.json({ success: true, numTracked: tracked.length })
  } catch (ex) {
    console.error(ex)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'failed to track nfts, please try again later' })
  }
})

// TODO: rate limit
router.post('/lookup', async (req, res) => {
  const { address, contractAddress } = req.body
  if (contractAddress && !utils.isValidAddress(contractAddress)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: `bad contractAddress ${contractAddress}` })
  }
  try {
    const nfts = await NFT.getAllTracked({ address, contractAddress })
    res.json(nfts)
  } catch (ex) {
    console.error(ex)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'failed to get nfts, please try again later' })
  }
})

router.post('/untrack', hasUserSignedBody, async (req, res) => {
  const { body: { contractAddress, tokenId } } = req.body
  const { address } = req.user
  if (!utils.isValidAddress(contractAddress) || !sharedUtils.isValidTokenId(tokenId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad parameters', contractAddress, tokenId })
  }
  try {
    const removed = await NFT.untrack({ address, contractAddress, tokenId })
    if (!removed) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'nft cannot be hidden, or does not exist' })
    }
    res.json({ success: true, removed })
  } catch (ex) {
    console.error(ex)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'failed to get nfts, please try again later' })
  }
})

export default router
