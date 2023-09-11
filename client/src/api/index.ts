import { utils } from '../utils'
import axios, { type AxiosError, HttpStatusCode } from 'axios'
import {
  Wallet,
  hashMessage,
  isAddress,
  type ContractTransactionResponse,
  type Contract
} from 'ethers'
import config from '../config'
import Constants from '../../../shared/constants'
import web3, { provider, getTokenContract, getTokenMetadataContract } from '../../../shared/web3'
import stringify from 'json-stable-stringify'

export interface HeadersConfig {
  secret: string
  network: string
}

export interface TokenMetaData {
  name: string
  symbol: string
  uri: string
  decimals: bigint
}
const headers = ({ secret, network }: HeadersConfig): Record<string, string> => ({
  'X-SMS-WALLET-SECRET': secret,
  'X-SMS-WALLET-NETWORK': network
})

// console.log(config)

const TIMEOUT = 60000
const apiBase = axios.create({
  baseURL: config.server,
  headers: headers({ secret: config.secret, network: config.network }),
  timeout: TIMEOUT
})

// const web3 = new Web3(config.rpc)
// web3.eth.defaultCommon = {
//   customChain: {
//     name: config.network,
//     networkId: config.networkId,
//     chainId: config.chainId
//   }
// }
// web3.eth.defaultChain = config.chainId

// Contract.setProvider(web3.currentProvider)

