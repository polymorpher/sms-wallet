import { handleActions } from 'redux-actions'
import globalActions, { type NextAction } from './actions'

export interface GlobalState {
  next: NextAction
  prefilledPhone?: string
}

export const initialState = {
  next: {},
  prefilledPhone: undefined
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
