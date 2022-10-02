import React, { useState, useEffect } from 'react'
import PhoneInput from 'react-phone-number-input'
import { BaseText, Desc, LinkText, Title } from '../components/Text'
import { processError, utils } from '../utils'
import apis from '../api'
import { toast } from 'react-toastify'
import OtpBox from '../components/OtpBox'
import { Button, Input } from '../components/Controls'
import qrcode from 'qrcode'
import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { walletActions } from '../state/modules/wallet'
import paths from './paths'
import SaveQR from './SaveQR'
import MainContainer from '../components/Container'
import { globalActions } from '../state/modules/global'
import phoneValidator from 'phone'
import { Redirect } from 'react-router-dom'
import styled from 'styled-components'
const randomSeed = () => {
  const otpSeedBuffer = new Uint8Array(32)
  return window.crypto.getRandomValues(otpSeedBuffer)
}

const InputLightMargin = styled(Input)`
  margin: 16px auto;
`

const Signup = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const [phone, setPhone] = useState('')
  const [pk] = useState(randomSeed())
  const [p] = useState(randomSeed())
  // const [hash, setHash] = useState('123')
  const [hash, setHash] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [verifying, setVerifying] = useState(false)
  const [address, setAddress] = useState(apis.web3.getAddress(pk))
  // const [qrCodeData, setQrCodeData] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAklEQVR4AewaftIAAAa+SURBVO3BUYrEWBIEQY+k7n/l2P4d6AfTQitUk26W/kDSSoOktQZJaw2S1hokrTVIWmuQtNYgaa1B0lqDpLUGSWsNktYaJK01SFprkLTWIGmtQdJag6S1BklrDZLWGiStNUhaa5C01iBprUHSWoOktQZJaw2S1vrwsCR8u7b8VRJO2vIWSbiiLVck4a/acpKEb9eWpwyS1hokrTVIWmuQtNYgaa1B0lofXqQtb5GEK5JwpyRc0ZYr2nJFEq5oy0kS7tSWt0jCGwyS1hokrTVIWmuQtNYgaa1B0lofvkQS7taWu7XlN0k4ScIVbbkiCSdtOUnCSVtOknCShDdIwt3a8naDpLUGSWsNktYaJK01SFprkLTWB90qCX/VlpMk3K0td0vCSVtOknDSFv1/DZLWGiStNUhaa5C01iBprUHSWh90q7b8VRJO2nKShCe15Yok6J0GSWsNktYaJK01SFprkLTWIGmtD1+iLd8gCb9py93acpKEuyXhpC0nbbkiCb9py93astEgaa1B0lqDpLUGSWsNktYaJK314UWSoH8vCSdtOUnCSVtOknBFEk7a8pQk6J8GSWsNktYaJK01SFprkLTWIGmt9Af6Skm4oi0nSThpy5OS8Ju26B6DpLUGSWsNktYaJK01SFprkLTWh4cl4S3acpKEN2jLFW05ScLdknDSlpMknLTlN0k4actJEk7acpKEk7acJOGkLW8wSFprkLTWIGmtQdJag6S10h+8RBLu1pa7JeGkLb9Jwklb3iIJV7TliiS8XVvuloSTtjxlkLTWIGmtQdJag6S1BklrDZLW+vCwJNytLXdLwklbTpJwpyRc0ZYr2nJFEq5oy0kS/qotJ0k4acuT2vIGg6S1BklrDZLWGiStNUhaa5C0VvqDL5eEk7a8QRLu1pYrknDSlpMknLTliiT8VVuuSMLd2nKShJO2vMEgaa1B0lqDpLUGSWsNktYaJK314WFJOGnLk5JwRVtOkvBXbTlJwt3ackVbTpJw0pYr2vKUtpwk4SQJJ215u0HSWoOktQZJaw2S1hokrTVIWiv9wUsk4aQt3ywJV7TlJAlPasvdkvB2bblbEk7a8pRB0lqDpLUGSWsNktYaJK01SFor/cEXSMJJW06S8HZtuVsSntSWuyXhN205ScIVbTlJwhVtebtB0lqDpLUGSWsNktYaJK01SFrrw5doy93acrck/KYtd0vCFW05ScJJW65IwhVt+U0STtpyRRJO2nJFEk7a8gaDpLUGSWsNktYaJK01SFprkLTWhxdJwhVtOWnLFUl4ShJO2nJFW06ScEUSrmjLndpyRRJO2nKShCva8naDpLUGSWsNktYaJK01SFprkLRW+oMHJeGKttwtCSdt0b+XhP+qtpwk4aQtJ0k4actTBklrDZLWGiStNUhaa5C01iBprQ8v0pYnteUkCSdteUoSrmjLFUm4W1uekoRv0JY3GCStNUhaa5C01iBprUHSWoOktT58iSSctOUkCVe05SQJf9WWkyRc0ZYrknC3tlyRhDu15SQJJ225oi0nSThpyxsMktYaJK01SFprkLTWIGmtQdJa6Q8elISTtrxFEp7SlpMknLTlSUm4oi0nSXi7tpwk4W5tecogaa1B0lqDpLUGSWsNktZKf6DbJOE3bTlJwklbTpJwt7a8RRJ+05a7JeEt2vKUQdJag6S1BklrDZLWGiStNUha68PDkvDt2vIGbTlJwhVJOGnLSRLeIAknbXlSW95ukLTWIGmtQdJag6S1BklrDZLW+vAibXmLJFzRlt8k4aQtVyThiracJOGKtpwk4aQtJ0n4q7bcrS3/VYOktQZJaw2S1hokrTVIWmuQtNaHL5GEu7Xlbkl4g7acJOGKJFzRljsl4S2ScEVb3mCQtNYgaa1B0lqDpLUGSWsNktb6oEe05SQJJ205acsVbbkiCSdtOUnCSVtO2vIGSbhbEk7a8pRB0lqDpLUGSWsNktYaJK01SFrrgx6RhJO2nCThirZckYS7teUkCSdt+U0Svl1b3mCQtNYgaa1B0lqDpLUGSWsNktb68CXa8s3acre2XJGEk7acJOFJSfhNW65IwklbTpJw0paTJLzdIGmtQdJag6S1BklrDZLWGiSt9eFFkvBflYSTtjypLXdLwt3acqe2nCThiiSctOXtBklrDZLWGiStNUhaa5C01iBprfQHklYaJK01SFprkLTWIGmtQdJag6S1BklrDZLWGiStNUhaa5C01iBprUHSWoOktQZJaw2S1hokrTVIWmuQtNYgaa1B0lqDpLUGSWsNktYaJK01SFrrf6OaOfmljWqHAAAAAElFTkSuQmCC')
  const [qrCodeData, setQrCodeData] = useState('')
  const next = useSelector(state => state.global.next || {})
  const prefilledPhone = useSelector(state => state.global.prefilledPhone)
  const wallet = useSelector(state => state.wallet || {})
  const [triedSave, setTriedSave] = useState(false)
  const [useQR, setUseQR] = useState(false)

  useEffect(() => {
    if (prefilledPhone) {
      const { phoneNumber, isValid } = phoneValidator(prefilledPhone)
      if (!isValid) {
        return
      }
      setPhone(phoneNumber)
    }
  }, [prefilledPhone])
  const signup = async () => {
    if (!(countdown <= 0)) {
      return
    }
    setVerifying(true)
    const { address, ekey, eseed } = utils.computeParameters({ phone, p, pk })
    try {
      const hash = await apis.server.signup({ phone, eseed, ekey, address })
      setHash(hash)
      const submissionTime = Date.now()
      setCountdown(120)
      const h = setInterval(() => {
        const cd = Math.max(0, Math.floor((submissionTime + 120000 - Date.now()) / 1000))
        setCountdown(cd)
        if (cd <= 0) {
          clearInterval(h)
        }
      })
      toast.success('Verification SMS Sent')
    } catch (ex) {
      console.error(ex)
      toast.error('Error: ' + processError(ex))
    } finally {
      setVerifying(false)
    }
  }
  const verify = async () => {
    const { address, ekey, eseed } = utils.computeParameters({ phone, p, pk })
    const { signature } = apis.web3.web3.eth.accounts.sign(hash, utils.hexString(pk))
    try {
      setVerifying(true)
      await apis.server.verify({ phone, address, ekey, eseed, code, signature })
      toast.success('Signup successful')
      const restoreUri = utils.getRestoreUri(utils.hexView(p))
      const qr = await qrcode.toDataURL(restoreUri, { errorCorrectionLevel: 'low', width: 256 })
      setAddress(address)
      setQrCodeData(qr)
    } catch (ex) {
      console.error(ex)
      toast.error('Verification error: ' + processError(ex))
    } finally {
      setCode('')
      setVerifying(false)
      setCountdown(0)
    }
  }

  const restart = () => {
    setPhone('')
    setCountdown(0)
    setHash('')
    setCode('')
  }

  const onSaveQR = () => {
    const { address, eseed } = utils.computeParameters({ phone, pk, p })
    dispatch(walletActions.updateWallet({ phone, address, pk: utils.hexView(pk), eseed }))
  }

  const done = () => {
    if (next?.path) {
      dispatch(globalActions.setNextAction({}))
      dispatch(globalActions.setPrefilledPhone())
      history.push({ pathname: next.path, search: next.query })
      return
    }
    history.push(paths.wallet)
  }

  useEffect(() => {
    if (code?.length === 6 && !verifying) {
      verify()
    }
  }, [code, verifying])

  const onSubmit = async (e) => {
    e.preventDefault()
    history.push(history.location.pathname + '#submitted')
    setTriedSave(true)
    onSaveQR()
    // onDone && onDone()
  }

  const existingAddress = !hash && Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  if (existingAddress) {
    console.log('redirecting because wallet exists:', existingAddress)
    return <Redirect to={paths.wallet} />
  }

  return (
    <MainContainer>

      {!hash && <Title> Create a new wallet </Title>}

      <form action='#' onSubmit={onSubmit}>
        <Desc>
          {!hash && <BaseText>First, we need to verify your phone number via SMS</BaseText>}
          <PhoneInput
            disabled={!!hash}
            inputComponent={InputLightMargin}
            defaultCountry='US'
            placeholder='Enter phone number'
            value={phone} onChange={setPhone}
          />
          <Input
            disabled
            $width='0px'
            $marginTop='0px'
            $marginBottom='0px'
            style={{ border: 'none', position: 'absolute' }}
            name='password'
            type='password'
            autoComplete='new-password' value={utils.hexView(p)}
            readOnly
          />
          {!hash &&
            <>
              <Button onClick={signup} disabled={verifying}>Verify</Button>
              <LinkText onClick={() => history.push(paths.recover)}>
                Recover an existing SMS Wallet
              </LinkText>
            </>}
          {hash && !qrCodeData &&
            <>
              <BaseText>Verify your 6-digit code</BaseText>
              <OtpBox value={code} onChange={setCode} />
              <Button onClick={signup} disabled={verifying || !(countdown <= 0)}>Resend SMS</Button>
              {countdown > 0 && <BaseText $color='#cccccc'>(wait {countdown}s)</BaseText>}
              <LinkText onClick={restart}>
                Use a different phone number
              </LinkText>
            </>}

          {hash && qrCodeData &&
            <>
              {!triedSave &&
                <>
                  <BaseText>Please save the recovery code to Keychain or password managers</BaseText>
                  <Button type='submit'>AUTO SAVE</Button>
                </>}
              {triedSave &&
                <>
                  <Button onClick={done} style={{ marginBottom: 64 }}>DONE {'>>'}</Button>
                  <BaseText>Password not saved?</BaseText>
                </>}
              <LinkText
                style={{ marginTop: 16 }} onClick={() => {
                  setUseQR(true)
                  setTimeout(() => { window.scrollTo({ top: 384, behavior: 'smooth' }) }, 100)
                }}
              >
                Save As QR Code Instead
              </LinkText>
              {useQR && <SaveQR onSaveQR={onSaveQR} phone={phone} onDone={done} qrCodeData={qrCodeData} address={address} />}
            </>}

        </Desc>
      </form>
    </MainContainer>
  )
}

export default Signup
