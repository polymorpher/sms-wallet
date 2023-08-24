import './app.scss'
import React from 'react'
import { createRoot } from 'react-dom/client'
import rootSaga from './state/rootSaga'
import store, { history, persistor } from './state/store'
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker'
import Routes from './AppRoutes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-phone-number-input/style.css'
import { HistoryRouter } from 'redux-first-history/rr6'
import { PersistGate } from 'redux-persist/es/integration/react'
import { Loading } from './components/Misc'

// eslint-disable-next-line @typescript-eslint/no-empty-function
document.body.ontouchstart = function (): void {}

rootSaga.run()

const container = document.getElementById('root')

if (container != null) {
  const root = createRoot(container)
  root.render(
    <Provider store={store}>
      <PersistGate loading={<Loading/>} persistor={persistor}>
        <HistoryRouter history={history}>
          <Routes />
          <ToastContainer />
        </HistoryRouter>
      </PersistGate>
    </Provider>
  )
}

serviceWorker.unregister()
