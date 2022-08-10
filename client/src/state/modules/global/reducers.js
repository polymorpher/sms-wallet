import { handleActions } from 'redux-actions'
import globalActions from './actions'

// address -> wallet
export const initialState = {
  next: {}
}

const reducer = handleActions({
  [globalActions.setNextAction]: (state, action) => ({
    ...state,
    next: { ...action.payload },
  }),
}, {
  ...initialState
})

export default reducer
