import reducer from './reducers'

export { default as globalSagas } from './sagas'
export { default as globalActions } from './actions'

export const persistConfig = {
  key: 'global',
  blacklist: []
}

export default reducer
