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
import { Button } from '../components/Controls'

const randomSeed = (): Uint8Array => {
  const otpSeedBuffer = new Uint8Array(32)
  return window.crypto.getRandomValues(otpSeedBuffer)
}

const TgSignup = (): React.JSX.Element => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [pk] = useState(randomSeed())
  const [p] = useState(randomSeed())
  const [accountExists, setAccountExists] = useState(false)
  const [invalidSession, setInvalidSession] = useState(false)
  const [signedUp, setSignedup] = useState<boolean>(false)
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const qs = querystring.parse(location.search) as Record<string, string>
  const { userId, sessionId } = qs
  const fullUserId = `tg:${userId}`
  const next = useSelector<RootState, NextAction>(state => state.global.next || {})

  useEffect(() => {
    if (!sessionId || !userId || !fullUserId || !p || !pk) {
      return
    }
    async function signup (): Promise<void> {
      const { address, ekey, eseed } = utils.computeParameters({ phone: fullUserId, p, pk })
      try {
        const message = `${fullUserId}${eseed}${ekey}${address}`.toLowerCase()
        const signature = apis.web3.wallet(utils.hexString(pk)).signMessageSync(message)
        const { success, error, invalidSession, accountExists } = await apis.server.tgSignup({ signature, sessionId, userId, eseed, ekey, address })
        if (!success) {
          toast.error(error)
          if (invalidSession) {
            setInvalidSession(true)
          } else if (accountExists) {
            setAccountExists(true)
          }
          return
        }
        toast.success('Signup successful')
        setSignedup(true)
      } catch (ex) {
        console.error(ex)
        toast.error(`Error: ${processError(ex)}`)
      }
    }
    signup().catch(console.error)
  }, [navigate, sessionId, userId, fullUserId, p, pk])

  useEffect(() => {
    if (!signedUp) {
      return
    }
    const { address, eseed } = utils.computeParameters({ phone: fullUserId, pk, p })
    // console.log({ fullUserId, pk, p, address, eseed })
    dispatch(walletActions.updateWallet({ phone: fullUserId, address, pk: utils.hexView(pk), eseed, p: utils.hexView(p) }))
    setTimeout(() => {
      if (next?.path) {
        dispatch(globalActions.setNextAction({}))
        dispatch(globalActions.setPrefilledPhone(''))
        navigate({ pathname: next.path, search: next.query })
        return
      }
      navigate(paths.wallet)
    }, 2000)
  }, [dispatch, navigate, fullUserId, next.path, next.query, p, pk, signedUp])

  const recover = (): void => {
    navigate({ pathname: paths.tgRecover, search: `?userId=${userId}&sessionId=${sessionId}` })
  }

  const existingAddress = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  if (existingAddress) {
    console.log('redirecting because wallet exists:', existingAddress)
    return <Navigate to={paths.wallet} />
  }

  return (
    <MainContainer>
      <Desc>
        {invalidSession && <>
          <BaseText>Your session expired. Please close the window and send</BaseText>
          <BaseText> /start </BaseText>
          <BaseText>to the bot, then re-open the wallet using the button in reply message</BaseText>
        </>}
        {accountExists && <>
          <BaseText>Your Telegram account already have a wallet, but it is not set up on this device</BaseText>
          <Button onClick={recover}>Recover</Button>
        </>}
        {!signedUp && !accountExists && !invalidSession &&
        <>
          <BaseText>Creating Your Wallet...</BaseText>
          <TailSpin width={32} height={32} style={{ margin: 32 }} />
        </>}

        {signedUp && <>
          <BaseText>Your wallet is ready!</BaseText>
          <BaseText>Redirecting in 2s...</BaseText>
        </>
        }
      </Desc>
    </MainContainer>
  )
}

export default TgSignup
