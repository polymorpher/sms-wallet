import { handleActions } from 'redux-actions'
import globalActions from './actions'

// address -> wallet
export const initialState = {
  next: {},
  prefilledPhone: null
}

const reducer = handleActions({
  [globalActions.setNextAction as any]: (state, action) => ({
    ...state,
    next: { ...action.payload }
  }),
  [globalActions.setPrefilledPhone as any]: (state, action) => ({
    ...state,
    prefilledPhone: action.payload
  })
}, { ...initialState })

export default reducer
