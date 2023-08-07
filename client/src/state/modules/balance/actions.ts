import { createAction } from '@reduxjs/toolkit'

export interface FetchTokenBalanceSuccessPayload {
  address: string
  key: string
  balance: string
}

export interface FetchTokenBalancePayload {
  address: string
  contractAddress: string
  tokenType: string
  tokenId: string
}

export interface FetchBalanceSuccessPayload {
  address: string
  balance: string
}

export interface FetchBalancePayload {
  address: string
}

const deleteBalance = createAction<string>('DELETE_BALANCE')

const fetchBalance = createAction<FetchBalancePayload>('FETCH_BALANCE')
const fetchBalanceSuccess = createAction<FetchBalanceSuccessPayload>('FETCH_BALANCE_SUCCESS')

const fetchTokenBalance = createAction<FetchTokenBalancePayload>('FETCH_TOKEN_BALANCE')
const fetchTokenBalanceSuccess = createAction<FetchTokenBalanceSuccessPayload>('FETCH_TOKEN_BALANCE_SUCCESS')

export default {
  deleteBalance,

  fetchBalance,
  fetchBalanceSuccess,
  fetchTokenBalance,
  fetchTokenBalanceSuccess
}
