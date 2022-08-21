import React, { useEffect, useState } from 'react'
import { LinkWrarpper, Col, Row, MainContainer} from '../components/Layout'
import { Button} from '../components/Controls'
import { BaseText } from '../components/Text'
import config from '../../config'
import { CalldataTable, CallParameterTable, useCallParameters } from './CallDemo'
import { Input, JSONBlock, Param, SecondaryText, Table} from './DemoStyles'
import axios from 'axios'
import ReactPlayer from 'react-player'

const RequestDemo = () => {
  const [address, setAddress] = useState()
  const [phone, setPhone] = useState()
  const [request, setRequest] = useState({})
  const [response, setResponse] = useState('')
  const [responseCode, setResponseCode] = useState()

  const args = useCallParameters()
  const { caller, calldata, amount, comment, callback, dest } = args

  useEffect(() => {
    setRequest({ caller, calldata, amount, comment, callback, dest })
  }, [caller, calldata, amount, comment, callback, dest])

  const sendRequest = async () => {
    try {
      console.log({ request, address, phone })
      const { data } = await axios.post(config.serverUrl + '/request', { request, address, phone })
      setResponse(JSON.stringify(data))
      setResponseCode(200)
    } catch (ex) {
      setResponseCode(ex?.response?.status)
      setResponse(JSON.stringify(ex?.response?.data))
    }
  }

  return (
    <MainContainer>
      <h1>SMS Tx Request Demo</h1>
      <BaseText>In this demo, we show how the developer can define and submit a transaction to SMS Wallet server REST API. The server will create a confirmation short-link for this transaction, and send the user a confirmation SMS with the short-link. The user can then click the link, view the transaction in their wallet, and approve that subsequently. </BaseText>
      <Row style={{ justifyContent: 'center' }}>
        <ReactPlayer
          playsinline
          playing loop muted
          config={{ youtube: { playerVars: { autoplay: 1, loop: 1, fs: 1, controls: 1 } } }}
          url='https://www.youtube.com/watch?v=rpkWlVlFjeI' width='640px' height='360px'
        />
      </Row>
      <h2>REST API Parameters</h2>
      <BaseText>The request must be made over POST with a JSON body</BaseText>
      <Row><BaseText>POST {config.serverUrl + '/request'}</BaseText><Button onClick={sendRequest}>Send Now</Button></Row>
      {responseCode &&
        <Row>
          <Col>
            <BaseText $color={responseCode === 200 ? 'green' : 'red'}>Response: {responseCode}</BaseText>
            <JSONBlock $color={responseCode === 200 ? 'green' : 'red'}>{response}</JSONBlock>
            <BaseText>Response parameters:</BaseText>
            <BaseText>
              - <b>error</b>: shows the error occurred in the request, if any<br />
              - <b>id</b>: the id of the transaction, can be used to check completion status in "SMS Tx Request Completion Status" API<br />
              - <b>hash</b>: the keccak256 hash of the stable-JSON string of the request. It can be used to check integrity and enhance security<br />
            </BaseText>
          </Col>
        </Row>}
      <Table>
        <tbody>
          <tr>
            <td>
              <Param>address</Param>
              <SecondaryText>(option 1)</SecondaryText>
            </td>
            <td>
              <Input
                placeholder='0x...'
                value={address} onChange={({ target: { value } }) => setAddress(value)}
              />
            </td>
            <td><BaseText>The address of the user you are sending the tx request to via SMS. Cannot be used with <b>phone</b> together</BaseText></td>
          </tr>
          <tr>
            <td>
              <Param>phone</Param>
              <SecondaryText>(option 2)</SecondaryText>
            </td>
            <td>
              <Input
                value={phone}
                placeholder='+1650.......'
                onChange={({ target: { value } }) => setPhone(value)}
              />
            </td>
            <td><BaseText>The phone number of the user in E.164 format. You can provide this parameter in lieu of address, but you cannot provide both address and phone.</BaseText></td>
          </tr>
          <tr>
            <td>
              <Param>request</Param>
            </td>
            <td>
              <Col>
                <JSONBlock>
                  {JSON.stringify(request)}
                </JSONBlock>
              </Col>
            </td>
            <td>
              <Col>
                <BaseText>A JSON Object describing the request and the transaction you want the user to approve. Use the tool below to automatically update</BaseText>
              </Col>
            </td>
          </tr>
        </tbody>
      </Table>
      <h2>Request Specification</h2>
      <BaseText>The request use the same parameters in <LinkWrarpper href='/call'>Contract Call</LinkWrarpper></BaseText>
      <CallParameterTable {...args} />

      <h2>Calldata construction</h2>
      <BaseText>The calldata follows the same format as in <LinkWrarpper href='/call'>Contract Call</LinkWrarpper>. The following keys and values are used for constructing the encoded-data (calldata). The encoding result is automatically reflected above. </BaseText>
      <CalldataTable {...args} />

      <div style={{ height: 256 }} />
    </MainContainer>
  )
}

export default RequestDemo
