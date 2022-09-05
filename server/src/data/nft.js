const { v1: uuid } = require('uuid')
const config = require('../../config')
const { GenericBuilder } = require('./generic')
const NFTPrototype = GenericBuilder('nft')
const NFT = ({
  ...NFTPrototype,
  track: async ({ address, contractAddress, tokenId, tokenType }) => {
    address = address.toLowerCase()
    contractAddress = contractAddress.toLowerCase()
    const id = `${address}-${contractAddress}-${tokenId}`
    const details = {
      id,
      address,
      contractAddress,
      tokenId,
      tokenType
    }
    return NFTPrototype.add(id, details)
  },

  batchTrack: async ({ address, nfts }) => {
    const entities = nfts.map(({ contractAddress, tokenId, tokenType }) => {
      address = address.toLowerCase()
      contractAddress = contractAddress.toLowerCase()
      const id = `${address}-${contractAddress}-${tokenId}`
      const data = {
        id,
        address,
        contractAddress,
        tokenId,
        tokenType
      }
      const key = NFTPrototype.key(id)
      return { key, data }
    })
    return NFTPrototype.batchAddEntities(entities)
  },

  isTracked: async ({ address, contractAddress, tokenId }) => {
    address = address.toLowerCase()
    contractAddress = contractAddress.toLowerCase()
    const [u] = await NFTPrototype.find(['address', address], ['contractAddress', contractAddress], ['tokenId', tokenId])
    return u
  },
  getAllTracked: async ({ address, contractAddress }) => {
    address = address.toLowerCase()
    const predicates = [['address', address]]
    if (contractAddress) {
      contractAddress = contractAddress.toLowerCase()
      predicates.push(['contractAddress', contractAddress])
    }
    return NFTPrototype.find(...predicates)
  },
  untrack: async ({ address, contractAddress, tokenId }) => {
    address = address.toLowerCase()
    contractAddress = contractAddress.toLowerCase()
    const id = `${address}-${contractAddress}-${tokenId}`
    return NFTPrototype.remove(id)
  },
})

module.exports = { NFT }
