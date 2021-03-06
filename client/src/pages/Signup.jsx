import React, { useState, useEffect, useRef } from 'react'
import PhoneInput from 'react-phone-number-input'
import styled from 'styled-components'
import { FlexRow, Main } from '../components/Layout'
import { Address, BaseText, Desc, Heading, Title } from '../components/Text'
import { utils } from '../utils'
import apis from '../api'
import { NotificationManager } from 'react-notifications'
import OtpBox from '../components/OtpBox'
import { Button } from '../components/Controls'
import qrcode from 'qrcode'
import html2canvas from 'html2canvas'
import { useHistory } from 'react-router'
import { useDispatch } from 'react-redux'
import { walletActions } from '../state/modules/wallet'
import paths from './paths'

const Input = styled.input`
  width: ${props => typeof props.width === 'number' ? `${props.width || 400}px` : (props.width || 'auto')};
  margin-top: ${props => props.$marginTop || props.margin || '32px'};
  margin-bottom: ${props => props.$marginBottom || props.margin || '32px'};
  border: none;
  border-bottom: 1px dashed black;
  font-size: 16px;
  padding: 4px;
  &:hover{
    border-bottom: 1px dashed black;
  }
`

const QRImage = styled.img`
  border: 1px solid lightgrey;
  border-radius: 8px;
  box-shadow: 0px 0px 10px lightgrey;
  width: 256px;
  height: 256px;
  object-fit: contain;
`

const randomSeed = () => {
  const otpSeedBuffer = new Uint8Array(32)
  return window.crypto.getRandomValues(otpSeedBuffer)
}

