import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useHistory } from 'react-router'
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
import { globalActions } from '../state/modules/global'

export const decodeCalldata = (calldataB64Encoded) => {
  const calldataDecoded = Buffer.from(calldataB64Encoded || '', 'base64')
  try {
    return JSON.parse(calldataDecoded)
  } catch (ex) {
    console.error(ex)
    return null
  }
}

export const ApproveTransaction = ({ calldata, caller, callback, comment, inputAmount, dest, onComplete }) => {
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))

  const [showDetails, setShowDetails] = useState(false)
  const { balance: amount, formatted: amountFormatted } = utils.toBalance(inputAmount || 0)

  const pk = wallet[address]?.pk
  if (!pk) {
    return <Redirect to={paths.signup} />
  }

  const execute = async () => {
    if (!(dest?.startsWith('0x')) || !apis.web3.isValidAddress(dest)) {
      toast.error('Invalid address')
      return
    }
    try {
      apis.web3.changeAccount(pk)
      let types, values
      if (calldata.parameters) {
        types = calldata.parameters.map(p => p.type)
        if (types.filter(e => e) !== calldata.parameters.length) {
          types = null
        }
        values = calldata.parameters.map(p => p.value)
      }
      const encoded = utils.encodeCalldata({ method: calldata.method, selector: calldata.selector, types, values })
      console.log(encoded)
      const txParams = {
        to: dest,
        value: amount.toString(),
        data: encoded
      }
      const gas = await apis.web3.web3.eth.estimateGas(txParams)
      const receipt = await apis.web3.web3.eth.sendTransaction({ ...txParams, gas })
      onComplete && await onComplete(receipt)
      const hash = receipt.transactionHash
      const returnUrl = new URL(callback)
      returnUrl.searchParams.append('success', 'true')
      returnUrl.searchParams.append('hash', hash)
      returnUrl.searchParams.append('address', address)
      toast.success(
        <Row>
          <BaseText style={{ marginRight: 8 }}>Execution complete</BaseText>
          <LinkWrarpper target='_blank' href={utils.getExplorerUri(hash)}>
            <BaseText>View transaction</BaseText>
          </LinkWrarpper>
        </Row>
      )
      toast.success(`Returning to app at ${returnUrl.hostname}`)
      setTimeout(() => { location.href = returnUrl.href }, 1500)
    } catch (ex) {
      console.error(ex)
      toast.error(`Error during execution: ${ex.toString()}`)
    } finally {
      apis.web3.changeAccount()
    }
  }

  const cancel = async () => {
    try {
      const returnUrl = new URL(callback)
      returnUrl.searchParams.append('error', 'cancelled')
      returnUrl.searchParams.append('cancelled', 'true')
      toast.info(`Execution cancelled. Returning to app at ${returnUrl.hostname}`)
      setTimeout(() => { location.href = callback.href }, 1000)
    } catch (ex) {
      console.error(ex)
      toast.error(`Error occurred: ${ex.toString()}`)
    }
  }

  return (
    <MainContainer withMenu>
      <DescLeft>
        <Title>{caller || 'An App'}{callback?.hostname ? ` (${callback?.hostname})` : ''} requests you to execute a contract call</Title>
        {amount.gtn(0) && <BaseText> and to send {amountFormatted} ONE</BaseText>}
        {comment && <BaseText>Reason: {comment}</BaseText>}
        <Hint>Tips: Apps often make contract calls to transfer assets, such as NFTs and tokens, or to perform custom actions. Make sure you trust this app.</Hint>
      </DescLeft>
      <DescLeft>
        <BaseText>Contract: </BaseText>
        <Address>{dest}</Address>
        {!showDetails && <LinkWrarpper href='#' onClick={() => setShowDetails(true)}>Show Technical Details</LinkWrarpper>}
        {showDetails &&
          <>
            {calldata.calldata && calldata.selector
              ? (
                <>
                  <SmallText>Direct call with byte data</SmallText>
                  <SmallText>Selector: {calldata.selector}</SmallText>
                  <SmallText>Calldata: {calldata.calldata}</SmallText>
                </>)
              : (
                <>
                  <SmallText>Method: {calldata.method}</SmallText>
                  <SmallText>Parameters:</SmallText>
                  {(calldata.parameters || []).map((p, i) => {
                    return <SmallText style={{ wordBreak: 'break-all' }} key={`${i}`}>{JSON.stringify(pick(p, ['name', 'value', 'type']))}</SmallText>
                  })}
                </>)}
          </>}
      </DescLeft>
      <Row style={{ justifyContent: 'space-between', padding: '0 16px' }}>
        <CancelButton onClick={cancel}>Cancel</CancelButton>
        <Button onClick={execute}>Confirm</Button>
      </Row>

    </MainContainer>
  )
}

const ApproveTransactionPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const qs = querystring.parse(location.search)
  const callback = utils.safeURL(qs.callback && Buffer.from(decodeURIComponent(qs.callback), 'base64').toString())
  const { caller, comment, amount: inputAmount, dest, calldata: calldataB64Encoded, phone } = qs
  const calldata = decodeCalldata(calldataB64Encoded)

  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const pk = wallet[address]?.pk

  useEffect(() => {
    if (phone) {
      dispatch(globalActions.setPrefilledPhone(phone))
    }
  }, [phone])

  if (!pk) {
    dispatch(globalActions.setNextAction({ path: paths.call, query: location.search }))
    return <Redirect to={paths.signup} />
  }

  if (!callback || !calldata || !dest) {
    return (
      <MainContainer withMenu>
        <Desc>
          <BaseText>Error: the app which sent you here has malformed callback URL, call data, or destination address. Please contact the app developer.</BaseText>
          <Button onClick={() => history.goBack()}> Go back</Button>
        </Desc>
      </MainContainer>
    )
  }

  return <ApproveTransaction comment={comment} callback={callback} caller={caller} inputAmount={inputAmount} dest={dest} calldata={calldata} />
}

export default ApproveTransactionPage
