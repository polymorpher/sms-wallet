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
  startReset: async (id) => {
    return UserPrototype.update(id, { resetTime: Date.now() + config.archiveWaitDuration })
  },
  cancelReset: async (id) => {
    return UserPrototype.update(id, { resetTime: 0 })
  },
  finalizeReset: async (id) => {
    const [u] = await UserPrototype.get(id)
    return UserPrototype.update(id, { phone: null, oldPhone: `${u.phone}`, resetFinalizeTime: Date.now() })
  }
})

module.exports = { User }
