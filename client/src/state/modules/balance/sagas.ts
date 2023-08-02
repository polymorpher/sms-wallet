import { put, all, call, takeEvery } from 'redux-saga/effects'
import balanceActions, { type FetchBalancePayload, type FetchTokenBalancePayload } from './actions'
import api from '../../../api'
import { utils } from '../../../utils'
import { type Effect } from '@redux-saga/types'

function * handleFetchBalance (action): Generator<Effect> {
  try {
    const { address } = action.payload as FetchBalancePayload
    const balance = yield call(api.blockchain.getBalance, { address })
    yield all([
      put(balanceActions.fetchBalanceSuccess({ address, balance: (balance as bigint).toString() }))
    ])
  } catch (err) {
    console.error(err)
  }
}

function * handleFetchTokenBalance (action): Generator<Effect> {
  try {
    const { address, contractAddress, tokenType, tokenId } = action.payload as FetchTokenBalancePayload
    const key = utils.computeTokenKey({ contractAddress, tokenType, tokenId }).string
    if (!key) {
      return
    }
    const balance = yield call(api.blockchain.getTokenBalance, { contractAddress, tokenType, tokenId, address })
    yield all([
      put(balanceActions.fetchTokenBalanceSuccess({ address, key, balance: (balance as bigint).toString() }))
    ])
  } catch (err) {
    console.error(err)
  }
}

function * balanceSagas (): Generator<Effect> {
  yield all([
    takeEvery(balanceActions.fetchBalance.type, handleFetchBalance),
    takeEvery(balanceActions.fetchTokenBalance.type, handleFetchTokenBalance)
  ])
}

export default balanceSagas
