import { JsonRpcProvider, Contract } from 'ethers'
import utils from './utils'
import config from './config'
import IERC165 from './abi/IERC165.json'
import IERC1155MetadataURI from './abi/IERC1155MetadataURI.json'
import IERC1155 from './abi/IERC1155.json'
import IERC721Metadata from './abi/IERC721Metadata.json'
import IERC721 from './abi/IERC721.json'
import IERC20Metadata from './abi/IERC20Metadata.json'
import IERC20 from './abi/IERC20.json'

export const provider = new JsonRpcProvider(config.rpc)

export const getTokenContract = {
  ERC20: (address): Contract => new Contract(address, IERC20, provider),
  ERC721: (address): Contract => new Contract(address, IERC721, provider),
  ERC1155: (address): Contract => new Contract(address, IERC1155, provider),
  ERC165: (address): Contract => new Contract(address, IERC165, provider)
}

export const getTokenMetadataContract = {
  ERC20: (address): Contract => new Contract(address, IERC20Metadata, provider),
  ERC721: (address): Contract => new Contract(address, IERC721Metadata, provider),
  ERC1155: (address): Contract => new Contract(address, IERC1155MetadataURI, provider)
}

const web3 = {
  getBalance: async ({ address }: { address: string }): Promise<bigint> => {
    return await provider.getBalance(address)
  },

  getTokenBalance: async ({ address, contractAddress, tokenType = '', tokenId }): Promise<bigint> => {
    if (!utils.isValidTokenType(tokenType)) {
      throw new Error(`Unknown token type: ${tokenType}`)
    }
    const c = getTokenContract[tokenType](contractAddress)
    if (tokenType === 'ERC20') {
      return (await c.balanceOf(address)) as bigint
    } else if (tokenType === 'ERC721') {
      const owner = (await c.ownerOf(tokenId)) as string
      return owner.toLowerCase() === address.toLowerCase() ? 1n : 0n
    } else if (tokenType === 'ERC1155') {
      return c.balanceOf(address, tokenId) as bigint
    } else {
      throw Error('unreachable')
    }
  }
}

export default web3
