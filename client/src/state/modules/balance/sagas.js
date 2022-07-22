import { put, all, call, takeEvery } from 'redux-saga/effects'
import balanceActions from './actions'
import api from '../../../api'

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

// function * handleFetchTokenBalance (action) {
//   try {
//     const { address, contractAddress, tokenType, tokenId, key } = action.payload
//     const balance = yield call(api.blockchain.tokenBalance, { contractAddress, tokenType, tokenId, address })
//     yield all([
//       put(balanceActions.fetchTokenBalanceSuccess({ address, key, balance: balance.toString() })),
//     ])
//   } catch (err) {
//     console.error(err)
//   }
// }

function * balanceSagas () {
  yield all([
    takeEvery(balanceActions.fetchBalance().type, handleFetchBalance),
    // takeEvery(balanceActions.fetchTokenBalance().type, handleFetchTokenBalance),
  ])
}

export default balanceSagas
