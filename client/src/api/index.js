import { utils } from '../utils'
import axios from 'axios'
import Web3 from 'web3'
import config from '../config'
import BN from 'bn.js'
import Contract from 'web3-eth-contract'
import Constants from '../../../shared/constants'
import stringify from 'json-stable-stringify'
const IERC20 = require('../../abi/IERC20.json')
const IERC165 = require('../../abi/IERC165.json')
const IERC20Metadata = require('../../abi/IERC20Metadata.json')
const IERC721 = require('../../abi/IERC721.json')
const IERC721Metadata = require('../../abi/IERC721Metadata.json')
const IERC1155 = require('../../abi/IERC1155.json')
const IERC1155MetadataURI = require('../../abi/IERC1155MetadataURI.json')
const headers = ({ secret, network }) => ({
  'X-SECRET': secret,
  'X-NETWORK': network,
})

// console.log(config)

const TIMEOUT = 60000
const apiBase = axios.create({
  baseURL: config.server,
  headers: headers({ secret: config.secret, network: config.network }),
  timeout: TIMEOUT,
})

const web3 = new Web3(config.rpc)
web3.eth.defaultCommon = {
  customChain: {
    name: config.network,
    networkId: config.networkId,
    chainId: config.chainId,
  }
}
// web3.eth.defaultChain = config.chainId

Contract.setProvider(web3.currentProvider)
const setDefaults = (c) => {
  // console.log(c)
  return c
}

const getTokenContract = {
  ERC20: (address) => setDefaults(new Contract(IERC20, address)),
  ERC721: (address) => setDefaults(new Contract(IERC721, address)),
  ERC1155: (address) => setDefaults(new Contract(IERC1155, address)),
}

const getTokenMetadataContract = {
  ERC20: (address) => setDefaults(new Contract(IERC20Metadata, address)),
  ERC721: (address) => setDefaults(new Contract(IERC721Metadata, address)),
  ERC1155: (address) => setDefaults(new Contract(IERC1155MetadataURI, address)),
}

