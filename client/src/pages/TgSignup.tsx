import React, { useState, useEffect } from 'react'
import { TailSpin } from 'react-loading-icons'
import { BaseText, Desc } from '../components/Text'
import { processError, utils } from '../utils'
import apis from '../api'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { walletActions } from '../state/modules/wallet'
import paths from './paths'
import MainContainer from '../components/Container'
import { globalActions } from '../state/modules/global'
import { Navigate, useNavigate } from 'react-router'
import { type RootState } from '../state/rootReducer'
import { type NextAction } from '../state/modules/global/actions'
import { type WalletState } from '../state/modules/wallet/reducers'
import querystring from 'query-string'
import { ethers } from 'ethers'
const randomSeed = (): Uint8Array => {
  const otpSeedBuffer = new Uint8Array(32)
  return window.crypto.getRandomValues(otpSeedBuffer)
}

const TgSignup = (): React.JSX.Element => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [pk] = useState(randomSeed())
  const [p] = useState(randomSeed())
  const [signedUp, setSignedup] = useState<boolean>(false)
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const qs = querystring.parse(location.search) as Record<string, string>
  const { userId, sessionId } = qs
  const fullUserId = `tg:${userId}`
  const next = useSelector<RootState, NextAction>(state => state.global.next || {})
  console.log('[TgSignup]')
  useEffect(() => {
    if (!sessionId || !userId || !fullUserId || !p || !pk) {
      return
    }
    async function signup (): Promise<void> {
      const { address, ekey, eseed } = utils.computeParameters({ phone: fullUserId, p, pk })
      try {
        const message = `${fullUserId}${eseed}${ekey}${address}`.toLowerCase()
        const signature = apis.web3.wallet(utils.hexString(pk)).signMessageSync(message)
        console.log(ethers.hashMessage(message))
        console.log(utils.hexView(utils.keccak(message)))
        const { success, error } = await apis.server.tgSignup({ signature, sessionId, userId, eseed, ekey, address })
        if (!success) {
          toast.error(error)
          toast.info('Redirecting in 2s...')
          setTimeout(() => { navigate({ pathname: paths.tgRecover, search: `?userId=${userId}&sessionId=${sessionId}` }) }, 2000)
          return
        }
        toast.success('Signup successful')
        setSignedup(true)
      } catch (ex) {
        console.error(ex)
        toast.error(`Error: ${processError(ex)})`)
      }
    }
    signup().catch(console.error)
  }, [navigate, sessionId, userId, fullUserId, p, pk])

  useEffect(() => {
    if (!signedUp) {
      return
    }
    const done = (): void => {
      if (next?.path) {
        dispatch(globalActions.setNextAction({}))
        dispatch(globalActions.setPrefilledPhone(''))
        navigate({ pathname: next.path, search: next.query })
        return
      }
      navigate(paths.wallet)
    }
    const saveLater = (): void => {
      const { address, eseed } = utils.computeParameters({ phone: fullUserId, pk, p })
      dispatch(walletActions.updateWallet({ phone: fullUserId, address, pk: utils.hexView(pk), eseed, p: utils.hexView(p) }))
      done()
    }
    setTimeout(() => { saveLater() }, 1000)
  }, [dispatch, navigate, fullUserId, next.path, next.query, p, pk, signedUp])

  const existingAddress = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  if (existingAddress) {
    console.log('redirecting because wallet exists:', existingAddress)
    return <Navigate to={paths.wallet} />
  }

  return (
    <MainContainer>
      <Desc>
        {!signedUp &&
        <>
          <BaseText>Creating Your Wallet...</BaseText>
          <TailSpin width={32} height={32} style={{ margin: 32 }} />
        </>}

        {signedUp && <>
          <BaseText>Your wallet is ready!</BaseText>
          <BaseText>Redirecting in 1s...</BaseText>
        </>
        }
      </Desc>
    </MainContainer>
  )
}

export default TgSignup
