import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { createBrowserHistory } from 'history'
import { createReduxHistoryContext } from 'redux-first-history'

import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import { buildRootReducer } from './rootReducer'

export const sagaMiddleware = createSagaMiddleware()

const {
  createReduxHistory,
  routerMiddleware,
  routerReducer
} = createReduxHistoryContext(
  { history: createBrowserHistory() }
)

const store = configureStore({
  reducer: buildRootReducer(routerReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }).concat(
      routerMiddleware,
      sagaMiddleware
    )
})

export const persistor = persistStore(store)
export const history = createReduxHistory(store)

export default store
