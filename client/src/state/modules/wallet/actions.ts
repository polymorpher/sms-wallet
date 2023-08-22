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
  // p is the recovery secret. It should be deleted as soon as the user saves it. They are given the option to save it later when creating the wallet
  p?: string
}
export interface TrackedToken {
  id?: string
  address?: string
  contractAddress: string
  tokenId: string
  tokenType: string
  key: string
}

export interface TrackTokensPayload {
  address: string
  tokens: TrackedToken[]
}

export type OverrideTokensPayload = TrackTokensPayload
export interface UntrackTokensPayload {
  address: string
  keys: string[]
}

export interface SetSelectedTokenPayload {
  address: string
  selectedToken: TrackedToken
}

const fetchWallet = createAction<FetchWalletPayload>('FETCH_WALLET')
const fetchWalletSuccess = createAction<FetchWalletSuccessPayload>('FETCH_WALLET_SUCCESS')

const updateWallet = createAction<UpdateWalletPayload>('UPDATE_WALLET')
const deleteWallet = createAction<string>('DELETE_WALLET')
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
