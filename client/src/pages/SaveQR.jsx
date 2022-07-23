import React, { useState, useRef } from 'react'
import { Address, BaseText, Desc, Title } from '../components/Text'
import { FlexRow } from '../components/Layout'
import { Button } from '../components/Controls'
import html2canvas from 'html2canvas'
import styled from 'styled-components'

const QRImage = styled.img`
  border: 1px solid lightgrey;
  border-radius: 8px;
  box-shadow: 0px 0px 10px lightgrey;
  width: 256px;
  height: 256px;
  object-fit: contain;
`

const SaveQR = ({ address, qrCodeData, onSaveQR, onDone }) => {
  const refQr = useRef()
  const [codeSaved, setCodeSaved] = useState(false)

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
    const element = document.createElement('a')
    element.href = URL.createObjectURL(blob)
    element.download = `sms-wallet-${address}.png`
    document.body.appendChild(element)
    element.click()
    URL.revokeObjectURL(element.href)
    setCodeSaved(true)
    onSaveQR && onSaveQR()
  }

  return (
    <>
      <Title>Save your recovery code </Title>
      <Desc ref={refQr}>
        <BaseText>Scan or load this QR code to recover SMS Wallet on any device</BaseText>
        <QRImage
          src={qrCodeData}
          onClick={saveQR}
        />
        <Address>{address}</Address>
        <FlexRow style={{ justifyContent: codeSaved ? 'space-between' : 'center', width: '100%' }}>
          <Button onClick={saveQR}>Save Image</Button>
          {codeSaved && <Button onClick={onDone}>Done {' >>'}</Button>}
        </FlexRow>
      </Desc>
    </>
  )
}

export default SaveQR
