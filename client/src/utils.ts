import AES from 'aes-js'
import sharedUtils from '../../shared/utils'
import { useState, useEffect } from 'react'
import config from './config'
import paths from './pages/paths'
import apis from './api'
import { ethers } from 'ethers'

export interface Balance {
  balance: bigint
  formatted: string
  fiat: number
  fiatFormatted: string
  valid?: boolean
}

interface KeyEncryptionParameters {
  phone: string
  p: Uint8Array
  pk?: Uint8Array
}

interface ComputedParameters {
  address: string
  ekey: string
  eseed: string
}
interface PartialComputedParameters {
  eseed: string
}

interface CallDataEncodeInput {
  method?: string
  selector?: string
  types: string[]
  values: any[]
}

export const utils = {
  ...sharedUtils,
  /**
   *
   * @param content - Uint8Array, multiple of 16 bytes
   * @param encryptionKey - Uint8Array, 16 or 32 bytes
   * @param iv - Uint8Array, 16 bytes
   */
  encrypt: (content: Uint8Array, encryptionKey: Uint8Array, iv: Uint8Array): Uint8Array => {
    // eslint-disable-next-line new-cap
    const aes = new AES.ModeOfOperation.cbc(encryptionKey, iv)
    return aes.encrypt(content)
  },
  decrypt: (encryptedContent: Uint8Array, encryptionKey: Uint8Array, iv: Uint8Array): Uint8Array => {
    // eslint-disable-next-line new-cap
    const aes = new AES.ModeOfOperation.cbc(encryptionKey, iv)
    return aes.decrypt(encryptedContent)
  },
  getRestoreUri: (p: string): string => {
    return `${config.rootUrl}${paths.recover}?p=${p}`
  },
  getExplorerUri: (txHash: string): string => {
    return config.explorer.replace('{{txId}}', txHash)
  },
  getExplorerHistoryUri: (address: string): string => {
    return config.explorerHistory.replace('{{address}}', address)
  },
  validBalance: (balance: number | string | undefined, allowFloat?: boolean): boolean => {
    if (typeof balance === 'number') { return true }
    if (typeof balance !== 'string') { return false }
    for (let i = 0; i < balance.length; i += 1) {
      const c = balance.charCodeAt(i)
      if (c < 48 || c > 57) {
        if (!allowFloat) {
          return false
        }
        if (c !== 46) {
          return false
        }
      }
    }
    return true
  },

  computeBalance: (balance: string | number | undefined, price?: number, decimals?, maxPrecision?: number): Balance => {
    if (!utils.validBalance(balance)) {
      return { balance: BigInt(0), formatted: '0', fiat: 0, fiatFormatted: '0', valid: false }
    }
    const ones = sharedUtils.toOne(balance ?? 0, undefined, decimals)
    const formatted = sharedUtils.formatNumber(ones, maxPrecision)
    const fiat = (price ?? 0) * parseFloat(ones)
    const fiatFormatted = sharedUtils.formatNumber(fiat)
    return { balance: BigInt(balance ?? 0), formatted, fiat, fiatFormatted, valid: true }
  },

  toBalance: (formatted: string, price?: number, decimals?, maxPrecision?: number): Balance => {
    if (!utils.validBalance(formatted, true)) {
      return { balance: BigInt(0), formatted: '0', fiat: 0, fiatFormatted: '0', valid: false }
    }
    const balance = sharedUtils.toFraction(formatted, undefined, decimals)
    let fiat, fiatFormatted
    if (price !== undefined && price !== null) {
      const f = parseFloat(formatted)
      fiat = f * (price || 0)
      fiatFormatted = utils.formatNumber(fiat, maxPrecision)
    }
    return { balance, formatted, fiat, fiatFormatted, valid: true }
  },

  computeParameters: ({ phone, p, pk }: KeyEncryptionParameters): ComputedParameters | PartialComputedParameters => {
    const phoneBytes = utils.stringToBytes(phone)
    const combined = utils.bytesConcat(p, phoneBytes)
    const q = utils.keccak(combined)
    const eseed = utils.hexView(q)
    if (!pk) {
      return { eseed }
    }
    const iv = q.slice(0, 16)
    const ekeyBytes = utils.encrypt(pk, p, iv)
    const ekey = utils.hexView(ekeyBytes)
    const address = apis.web3.getAddress(pk)
    return { address, ekey, eseed }
  },

  ellipsisAddress: (address?: string): string => {
    if (!address || address.length < 10) {
      return address ?? ''
    }
    return address.slice(0, 6) + '...' + address.slice(address.length - 3, address.length)
  },
  safeURL: (callback: string): URL | null => {
    try {
      return new URL(callback)
    } catch (ex) {
      return null
    }
  },
  encodeCalldata: ({ method, selector, types, values = [] }: CallDataEncodeInput) => {
    // require either method or selector
    if (!method && !selector) {
      return '0x'
    }
    selector = selector ?? ethers.FunctionFragment.from(method).selector
    if (!types) {
      if (!method) {
        return null
      }
      const m = method.match(/.+\((.*)\)/)
      if (!m) {
        return null
      }
      types = m[1] ? m[1].split(',') : []
    }
    const encodedParameters = ethers.AbiCoder.defaultAbiCoder().encode(types, values)
    return selector + encodedParameters.slice(2)
  }
}

interface UIDimensions {
  width: number
  height: number
}

interface UIFormFactor {
  isMobile: boolean
}
export function getWindowDimensions (): UIDimensions {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height
  }
}

export function useWindowDimensions (): UIDimensions & UIFormFactor {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
  const isMobile = !(windowDimensions.width >= 600)

  useEffect(() => {
    function handleResize (): void {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize) }
  }, [])

  return { isMobile, ...windowDimensions }
}

export function processError (ex): string {
  const { data } = ex?.response || {}
  if (data?.error) {
    return data.error.toString()
  }
  if (typeof data === 'object') {
    return JSON.stringify(data)
  }
  if (data) {
    return data
  }
  return ex.toString()
}

export const getDataURLFromFile = async (img): Promise<string | ArrayBuffer | null> => await new Promise((resolve) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => { resolve(reader.result) })
  reader.readAsDataURL(img)
})

export const getTextFromFile = async (file): Promise<string | ArrayBuffer | null> =>
  await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => { resolve(reader.result) })
    reader.addEventListener('error', () => { reject(reader.error) })
    reader.readAsText(file)
  })

export const NFTUtils = {
  replaceIPFSLink: (link?: string, ipfsGateway?: string): string => {
    if (!link) {
      return ''
    }
    if (!link.includes('://')) {
      return exports.default.replaceIPFSLink(`ipfs://${link}`, ipfsGateway)
    }
    if (!link.startsWith('ipfs://')) {
      return link
    }
    let end = link.indexOf('?')
    if (end < 0) {
      end = link.length
    }
    const hash = link.slice(7, end)
    // console.log({ link, ipfsGateway })
    // console.trace()
    return (ipfsGateway ?? config.ipfs.gateway).replace('{{hash}}', hash)
  }
}
