import React, { useState, useEffect, useCallback } from 'react'
import { BaseText, Desc, LinkText, Title } from '../components/Text'
import QrCodeScanner from '../components/QrCodeScanner'
import qs from 'query-string'
import { toast } from 'react-toastify'
import PhoneInput from 'react-phone-number-input'
import { Button, Input } from '../components/Controls'
import { processError, utils } from '../utils'
import apis from '../api'
import OtpBox from '../components/OtpBox'
import { walletActions } from '../state/modules/wallet'
import { useDispatch, useSelector } from 'react-redux'
import paths from './paths'
import { useNavigate } from 'react-router'
import MainContainer from '../components/Container'
import { globalActions } from '../state/modules/global'
import phoneValidator from 'phone'
import { IconImg } from '../components/Menu'
import QrIcon from '../../assets/qr.svg'
import styled from 'styled-components'
import { type RootState } from '../state/rootReducer'
import { type NextAction } from '../state/modules/global/actions'

const InvisibleInput = styled(Input)`
  width: 0;
  border: 0;
  height: 0;
  margin: 0;
  padding: 0;
`

const StyledPhoneInput = styled(PhoneInput)`
  width: 0;
  border: 0;
  height: 0;
  margin: 0;
  padding: 0;
  .PhoneInputCountry{
    display: none;
  }
  .PhoneInputCountryIcon{
    width:0;
    height:0;
    padding:0;
    margin:0;
  }
`

