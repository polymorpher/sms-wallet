import React, { useEffect } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Wallet from './pages/Wallet'
import Recover from './pages/Recover'
import paths from './pages/paths'
import SignMessage from './pages/SignMessage'
import ApproveTransactionPage from './pages/ApproveTransaction'
import Request from './pages/Request'
import Archive from './pages/Archive'
import TgSignup from './pages/TgSignup'
import TgRecover from './pages/TgRecover'
import SaveRecoverySecret from './pages/SaveRecoverySecret'
import querystring from 'query-string'
import TgRouter from './pages/TgRouter'
import useMultipleWallet from './hooks/useMultipleWallet'

const UserIdHandler = () => {
  const qs = querystring.parse(location.search) as Record<string, string>
  const { userId } = qs

  const { wallet, containWallet, switchWallet } = useMultipleWallet()

  useEffect(() => {
    if (wallet?.address && wallet.pk && wallet.phone === userId) {
      return
    } else if (containWallet(userId)) {
      switchWallet(userId)
    }
  }, [wallet, switchWallet, containWallet, userId])

  return (
    <Outlet />
  )
}

const AppRoutes = (): React.JSX.Element => {
  return (
    <Routes>
      <Route index element={<UserIdHandler />} />

      {/* <Route exact path='/' element={() => <Landing />} /> */}
      <Route path={paths.root} element={<Wallet />} />
      <Route path={paths.wallet} element={<Wallet />} />

      <Route path={paths.tg} element={<TgRouter />} />
      <Route path={paths.tgSignup} element={<TgSignup />} />
      <Route path={paths.tgRecover} element={<TgRecover />} />

      <Route path={paths.signup} element={<Signup />} />
      <Route path={paths.archive} element={<Archive />} />
      <Route path={paths.recover} element={<Recover />} />
      <Route path={paths.saveSecret} element={<SaveRecoverySecret />} />
      <Route path={paths.sign} element={<SignMessage />} />
      <Route path={paths.call} element={<ApproveTransactionPage />} />
      <Route path={paths.request} element={<Request />} />
      <Route path={'/*'} element={<Wallet />} />
    </Routes>
  )
}

export default AppRoutes
