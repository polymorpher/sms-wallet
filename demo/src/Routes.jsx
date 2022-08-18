import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Landing from './pages/Landing'
import CallDemo from './pages/CallDemo'

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' render={() => <Landing />} />
        <Route path='' render={() => <CallDemo />} />
        <Redirect to='/' />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
