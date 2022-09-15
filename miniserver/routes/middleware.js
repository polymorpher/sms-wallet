const config = require('../config')
const { StatusCodes } = require('http-status-codes')
const { Logger } = require('../logger')
const { phone } = require('phone')
const Twilio = require('twilio')
const { User } = require('../../server/src/data/user')
const { toNumber } = require('lodash')
const { ethers } = require('ethers')
const utils = require('../../server/utils')
const { parseError } = utils

const checkFromTwilio = async (req, res, next) => {
  // if not in debug mode check valid Twilio Request
  if (config.debug === false) {
    if (!Twilio.validateRequest(config.twilio.token, req.headers['x-twilio-signature'], (req.protocol + req.get('host') + req.path), req.body)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'request not from twilio' })
    }
  }
  next()
}

// parseSMS parses a message and returns command, requestor, funder, amount
// Balance Example : smsBody = 'b' returns balance requestor.address
// Payment Example : smsbody = 'p 4158401410 0.1' returns pay requestor.address funder.address 0.1
const parseSMS = async (req, res, next) => {
  const { From: senderPhoneNumber, Body: smsBody } = req.body
  const smsParams = smsBody.split(/(\s+)/).filter(e => { return e.trim().length > 0 })
  const response = new Twilio.twiml.MessagingResponse()
  try {
    let command
    const requestor = await User.findByPhone({ phone: senderPhoneNumber })
    if (smsParams.length < 1) {
      response.message('error: empy sms command')
      return res.send(response.toString())
    }
    if (smsParams[0] === 'b') {
      command = 'balance'
      req.processedBody = { ...req.processedBody, command, requestor }
    } else if (smsParams[0] === 'p') {
      command = 'pay'
      let funder
      let amount
      if (smsParams.length < 2) {
        response.message('error: pay request requires funder and an amount. example request "p +14158401999 0.1"')
        return res.send(response.toString())
      }
      // Allow requesting of funds from users by address (without checking registered phone number)
      if (smsParams[1].substr(0, 2) === '0x') {
        if (ethers.utils.isAddress(smsParams[1])) {
          funder.address = smsParams[1]
        } else {
          response.message(`error: invalid funder address ${smsParams[1]}. example request "p 0x8ba1f109551bd432803012645ac136ddd64dba72 0.1"`)
          return res.send(response.toString())
        }
      } else {
        // set country and look up user address from Phone Number
        let funderPhone = smsParams[1]
        if (funderPhone.substr(0, 1) !== '+') {
          const { countryIso3 } = phone(requestor.phone)
          const { isValid, phoneNumber } = phone(funderPhone, countryIso3)
          funderPhone = phoneNumber
          if (!isValid) {
            response.message(`error: invalid recipient phone number ${smsParams[1]}. example request "p +14158401999 0.1"`)
            return res.send(response.toString())
          }
        }
        Logger.log(`funderPhone: ${funderPhone}`)
        funder = await User.findByPhone({ phone: funderPhone })
        if (!funder?.address) {
          response.message(`error: funders phone number is not a registered wallet: ${smsParams[1]}. example request "p +14158401999 0.1"`)
          return res.send(response.toString())
        }
      }

      if (toNumber(smsParams[2]) > 0) {
        amount = ethers.utils.parseEther(smsParams[2])
      } else {
        response.message(`error: pay request requires a valid amount': ${smsParams[2]} example request "p +14158401999 0.1"`)
        return res.send(response.toString())
      }
      req.processedBody = { ...req.processedBody, command, requestor, funder, amount }
    } else {
      response.message('error: invalid sms command. example payment request "p +14158401999 0.1"')
      return res.send(response.toString())
    }
  } catch (ex) {
    console.error(ex)
    const { code, error, success } = parseError(ex)
    response.message(`An exception occured. success: ${success} code: ${code} error: ${error.substr(0, 100)} `)
    return res.send(response.toString())
  }
  next()
}

const validateID = async (req, res, next) => {
  const { phoneNumber, address } = req.processedBody
  let u
  if (address) {
    if (!ethers.utils.isAddress(address)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `invalid Address: ${address}` })
    } else {
      // find by address
      u = await User.findByAddress({ address })
      if (!u?.id) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: `address does not exists: ${address}` })
      }
    }
  } else {
    //   const u = await User.findByAddress({ address })
    u = await User.findByPhone({ phone: phoneNumber })
    if (!u?.id) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: `phone number not registered: ${phoneNumber}` })
    }
  }
  req.processedBody = { ...req.processedBody, phone: u.phone, address: u.address.toLowerCase() }
  next()
}

module.exports = { checkFromTwilio, parseSMS, validateID }
