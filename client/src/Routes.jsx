import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
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
const Routes = () => {
  const dispatch = useDispatch()
  const [rehydrated, setRehydrated] = useState(false)
  useEffect(() => {
    const store = require('./state/store')
    persistStore(store.default, null, () => {
      setRehydrated(true)
    })
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
      <Switch>
        {/* <Route exact path='/' render={() => <Landing />} /> */}
        <Route exact path={paths.root} render={() => <Wallet />} />
        <Route path={paths.wallet} render={() => <Wallet />} />
        <Route path={paths.signup} render={() => <Signup />} />
        <Route path={paths.recover} render={() => <Recover />} />
        <Route path={paths.sign} render={() => <SignMessage />} />
        <Route path={paths.call} render={() => <ApproveTransactionPage />} />
        <Route path={paths.request} render={() => <Request />} />
        <Redirect to={paths.root} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
