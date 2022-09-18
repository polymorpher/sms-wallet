import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useHistory, useRouteMatch } from 'react-router'
import paths from './paths'
import MainContainer from '../components/Container'
import { BaseText, Desc, DescLeft } from '../components/Text'
import apis from '../api'
import { toast } from 'react-toastify'
import { processError, utils } from '../utils'
import { ApproveTransaction, decodeCalldata } from './ApproveTransaction'
import { Button } from '../components/Controls'
import { TailSpin } from 'react-loading-icons'
import { globalActions } from '../state/modules/global'

const Request = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))

  const match = useRouteMatch(paths.request)
  const { id, phone } = match ? match.params : {}
  const [request, setRequest] = useState()
  const [error, setError] = useState()
  const { calldata: calldataB64Encoded, caller, callback: callbackURL, comment, amount, dest } = request || {}
  const calldata = decodeCalldata(calldataB64Encoded)
  const callback = utils.safeURL(callbackURL)
  useEffect(() => {
    if (phone) {
      dispatch(globalActions.setPrefilledPhone(phone))
    }
  }, [phone])

  useEffect(() => {
    async function f () {
      try {
        const signature = apis.web3.web3.eth.accounts.sign(id, pk).signature
        const { request } = await apis.server.requestView({ id, address, signature })
        console.log(request)
        // TODO: verify hash of calldata
        setRequest(request)
      } catch (ex) {
        console.error(ex)
        const error = processError(ex)
        setError(error)
        toast.error('Error processing request')
      }
    }
    f()
  }, [])

  const pk = wallet[address]?.pk
  if (!pk) {
    dispatch(globalActions.setNextAction({ path: paths.request, query: location.search }))
    return <Redirect to={paths.signup} />
  }

  if (error) {
    return (
      <MainContainer withMenu>
        <DescLeft>
          <BaseText>An error occurred:</BaseText>
          <BaseText $color='red'>{error}</BaseText>
        </DescLeft>
        <Desc>
          <Button $width='196px' onClick={() => history.push(paths.wallet)}>Return to Wallet</Button>
        </Desc>
      </MainContainer>
    )
  }

  const onComplete = async (receipt) => {
    try {
      const txHash = receipt.transactionHash
      const signature = apis.web3.web3.eth.accounts.sign(`${id} ${txHash}`, pk).signature
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
          <Button $width='196px' onClick={() => history.push(paths.wallet)}>Return to Wallet</Button>
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
      dest={dest}
      onComplete={onComplete}
    />

  )
}

export default Request
