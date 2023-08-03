import { createAction } from '@reduxjs/toolkit'

export interface FetchWalletPayload {
  address: string
}
export interface FetchWalletSuccessPayload {
  address: string
  [key: string]: any
}

export interface UpdateWalletPayload {
  _merge?: boolean
  address: string
  phone?: string
  pk?: string
  eseed?: string
}
export interface DeleteWalletPayload {
  address: string
}

export interface TrackTokensPayload {
  address: string
  tokens: string[]
}

export type OverrideTokensPayload = TrackTokensPayload
export type UntrackTokensPayload = TrackTokensPayload

export interface SetSelectedTokenPayload {
  address: string
  selectedToken: string
}

const fetchWallet = createAction<FetchWalletPayload>('FETCH_WALLET')
const fetchWalletSuccess = createAction<FetchWalletSuccessPayload>('FETCH_WALLET_SUCCESS')

const updateWallet = createAction<UpdateWalletPayload>('UPDATE_WALLET')
const deleteWallet = createAction<DeleteWalletPayload>('DELETE_WALLET')
const deleteAllWallet = createAction('DELETE_ALL_WALLET')

const trackTokens = createAction<TrackTokensPayload>('TRACK_TOKENS')
const overrideTokens = createAction<OverrideTokensPayload>('OVERRIDE_TOKENS')
const untrackTokens = createAction<UntrackTokensPayload>('UNTRACK_TOKENS')
const setSelectedToken = createAction<SetSelectedTokenPayload>('SET_SELECTED_TOKEN')

export default {
  fetchWallet,
  fetchWalletSuccess,
  updateWallet,
  deleteWallet,
  deleteAllWallet,

  overrideTokens,
  trackTokens,
  untrackTokens,
  setSelectedToken
}
