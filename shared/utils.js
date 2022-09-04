const createKeccakHash = require('keccak')
const Conversion = require('ethjs-unit')
const STANDARD_DECIMAL = 18
const BN = require('bn.js')
const Constants = require('./constants')

const utils = {
  /**
   *
   * @param {string | Buffer} bytes
   * @returns {Uint8Array}
   */
  keccak: (bytes) => {
    const k = createKeccakHash('keccak256')
    // assume Buffer is poly-filled or loaded from https://github.com/feross/buffer
    const hash = k.update(Buffer.from(bytes)).digest()
    return new Uint8Array(hash)
  },
  hexView: (bytes) => {
    return bytes && Array.from(bytes).map(x => x.toString(16).padStart(2, '0')).join('')
  },
  hexString: (bytes) => {
    return '0x' + utils.hexView(bytes)
  },
  bytesConcat: (...args) => {
    let len = 0
    args.forEach(e => {
      len += e.length
    })
    const buf = new Uint8Array(len)
    let n = 0
    args.forEach(e => {
      buf.set(e, n)
      n += e.length
    })
    return buf
  },
  hexToBytes: (hex, length, padRight) => {
    if (!hex) {
      return
    }
    length = length || hex.length / 2
    const ar = new Uint8Array(length)
    for (let i = 0; i < hex.length / 2; i += 1) {
      let j = i
      if (padRight) {
        j = length - hex.length + i
      }
      ar[j] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    return ar
  },
  hexStringToBytes: (hexStr, length) => {
    return hexStr.startsWith('0x') ? utils.hexToBytes(hexStr.slice(2), length) : utils.hexToBytes(hexStr, length)
  },
  stringToBytes: str => {
    return new TextEncoder().encode(str)
  },


  toFraction: (ones, unit, decimals) => {
    const v = Conversion.toWei(ones, unit || 'ether')
    const diff = STANDARD_DECIMAL - (decimals || STANDARD_DECIMAL)
    const denominator = new BN(10).pow(new BN(diff))
    return v.div(denominator)
  },

  toOne: (fractions, unit, decimals) => {
    const diff = STANDARD_DECIMAL - (decimals || STANDARD_DECIMAL)
    const multiplier = new BN(10).pow(new BN(diff))
    const bfractions = new BN(fractions).mul(multiplier)
    const v = Conversion.fromWei(bfractions, unit || 'ether')
    return v
  },

  toBN: (numberLike) => {
    if (typeof numberLike === 'string' && numberLike.startsWith('0x')) {
      return new BN(numberLike.slice(2), 16)
    }
    if (typeof numberLike === 'number' && numberLike > 1e+14) {
      return new BN(String(numberLike.toLocaleString('fullwide', { useGrouping: false })))
    }
    return new BN(numberLike)
  },

  formatNumber: (number, maxPrecision) => {
    maxPrecision = maxPrecision || 4
    number = parseFloat(number)
    if (number < 10 ** (-maxPrecision)) {
      return '0'
    }
    const order = Math.ceil(Math.log10(Math.max(number, 1)))
    const digits = Math.max(0, maxPrecision - order)
    // https://www.jacklmoore.com/notes/rounding-in-javascript/
    const floored = Number(`${Math.floor(`${number}e+${digits}`)}e-${digits}`)
    return floored.toString()
  },
  isValidTokenType: (tokenType) => {
    if (tokenType === 'NONE' || typeof tokenType !== 'string') {
      return false
    }
    return Constants.TokenType[tokenType] !== undefined
  },
  isValidNumericTokenType: (tokenType) => {
    if (tokenType === 3 || typeof tokenType !== 'number') {
      return false
    }
    return Constants.TokenType[tokenType] !== undefined
  },
  normalizeNumber: n => {
    if (typeof n === 'string' && n.startsWith('0x')) {
      const t = new BN(n.slice(2), 16)
      return t.toString()
    } else {
      return new BN(n).toString()
    }
  },
  isValidTokenId: tokenId => {
    try {
      const t = utils.normalizeNumber(tokenId)
      return t.gten(0)
    } catch (ex) {
      return false
    }
  }
}

module.exports = utils