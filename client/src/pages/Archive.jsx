import React, { useState, useEffect } from 'react'
import { BaseText, Desc, LinkText, Title } from '../components/Text'
import { toast } from 'react-toastify'
import PhoneInput from 'react-phone-number-input'
import { Button, Input } from '../components/Controls'
import { processError } from '../utils'
import apis from '../api'
import OtpBox from '../components/OtpBox'
import { useSelector } from 'react-redux'
import paths from './paths'
import { useHistory } from 'react-router'
import MainContainer from '../components/Container'
import phoneValidator from 'phone'
import humanizeDuration from 'humanize-duration'

const Archive = () => {
  const history = useHistory()
  const [phone, setPhone] = useState('')
  const [archiving, setArchiving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [readyForCode, setReadyForCode] = useState(false)
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const prefilledPhone = useSelector(state => state.global.prefilledPhone)

  useEffect(() => {
    if (prefilledPhone) {
      const { phoneNumber, isValid } = phoneValidator(prefilledPhone)
      if (!isValid) {
        return
      }
      setPhone(phoneNumber)
    }
  }, [prefilledPhone])

  const archivePhone = async () => {
    if (!(countdown <= 0)) {
      return
    }
    setArchiving(true)
    // console.log({ phone, eseed })
    try {
      await apis.server.archive({ phone })
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
      setArchiving(false)
    }
  }
  const restart = () => {
    setPhone('')
    setCountdown(0)
    setReadyForCode(false)
    setCode('')
  }

  const archivePhoneVerify = async () => {
    setVerifying(true)
    try {
      const { timeRemain, archived, reset } = await apis.server.archiveVerify({ phone, code })
      if (archived) {
        toast.success('Archived wallet. You can sign up again now using the same phone number')
        history.push(paths.signup)
        return
      }
      const timeRemainStr = humanizeDuration(timeRemain, { largest: 2, round: true })
      if (reset) {
        toast.success(`Archiving wallet. Please check again in: ${timeRemainStr}`)
      } else {
        toast.info(`Archiving in process. Please wait for ${timeRemainStr} to check again`)
      }
      restart()
    } catch (ex) {
      console.error(ex)
      toast.error(`Error: ${processError(ex)}`)
    } finally {
      setCode('')
      setVerifying(false)
      setCountdown(0)
    }
  }

  useEffect(() => {
    if (code?.length === 6 && !verifying) {
      archivePhoneVerify()
    }
  }, [code, verifying])
  return (
    <MainContainer>
      <Title> Archive your wallet </Title>
      <Desc>
        {!readyForCode &&
          <>
            <BaseText>Please provide the phone number of the wallet you want to archive, so you can create another wallet with the phone number again</BaseText>
            <PhoneInput
              autoComplete='username'
              name='username'
              margin='16px'
              inputComponent={Input}
              defaultCountry='US'
              placeholder='Enter phone number'
              value={phone} onChange={setPhone}
            />
            <Button onClick={archivePhone} disabled={archiving}>Verify</Button>
          </>}
        {readyForCode &&
          <>
            <BaseText>Verify your 6-digit code</BaseText>
            <OtpBox value={code} onChange={setCode} />
            <Button onClick={archivePhone} disabled={verifying || !(countdown <= 0)}>Resend SMS</Button>
            {countdown > 0 && <BaseText $color='#cccccc'>(wait {countdown}s)</BaseText>}
            <LinkText onClick={restart}>
              Use a different phone number
            </LinkText>
          </>}
      </Desc>
    </MainContainer>
  )
}

export default Archive
