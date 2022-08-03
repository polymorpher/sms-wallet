const { pick } = require('lodash')
const { v4: uuid } = require('uuid')
const { GenericBuilder } = require('./generic')
const utils = require('../../utils')
const stringify = require('json-stable-stringify')
const RequestPrototype = GenericBuilder('request')
const Request = ({
  ...RequestPrototype,
  add: async ({ request, address }) => {
    const id = uuid()
    const requestStr = stringify(request)
    const hash = utils.hexView(utils.keccak(requestStr))
    await RequestPrototype.add(id, { txHash: '', hash, requestStr, address })
    return { id, hash }
  },
  complete: async ({ id, txHash }) => {
    const u = await RequestPrototype.get(id)
    if (!u) {
      return null
    }
    return RequestPrototype.update(id, { txHash })
  },
})

module.exports = { Request }
