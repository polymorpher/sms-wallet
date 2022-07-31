const { pick } = require('lodash')
const { GenericBuilder } = require('./generic')
const SettingPrototype = GenericBuilder('setting')
const SettingKeys = ['hide']
const Setting = ({
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
  },
})

module.exports = { Setting }
