import { createAction } from '@reduxjs/toolkit'

const fetchWallet = createAction('FETCH_WALLET')
const fetchWalletSuccess = createAction('FETCH_WALLET_SUCCESS')

const updateWallet = createAction('UPDATE_WALLET')
const deleteWallet = createAction('DELETE_WALLET')
const deleteAllWallet = createAction('DELETE_ALL_WALLET')

const trackTokens = createAction('TRACK_TOKENS')
const overrideTokens = createAction('OVERRIDE_TOKENS')
const untrackTokens = createAction('UNTRACK_TOKENS')
const setSelectedToken = createAction('SET_SELECTED_TOKEN')

export default {

  fetchWallet,
  fetchWalletSuccess,
  updateWallet,
  deleteWallet,
  deleteAllWallet,

  overrideTokens,
  trackTokens,
  untrackTokens,
  setSelectedToken,
}
