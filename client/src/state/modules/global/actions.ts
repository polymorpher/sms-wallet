import { createAction } from '@reduxjs/toolkit'

export interface NextAction {
  path?: string
  query?: string
}

const setNextAction = createAction<NextAction>('SET_NEXT_ACTION')
const setPrefilledPhone = createAction<string>('SET_PREFILLED_PHONE')

export default {
  setNextAction,
  setPrefilledPhone
}
