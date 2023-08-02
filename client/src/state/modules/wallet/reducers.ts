import { handleActions } from 'redux-actions'
import walletActions from './actions'
import uniq from 'lodash/fp/uniq'
import omit from 'lodash/fp/omit'

// address -> wallet
export const initialState = {}

const reducer = handleActions({
  [walletActions.fetchWalletSuccess as any]: (state, action) => ({
    ...state,
    [action.payload.address]: { ...state[action.payload.address], ...action.payload }
  }),

  [walletActions.updateWallet as any]: (state, action) => ({
    ...state,
    [action.payload.address]: action.payload._merge ? omit(['_merge'], { ...state[action.payload.address], ...action.payload }) : action.payload
  }),

  [walletActions.deleteWallet as any]: (state, action) => ({ ...omit([action.payload], state) }),

  [walletActions.deleteAllWallet as any]: () => ({}),

  [walletActions.trackTokens as any]: (state, action) => ({
    ...state,
    [action.payload.address]: {
      ...state[action.payload.address],
      trackedTokens: [...(state[action.payload.address]?.trackedTokens || []), ...action.payload.tokens],
      untrackedTokens: (state[action.payload.address]?.untrackedTokens || []).filter(k => (action.payload.tokens || []).find(t => t.key === k) === undefined)
    }
  }),
  [walletActions.overrideTokens as any]: (state, action) => ({
    ...state,
    [action.payload.address]: {
      ...state[action.payload.address],
      trackedTokens: [...action.payload.tokens],
      untrackedTokens: []
    }
  }),
  [walletActions.untrackTokens as any]: (state, action) => ({
    ...state,
    [action.payload.address]: {
      ...state[action.payload.address],
      trackedTokens: (state[action.payload.address]?.trackedTokens || []).filter(e => action.payload.keys.find(k => k === e.key) === undefined),
      untrackedTokens: uniq([...(state[action.payload.address]?.untrackedTokens || []), ...action.payload.keys])
    }
  }),
  [walletActions.setSelectedToken as any]: (state, action) => ({
    ...state,
    [action.payload.address]: {
      ...state[action.payload.address],
      selectedToken: action.payload.token
    }
  })
}, { ...initialState })

export default reducer
