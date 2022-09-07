const express = require('express')
const { StatusCodes } = require('http-status-codes')
const router = express.Router()
const { hasUserSignedBody, validateID } = require('../../server/routes/middleware')
const blockchain = require('../blockchain')

router.post('/getid', validateID, async (req, res) => {
  // get MiniId contract
  const { phone, address } = req.processedBody
  let validMiniID
  const miniID = blockchain.getMiniID()
  const tokenCount = await miniID.balanceOf(address)
  if (tokenCount < 1) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: `${phone} address(${address}) has no MiniId` })
  }
  validMiniID.address = miniID.address()
  validMiniID.tokenID = await miniID.tokenOfOwnerByIndex(address, 0)
  validMiniID.tokenURI = await miniID.tokenOfOwnerByIndex(validMiniID.tokenID)

  return res.json({ success: true, miniID: validMiniID })
})

// mint creates an Identity NFT for a user
// Input Parameters
// id: the phone number or address of the user
// signature (optional): a signature from the user
// application (optional) : application to add tracking for
// Returns
// nftID: token address, tokenId, tokenqty (Optional)
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
router.post('/mintID', hasUserSignedBody, async (req, res) => {

})

module.exports = router
