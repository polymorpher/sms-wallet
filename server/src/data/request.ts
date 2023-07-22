import { v4 as uuid } from 'uuid'
import { GenericBuilder } from './generic.ts'

import utils from '../../utils.ts'
import stringify from 'json-stable-stringify'

const RequestPrototype = GenericBuilder('request')
export const Request = ({
  ...RequestPrototype,
  add: async ({ request, address }) => {
    const id = uuid()
    const requestStr = stringify(request)``
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
  }
})
