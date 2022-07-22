import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Signup from './pages/Signup'
import Wallet from './pages/Wallet'
import Recover from './pages/Recover'
import paths from './pages/paths'
const Routes = () => {
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
