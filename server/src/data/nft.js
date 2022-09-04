const { v1: uuid } = require('uuid')
const config = require('../../config')
const { GenericBuilder } = require('./generic')
const NFTPrototype = GenericBuilder('user')
const NFT = ({
  ...NFTPrototype,
  track: async ({ address, contractAddress, tokenId, tokenType }) => {
    address = address.toLowerCase()
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
      const key = `${address}-${contractAddress}-${tokenId}`
      const data = {
        id: key,
        address,
        contractAddress,
        tokenId,
        tokenType
      }
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
    const predicates = [['address', address]]
    if (contractAddress) {
      predicates.push(['contractAddress', contractAddress])
    }
    const nfts = await NFTPrototype.find(...predicates)
    return nfts
  },
  untrack: async ({ address, contractAddress, tokenId }) => {
    address = address.toLowerCase()
    contractAddress = contractAddress.toLowerCase()
    const id = `${address}-${contractAddress}-${tokenId}`
    return NFTPrototype.remove(id)
  },
})

module.exports = { NFT }
