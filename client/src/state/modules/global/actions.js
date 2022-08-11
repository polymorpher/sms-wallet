import { createAction } from '@reduxjs/toolkit'

const setNextAction = createAction('SET_NEXT_ACTION')
const setPrefilledPhone = createAction('SET_PREFILLED_PHONE')

export default {
  setNextAction,
  setPrefilledPhone
}
