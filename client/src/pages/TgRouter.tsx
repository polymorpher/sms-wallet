import React, { useEffect } from 'react'
import paths from './paths'
import { useNavigate } from 'react-router'
import querystring from 'query-string'
import useMultipleWallet from '../hooks/useMultipleWallet'

const TgRouter = (): React.JSX.Element => {
  const qs = querystring.parse(location.search) as Record<string, string>
  const { userId, sessionId } = qs
  const { wallet, containWallet, switchWallet } = useMultipleWallet()
  const navigate = useNavigate()

  useEffect(() => {
    if (wallet?.address && wallet.pk && wallet.phone === userId) {
      navigate(paths.wallet)
    } else if (containWallet(userId)) {
      switchWallet(userId)
    } else {
      navigate({ pathname: paths.tgSignup, search: `?userId=${userId}&sessionId=${sessionId}` })
    }
  }, [wallet, switchWallet, containWallet, navigate, sessionId, userId])

  return <></>
}

export default TgRouter
