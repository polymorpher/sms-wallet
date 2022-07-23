import React, { useState } from 'react'
import { BaseText, Desc, Heading, LinkText, Title } from '../components/Text'
import { Main } from '../components/Layout'
import QrCodeScanner from '../components/QrCodeScanner'
import qs from 'query-string'
import { toast } from 'react-toastify'
import PhoneInput from 'react-phone-number-input'
import { Button, Input } from '../components/Controls'
import { processError, utils } from '../utils'
import apis from '../api'
import OtpBox from '../components/OtpBox'
import { useEffect } from '@types/react'
const processRecoverData = (d) => {
  try {
    const q = qs.parseUrl(d)
    return q?.query?.p
  } catch (ex) {
    console.error(ex)
    return null
  }
}
const Recover = () => {
  const [p, setP] = useState()
  const [phone, setPhone] = useState('')
  const [pk, setPk] = useState('')
  const [restoring, setRestoring] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [readyForCode, setReadyForCode] = useState(false)
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  const onScan = (data, isJson) => {
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
    console.log(pStr)
  }
  const restore = async () => {
    if (!(countdown <= 0)) {
      return
    }
    setRestoring(true)
    const { eseed } = utils.computeParameters({ phone, p })
    console.log({ phone, eseed })
    try {
      await apis.server.restore({ phone, eseed })
      setReadyForCode(true)
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
      setRestoring(false)
    }
  }
  const restart = () => {
    setPhone('')
    setCountdown(0)
    setReadyForCode(false)
    setCode('')
  }

  const restoreVerify = async () => {

  }

  useEffect(() => {
    if (code?.length === 6 && !verifying) {
      restoreVerify()
    }
  }, [code, verifying])


  return (
    <Main>
      <Heading>
        <div>SMS Wallet</div>
      </Heading>
      <Title> Recover your wallet </Title>
      {!p &&
        <Desc>
          <BaseText>Scan or select your recovery QR code</BaseText>
          <QrCodeScanner style={{ maxWidth: 288 }} onScan={onScan} shouldInit />
        </Desc>}
      {p && !readyForCode &&
        <Desc>
          <BaseText>Next, please provide the phone number you used to sign up the wallet</BaseText>
          <PhoneInput
            margin='16px'
            inputComponent={Input}
            defaultCountry='US'
            placeholder='Enter phone number'
            value={phone} onChange={setPhone}
          />
          <Button onClick={restore} disabled={restoring}>Verify</Button>
        </Desc>}
      {p && readyForCode &&
        <Desc>
          <BaseText>Verify your 6-digit code</BaseText>
          <OtpBox value={code} onChange={setCode} />
          <Button onClick={restore} disabled={verifying || !(countdown <= 0)}>Resend SMS</Button>
          {countdown > 0 && <BaseText $color='#cccccc'>(wait {countdown}s)</BaseText>}
          <LinkText onClick={restart}>
            Use a different phone number
          </LinkText>
        </Desc>}

    </Main>
  )
}

export default Recover
