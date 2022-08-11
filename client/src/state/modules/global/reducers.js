import { handleActions } from 'redux-actions'
import globalActions from './actions'

// address -> wallet
export const initialState = {
  next: {},
  prefilledPhone: null,
}

const reducer = handleActions({
  [globalActions.setNextAction]: (state, action) => ({
    ...state,
    next: { ...action.payload },
  }),
  [globalActions.setPrefilledPhone]: (state, action) => ({
    ...state,
    prefilledPhone: action.payload,
  }),
}, {
  ...initialState
})

export default reducer
