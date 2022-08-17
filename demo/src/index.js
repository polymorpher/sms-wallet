import './app.scss'
import React from 'react'
import ReactDOM from 'react-dom'

import Routes from './Routes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

document.body.ontouchstart = function () {}

ReactDOM.render(
  <>
    <Routes />
    <ToastContainer />
  </>,
  document.getElementById('root')
)
