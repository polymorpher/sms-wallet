import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useHistory } from 'react-router'
import paths from './paths'
import MainContainer from '../components/Container'
import querystring from 'query-string'
import { BaseText, Desc, DescLeft, Hint, Title } from '../components/Text'
import { Button, CancelButton } from '../components/Controls'
import apis from '../api'
import { toast } from 'react-toastify'
import { Row } from '../components/Layout'
import { utils } from '../utils'
import { globalActions } from '../state/modules/global'

const SignMessage = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const qs = querystring.parse(location.search)
  const callback = utils.safeURL(qs.callback && Buffer.from(decodeURIComponent(qs.callback), 'base64').toString())
  const { caller, message, comment, phone } = qs

  useEffect(() => {
    if (phone) {
      dispatch(globalActions.setPrefilledPhone(phone))
    }
  }, [phone])

  const pk = wallet[address]?.pk
  if (!pk) {
    dispatch(globalActions.setNextAction({ path: paths.sign, query: location.search }))
    return <Redirect to={paths.signup} />
  }
  if (!callback || !message) {
    return (
      <MainContainer withMenu>
        <Desc>
          <BaseText>Error: the app which sent you here has malformed callback URL or message. Please contact the app developer.</BaseText>
          <Button onClick={() => history.goBack()}> Go back</Button>
        </Desc>
      </MainContainer>
    )
  }

  const sign = async () => {
    try {
      const sig = apis.web3.web3.eth.accounts.sign(message, pk)
      const returnUrl = new URL(callback)
      returnUrl.searchParams.append('signature', sig.signature)
      returnUrl.searchParams.append('messageHash', sig.messageHash)
      returnUrl.searchParams.append('address', address)
      toast.success(`Signing complete. Returning to app at ${returnUrl.hostname}`)
      setTimeout(() => { location.href = returnUrl.href }, 1000)
    } catch (ex) {
      console.error(ex)
      toast.error(`Error signing the message: ${ex.toString()}`)
    }
  }

  const cancel = async () => {
    try {
      const returnUrl = new URL(callback)
      returnUrl.searchParams.append('error', 'cancelled')
      returnUrl.searchParams.append('cancelled', 'true')
      toast.info(`Signing cancelled. Returning to app at ${returnUrl.hostname}`)
      setTimeout(() => { location.href = callback.href }, 1000)
    } catch (ex) {
      console.error(ex)
      toast.error(`Error occurred: ${ex.toString()}`)
    }
  }

  return (
    <MainContainer withMenu>
      <DescLeft>
        <Title>{caller || 'An App'} ({callback.hostname}) requests you to sign a message</Title>
        {comment && <BaseText>Reason: {comment}</BaseText>}
        <Hint>Tips: Apps often request signatures for authentication, login, or verification purposes. Signing a message won't grant the app to access your NFT or your funds</Hint>
      </DescLeft>
      <DescLeft>
        <BaseText>Message</BaseText>
        <BaseText style={{ fontSize: 12 }}>{message}</BaseText>
      </DescLeft>
      <Row style={{ justifyContent: 'space-between', padding: '0 16px' }}>
        <CancelButton onClick={cancel}>Cancel</CancelButton>
        <Button onClick={sign}>Confirm</Button>
      </Row>

    </MainContainer>
  )
}

export default SignMessage
