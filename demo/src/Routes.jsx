import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Landing from './pages/Landing'
import CallDemo from './pages/CallDemo'
import RequestDemo from './pages/RequestDemo'
import CallbackDemo from './pages/Callback'
import SignatureDemo from './pages/SignatureDemo'

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' render={() => <Landing />} />
        <Route path='/call' render={() => <CallDemo />} />
        <Route path='/request' render={() => <RequestDemo />} />
        <Route path='/callback' render={() => <CallbackDemo />} />
        <Route path='/signature' render={() => <SignatureDemo />} />
        <Redirect to='/' />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
