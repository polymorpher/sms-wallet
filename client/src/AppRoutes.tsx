import React from 'react'
import { Route, Routes } from 'react-router-dom'
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
import TgRouter from './pages/TgRouter'
const AppRoutes = (): React.JSX.Element => {
  return (
    <Routes>
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
