import React, { useState } from 'react'
import { BaseText, Desc, Title } from '../components/Text'
import { toast } from 'react-toastify'
import { Button, Input } from '../components/Controls'
import { processError, utils } from '../utils'
import apis from '../api'
import { walletActions } from '../state/modules/wallet'
import { useDispatch, useSelector } from 'react-redux'
import paths from './paths'
import { useNavigate } from 'react-router'
import MainContainer from '../components/Container'
import { globalActions } from '../state/modules/global'
import { type RootState } from '../state/rootReducer'
import { type NextAction } from '../state/modules/global/actions'
import querystring from 'query-string'

const Recover = (): React.JSX.Element => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [p, setP] = useState<Uint8Array | undefined>()
  const [verifying, setVerifying] = useState(false)
  const next = useSelector<RootState, NextAction>(state => state.global.next || {})
  const [password, setPassword] = useState('')
  const qs = querystring.parse(location.search) as Record<string, string>
  const { userId, sessionId } = qs

  const restore = async (): Promise<void> => {
    let p: undefined | Uint8Array
    try {
      p = utils.hexStringToBytes(password)
    } catch (ex: any) {
      console.error(ex)
    }
    if (!p) {
      toast.error('Malformed recover secret')
      return
    }
    setVerifying(true)
    const fullId = `tg:${userId}`
    try {
      const eseed = utils.computePartialParameters({ phone: fullId, p })
      const { success, ekey, address, error } = await apis.server.tgRestore({ userId, eseed, sessionId })
      if (!success || !ekey || !address) {
        toast.error(error)
        return
      }

      const q = utils.hexStringToBytes(eseed) as Uint8Array
      const iv = q.slice(0, 16)
      const pk = utils.decrypt(utils.hexStringToBytes(ekey) as Uint8Array, p, iv)
      const derivedAddress = apis.web3.getAddress(pk)
      if (!address || (address.toLowerCase() !== derivedAddress.toLowerCase())) {
        console.error(address, derivedAddress)
        toast.error(`Address mismatch ${address} ${derivedAddress}`)
        return
      }
      toast.success(`Recovered wallet ${derivedAddress}`)
      dispatch(walletActions.updateWallet({ phone: fullId, address: derivedAddress, pk: utils.hexView(pk), eseed }))
      setTimeout(() => {
        if (next?.path) {
          dispatch(globalActions.setNextAction({}))
          dispatch(globalActions.setPrefilledPhone(''))
          navigate({ pathname: next.path, search: next.query })
          return
        }
        navigate(paths.wallet)
      }, 1000)
    } catch (ex: any) {
      console.error(ex)
      toast.error(`Error: ${processError(ex)}`)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <MainContainer>
      <Title> Recover your wallet </Title>
      <Desc>
        <BaseText>Paste your recovery secret below</BaseText>
        <Input
          style={{ width: 288, marginTop: 36, marginBottom: 16 }}
          type='password' placeholder='12ab34cdef...' autoComplete='password' value={password}
          onChange={({ target: { value } }) => { setPassword(value) }}
              />

        <Button onClick={restore} disabled={verifying}>Recover</Button>

      </Desc>
    </MainContainer>
  )
}

export default Recover
