const { phone } = require('phone')
const { StatusCodes } = require('http-status-codes')
const { User } = require('../src/data/user')
const stringify = require('json-stable-stringify')
const w3utils = require('../w3utils')

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

module.exports = { partialReqCheck, reqCheck, checkExistence, hasUserSignedBody }
