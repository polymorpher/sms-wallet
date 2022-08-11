const { v1: uuid } = require('uuid')
const config = require('../../config')
const { GenericBuilder } = require('./generic')
const UserPrototype = GenericBuilder('user')
const User = ({
  ...UserPrototype,
  addNew: async ({ id, phone, ekey, eseed, address }) => {
    id = id || uuid()
    const [u] = await UserPrototype.find(['phone', phone])
    address = address.toLowerCase()
    if (u) {
      return false
    }
    const details = {
      id,
      phone,
      ekey,
      eseed,
      address
    }
    return UserPrototype.add(id, details)
  },
  findByPhone: async ({ phone }) => {
    const [u] = await UserPrototype.find(['phone', phone])
    return u
  },
  findByAddress: async ({ address }) => {
    const [u] = await UserPrototype.find(['address', address.toLowerCase()])
    return u
  },
})

module.exports = { User }
