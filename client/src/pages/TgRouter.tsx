import React from 'react'
import apis from '../api'
import { useSelector } from 'react-redux'
import paths from './paths'
import { Navigate } from 'react-router'
import { type RootState } from '../state/rootReducer'
import { type WalletState } from '../state/modules/wallet/reducers'
import querystring from 'query-string'

const TgRouter = (): React.JSX.Element => {
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const qs = querystring.parse(location.search) as Record<string, string>
  const { userId, sessionId } = qs
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const state = wallet[address ?? '']
  const pk = state?.pk
  const phone = state?.phone

  if (address && pk && phone) {
    console.log('redirecting to existing wallet', address)
    return <Navigate to={{ pathname: paths.wallet, search: '?tg' }} />
  }

  // TODO: delete address if pk and phone are not present

  return <Navigate to={{ pathname: paths.wallet, search: `?userId=${userId}&sessionId=${sessionId}` }} />
}

export default TgRouter
