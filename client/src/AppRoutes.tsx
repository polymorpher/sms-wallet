import React, { useEffect, useState, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Wallet from './pages/Wallet'
import Recover from './pages/Recover'
import paths from './pages/paths'
import { persistStore } from 'redux-persist'
import { useDispatch } from 'react-redux'
import { FlexColumn, FlexRow } from './components/Layout'
import SignMessage from './pages/SignMessage'
import ApproveTransactionPage from './pages/ApproveTransaction'
import Request from './pages/Request'
import Archive from './pages/Archive'
const AppRoutes = () => {
  const dispatch = useDispatch()
  const [rehydrated, setRehydrated] = useState(false)
  useEffect(() => {
    async function f (): Promise<void> {
      const store = await import('./state/store')
      persistStore(store.default, null, () => {
        setRehydrated(true)
      })
    }
    f().catch(console.error)
  }, [dispatch])
  if (!rehydrated) {
    return (
      <FlexColumn style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <FlexRow style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          Loading...
        </FlexRow>
      </FlexColumn>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route exact path='/' element={() => <Landing />} /> */}
        <Route path={paths.root} element={<Wallet />} />
        <Route path={paths.wallet} element={<Wallet />} />
        <Route path={paths.signup} element={<Signup />} />
        <Route path={paths.archive} element={<Archive />} />
        <Route path={paths.recover} element={<Recover />} />
        <Route path={paths.sign} element={<SignMessage />} />
        <Route path={paths.call} element={<ApproveTransactionPage />} />
        <Route path={paths.request} element={<Request />} />
        <Route path={'/*'} element={<Wallet />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
