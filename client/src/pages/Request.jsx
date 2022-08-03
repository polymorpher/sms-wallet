import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, useHistory, useRouteMatch } from 'react-router'
import paths from './paths'
import MainContainer from '../components/Container'
import querystring from 'query-string'
import { Address, BaseText, Desc, DescLeft, Hint, SmallText, Title } from '../components/Text'
import { Button, CancelButton, LinkWrarpper } from '../components/Controls'
import apis from '../api'
import { toast } from 'react-toastify'
import { Row } from '../components/Layout'
import { utils } from '../utils'
import { pick } from 'lodash'

const decodeCalldata = (calldataB64Encoded) => {
  const calldataDecoded = Buffer.from(calldataB64Encoded || '', 'base64')
  try {
    return JSON.parse(calldataDecoded)
  } catch (ex) {
    console.error(ex)
    return null
  }
}

const Request = () => {
  const history = useHistory()
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet)[0]

  const match = useRouteMatch(paths.request)
  const { id } = match ? match.params : {}

  useEffect(() => {

  }, [])

  const pk = wallet[address]?.pk
  if (!pk) {
    return <Redirect to={paths.signup} />
  }
  if (!id) {
    return (
      <MainContainer withMenu>
        <Desc>
          <BaseText>Error: the app which sent you here submitted an invalid request. Please contact the app developer.</BaseText>
        </Desc>
      </MainContainer>
    )
  }

  return (<></>

  )
}

export default Request
