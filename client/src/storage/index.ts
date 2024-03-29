import config from '../config'
import localforage from 'localforage'

const storage = localforage.createInstance({
  name: config.appId,
  driver: localforage.INDEXEDDB,
  version: 2.0,
  storeName: 'SMSWalletStorage'
})

export default storage
