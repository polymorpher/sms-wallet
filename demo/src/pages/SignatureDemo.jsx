import React, { useState, useEffect } from 'react'
import { BaseText } from '../components/Text'
import { LinkWrarpper, MainContainer, Row } from '../components/Layout'
import { Input, Param, QRImage, SecondaryText, Table, TextArea, Wrapped } from './DemoStyles'
import { useCallbackParameters } from './CallDemo'
import config from '../../config'
import qs from 'query-string'
import qrcode from 'qrcode'
import ReactPlayer from 'react-player'
const SignatureDemo = () => {
  const { caller, setCaller, callback, setCallback, comment, setComment } = useCallbackParameters()
  const [message, setMessage] = useState('Whatever message you want...')
  const [url, setUrl] = useState('')
  const [qrCodeData, setQrCodeData] = useState('')

  useEffect(() => {
    const url = new URL(config.clientUrl + '/sign')
    const callbackEncoded = Buffer.from(callback).toString('base64')
    url.search = qs.stringify({ caller, callback: callbackEncoded, comment, message }, { skipEmptyString: true, skipNull: true })
    setUrl(url.href)
  }, [caller, comment, callback, message])

  useEffect(() => {
    async function f () {
      const qr = await qrcode.toDataURL(url, { errorCorrectionLevel: 'low', width: 256 })
      setQrCodeData(qr)
    }
    f()
  }, [url])

  return (
    <MainContainer>
      <h1>Signature Demo</h1>
      <BaseText>In this demo, we show how you can specify a message, then asks the user to cryptographically sign a message using (the private key within) their wallet. You can obtain the user's signature for this message in the callback after the user confirms signing. The signature is conforming EIP-191 and can be verified using web3.js and ethers.js. That means, given the user's signature and the message you specified, you can recovery the signing address and verify whether the address is the same as the user's.</BaseText>
      <Row style={{ justifyContent: 'center' }}>
        <ReactPlayer
          playsinline
          playing loop muted
          config={{ youtube: { playerVars: { autoplay: 1, loop: 1, fs: 1, controls: 1 } } }}
          url='https://www.youtube.com/watch?v=MOFXkYOVoeY' width='640px' height='360px'
        />
      </Row>
      <h2>Fully constructed URL</h2>
      <BaseText>This is the URL the user should be sent to, based on the parameters below. The URL changes automatically as you update the parameters</BaseText>
      <LinkWrarpper style={{ width: '100%', wordBreak: 'break-word' }} href={url} target='_blank'><Wrapped style={{ width: '100%' }}>{url}</Wrapped></LinkWrarpper>
      <h2>QR Code</h2>
      <BaseText>You can also encode the URL above in a QR code and asks the user to scan on their mobile device</BaseText>
      <QRImage src={qrCodeData} />
      <h2>Parameters</h2>
      <BaseText>The following query parameters are passed into the URL. All parameters should be URL encoded (including those already base64 encoded)</BaseText>
      <Table>
        <tbody>
          <tr>
            <td>
              <Param>caller</Param>
              <SecondaryText>(optional)</SecondaryText>
            </td>
            <td>
              <Input
                placeholder='Your Demo App'
                value={caller} onChange={({ target: { value } }) => setCaller(value)}
              />
            </td>
            <td><BaseText>Your app's name. This helps the user identify which app is asking the user to approve a transaction</BaseText></td>
          </tr>
          <tr>
            <td>
              <Param>comment</Param>
              <SecondaryText>(optional)</SecondaryText>
            </td>
            <td>
              <Input
                value={comment}
                placeholder='Just testing'
                onChange={({ target: { value } }) => setComment(value)}
              />
            </td>
            <td><BaseText>Reason for the request. Here you can explain to the user in details why you are making this request </BaseText></td>
          </tr>
          <tr>
            <td>
              <Param>message</Param>
            </td>
            <td>
              <TextArea
                value={message}
                onChange={({ target: { value } }) => setMessage(value)}
              />
            </td>
            <td><BaseText>Reason for the request. Here you can explain to the user in details why you are making this request </BaseText></td>
          </tr>
          <tr>
            <td>
              <Param>callback</Param>
            </td>
            <td>
              <Input
                placeholder='https://google.com'
                value={callback} onChange={({ target: { value } }) => setCallback(value)}
              />
              <BaseText><br /><SecondaryText>base64 encoded:</SecondaryText><br />{encodeURIComponent(Buffer.from(callback || '').toString('base64'))}</BaseText>
            </td>
            <td>
              <BaseText>The callback URL the user would be redirected to, after the transaction is approved. The parameter must be base64 encoded. This provides a way for your app to be notified when the transaction is approved and executed, or if any error occurs. The user's address and transaction hash will be attached in query parameters</BaseText>
            </td>
          </tr>
        </tbody>
      </Table>

    </MainContainer>
  )
}

export default SignatureDemo
