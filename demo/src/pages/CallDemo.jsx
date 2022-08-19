import React, { useEffect, useState } from 'react'
import { LinkWrarpper, Col, Row, MainContainer, Line } from '../components/Layout'
import { BaseText } from '../components/Text'
import { clone } from 'lodash'
import config from '../../config'
import qs from 'query-string'
import { Input, JSONBlock, Param, QRImage, SecondaryText, Table, Wrapped } from './DemoStyles'
import qrcode from 'qrcode'
import ReactPlayer from 'react-player'

export const CallParameterTable = ({ caller, setCaller, comment, setComment, amount, setAmount, dest, setDest, calldata, callback, setCallback, calldataJSON }) => {
  return (
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
            <Param>amount</Param>
            <SecondaryText>(optional)</SecondaryText>
          </td>
          <td><Input value={amount} onChange={({ target: { value } }) => setAmount(value)} /></td>
          <td><BaseText>The amount of native assets you want the user to send in this transaction</BaseText></td>
        </tr>
        <tr>
          <td>
            <Param>dest</Param>
          </td>
          <td><Input value={dest} onChange={({ target: { value } }) => setDest(value)} /></td>
          <td><BaseText>The address of the contract to call, in hex format</BaseText></td>
        </tr>
        <tr>
          <td>
            <Param>calldata</Param>
          </td>
          <td>
            <Col>
              <Wrapped>{calldata}</Wrapped>
              <BaseText>
                Equivalent JSON:
                <Line />
                <JSONBlock>
                  <pre>
                    {calldataJSON}
                  </pre>
                </JSONBlock>
                <Line />
              </BaseText>
            </Col>
          </td>
          <td>
            <Col>
              <BaseText>Base64 encoded JSON string of the object describing the method and parameters for the contract call. Use "calldata construction" tool below to automatically adjust this value</BaseText>
            </Col>
          </td>
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
        <tr>
          <td />
          <td colSpan={2}>
            <BaseText>
              <br />
              Response query parameters:<br />
              - <b>success</b>: "true" if the transaction was successfully confirmed on blockchain<br />
              - <b>cancelled</b>: "true" if the user cancelled the transaction<br />
              - <b>error</b>: string, showing any error occurred. Note that if the transaction was confirmed by user but not by blockchain, you would not get a callback<br />
              - <b>hash</b>: the transaction hash, in 0x-hex form<br />
              - <b>address</b>: the user's wallet address<br />
            </BaseText>
          </td>
        </tr>
      </tbody>
    </Table>
  )
}

export const CalldataTable = ({ method, setMethod, selector, setSelector, parameters, setParameters, onParameterUpdate }) => {
  return (
    <Table>
      <tbody>
        <tr>
          <td>
            <Param>method</Param>
          </td>
          <td><Input value={method} onChange={({ target: { value } }) => setMethod(value)} /></td>
          <td><BaseText>The signature of the function to call (name and types in compact form). For example, <b>transfer(address,uint256)</b> is the signature of <LinkWrarpper href='https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#ERC20-transfer-address-uint256-' target='_blank'>the standard ERC20 transfer function</LinkWrarpper></BaseText></td>
        </tr>
        <tr>
          <td>
            <Param>selector</Param>
            <SecondaryText>(optional)</SecondaryText>
          </td>
          <td><Input value={selector} placeholder='0x70343886' onChange={({ target: { value } }) => setSelector(value)} /></td>
          <td><BaseText>The selector of the function signature in 0x-hex format, as defined in <LinkWrarpper href='https://docs.soliditylang.org/en/v0.8.12/abi-spec.html#function-selector' target='_blank'>here</LinkWrarpper>. This value overrides <b>method</b></BaseText></td>
        </tr>
        <tr>
          <td>
            <Param>parameters</Param>
          </td>
          <td>
            <Col>
              {parameters.map(({ type, value, name }, i) => {
                return (
                  <Col key={`${i}`}>
                    <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: i > 0 ? 16 : 0 }}>
                      <SecondaryText>Parameter {i}</SecondaryText>
                      <LinkWrarpper
                        href='#' onClick={(e) => {
                          e.preventDefault()
                          setParameters((p) => [...p.slice(0, i), ...p.slice(i + 1)])
                        }}
                      >- Remove
                      </LinkWrarpper>
                    </Row>

                    <Row><BaseText>Value</BaseText><Input value={value} onChange={({ target: { value } }) => onParameterUpdate({ value }, i)} /></Row>
                    <Row><BaseText>Type</BaseText><Input value={type} onChange={({ target: { value } }) => onParameterUpdate({ type: value }, i)} /></Row>
                    <Row><BaseText>Name</BaseText><Input value={name} onChange={({ target: { value } }) => onParameterUpdate({ name: value }, i)} /></Row>
                  </Col>
                )
              })}
              <LinkWrarpper
                style={{ marginTop: parameters.length > 0 ? 32 : 0 }}
                href='#' onClick={(e) => {
                  e.preventDefault()
                  setParameters((p) => [...p, {
                    value: '1',
                    type: 'uint256',
                    name: 'param'
                  }])
                }}
              >+ Add a parameter
              </LinkWrarpper>
            </Col>

          </td>
          <td><BaseText>The values, types, and names of the parameters. The names are for informational purposes only. Types are optional, but it is advisable to include the type of each parameter even though the function signature already contains types, because some complex types (such as structs and types) may be hard to infer from signature. The values are in their canonical forms, that means (1) 0x-hex-encoded string for byte data and address (2) number or string for integers (3) string for strings (3) array for arrays, structs, and tuples. </BaseText></td>
        </tr>
      </tbody>
    </Table>
  )
}

