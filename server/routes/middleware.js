const { phone } = require('phone')
const { StatusCodes } = require('http-status-codes')
const { User } = require('../src/data/user')
const stringify = require('json-stable-stringify')
const w3utils = require('../w3utils')
const { ethers } = require('ethers')

const partialReqCheck = async (req, res, next) => {
  const { phone: unvalidatedPhone, eseed } = req.body
  const { isValid, phoneNumber } = phone(unvalidatedPhone)
  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad phone number' })
  }
  if (!(eseed?.length >= 32)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid eseed' })
  }
  req.processedBody = { ...req.processedBody, phoneNumber, eseed: eseed.toLowerCase() }
  next()
}

const reqCheck = async (req, res, next) => {
  return partialReqCheck(req, res, () => {
    const { ekey, address } = req.body

    if (!ekey || !address) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need eseed, ekey' })
    }
    req.processedBody = { ...req.processedBody, ekey: ekey.toLowerCase(), address: address.toLowerCase() }
    next()
  })
}

const checkExistence = async (req, res, next) => {
  const { phoneNumber, address } = req.processedBody
  let u = await User.findByPhone({ phone: phoneNumber })
  if (u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number already exists' })
  }
  u = await User.findByAddress({ address })
  if (u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'address already exists' })
  }
  next()
}

const hasUserSignedBody = async (req, res, next) => {
  const { address, signature, body } = req.body
  const msg = stringify(body)

  const expectedAddress = w3utils.ecrecover(msg, signature)
  // console.log(msg, expectedAddress, address)
  if (!address || !expectedAddress || address !== expectedAddress) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
  }
  const u = await User.findByAddress({ address })
  if (!u) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'user does not exist' })
  }
  req.user = u
  next()
}

const validateID = async (req, res, next) => {
  const { id: unvalidatedID } = req.body
  let u
  if (unvalidatedID.substr(0, 2) === '0x') {
    if (!ethers.utils.isAddress(unvalidatedID)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `invalid Address: ${unvalidatedID}` })
    } else {
      // find by address
      u = await User.findByAddress({ address: unvalidatedID })
      if (!u?.id) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: `address does not exists: ${unvalidatedID}` })
      }
    }
  } else {
    //   const u = await User.findByAddress({ address })
    u = await User.findByPhone({ phone: unvalidatedID })
    if (!u?.id) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `invalid Address: ${unvalidatedID}` })
    }
  }
  req.processedBody = { ...req.processedBody, phone: u.phone, address: u.address.toLowerCase() }
  next()
}

module.exports = { partialReqCheck, reqCheck, checkExistence, hasUserSignedBody, validateID }
