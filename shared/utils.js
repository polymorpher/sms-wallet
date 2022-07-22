const createKeccakHash = require('keccak')

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

}

module.exports = utils