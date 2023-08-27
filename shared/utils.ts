import createKeccakHash from 'keccak'
import Conversion from 'ethjs-unit'
import BN from 'bn.js'
const STANDARD_DECIMAL = 18

export const Constants = {
  TokenType: {
    0: 'ERC20',
    1: 'ERC721',
    2: 'ERC1155',
    3: 'NONE',
    ERC20: 0,
    ERC721: 1,
    ERC1155: 2,
    NONE: 3
  },
  TokenInterfaces: {
    ERC721: '0x80ac58cd',
    ERC1155: '0xd9b67a26'
  }
}

const utils = {
  keccak: (bytes: string | Buffer | Uint8Array): Uint8Array => {
    const k = createKeccakHash('keccak256')
    // assume Buffer is poly-filled or loaded from https://github.com/feross/buffer
    const hash = k.update(Buffer.from(bytes)).digest()
    return new Uint8Array(hash)
  },
  hexView: (bytes: Buffer | Uint8Array): string => {
    return bytes && Array.from(bytes).map(x => x.toString(16).padStart(2, '0')).join('')
  },
  hexString: (bytes: Buffer | Uint8Array): string => {
    return '0x' + utils.hexView(bytes)
  },
  bytesConcat: (...args: Uint8Array[]) => {
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
  hexToBytes: (hex: string, length?: number, padRight?: boolean): undefined | Uint8Array => {
    if (!hex) {
      return
    }
    length = length ?? hex.length / 2
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
  hexStringToBytes: (hexStr: string, length?: number): undefined | Uint8Array => {
    return hexStr.startsWith('0x') ? utils.hexToBytes(hexStr.slice(2), length) : utils.hexToBytes(hexStr, length)
  },
  stringToBytes: (str: string): Uint8Array => {
    return new TextEncoder().encode(str)
  },

  toFraction: (ones: number | string, unit?: string, decimals?: number): bigint => {
    const v = Conversion.toWei(ones, unit ?? 'ether')
    const diff = BigInt(STANDARD_DECIMAL - (decimals ?? STANDARD_DECIMAL))
    const denominator = 10n ** diff
    return BigInt(v.toString()) / (denominator)
  },

  toOne: (fractions: string | number, unit?: string, decimals?: number) => {
    const diff = BigInt(STANDARD_DECIMAL - (decimals ?? STANDARD_DECIMAL))
    const multiplier = 10n ** diff
    const bfractions = BigInt(fractions) * multiplier
    return Conversion.fromWei(bfractions.toString(), unit ?? 'ether')
  },

  toBigInt: (numberLike: string | number | bigint): bigint => {
    if (typeof numberLike === 'string' && numberLike.startsWith('0x')) {
      return BigInt(numberLike)
    }
    if (typeof numberLike === 'number' && numberLike > 1e+14) {
      return BigInt(String(numberLike.toLocaleString('fullwide', { useGrouping: false })))
    }
    return BigInt(numberLike)
  },

  formatNumber: (number: number | string, maxPrecision?: number): string => {
    maxPrecision = maxPrecision ?? 4
    number = typeof number === 'string' ? parseFloat(number) : number
    if (number < 10 ** (-maxPrecision)) {
      return '0'
    }
    const order = Math.ceil(Math.log10(Math.max(number, 1)))
    const digits = Math.max(0, maxPrecision - order)
    // https://www.jacklmoore.com/notes/rounding-in-javascript/
    const floored = Number(`${Math.floor(Number(`${number}e+${digits}`))}e-${digits}`)
    return floored.toString()
  },
  isValidTokenType: (tokenType: string): boolean => {
    if (tokenType === 'NONE') {
      return false
    }
    return Constants.TokenType[tokenType] !== undefined
  },
  isValidNumericTokenType: (tokenType: number) => {
    if (tokenType === 3) {
      return false
    }
    return Constants.TokenType[tokenType] !== undefined
  },
  normalizeNumber: (n: string | number): string => {
    return BigInt(n).toString()
  },
  isValidTokenId: (tokenId: number | string): boolean => {
    try {
      const t = utils.normalizeNumber(tokenId)
      return BigInt(t) > 0n
    } catch (ex) {
      return false
    }
  },
  computeTokenKey: ({ tokenId, tokenType, contractAddress }: TokenKeyInput): TokenKey => {
    if (!contractAddress || !tokenId || (tokenType !== 0 && !tokenType)) {
      return { string: '', hash: new Uint8Array(), bytes: new Uint8Array() }
    }
    contractAddress = contractAddress.toLowerCase()
    if (typeof tokenType === 'string' && tokenType.startsWith('ERC')) {
      tokenType = Constants.TokenType[tokenType]
    }
    const bytes = new Uint8Array(96)
    // TODO: find ways from bigint to uint8array
    const s1 = new BN(tokenType, 10).toArrayLike(Uint8Array, 'be', 32)
    const s2 = utils.hexStringToBytes(contractAddress, 32) as Uint8Array
    const s3 = new BN(tokenId, 10).toArrayLike(Uint8Array, 'be', 32)
    bytes.set(s1)
    bytes.set(s2, 32)
    bytes.set(s3, 64)
    const hash = utils.keccak(bytes)
    const string = utils.hexView(hash)
    return { string, hash, bytes }
  }
}

export function processError (ex): string {
  const { data, status, statusText } = ex?.response || {}
  if (data?.error) {
    return data.error.toString()
  }
  if (typeof data === 'object') {
    return `${status} ${statusText} ${JSON.stringify(data)}`
  }
  if (data) {
    return data
  }
  return ex.toString()
}

export interface TokenKeyInput {
  tokenId?: string
  tokenType?: string | number
  contractAddress?: string
}
export interface TokenKey {
  string: string
  hash: Uint8Array
  bytes: Uint8Array
}

export default utils
