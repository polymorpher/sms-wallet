import React, { useState, useRef } from 'react'
import { Address, BaseText, Desc, Title } from '../components/Text'
import { FlexColumn, FlexRow } from '../components/Layout'
import { Button } from '../components/Controls'
import html2canvas from 'html2canvas'
import styled from 'styled-components'

const QRImage = styled.img`
  border: 1px solid lightgrey;
  border-radius: 8px;
  box-shadow: 0 0 8px lightgrey;
  width: 256px;
  height: 256px;
  object-fit: contain;
`

const SaveQR = ({ phone, address, qrCodeData, onSaveQR, onDone }): React.JSX.Element => {
  const refQr = useRef<HTMLDivElement>(null)
  const [codeSaved, setCodeSaved] = useState(false)

  const capture = async (): Promise<Blob | undefined> => {
    if (!refQr?.current) {
      return
    }
    const canvas = await html2canvas(refQr.current)
    return await new Promise<Blob | undefined>((resolve, reject) => {
      try {
        canvas.toBlob(blob => { resolve(blob ?? undefined) })
      } catch (err) {
        reject(err)
      }
    })
  }

  const saveQR = async (): Promise<void> => {
    const blob = await capture() as Blob
    const element = document.createElement('a')
    element.href = URL.createObjectURL(blob)
    element.download = `sms-wallet-${phone.replace('+', '_')}-${address}.png`
    document.body.appendChild(element)
    element.click()
    URL.revokeObjectURL(element.href)
    setCodeSaved(true)
    onSaveQR?.()
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
        <FlexColumn>
          <Address style={{ fontSize: 11 }}>{address}</Address>
          <Address>{phone}</Address>
        </FlexColumn>
        <FlexRow style={{ justifyContent: codeSaved ? 'space-between' : 'center', width: '100%' }}>
          <Button onClick={saveQR}>Save Image</Button>
          {codeSaved && <Button onClick={onDone}>Done {' >>'}</Button>}
        </FlexRow>
      </Desc>
    </>
  )
}

export default SaveQR
