import { persistCombineReducers, persistReducer } from 'redux-persist'
import * as reducers from './modules'
import { persistConfig as walletPersistConfig } from './modules/wallet'
import { persistConfig as balancePersistConfig } from './modules/balance'
import { persistConfig as globalPersistConfig } from './modules/global'
import localForage from 'localforage'
import config from '../config'
import { type WalletState } from './modules/wallet/reducers'
import { type GlobalState } from './modules/global/reducers'
import { type BalanceState } from './modules/balance/reducers'
import { type Reducer } from 'redux'
import { type RouterState } from 'redux-first-history/src/reducer'

const storage = localForage.createInstance({
  name: config.appId,
  driver: localForage.INDEXEDDB,
  version: 1.0,
  storeName: 'SMSWalletState'
})

export const buildRootReducer = (routerReducer: Reducer<RouterState>): Reducer => persistCombineReducers({
  key: 'root',
  storage,
  whitelist: [
    walletPersistConfig.key,
    balancePersistConfig.key,
    globalPersistConfig.key
  ]
}, {
  router: routerReducer,
  wallet: persistReducer({ ...walletPersistConfig, storage }, reducers.wallet),
  balance: persistReducer({ ...balancePersistConfig, storage }, reducers.balance),
  global: persistReducer({ ...globalPersistConfig, storage }, reducers.global)
})

export interface RootState {
  wallet: WalletState
  global: GlobalState
  balance: BalanceState
}
