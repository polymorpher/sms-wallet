import { type Effect } from '@redux-saga/types'
import { all } from '@redux-saga/core/effects'

function * globalSagas (): Generator<Effect> {
  yield all([])
}

export default globalSagas
