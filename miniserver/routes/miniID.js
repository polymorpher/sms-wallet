const express = require('express')
const { StatusCodes } = require('http-status-codes')
// const { NFT } = require('../../server/src/data/nft')
const router = express.Router()
// const { hasUserSignedBody } = require('../../server/routes/middleware')
// const sharedUtils = require('../../shared/utils')
const { validateID } = require('./middleware')
const blockchain = require('../blockchain')

// allows an existing user to lookup another user's address by their phone number, iff the phone number exists and the target user does not choose to hide its phone-address mapping (under `hide` parameter in settings)
router.post('/lookup', validateID, async (req, res) => {
  console.log(`req.body: ${JSON.stringify(req.body)}`)
  const { phone, address } = req.processedBody
  return res.json({ phone: phone, address: address })
})

router.post('/getid', validateID, async (req, res) => {
  // get MiniId contract
  const { phone, address } = req.processedBody
  const validMiniID = {}
  const miniID = blockchain.getMiniID()
  //   const tokenCount = await miniID.balanceOf('0x90F79bf6EB2c4f870365E785982E1f101E93b906')
  const tokenCount = await miniID.balanceOf(address)
  if (tokenCount < 1) {
    // return res.status(StatusCodes.BAD_REQUEST).json({ error: `${phone} address(${address}) has no MiniId` })
    return res.json({ success: false, error: `${phone} address(${address}) has no MiniId`, miniID: validMiniID })
  }
  validMiniID.address = await miniID.address
  validMiniID.tokenID = (await miniID.tokenOfOwnerByIndex(address, 0)).toNumber()
  validMiniID.tokenURI = await miniID.tokenURI(validMiniID.tokenID)

  return res.json({ success: true, miniID: validMiniID })
})

// mint creates an Identity NFT for a user
// Input Parameters
// id: the phone number or address of the user
// signature (optional): a signature from the user
// application (optional) : application to add tracking for
// Returns
// nftID: tokenAddress, tokenId, tokenQty (Optional)
// Logic Overview
// Validate the id is a valid SMS id
// Validate the signature is from the address of the ID
// Validate the id does not own an NFTId
// Get the next tokenId available
// Metadata
//  Read baseData URI from Contract (Address is in config)
//  Generate an Image (QR code with chainId and addressId)
//  Generate Metadata
//  Add attributes (country and region)
// Persist Metadata and Image to IPFS
// Operator Mints the token (if this fails retrieve latest token and try again)
// Update SMS Tracking Info
// Return nftId
// router.post('/mintID', validateID, hasUserSignedBody, async (req, res) => {
router.post('/mintID', validateID, async (req, res) => {
  console.log(`req.body: ${JSON.stringify(req.body)}`)
  const { phone, address } = req.processedBody
  let tokenAddress
  let tokenID
  let tokenQty
  return res.json({ phone: phone, address: address, tokenAddress, tokenID, tokenQty })
})

module.exports = router
