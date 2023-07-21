import { pick } from 'lodash'

import { GenericBuilder } from './generic.ts'

const SettingPrototype = GenericBuilder('setting')
const SettingKeys = ['hide']
export const Setting = ({
  ...SettingPrototype,
  update: async (id, fields, override) => {
    fields = pick(fields, SettingKeys)
    const newSetting = await SettingPrototype.update(id, fields, override)
    if (!newSetting) {
      return null
    }
    return pick(newSetting, SettingKeys)
  },
  get: async (id) => {
    const u = await SettingPrototype.get(id)
    if (!u) {
      return null
    }
    return pick(u, SettingKeys)
  }
})