const apis = {
  web3: {
    web3,
    changeAccount: (key) => {
      web3.eth.accounts.wallet.clear()
      if (key) {
        const { address } = web3.eth.accounts.wallet.add(key)
        web3.eth.defaultAccount = address
      } else {
        web3.eth.defaultAccount = ''
      }
    },
    changeNetwork: (network) => {
      // TODO
    },
    getAddress: (key) => {
      if (typeof key !== 'string') {
        key = utils.hexString(key)
      }
      return web3.eth.accounts.privateKeyToAccount(key).address
    },
    isValidAddress: (address) => {
      try {
        return web3.utils.isAddress(address)
      } catch (ex) {
        console.error(ex)
        return false
      }
    },
    signWithNonce: (msg, key) => {
      const nonce = Math.floor(Date.now() / (config.defaultSignatureValidDuration)) * config.defaultSignatureValidDuration
      const message = `${msg} ${nonce}`
      return web3.eth.accounts.sign(message, key).signature
    },
    signWithBody: (body, key) => {
      const msg = stringify(body)
      return web3.eth.accounts.sign(msg, key).signature
    }
  },
  blockchain: {
    sendToken: async ({ address, contractAddress, tokenType, tokenId, amount, dest }) => {
      const c = getTokenContract[tokenType](contractAddress)
      console.log({ address, contractAddress, tokenType, tokenId, amount, dest })
      let data
      if (tokenType === 'ERC20') {
        data = c.methods.transferFrom(address, dest, amount).encodeABI()
      } else if (tokenType === 'ERC721') {
        data = c.methods.safeTransferFrom(address, dest, tokenId).encodeABI()
      } else if (tokenType === 'ERC1155') {
        data = c.methods.safeTransferFrom(address, dest, tokenId, amount, '0x').encodeABI()
      } else {
        throw Error('unreachable')
      }
      const gas = await web3.eth.estimateGas({ from: address, to: contractAddress, data })
      return web3.eth.sendTransaction({ data, gas: Math.floor(gas * 1.5), from: address, to: contractAddress })
    },
    getBalance: async ({ address }) => {
      const b = await web3.eth.getBalance(address)
      return new BN(b)
    },

    // returns Promise<BN>
    getTokenBalance: async ({ address, contractAddress, tokenType = '', tokenId }) => {
      if (!utils.isValidTokenType(tokenType)) {
        throw new Error(`Unknown token type: ${tokenType}`)
      }
      const c = getTokenContract[tokenType](contractAddress)
      if (tokenType === 'ERC20') {
        return c.methods.balanceOf(address).call()
      } else if (tokenType === 'ERC721') {
        const owner = await c.methods.ownerOf(tokenId).call()
        return owner.toLowerCase() === address.toLowerCase() ? new BN(1) : new BN(0)
      } else if (tokenType === 'ERC1155') {
        return c.methods.balanceOf(address, tokenId).call()
      } else {
        throw Error('unreachable')
      }
    },

    getTokenMetadata: async ({ tokenType, contractAddress, tokenId }) => {
      if (!utils.isValidTokenType(tokenType)) {
        throw new Error(`Unknown token type: ${tokenType}`)
      }
      const c = getTokenMetadataContract[tokenType](contractAddress)
      let name, symbol, uri, decimals
      if (tokenType === 'ERC20') {
        [name, symbol, decimals] = await Promise.all([c.methods.name().call(), c.methods.symbol().call(), c.methods.decimals().call()])
      } else if (tokenType === 'ERC721') {
        [name, symbol, uri] = await Promise.all([c.methods.name().call(), c.methods.symbol().call(), c.methods.tokenURI(tokenId).call()])
      } else if (tokenType === 'ERC1155') {
        uri = await c.methods.uri(tokenId).call()
        try {
          const c2 = getTokenMetadataContract.ERC721(contractAddress)
          // eslint-disable-next-line no-lone-blocks
          { [name, symbol] = await Promise.all([c2.methods.name().call(), c2.methods.symbol().call()]) }
        } catch (ex) {
          console.log('Failed to get name and symbol for', contractAddress)
        }
      } else {
        throw Error('unreachable')
      }
      return { name, symbol, uri, decimals: decimals && new BN(decimals).toNumber() }
    },
  },
  server: {
    signup: async ({ phone, eseed, ekey, address }) => {
      const { data } = await apiBase.post('/signup', { phone, eseed, ekey, address })
      const { hash } = data
      return hash
    },
    verify: async ({ phone, eseed, ekey, address, code, signature }) => {
      const { data } = await apiBase.post('/verify', { phone, eseed, ekey, address, code, signature })
      const { success } = data
      return success
    },
    restore: async ({ phone, eseed }) => {
      const { data } = await apiBase.post('/restore', { phone, eseed })
      const { success } = data
      return success
    },
    restoreVerify: async ({ phone, eseed, code }) => {
      const { data } = await apiBase.post('/restore-verify', { phone, eseed, code })
      const { ekey, address } = data
      return { ekey, address }
    },
    lookup: async ({ destPhone, address, signature }) => {
      const { data } = await apiBase.post('/lookup', { destPhone, address, signature })
      const { address: destAddress } = data
      return destAddress
    },
    settings: async ({ address, signature, newSetting = {} }) => {
      const { data } = await apiBase.post('/settings', { newSetting, address, signature })
      const { address: destAddress } = data
      return destAddress
    },
    requestView: async ({ address, signature, id }) => {
      const { data } = await apiBase.post('/request-view', { address, signature, id })
      const { request, hash } = data
      return { request, hash }
    },
    requestComplete: async ({ address, signature, id, txHash }) => {
      const { data } = await apiBase.post('/request-complete', { address, signature, id, txHash })
      const { success } = data
      return success
    }
  },
  nft: {
    getCachedData: async (address, tokenType, contractAddress, tokenId) => {
      return {}
    },
    getNFTType: async (contractAddress) => {
      const c = new web3.eth.Contract(IERC165, contractAddress)
      const is721 = await c.methods.supportsInterface(Constants.TokenInterfaces.ERC721).call()
      if (is721) {
        return 'ERC721'
      }
      const is1155 = await c.methods.supportsInterface(Constants.TokenInterfaces.ERC1155).call()
      if (is1155) {
        return 'ERC1155'
      }
      return null
    },
    lookup: async ({ address, contractAddress }) => {
      const { data: nfts } = await apiBase.post('/nft/lookup', { contractAddress, address })
      return nfts
    },
    track: async ({ address, contractAddress, tokenId, tokenType, signature }) => {
      const { data: { numTracked, success } } = await apiBase.post('/nft/track', {
        body: [{ contractAddress, tokenId, tokenType }],
        signature,
        address
      })
      return { numTracked, success }
    },
    untrack: async ({ address, contractAddress, tokenId, signature }) => {
      const { data: { removed, success } } = await apiBase.post('/nft/untrack', {
        body: { contractAddress, tokenId },
        signature,
        address
      })
      return { removed, success }
    },
  }
}
if (window) {
  window.apis = apis
}
export default apis
