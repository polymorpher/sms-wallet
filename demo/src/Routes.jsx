import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import Landing from './pages/Landing'
import Call from './pages/Call'

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' render={() => <Landing />} />
        <Route path='' render={() => <Call />} />
        <Redirect to='/' />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
