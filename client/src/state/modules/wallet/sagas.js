import { put, all, call, takeEvery } from 'redux-saga/effects'
import walletActions from './actions'
import balanceActions from '../balance/actions'
import api from '../../../api'

// function * handleFetchWallet (action) {
//   try {
//     const { address } = action.payload
//     const wallet = yield call(api.blockchain.getWallet, { address })
//     yield all([
//       put(walletActions.fetchWalletSuccess({ ...wallet })),
//     ])
//   } catch (err) {
//     console.error(err)
//   }
// }

function * handleDeleteWallet (action) {
  yield all([
    put(balanceActions.deleteBalance(action.payload)),
  ])
}

function * walletSagas () {
  yield all([
    // takeEvery(walletActions.fetchWallet().type, handleFetchWallet),
    takeEvery(walletActions.deleteWallet().type, handleDeleteWallet),
  ])
}

export default walletSagas
