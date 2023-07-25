import { v1 as uuid } from 'uuid'
import { GenericBuilder } from './generic.ts'

const UserPrototype = GenericBuilder('user')

export interface AddNewUser {
  id?: string
  phone: string
  ekey: string
  eseed: string
  address: string
}
export const User = ({
  ...UserPrototype,
  addNew: async ({ id, phone, ekey, eseed, address }: AddNewUser) => {
    id = id ?? uuid()
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
  findByUserHandle: async (userHandle: string) => {
    const [u] = await UserPrototype.find(['phone', userHandle])
    return u
  },
  findByAddress: async ({ address }) => {
    const [u] = await UserPrototype.find(['address', address.toLowerCase()])
    return u
  },
  isTgUser: (phone: string): boolean => {
    return phone.startsWith('tg:')
  },
  getTgUserId: (phone: string): string => {
    if (!User.isTgUser(phone)) {
      throw new Error('Not tg user')
    }
    return phone.slice(3)
  },
  makeTgUserHandle: (id: string): string => {
    return `tg:${id}`
  }
})
