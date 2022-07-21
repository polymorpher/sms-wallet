import './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import rootSaga from './state/rootSaga'
import store, { history } from './state/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import * as serviceWorker from './serviceWorker'
import Routes from './Routes'
document.body.ontouchstart = function () {}

rootSaga.run()
ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Routes />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)

serviceWorker.unregister()