const testCalldata = { method: 'test(uint32,bytes4)', parameters: [{ name: 'amount', type: 'uint32', value: 1 }, { name: 'id', type: 'bytes4', value: '0x12345678' }] }

export const useCallbackParameters = () => {
  const cleanURL = new URL(location.href)
  cleanURL.search = ''
  cleanURL.hash = ''
  cleanURL.pathname = '/callback'
  const [caller, setCaller] = useState()
  const [callback, setCallback] = useState(cleanURL.href)
  const [comment, setComment] = useState()
  return { caller, setCaller, callback, setCallback, comment, setComment }
}

export const useCallParameters = () => {
  const { caller, setCaller, callback, setCallback, comment, setComment } = useCallbackParameters()
  const [amount, setAmount] = useState('0.1')
  const [dest, setDest] = useState('0x37CCbeAa1d176f77227AEa39BE5888BF8768Bf85')
  const [method, setMethod] = useState('test(uint32,bytes4)')
  const [selector, setSelector] = useState()
  const [parameters, setParameters] = useState(testCalldata.parameters)
  const [calldata, setCalldata] = useState('eyJtZXRob2QiOiJ0ZXN0KHVpbnQzMixieXRlczQpIiwicGFyYW1ldGVycyI6W3sibmFtZSI6ImFtb3VudCIsInR5cGUiOiJ1aW50MzIiLCJ2YWx1ZSI6MX0seyJuYW1lIjoiaWQiLCJ0eXBlIjoiYnl0ZXM0IiwidmFsdWUiOiIweDEyMzQ1Njc4In1dfQ')
  const [calldataJSON, setCalldataJSON] = useState(JSON.stringify(testCalldata, null, 2))
  useEffect(() => {
    const obj = { method, selector, parameters }
    const j = JSON.stringify(obj)
    const jf = JSON.stringify(obj, null, 2)
    setCalldataJSON(jf)
    setCalldata(Buffer.from(j).toString('base64'))
  }, [parameters])
  const onParameterUpdate = (kv, index) => {
    setParameters(p => {
      if (index >= p.length) {
        console.error('Bad index', p.length, index, kv)
        return
      }
      const pp = clone(p)
      pp[index] = { ...p[index], ...kv }
      return pp
    })
  }
  return {
    method,
    setMethod,
    selector,
    setSelector,
    parameters,
    setParameters,
    onParameterUpdate,
    caller,
    setCaller,
    comment,
    setComment,
    amount,
    setAmount,
    dest,
    setDest,
    calldata,
    callback,
    setCallback,
    calldataJSON
  }
}

const CallDemo = () => {
  const args = useCallParameters()
  const { caller, calldata, amount, comment, callback, dest } = args

  const [url, setUrl] = useState('')
  const [qrCodeData, setQrCodeData] = useState('')

  useEffect(() => {
    const url = new URL(config.clientUrl + '/call')
    const callbackEncoded = Buffer.from(callback).toString('base64')
    url.search = qs.stringify({ caller, callback: callbackEncoded, dest, amount, comment, calldata }, { skipEmptyString: true, skipNull: true })
    setUrl(url.href)
  }, [caller, calldata, amount, comment, callback, dest])

  useEffect(() => {
    async function f () {
      const qr = await qrcode.toDataURL(url, { errorCorrectionLevel: 'low', width: 256 })
      setQrCodeData(qr)
    }
    f()
  }, [url])

  return (
    <MainContainer>
      <h1>Contract Call Demo</h1>
      <BaseText>In this demo, we show how the developer may configure various parameters to specify a transaction, and construct a URL that requests the user to approve the transaction. The URL points to a transaction approval page under the domain smswallet.xyz. As soon as the user confirms the transaction on that page, the transaction will be submitted to the blockchain immediately for processing. At the same time, the user will be redirected back to a callback parameter which the developer should specify.</BaseText>
      <Row style={{ justifyContent: 'center' }}>
        <ReactPlayer
          playsinline
          playing loop muted
          config={{ youtube: { playerVars: { autoplay: 1, loop: 1, fs: 1, controls: 1 } } }}
          url='https://www.youtube.com/watch?v=AO_R4lrkPmI' width='640px' height='360px'
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
      <CallParameterTable {...args} />

      <h2>Calldata construction</h2>
      <BaseText>The following keys and values are used for constructing the encoded-data (calldata). The encoding result is automatically reflected above. In Javascript, you may use <b>encodeURIComponent(atob(JSON.stringify(obj)))</b> to produce the same result, assuming <b>obj</b> is the JSON object containing the following keys and values. In node.js, use <b>Buffer.from(JSON.stringify(obj)).toString('base64url')</b></BaseText>
      <CalldataTable {...args} />
      <div style={{ height: 256 }} />
    </MainContainer>
  )
}

export default CallDemo
