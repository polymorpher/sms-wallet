const JSSHA = require('jssha')
const sharedUtils = require('../shared/utils')

const { keccak, hexView, hexString } = sharedUtils

const { StatusCodes } = require('http-status-codes')
const { values, mapValues } = require('lodash')
const constants = require('./constants')

const utils = {
  keccak,
  hexView,
  hexString,
  // from https://github.com/polymorpher/one-wallet
  // seed: uint8array
  genOTP: ({ seed, interval = 30000, counter = Math.floor(Date.now() / interval), n = 1, progressObserver }) => {
    const codes = new Uint8Array(n * 4)
    const v = new DataView(codes.buffer)
    const b = new DataView(new ArrayBuffer(8))
    for (let i = 0; i < n; i += 1) {
      const t = counter + i
      b.setUint32(0, 0, false)
      b.setUint32(4, t, false)
      const jssha = new JSSHA('SHA-1', 'UINT8ARRAY')
      jssha.setHMACKey(seed, 'UINT8ARRAY')
      jssha.update(new Uint8Array(b.buffer))
      const h = jssha.getHMAC('UINT8ARRAY')
      const p = h[h.length - 1] & 0x0f
      const x1 = (h[p] & 0x7f) << 24
      const x2 = (h[p + 1] & 0xff) << 16
      const x3 = (h[p + 2] & 0xff) << 8
      const x4 = (h[p + 3] & 0xff)
      const c = x1 | x2 | x3 | x4
      const r = c % 1000000
      v.setUint32(i * 4, r, false)
      if (progressObserver) {
        progressObserver(i, n)
      }
    }
    return codes
  },

  decodeOtp: (otp) => {
    return new DataView(otp.buffer).getUint32(0, false)
  },

  // from https://github.com/polymorpher/one-wallet
  genOTPStr: ({ seed, interval = 30000, counter = Math.floor(Date.now() / interval), n = 1 }) => {
    const otps = utils.genOTP({ seed, interval, counter, n })
    const nums = new Array(n).fill(0).map((a, i) => new Uint8Array(otps.slice(i * 4, (i + 1) * 4))).map(utils.decodeOtp)
    return nums.map(i => i.toString().padStart(6, '0'))
  },

  parseError: (ex) => {
    let error = ex.toString()
    if (error && error.indexOf(constants.ReasonGiven) > 0) {
      error = error.slice(error.indexOf(constants.ReasonGiven) + constants.ReasonGiven.length)
      return { success: false, code: StatusCodes.OK, error, extra: ex.extra }
    }
    return { success: false, code: StatusCodes.INTERNAL_SERVER_ERROR, error, extra: ex.extra }
  },

  checkParams: (params, res) => {
    params = mapValues(params, e => e === undefined ? null : e)
    if (values(params).includes(undefined) || values(params).includes(null)) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Some parameters are missing', params })
      return false
    }
    return true
  }
}

module.exports = utils
