import './app.scss'
import React from 'react'
import { createRoot } from 'react-dom/client'
import rootSaga from './state/rootSaga'
import store, { history } from './state/store'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import * as serviceWorker from './serviceWorker'
import Routes from './AppRoutes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-phone-number-input/style.css'

document.body.ontouchstart = function (): void {}

rootSaga.run()

const container = document.getElementById('root')

if (container != null) {
  const root = createRoot(container)
  root.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes />
        <ToastContainer />
      </ConnectedRouter>
    </Provider>
  )
}

serviceWorker.unregister()
