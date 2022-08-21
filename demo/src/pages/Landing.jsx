import React from 'react'
import { LinkWrarpper, MainContainer } from '../components/Layout'
import { BaseText } from '../components/Text'

const Landing = () => {
  return (
    <MainContainer>
      <h1>SMS Wallet Developer Demos</h1>
      <h2>Basic functionalities</h2>
      <ul>
        <li><LinkWrarpper href='/call'><b>Contract Call</b></LinkWrarpper>: Request the user to make a contract call in browser</li>
        <li><LinkWrarpper href='/request'><b>SMS Tx Request</b></LinkWrarpper>: Send the user an SMS to request the user to make a contract call</li>
        <li><LinkWrarpper href='/signature'><b>Signature</b></LinkWrarpper>: Request the user to sign a message</li>
      </ul>
      <h2>Use cases</h2>
      <ul>
        <li>Login via signature</li>
        <li>Ask a player to approve an in-game transaction via SMS</li>
      </ul>
      <h2>Bugs?</h2>
      <BaseText>Submit a request at <LinkWrarpper href='https://github.com/polymorpher/sms-wallet' target='_blank'>https://github.com/polymorpher/sms-wallet</LinkWrarpper></BaseText>
      <h2>Contact</h2>
      <BaseText>Telegram: <LinkWrarpper href='https://t.me/aaronqli' target='_blank'>aaronqli</LinkWrarpper></BaseText>
      <BaseText>Email: aaron at modulo.so</BaseText>
      <BaseText>GitHub: <LinkWrarpper href='https://github.com/polymorpher' target='_blank'>polymorpher</LinkWrarpper></BaseText>
    </MainContainer>
  )
}

export default Landing
