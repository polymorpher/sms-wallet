import React, { useState, useEffect, useRef } from 'react'
import PhoneInput from 'react-phone-number-input'
import styled from 'styled-components'
import { FlexColumn } from '../components/Layout'
import { BaseText, Title } from '../components/Text'
import { utils } from '../utils'
import apis from '../api'
import { NotificationManager } from 'react-notifications'
import OtpBox from '../components/OtpBox'
import { Button } from '../components/Controls'

const Main = styled(FlexColumn)`
  gap: 32px;
  width: 100%;
  align-items: center;
`

const Heading = styled.div`
  text-transform: uppercase;
  padding: 16px;
  background: black;
  color: white;
  //position: fixed;
  height: 32px;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

const Desc = styled.div`
  box-sizing: border-box;
  padding: 16px;
  color: black;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
`

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

const randomSeed = () => {
  const otpSeedBuffer = new Uint8Array(32)
  return window.crypto.getRandomValues(otpSeedBuffer)
}

const Signup = () => {
  const [phone, setPhone] = useState()
  const [pk, setPk] = useState(randomSeed())
  const [p, setP] = useState(randomSeed())
  const [hash, setHash] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  const verify = async () => {
    if (!(countdown <= 0)) {
      return
    }
    const phoneBytes = utils.stringToBytes(phone)
    const combined = utils.bytesConcat(p, phoneBytes)
    const q = utils.keccak(combined)
    const iv = q.slice(0, 16)
    const eseed = utils.hexView(q)
    const ekeyBytes = utils.encrypt(pk, p, iv)
    const ekey = utils.hexView(ekeyBytes)
    const address = apis.web3.getAddress(pk)
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
    }
  }
  const restart = () => {
    setPhone('')
    setCountdown(0)
    setHash('')
  }

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
          <Button onClick={verify}>Verify</Button>
        </Desc>}
      {hash &&
        <Desc>
          <BaseText>Verify your 6-digit code</BaseText>
          <OtpBox value={code} onChange={setCode} />
          <Button onClick={verify} disabled={!(countdown <= 0)}>Resend SMS</Button>
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
    </Main>
  )
}

export default Signup
