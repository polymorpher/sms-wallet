import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Signup from './pages/Signup'
import Wallet from './pages/Wallet'
import Recover from './pages/Recover'

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        {/* <Route exact path='/' render={() => <Landing />} /> */}
        <Route exact path='/' render={() => <Wallet />} />
        <Route path='/signup' render={() => <Signup />} />
        <Route path='/recover' render={() => <Recover />} />
        <Redirect to='/' />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
