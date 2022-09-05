import { put, all, call, takeEvery } from 'redux-saga/effects'
import balanceActions from './actions'
import api from '../../../api'
import { utils } from '../../../utils'

function * handleFetchBalance (action) {
  try {
    const { address } = action.payload
    const balanceBN = yield call(api.blockchain.getBalance, { address })
    yield all([
      put(balanceActions.fetchBalanceSuccess({ address, balance: balanceBN.toString() })),
    ])
  } catch (err) {
    console.error(err)
  }
}

function * handleFetchTokenBalance (action) {
  try {
    const { address, contractAddress, tokenType, tokenId } = action.payload
    const key = utils.computeTokenKey(action.payload).string
    if (!key) {
      return
    }
    console.log({ key, contractAddress, tokenId, tokenType })
    const balance = yield call(api.blockchain.getTokenBalance, { contractAddress, tokenType, tokenId, address })
    yield all([
      put(balanceActions.fetchTokenBalanceSuccess({ address, key, balance: balance.toString() })),
    ])
  } catch (err) {
    console.error(err)
  }
}

function * balanceSagas () {
  yield all([
    takeEvery(balanceActions.fetchBalance().type, handleFetchBalance),
    takeEvery(balanceActions.fetchTokenBalance().type, handleFetchTokenBalance),
  ])
}

export default balanceSagas
