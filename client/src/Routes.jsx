import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Signup from './pages/Signup'
import Wallet from './pages/Wallet'
import Recover from './pages/Recover'
import paths from './pages/paths'
import { persistStore } from 'redux-persist'
import { useDispatch } from 'react-redux'
import { FlexColumn, FlexRow } from './components/Layout'
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
        <Route path={paths.signup} render={() => <Signup />} />
        <Route path={paths.recover} render={() => <Recover />} />
        <Redirect to={paths.root} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
