import React, { useEffect, useState } from 'react'
import MainContainer from '../components/Container'
import { useDispatch, useSelector } from 'react-redux'
import { type RootState } from '../state/rootReducer'
import { type WalletState } from '../state/modules/wallet/reducers'
import apis from '../api'
import { Navigate, useNavigate } from 'react-router'
import paths from './paths'
import { BaseText, DescLeft, LinkText } from '../components/Text'
import { Col, Row } from '../components/Layout'
import { Button, LinkWrarpper } from '../components/Controls'
import { globalActions } from '../state/modules/global'
import { utils } from '../utils'
import { walletActions } from '../state/modules/wallet'
import { toast } from 'react-toastify'

const SaveRecoverySecret = (): React.JSX.Element => {
  const [tgDest, setTgDest] = useState('')
  const [emailDest, setEmailDest] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))

  const state = wallet[address ?? '']
  const pk = state?.pk
  const phone = state?.phone
  const p = state?.p

  useEffect(() => {
    if (!pk || !p || !phone) {
      return
    }
    const text = encodeURIComponent(`My H1Wallet (${address}) recovery secret is ${p}`)
    const url = encodeURIComponent('https://t.country')
    const dest = `https://t.me/share/url?url=${url}&text=${text}`
    setTgDest(dest)
    const subject = encodeURIComponent('My recovery secret for H1Wallet (t.country)')
    const email = encodeURIComponent(`mailto:<fill in recipient here>?subject=${subject}&body=${text}`)
    setEmailDest(email)
  }, [phone, p, pk, address])

  const cleanup = (): void => {
    dispatch(walletActions.updateWallet({ ...state, p: '' }))
    toast.info('Recovery secret is saved and deleted from account')
    navigate(paths.wallet)
  }

  if (!pk || !address) {
    return <Navigate to={paths.signup} />
  }

  return (
    <MainContainer withMenu>
      {!p && <DescLeft>
        <BaseText>You have already saved recovery secret before. It was deleted and is no longer accessible from here.</BaseText>
        <Button onClick={() => { navigate(paths.wallet) }}>BACK TO WALLET</Button>
        </DescLeft>}
      {!p && <DescLeft>
        <BaseText>Please save your recovery secret by Telegram message or by email.</BaseText>
        <BaseText>Recovery secret can only be used to recover the wallet, not to access it.</BaseText>
        <Col>
          <LinkWrarpper href={tgDest} target={'_blank'}>SAVE BY TELEGRAM</LinkWrarpper>
          <BaseText>OR</BaseText>
          <LinkWrarpper href={emailDest} target={'_blank'}>SAVE BY EMAIL</LinkWrarpper>
          <LinkText onClick={() => { navigate(paths.wallet) }}> {'<<'} BACK </LinkText>
        </Col>
        <Button onClick={() => { cleanup() }}> DELETE RECOVERY SECRET</Button>
        <BaseText>After you save your recovery secret, it is a good practice to delete it here, so no one else can see it anymore. The annoying reminder bar will also be removed once you complete this step.</BaseText>
        </DescLeft>}
    </MainContainer>
  )
}

export default SaveRecoverySecret
