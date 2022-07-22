import AES from 'aes-js'
import sharedUtils from '../../shared/utils'
import { useState, useEffect } from 'react'
import config from './config'
import paths from './pages/paths'
export const utils = {
  ...sharedUtils,
  /**
   *
   * @param content - Uint8Array, multiple of 16 bytes
   * @param encryptionKey - Uint8Array, 16 or 32 bytes
   * @param iv - Uint8Array, 16 bytes
   */
  encrypt: (content, encryptionKey, iv) => {
    // eslint-disable-next-line new-cap
    const aes = new AES.ModeOfOperation.cbc(encryptionKey, iv)
    return aes.encrypt(content)
  },
  decrypt: (encryptedContent, encryptionKey, iv) => {
    // eslint-disable-next-line new-cap
    const aes = new AES.ModeOfOperation.cbc(encryptionKey, iv)
    return aes.decrypt(encryptedContent)
  },
  getRestoreUri: (p) => {
    return `${config.rootUrl}${paths.recover}?p=${p}`
  },
  getExplorerUri: (txHash) => {
    return config.explorer.replace('{{tx}}', txHash)
  },
  validBalance: (balance, allowFloat) => {
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

  computeBalance: (balance, price, decimals, maxPrecision) => {
    if (!utils.validBalance(balance)) {
      return { balance: 0, formatted: '0', fiat: 0, fiatFormatted: '0', valid: false }
    }
    const ones = sharedUtils.toOne(balance || 0, null, decimals)
    const formatted = sharedUtils.formatNumber(ones, maxPrecision)
    const fiat = (price || 0) * parseFloat(ones)
    const fiatFormatted = sharedUtils.formatNumber(fiat)
    return { balance, formatted, fiat, fiatFormatted, valid: true }
  },

  toBalance: (formatted, price, decimals, maxPrecision) => {
    if (!utils.validBalance(formatted, true)) {
      return { balance: 0, formatted: '0', fiat: 0, fiatFormatted: '0', valid: false }
    }
    const balance = sharedUtils.toFraction(formatted, null, decimals)
    let fiat, fiatFormatted
    if (price !== undefined && price !== null) {
      const f = parseFloat(formatted)
      fiat = f * (price || 0)
      fiatFormatted = utils.formatNumber(fiat, maxPrecision)
    }
    return { balance, formatted, fiat, fiatFormatted, valid: true }
  },
}

export function getWindowDimensions () {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height
  }
}

export function useWindowDimensions () {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
  const isMobile = !(windowDimensions.width >= 600)

  useEffect(() => {
    function handleResize () {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { isMobile, ...windowDimensions }
}
