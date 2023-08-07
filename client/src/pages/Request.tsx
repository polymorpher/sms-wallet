import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router'
import paths from './paths'
import MainContainer from '../components/Container'
import { BaseText, Desc, DescLeft } from '../components/Text'
import apis, { type CallRequest } from '../api'
import { toast } from 'react-toastify'
import { processError, utils } from '../utils'
import { ApproveTransaction, decodeCalldata } from './ApproveTransaction'
import { Button } from '../components/Controls'
import { TailSpin } from 'react-loading-icons'
import { globalActions } from '../state/modules/global'
import { type RootState } from '../state/rootReducer'
import { type WalletState } from '../state/modules/wallet/reducers'
import querystring from 'query-string'

const Request = (): React.JSX.Element => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const match = useParams()
  const { id } = match ?? {}
  const qs = querystring.parse(location.search) as Record<string, string>
  const phone = qs.phone ?? ''
  const [request, setRequest] = useState<CallRequest | undefined>()
  const [error, setError] = useState<string | undefined>()
  const {
    calldata: calldataB64Encoded,
    caller, callback: callbackURL, comment, amount,
    dest
  } = request ?? {}
  const calldata = decodeCalldata(calldataB64Encoded)
  const callback = utils.safeURL(callbackURL ?? '')
  const pk = wallet[address ?? '']?.pk

  useEffect(() => {
    if (phone) {
      dispatch(globalActions.setPrefilledPhone(phone))
    }
  }, [dispatch, phone])

  useEffect(() => {
    async function f (): Promise<void> {
      if (!id || !pk || !address) {
        return
      }
      try {
        const signature = apis.web3.wallet(pk).signMessageSync(id)
        const { request } = await apis.server.requestView({ id, address, signature })
        console.log(request)
        // TODO: verify hash of calldata
        setRequest(request)
      } catch (ex: any) {
        console.error(ex)
        const error = processError(ex)
        setError(error)
        toast.error('Error processing request')
      }
    }
    f().catch(console.error)
  }, [address, id, pk])

  if (!pk) {
    dispatch(globalActions.setNextAction({ path: paths.request, query: location.search }))
    return <Navigate to={paths.signup} />
  }

  if (error) {
    return (
      <MainContainer withMenu>
        <DescLeft>
          <BaseText>An error occurred:</BaseText>
          <BaseText $color='red'>{error}</BaseText>
        </DescLeft>
        <Desc>
          <Button $width='196px' onClick={() => { navigate(paths.wallet) }}>Return to Wallet</Button>
        </Desc>
      </MainContainer>
    )
  }

  const onComplete = async (receipt): Promise<void> => {
    try {
      const txHash = receipt.transactionHash
      const signature = apis.web3.wallet(pk).signMessageSync(`${id} ${txHash}`)
      await apis.server.requestComplete({ address, signature, id, txHash })
    } catch (ex) {
      console.error(ex)
      toast.error(processError(ex))
    }
  }

  if (!id) {
    return (
      <MainContainer withMenu>
        <DescLeft>
          <BaseText>Error: the app which sent you here submitted an invalid request. Please contact the app developer.</BaseText>
        </DescLeft>
        <Desc>
          <Button $width='196px' onClick={() => { navigate(paths.wallet) }}>Return to Wallet</Button>
        </Desc>
      </MainContainer>
    )
  }
  if (!request) {
    return (
      <MainContainer withMenu>
        <Desc>
          <TailSpin stroke='black' width={48} height={48} />
          <BaseText>Loading Request...</BaseText>
        </Desc>
      </MainContainer>
    )
  }

  return (
    <ApproveTransaction
      calldata={calldata}
      caller={caller}
      callback={callback}
      comment={comment}
      inputAmount={amount}
      dest={dest ?? ''}
      onComplete={onComplete}
    />

  )
}

export default Request
