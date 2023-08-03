import { persistReducer } from 'redux-persist'
import { combineReducers, type Reducer } from 'redux'
import { connectRouter } from 'connected-react-router'
import * as reducers from './modules'
import { persistConfig as walletPersistConfig } from './modules/wallet'
import { persistConfig as balancePersistConfig } from './modules/balance'
import { persistConfig as globalPersistConfig } from './modules/global'
import localForage from 'localforage'
import config from '../config'
import { type History } from 'history'
import { type WalletState } from './modules/wallet/reducers'
import { type GlobalState } from './modules/global/reducers'
import { type BalanceState } from './modules/balance/reducers'

const storage = localForage.createInstance({
  name: config.appId,
  driver: localForage.INDEXEDDB,
  version: 1.0,
  storeName: 'SMSWalletState'
})

export const rootConfig = {
  key: 'root',
  storage,
  whitelist: [
    walletPersistConfig.key,
    balancePersistConfig.key,
    globalPersistConfig.key
  ]
}

const lastAction = (state = null, action): any => {
  return action.type
}

const rootReducer = (history: History): Reducer => combineReducers({
  ...reducers,
  wallet: persistReducer({ ...walletPersistConfig, storage }, reducers.wallet),
  balance: persistReducer({ ...balancePersistConfig, storage }, reducers.balance),
  global: persistReducer({ ...globalPersistConfig, storage }, reducers.global),
  router: connectRouter(history),
  lastAction
})

export default (history: History): Reducer => persistReducer(rootConfig, rootReducer(history))

// export default (history) => persistCombineReducers(rootConfig, {
//   ...reducers,
//   wallet: persistReducer(walletConfig, reducers.wallet),
//   router: connectRouter(history)
// })

export interface RootState {
  wallet: WalletState
  global: GlobalState
  balance: BalanceState
}
