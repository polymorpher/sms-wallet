import React, { useState, useEffect } from 'react'
import { TailSpin } from 'react-loading-icons'
import { BaseText, Desc, LinkText } from '../components/Text'
import { processError, utils } from '../utils'
import apis from '../api'
import { toast } from 'react-toastify'
import { Button } from '../components/Controls'
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
import { Row } from '../components/Layout'
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
  const [triedSave, setTriedSave] = useState(false)
  const qs = querystring.parse(location.search) as Record<string, string>
  const { userId, sessionId } = qs
  const next = useSelector<RootState, NextAction>(state => state.global.next || {})
  console.log('[TgSignup]')
  useEffect(() => {
    if (!sessionId || !userId || !p || !pk) {
      return
    }
    async function signup (): Promise<void> {
      const { address, ekey, eseed } = utils.computeParameters({ phone: userId, p, pk })
      try {
        const message = `tg:${userId}${eseed}${ekey}${address}`
        const signature = apis.web3.wallet(utils.hexString(pk)).signMessageSync(message)
        console.log(ethers.hashMessage(message))
        console.log(utils.hexView(utils.keccak(message)))
        const success = await apis.server.tgSignup({ signature, sessionId, userId, eseed, ekey, address })
        if (!success) {
          toast.error('Signup failed for unknown reason. Please try again later')
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
  }, [sessionId, userId, p, pk])

  const saveNow = (): void => {
    const { address, eseed } = utils.computeParameters({ phone: userId, pk, p })
    const text = encodeURIComponent(`My tgWallet (${address}) recovery secret is ${utils.hexView(p)}`)
    const url = encodeURIComponent('https://t.country')
    const dest = `https://t.me/share/url?url=${url}&text=${text}`
    navigate(dest)
    setTriedSave(true)
    dispatch(walletActions.updateWallet({ phone: userId, address, pk: utils.hexView(pk), eseed }))
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
    const { address, eseed } = utils.computeParameters({ phone: userId, pk, p })
    dispatch(walletActions.updateWallet({ phone: userId, address, pk: utils.hexView(pk), eseed, p: utils.hexView(p) }))
    done()
  }

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

        {signedUp &&
        <>
          {!triedSave &&
          <>
            <BaseText>Your wallet is ready. Please save your recovery secret to your {'Telegram\'s "Saved Messages"'} or send it to a trusted person.</BaseText>
            <BaseText>Without access to your Telegram account, they will not be able to access your wallet with recovery secret</BaseText>
            <Row>
              <LinkText onClick={() => { saveLater() }}>Do it Later</LinkText>
              <Button onClick={() => { saveNow() }}>SAVE NOW</Button>
            </Row>

          </>}
          {triedSave &&
          <>
            <Button onClick={done} style={{ marginBottom: 64 }}>DONE {'>>'}</Button>
            <BaseText>Password not saved?</BaseText>
          </>}
        </>}

      </Desc>
    </MainContainer>
  )
}

export default TgSignup
