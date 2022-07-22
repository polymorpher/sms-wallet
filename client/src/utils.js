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
    return `https://${config.rootUrl}${paths.recover}?p=${p}`
  }
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
