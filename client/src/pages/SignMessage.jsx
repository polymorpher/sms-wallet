import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import paths from './paths'

const SignMessage = () => {
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet)[0]
  const pk = wallet[address]?.pk
  if (!pk) {
    return <Redirect to={paths.signup} />
  }
}

export default SignMessage
