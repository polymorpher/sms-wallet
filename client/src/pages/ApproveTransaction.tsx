import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { type RootState } from '../state/rootReducer'
import { type WalletState } from '../state/modules/wallet/reducers'
import { type TransactionReceipt } from 'ethers'
import { Navigate, useNavigate } from 'react-router'

export const decodeCalldata = (calldataB64Encoded?: string): any => {
  const calldataDecoded = Buffer.from(calldataB64Encoded ?? '', 'base64').toString()
  try {
    return JSON.parse(calldataDecoded)
  } catch (ex) {
    console.error(ex)
    return null
  }
}

export interface ApproveTransactionParams {
  dest: string
  calldata: {
    method?: string
    selector?: string
    parameters?: Array<{ type: string, value: string }>
    calldata?: string
  }
  callback: URL
  caller?: string
  comment?: string
  inputAmount?: string
  onComplete?: (txr: TransactionReceipt) => any
}

export const ApproveTransaction = ({ calldata, caller, callback, comment, inputAmount, dest, onComplete }: ApproveTransactionParams): React.JSX.Element => {
  const wallet = useSelector((state: RootState) => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))

  const [showDetails, setShowDetails] = useState(false)
  const { balance: amount, formatted: amountFormatted } = utils.toBalance(inputAmount ?? '0')

  if (!address || !wallet[address]?.pk) {
    return <Navigate to={paths.signup} />
  }
  const pk = wallet[address]?.pk

  const execute = async (): Promise<void> => {
    if (!(dest?.startsWith('0x')) || !apis.web3.isValidAddress(dest)) {
      toast.error('Invalid address')
      return
    }
    try {
      const w = apis.web3.wallet(pk)
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
      const tx = await w.sendTransaction({
        to: dest,
        value: amount.toString(),
        data: encoded
      })
      const receipt = await tx.wait()
      if (!receipt) {
        toast.error(`Blockchain error. Transaction is completed but no receipt given. Hash: ${tx.hash}`)
        return
      }
      onComplete && await onComplete(receipt)
      const returnUrl = new URL(callback)
      returnUrl.searchParams.append('success', 'true')
      returnUrl.searchParams.append('hash', receipt.hash)
      returnUrl.searchParams.append('address', address)
      toast.success(
        <Row>
          <BaseText style={{ marginRight: 8 }}>Execution complete</BaseText>
          <LinkWrarpper target='_blank' href={utils.getExplorerUri(receipt.hash)}>
            <BaseText>View transaction</BaseText>
          </LinkWrarpper>
        </Row>
      )
      toast.success(`Returning to app at ${returnUrl.hostname}`)
      setTimeout(() => { location.href = returnUrl.href }, 1500)
    } catch (ex: any) {
      console.error(ex)
      toast.error(`Error during execution: ${ex.toString()}`)
    }
  }

  const cancel = async (): Promise<void> => {
    try {
      const returnUrl = new URL(callback)
      returnUrl.searchParams.append('error', 'cancelled')
      returnUrl.searchParams.append('cancelled', 'true')
      toast.info(`Execution cancelled. Returning to app at ${returnUrl.hostname}`)
      setTimeout(() => { location.href = callback.href }, 1000)
    } catch (ex: any) {
      console.error(ex)
      toast.error(`Error occurred: ${ex.toString()}`)
    }
  }

  return (
    <MainContainer withMenu>
      <DescLeft>
        <Title>{caller ?? 'An App'}{callback?.hostname ? ` (${callback?.hostname})` : ''} requests you to execute a contract call</Title>
        {amount > 0n && <BaseText> and to send {amountFormatted} ONE</BaseText>}
        {comment && <BaseText>Reason: {comment}</BaseText>}
        <Hint>Tips: Apps often make contract calls to transfer assets, such as NFTs and tokens, or to perform custom actions. Make sure you trust this app.</Hint>
      </DescLeft>
      <DescLeft>
        <BaseText>Contract: </BaseText>
        <Address>{dest}</Address>
        {!showDetails && <LinkWrarpper href='#' onClick={() => { setShowDetails(true) }}>Show Technical Details</LinkWrarpper>}
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
                  {(calldata.parameters ?? []).map((p, i) => {
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

export interface ApproveTransactionQuery {
  caller?: string
  comment?: string
  amount?: string
  inputAmount?: string
  dest?: string
  calldata?: string
  phone?: string
  callback?: string
}

const ApproveTransactionPage = (): React.JSX.Element => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { caller, comment, amount: inputAmount, dest, calldata: calldataB64Encoded, phone, callback: callbackEncoded } = querystring.parse(location.search) as ApproveTransactionQuery

  const callback = utils.safeURL(Buffer.from(decodeURIComponent(callbackEncoded ?? ''), 'base64').toString())

  const calldata = decodeCalldata(calldataB64Encoded)

  const wallet = useSelector<RootState, WalletState>(state => state.wallet ?? {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e)) ?? ''
  const pk = wallet[address]?.pk

  useEffect(() => {
    if (phone) {
      dispatch(globalActions.setPrefilledPhone(phone))
    }
  }, [dispatch, phone])

  if (!pk) {
    dispatch(globalActions.setNextAction({ path: paths.call, query: location.search }))
    return <Navigate to={paths.signup} />
  }

  if (!callback || !calldata || !dest) {
    return (
      <MainContainer withMenu>
        <Desc>
          <BaseText>Error: the app which sent you here has malformed callback URL, call data, or destination address. Please contact the app developer.</BaseText>
          <Button onClick={() => { navigate(-1) }}> Go back</Button>
        </Desc>
      </MainContainer>
    )
  }

  return <ApproveTransaction comment={comment} callback={callback} caller={caller} inputAmount={inputAmount} dest={dest} calldata={calldata} />
}

export default ApproveTransactionPage