const Signup = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const [phone, setPhone] = useState()
  const [pk] = useState(randomSeed())
  const [p] = useState(randomSeed())
  const [hash, setHash] = useState('1')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [verifying, setVerifying] = useState(false)
  const [qrCodeData, setQrCodeData] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAklEQVR4AewaftIAAAa+SURBVO3BUYrEWBIEQY+k7n/l2P4d6AfTQitUk26W/kDSSoOktQZJaw2S1hokrTVIWmuQtNYgaa1B0lqDpLUGSWsNktYaJK01SFprkLTWIGmtQdJag6S1BklrDZLWGiStNUhaa5C01iBprUHSWoOktQZJaw2S1vrwsCR8u7b8VRJO2vIWSbiiLVck4a/acpKEb9eWpwyS1hokrTVIWmuQtNYgaa1B0lofXqQtb5GEK5JwpyRc0ZYr2nJFEq5oy0kS7tSWt0jCGwyS1hokrTVIWmuQtNYgaa1B0lofvkQS7taWu7XlN0k4ScIVbbkiCSdtOUnCSVtOknCShDdIwt3a8naDpLUGSWsNktYaJK01SFprkLTWB90qCX/VlpMk3K0td0vCSVtOknDSFv1/DZLWGiStNUhaa5C01iBprUHSWh90q7b8VRJO2nKShCe15Yok6J0GSWsNktYaJK01SFprkLTWIGmtD1+iLd8gCb9py93acpKEuyXhpC0nbbkiCb9py93astEgaa1B0lqDpLUGSWsNktYaJK314UWSoH8vCSdtOUnCSVtOknBFEk7a8pQk6J8GSWsNktYaJK01SFprkLTWIGmt9Af6Skm4oi0nSThpy5OS8Ju26B6DpLUGSWsNktYaJK01SFprkLTWh4cl4S3acpKEN2jLFW05ScLdknDSlpMknLTlN0k4actJEk7acpKEk7acJOGkLW8wSFprkLTWIGmtQdJag6S10h+8RBLu1pa7JeGkLb9Jwklb3iIJV7TliiS8XVvuloSTtjxlkLTWIGmtQdJag6S1BklrDZLW+vCwJNytLXdLwklbTpJwpyRc0ZYr2nJFEq5oy0kS/qotJ0k4acuT2vIGg6S1BklrDZLWGiStNUhaa5C0VvqDL5eEk7a8QRLu1pYrknDSlpMknLTliiT8VVuuSMLd2nKShJO2vMEgaa1B0lqDpLUGSWsNktYaJK314WFJOGnLk5JwRVtOkvBXbTlJwt3ackVbTpJw0pYr2vKUtpwk4SQJJ215u0HSWoOktQZJaw2S1hokrTVIWiv9wUsk4aQt3ywJV7TlJAlPasvdkvB2bblbEk7a8pRB0lqDpLUGSWsNktYaJK01SFor/cEXSMJJW06S8HZtuVsSntSWuyXhN205ScIVbTlJwhVtebtB0lqDpLUGSWsNktYaJK01SFrrw5doy93acrck/KYtd0vCFW05ScJJW65IwhVt+U0STtpyRRJO2nJFEk7a8gaDpLUGSWsNktYaJK01SFprkLTWhxdJwhVtOWnLFUl4ShJO2nJFW06ScEUSrmjLndpyRRJO2nKShCva8naDpLUGSWsNktYaJK01SFprkLRW+oMHJeGKttwtCSdt0b+XhP+qtpwk4aQtJ0k4actTBklrDZLWGiStNUhaa5C01iBprQ8v0pYnteUkCSdteUoSrmjLFUm4W1uekoRv0JY3GCStNUhaa5C01iBprUHSWoOktT58iSSctOUkCVe05SQJf9WWkyRc0ZYrknC3tlyRhDu15SQJJ225oi0nSThpyxsMktYaJK01SFprkLTWIGmtQdJa6Q8elISTtrxFEp7SlpMknLTlSUm4oi0nSXi7tpwk4W5tecogaa1B0lqDpLUGSWsNktZKf6DbJOE3bTlJwklbTpJwt7a8RRJ+05a7JeEt2vKUQdJag6S1BklrDZLWGiStNUha68PDkvDt2vIGbTlJwhVJOGnLSRLeIAknbXlSW95ukLTWIGmtQdJag6S1BklrDZLW+vAibXmLJFzRlt8k4aQtVyThiracJOGKtpwk4aQtJ0n4q7bcrS3/VYOktQZJaw2S1hokrTVIWmuQtNaHL5GEu7Xlbkl4g7acJOGKJFzRljsl4S2ScEVb3mCQtNYgaa1B0lqDpLUGSWsNktb6oEe05SQJJ205acsVbbkiCSdtOUnCSVtO2vIGSbhbEk7a8pRB0lqDpLUGSWsNktYaJK01SFrrgx6RhJO2nCThirZckYS7teUkCSdt+U0Svl1b3mCQtNYgaa1B0lqDpLUGSWsNktb68CXa8s3acre2XJGEk7acJOFJSfhNW65IwklbTpJw0paTJLzdIGmtQdJag6S1BklrDZLWGiSt9eFFkvBflYSTtjypLXdLwt3acqe2nCThiiSctOXtBklrDZLWGiStNUhaa5C01iBprfQHklYaJK01SFprkLTWIGmtQdJag6S1BklrDZLWGiStNUhaa5C01iBprUHSWoOktQZJaw2S1hokrTVIWmuQtNYgaa1B0lqDpLUGSWsNktYaJK01SFrrf6OaOfmljWqHAAAAAElFTkSuQmCC')
  const [codeSaved, setCodeSaved] = useState(false)
  const computeParameters = () => {
    const phoneBytes = utils.stringToBytes(phone)
    const combined = utils.bytesConcat(p, phoneBytes)
    const q = utils.keccak(combined)
    const iv = q.slice(0, 16)
    const eseed = utils.hexView(q)
    const ekeyBytes = utils.encrypt(pk, p, iv)
    const ekey = utils.hexView(ekeyBytes)
    const address = apis.web3.getAddress(pk)
    return { address, ekey, eseed }
  }

  const signup = async () => {
    if (!(countdown <= 0)) {
      return
    }
    setVerifying(true)
    const { address, ekey, eseed } = computeParameters()
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
      NotificationManager.success('SMS Sent', 'You will receive a 6-digit verification code')
    } catch (ex) {
      console.error(ex)
      NotificationManager.error('Signup error', ex.toString())
    } finally {
      setVerifying(false)
    }
  }
  const verify = async () => {
    const { address, ekey, eseed } = computeParameters()
    const { signature } = apis.web3.web3.eth.accounts.sign(hash, utils.hexString(pk))
    try {
      setVerifying(true)
      await apis.server.verify({ phone, address, ekey, eseed, code, signature })
      NotificationManager.success('Signup successful')
      const restoreUri = utils.getRestoreUri(utils.hexView(p))
      const qr = await qrcode.toDataURL(restoreUri, { errorCorrectionLevel: 'low', width: 256 })
      setQrCodeData(qr)
    } catch (ex) {
      console.error(ex)
      NotificationManager.error('Verification error', ex.toString())
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

  const refQr = useRef()

  const capture = async () => {
    const canvas = await html2canvas(refQr.current)
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(blob => { resolve(blob) })
      } catch (err) {
        reject(err)
      }
    })
  }

  const saveQR = async () => {
    const blob = await capture()
    const { address, eseed } = computeParameters()
    const element = document.createElement('a')
    element.href = URL.createObjectURL(blob)
    element.download = `sms-wallet-${address}.png`
    document.body.appendChild(element)
    element.click()
    URL.revokeObjectURL(element.href)
    setCodeSaved(true)
    dispatch(walletActions.updateWallet({ address, pk: utils.hexView(pk), eseed }))
  }

  const done = () => {
    history.push(paths.wallet)
  }

  useEffect(() => {
    if (code?.length === 6 && !verifying) {
      verify()
    }
  }, [code, verifying])

  return (
    <Main>
      <Heading>SMS Wallet</Heading>
      <Title> Create a new wallet </Title>
      {!hash &&
        <Desc>
          <BaseText>First, we need to verify your phone number via SMS</BaseText>
          <PhoneInput
            margin='16px'
            inputComponent={Input}
            defaultCountry='US'
            placeholder='Enter phone number'
            value={phone} onChange={setPhone}
          />
          <Button onClick={signup} disabled={verifying}>Verify</Button>
        </Desc>}
      {hash && !qrCodeData &&
        <Desc>
          <BaseText>Verify your 6-digit code</BaseText>
          <OtpBox value={code} onChange={setCode} />
          <Button onClick={signup} disabled={verifying || !(countdown <= 0)}>Resend SMS</Button>
          {countdown > 0 && <BaseText $color='#cccccc'>(wait {countdown}s)</BaseText>}
          <BaseText
            onClick={restart} style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 12,
              marginTop: 32
            }}
          >
            Use a different phone number
          </BaseText>
        </Desc>}
      {hash && qrCodeData &&
        <Desc ref={refQr}>
          <BaseText style={{ textTransform: 'uppercase' }}>Save your recovery code</BaseText>
          <BaseText>Scan or load this QR code to recover SMS Wallet on any device</BaseText>
          <QRImage
            src={qrCodeData}
            onClick={saveQR}
          />
          <Address>{apis.web3.getAddress(pk)}</Address>
          <FlexRow style={{ justifyContent: codeSaved ? 'space-between' : 'center', width: '100%' }}>
            <Button onClick={saveQR}>Save Image</Button>
            {codeSaved && <Button onClick={done}>Enter {' >>'}</Button>}
          </FlexRow>
        </Desc>}
    </Main>
  )
}

export default Signup