const processRecoverData = (d): string | null => {
  try {
    const q = qs.parseUrl(d)
    return String(q?.query?.p)
  } catch (ex) {
    console.error(ex)
    return null
  }
}
const Recover = (): React.JSX.Element => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [p, setP] = useState<Uint8Array | undefined>()
  const [phone, setPhone] = useState('')
  const [restoring, setRestoring] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [readyForCode, setReadyForCode] = useState(false)
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const next = useSelector<RootState, NextAction>(state => state.global.next || {})
  const prefilledPhone = useSelector<RootState, string | undefined>(state => state.global.prefilledPhone)
  const [password, setPassword] = useState('')
  const [revealPassword, setRevealPassword] = useState(false)

  const confirmManualPassword = (): void => {
    const p = utils.hexStringToBytes(password)
    setP(p)
  }

  useEffect(() => {
    if (prefilledPhone) {
      const { phoneNumber, isValid } = phoneValidator(prefilledPhone)
      if (!isValid) {
        return
      }
      setPhone(phoneNumber)
    }
  }, [prefilledPhone])

  const onScan = (data, isJson): void => {
    if (!data) {
      return
    }
    const pStr = isJson ? data.p : processRecoverData(data)
    if (!pStr) {
      toast.error('Unsupported recovery QR code')
      return
    }
    const p = utils.hexStringToBytes(pStr)
    setP(p)
    // console.log(pStr)
  }
  const restore = async (): Promise<void> => {
    if (!p) {
      return
    }
    if (!(countdown <= 0)) {
      return
    }
    setRestoring(true)
    const { eseed } = utils.computeParameters({ phone, p })
    // console.log({ phone, eseed })
    try {
      await apis.server.restore({ phone, eseed })
      setReadyForCode(true)
      const submissionTime = Date.now()
      setCountdown(120)
      const h = setInterval(() => {
        const cd = Math.max(0, Math.floor((submissionTime + 120000 - Date.now()) / 1000))
        setCountdown(e => Math.min(e, cd))
        if (cd <= 0) {
          clearInterval(h)
        }
      })
      toast.success('Verification SMS Sent')
    } catch (ex: any) {
      console.error(ex)
      toast.error('Error: ' + processError(ex))
    } finally {
      setRestoring(false)
    }
  }
  const restart = (): void => {
    setPhone('')
    setCountdown(0)
    setReadyForCode(false)
    setCode('')
  }

  const restoreVerify = useCallback(async (inputCode: string): Promise<void> => {
    if (!p) {
      return
    }
    setVerifying(true)
    const { eseed } = utils.computeParameters({ phone, p })
    try {
      const { ekey, address } = await apis.server.restoreVerify({ phone, eseed, code: inputCode })
      // console.log({ ekey, address })
      const q = utils.hexStringToBytes(eseed) as Uint8Array
      const iv = q.slice(0, 16)
      const pk = utils.decrypt(utils.hexStringToBytes(ekey) as Uint8Array, p, iv)
      const derivedAddress = apis.web3.getAddress(pk)
      if (address.toLowerCase() !== derivedAddress.toLowerCase()) {
        console.error(address, derivedAddress)
        toast.error(`Address mismatch ${address} ${derivedAddress}`)
        return
      }
      toast.success(`Recovered wallet ${derivedAddress}`)
      dispatch(walletActions.updateWallet({ phone, address: derivedAddress, pk: utils.hexView(pk), eseed }))
      setTimeout(() => {
        if (next?.path) {
          dispatch(globalActions.setNextAction({}))
          dispatch(globalActions.setPrefilledPhone(''))
          navigate({ pathname: next.path, search: next.query })
          return
        }
        navigate(paths.wallet)
      }, 1000)
    } catch (ex) {
      console.error(ex)
      toast.error(`Error: ${processError(ex)}`)
    } finally {
      setCode('')
      setVerifying(false)
      setCountdown(0)
    }
  }, [dispatch, navigate, p, phone, next?.path, next?.query])

  useEffect(() => {
    if (code?.length === 6 && !verifying) {
      restoreVerify(code).catch(console.error)
    }
  }, [restoreVerify, code, verifying])
  console.log(p)
  return (
    <MainContainer>
      <Title> Recover your wallet </Title>
      <form action='#' onSubmit={(e) => { e.preventDefault() }}>
        <Desc>
          {!p &&
            <>
              <BaseText>Scan or select your recovery QR code</BaseText>
              <QrCodeScanner style={{ maxWidth: 288 }} onScan={onScan} shouldInit />
              {!revealPassword &&
                <>
                  <Button style={{ whiteSpace: 'nowrap', width: 'auto', display: 'flex', gap: '16px' }} onClick={() => { setRevealPassword(true) }}>
                    <IconImg style={{ width: 16, height: 16, color: 'white' }} src={QrIcon as string} />
                    <BaseText>Use Keychain / Password</BaseText>
                  </Button>
                </>}
              {revealPassword &&
                <>
                  <StyledPhoneInput
                    autoComplete='username'
                    name='username'
                    inputComponent={InvisibleInput}
                    defaultCountry='US'
                    placeholder='Enter phone number'
                    value={phone} onChange={setPhone}
                  />
                  <Input
                    style={!p && revealPassword ? { width: 288, marginTop: 36, marginBottom: 16 } : { border: 'none', position: 'absolute', width: 0, margin: 0 }}
                    type='password' placeholder='Keychain Password' autoComplete='password' value={password}
                    onChange={({ target: { value } }) => { setPassword(value) }}
                  />
                  <Button onClick={confirmManualPassword}>Next</Button>
                </>}
            </>}
          {p && !readyForCode &&
            <>
              <BaseText>Next, please provide the phone number you used to sign up the wallet</BaseText>
              <PhoneInput
                autoComplete='username'
                name='username'
                margin='16px'
                inputComponent={Input}
                defaultCountry='US'
                placeholder='Enter phone number'
                value={phone} onChange={(e) => { setPhone(e ?? '') }}
              />
              <Button onClick={restore} disabled={restoring}>Verify</Button>
            </>}
          {p && readyForCode &&
            <>
              <BaseText>Verify your 6-digit code</BaseText>
              <OtpBox value={code} onChange={setCode} />
              <Button onClick={restore} disabled={verifying || !(countdown <= 0)}>Resend SMS</Button>
              {countdown > 0 && <BaseText $color='#cccccc'>(wait {countdown}s)</BaseText>}
              <LinkText onClick={restart}>
                Use a different phone number
              </LinkText>
            </>}
        </Desc>
      </form>
    </MainContainer>
  )
}

export default Recover
