import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, useHistory, useRouteMatch } from 'react-router'
import paths from './paths'
import MainContainer from '../components/Container'
import { BaseText, Desc } from '../components/Text'
import apis from '../api'
import { toast } from 'react-toastify'
import { processError } from '../utils'
import { ApproveTransaction } from './ApproveTransaction'

const Request = () => {
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet)[0]

  const match = useRouteMatch(paths.request)
  const { id } = match ? match.params : {}
  const [request, setRequest] = useState()
  const { calldata, caller, callback, comment, amount, dest } = request || {}
  useEffect(() => {
    async function f () {
      try {
        const signature = apis.web3.web3.eth.accounts.sign(id, pk).signature
        const { request } = await apis.server.requestView({ id, address, signature })
        // TODO: verify hash of calldata
        setRequest(request)
      } catch (ex) {
        console.error(ex)
        toast.error(`Error parsing request: ${processError(ex)}`)
      }
      // const u = new URL(location.href)
      // u.pathname = paths.call
      // for (const key of u.searchParams.keys()) {
      //   u.searchParams.delete(key)
      // }
      // for (const [k, v] of Object.entries({ id, amount, dest, calldata, caller, callback, comment })) {
      //   u.searchParams.append(k, v)
      // }
    }
    f()
  }, [])

  const pk = wallet[address]?.pk
  if (!pk) {
    return <Redirect to={paths.signup} />
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
        <Desc>
          <BaseText>Error: the app which sent you here submitted an invalid request. Please contact the app developer.</BaseText>
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
      amount={amount}
      dest={dest}
      onComplete={onComplete}
    />

  )
}

export default Request
