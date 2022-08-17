import React, { useEffect, useState } from 'react'
import { Main, LinkWrarpper, MainContainer } from '../components/Layout'

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
    </MainContainer>
  )
}

export default Landing