let activeWallet: Wallet | undefined
const apis = {
  hashMessage,
  web3: {
    wallet: (key: string): Wallet => {
      return new Wallet(key, provider)
    },
    changeAccount: (key?: string): Wallet | undefined => {
      if (!key) {
        activeWallet = undefined
        return
      }
      activeWallet = new Wallet(key, provider)
      return activeWallet
    },
    changeNetwork: (network) => {
      // TODO
    },
    getAddress: (key: string | Uint8Array): string => {
      if (typeof key !== 'string') {
        key = utils.hexString(key)
      }
      return new Wallet(key, provider).address
    },
    isValidAddress: (address: string): boolean => {
      try {
        return isAddress(address)
      } catch (ex) {
        console.error(ex)
        return false
      }
    },
    signWithNonce: (msg: string, key: string): string => {
      const nonce = Math.floor(Date.now() / (config.defaultSignatureValidDuration)) * config.defaultSignatureValidDuration
      const message = `${msg} ${nonce}`
      const w = new Wallet(key, provider)
      return w.signMessageSync(message)
    },
    signWithBody: (body: any, key: string): string => {
      const w = new Wallet(key, provider)
      const msg = stringify(body)
      return w.signMessageSync(msg)
    }
  },
  blockchain: {
    sendToken: async ({ address, contractAddress, tokenType, tokenId, amount, dest }): Promise<ContractTransactionResponse> => {
      if (!activeWallet) {
        throw new Error('no active wallet')
      }
      const c = (getTokenContract[tokenType](contractAddress) as Contract).connect(activeWallet) as Contract

      console.log('[sendToken]', { address, contractAddress, tokenType, tokenId, amount, dest })
      if (tokenType === 'ERC20') {
        return (await c.transferFrom(address, dest, amount)) as ContractTransactionResponse
      } else if (tokenType === 'ERC721') {
        return (await c.safeTransferFrom(address, dest, tokenId)) as ContractTransactionResponse
      } else if (tokenType === 'ERC1155') {
        return (await c.safeTransferFrom(address, dest, tokenId, amount, '0x')) as ContractTransactionResponse
      } else {
        throw Error('unreachable')
      }
    },
    getBalance: async ({ address }: { address: string }): Promise<bigint> => {
      return (await provider.getBalance(address))
    },

    getTokenBalance: async ({ address, contractAddress, tokenType = '', tokenId }): Promise<bigint> => await web3.getTokenBalance({
      address,
      contractAddress,
      tokenType,
      tokenId
    }),

    getTokenMetadata: async ({ tokenType, contractAddress, tokenId }): Promise<TokenMetaData> => {
      if (!utils.isValidTokenType(tokenType)) {
        throw new Error(`Unknown token type: ${tokenType}`)
      }
      const c = getTokenMetadataContract[tokenType](contractAddress) as Contract
      let name = ''; let symbol = ''; let uri = ''; let decimals = 0n
      if (tokenType === 'ERC20') {
        decimals = await c.decimals()
        name = await c.name()
        symbol = await c.symbol()
      } else if (tokenType === 'ERC721') {
        name = await c.name()
        symbol = await c.symbol()
        uri = await c.tokenURI(tokenId)
      } else if (tokenType === 'ERC1155') {
        uri = await c.uri(tokenId)
        try {
          const c2 = getTokenMetadataContract.ERC721(contractAddress)
          name = await c2.name()
          symbol = await c2.symbol()
        } catch (ex) {
          console.log('Failed to get name and symbol for', contractAddress)
        }
      } else {
        throw Error('unreachable')
      }
      return { name, symbol, uri, decimals }
    }
  },
  server: {
    signup: async ({ phone, eseed, ekey, address }): Promise<string> => {
      const { data } = await apiBase.post('/signup', { phone, eseed, ekey, address })
      const { hash } = data
      return hash
    },
    tgSignup: async ({ eseed, ekey, address, signature, sessionId, userId }): Promise<{
      success: boolean
      error?: any
      invalidSession?: boolean
      accountExists?: boolean
    }> => {
      try {
        const { data } = await apiBase.post('/tg/signup', { eseed, ekey, address, signature, sessionId, userId })
        const { success, error, accountExists } = data
        return { success, error, accountExists }
      } catch (ex: any) {
        console.log(ex)
        if (ex?.response) {
          const e = ex as AxiosError
          if (e.response?.status === HttpStatusCode.Unauthorized) {
            return { success: false, error: e?.response?.data || '', invalidSession: true }
          }
          throw ex
        }
        throw ex
      }
    },
    tgRestore: async ({ eseed, sessionId, userId }): Promise<{ success: boolean, ekey?: string, address?: string, error?: string }> => {
      const { data } = await apiBase.post('/tg/restore', { eseed, sessionId, phone: `tg:${userId}` })
      const { success, ekey, address } = data
      return { success, ekey, address }
    },
    verify: async ({ phone, eseed, ekey, address, code, signature }): Promise<boolean> => {
      const { data } = await apiBase.post('/verify', { phone, eseed, ekey, address, code, signature })
      const { success } = data
      return success
    },
    restore: async ({ phone, eseed }): Promise<boolean> => {
      const { data } = await apiBase.post('/restore', { phone, eseed })
      const { success } = data
      return success
    },
    restoreVerify: async ({ phone, eseed, code }): Promise<RestoreVerifyResponse> => {
      const { data } = await apiBase.post('/restore-verify', { phone, eseed, code })
      const { ekey, address } = data
      return { ekey, address }
    },
    archive: async ({ phone }): Promise<boolean> => {
      const { data } = await apiBase.post('/archive', { phone })
      const { success } = data
      return success
    },
    archiveVerify: async ({ phone, code }): Promise<ArchiveVerifyResponse> => {
      const { data } = await apiBase.post('/archive-verify', { phone, code })
      const { timeRemain, archived, reset } = data
      return { timeRemain, archived, reset }
    },
    lookup: async ({ destPhone, address, signature }): Promise<string> => {
      const { data } = await apiBase.post('/lookup', { destPhone, address, signature })
      const { address: destAddress } = data
      return destAddress
    },
    settings: async ({ address, signature, newSetting = {} }): Promise<Record<string, string>> => {
      const { data } = await apiBase.post('/settings', { newSetting, address, signature })
      const { setting } = data
      return setting
    },
    requestView: async ({ address, signature, id }): Promise<RequestViewResponse> => {
      const { data } = await apiBase.post('/request-view', { address, signature, id })
      const { request, hash } = data
      return { request, hash }
    },
    requestComplete: async ({ address, signature, id, txHash }): Promise<boolean> => {
      const { data } = await apiBase.post('/request-complete', { address, signature, id, txHash })
      const { success } = data
      return success
    }
  },
  nft: {
    getCachedData: async (address, tokenType, contractAddress, tokenId): Promise<Record<string, string>> => {
      return {}
    },
    getNFTType: async (contractAddress): Promise<string | null> => {
      const c = getTokenContract.ERC165(contractAddress)
      const is721 = await c.supportsInterface(Constants.TokenInterfaces.ERC721) as boolean
      if (is721) {
        return 'ERC721'
      }
      const is1155 = await c.supportsInterface(Constants.TokenInterfaces.ERC1155) as boolean
      if (is1155) {
        return 'ERC1155'
      }
      return null
    },
    lookup: async (address: string, contractAddress?: string): Promise<TrackedNFT[]> => {
      const { data: nfts } = await apiBase.post('/nft/lookup', { contractAddress, address })
      return nfts
    },
    track: async ({ address, contractAddress, tokenId, tokenType, signature }): Promise<TrackResponse> => {
      const { data: { numTracked, success } } = await apiBase.post('/nft/track', {
        body: [{ contractAddress, tokenId, tokenType }],
        signature,
        address
      })
      return { numTracked, success }
    },
    untrack: async ({ address, contractAddress, tokenId, signature }): Promise<UntrackResponse> => {
      const { data: { removed, success } } = await apiBase.post('/nft/untrack', {
        body: { contractAddress, tokenId },
        signature,
        address
      })
      return { removed, success }
    }
  }
}
export interface RestoreVerifyResponse {
  ekey: string
  address: string
}
export interface ArchiveVerifyResponse {
  timeRemain: number
  archived: boolean
  reset: boolean
}
export interface CallRequest {
  calldata: string
  caller?: string
  callback?: string
  comment?: string
  amount: string
  dest: string
}
export interface RequestViewResponse {
  request: CallRequest
  hash: string
}
export interface TrackedNFT {
  id: string
  contractAddress: string
  tokenId: string
  tokenType: string
  address: string
}
export interface TrackResponse {
  success: boolean
  numTracked: number
}
export interface UntrackResponse {
  success: boolean
  removed: TrackedNFT
}
if (window) {
  window.apis = apis
}
export default apis
