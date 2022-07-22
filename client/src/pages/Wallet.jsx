import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import paths from './paths'
import { Address, BaseText, Desc, Gallery, Heading, Label, Title } from '../components/Text'
import { FlexColumn, FlexRow, Main, Modal } from '../components/Layout'
import { utils } from '../utils'
// import { useHistory } from 'react-router'
import { balanceActions } from '../state/modules/balance'
import { Button, Input, LinkWrarpper } from '../components/Controls'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import BN from 'bn.js'
import apis from '../api'

const Row = styled(FlexRow)`
  align-items: center;
  width: 100%;
  gap: 16px;
`

const Wallet = () => {
  // const history = useHistory()
  const dispatch = useDispatch()
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet)[0]
  const balance = useSelector(state => state.balance[address]?.balance || '0')

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [sendModalVisible, setSendModalVisible] = useState(false)

  const { formatted } = utils.computeBalance(balance)
  console.log(balance, formatted)

  const pk = wallet[address]?.pk
  if (!pk) {
    return <Redirect to={paths.signup} />
  }
  useEffect(() => {
    const h = setInterval(() => {
      dispatch(balanceActions.fetchBalance({ address }))
    }, 5000)
    return () => {
      clearInterval(h)
    }
  }, [])
  const send = async () => {
    const { balance } = utils.toBalance(amount)
    const value = balance?.toString()
    // console.log(value, amount, balance)
    if (!value || value === '0') {
      toast.error('Invalid amount')
      return
    }

    if (!(new BN(value).lte(new BN(balance)))) {
      toast.error('Amount exceeds balance')
      return
    }
    if (!(to?.startsWith('0x')) || !apis.web3.isValidAddress(to)) {
      toast.error('Invalid address')
      return
    }
    toast.info('Submitting transaction...')
    apis.web3.changeAccount(pk)
    console.log(apis.web3.web3.eth.accounts.wallet)
    console.log({ value, from: address, to })
    const { transactionHash } = await apis.web3.web3.eth.sendTransaction({ value, from: address, to })
    console.log('done', transactionHash)
    toast.info(<><BaseText>Done! <LinkWrarpper href={utils.getExplorerUri(transactionHash)}>View transaction</LinkWrarpper></BaseText></>)
    setSendModalVisible(false)
  }
  return (
    <Main style={{ gap: 24 }}>
      <Heading>SMS Wallet</Heading>
      <Title style={{ margin: 16 }}> Your Wallet </Title>
      <Desc>
        <Address>{address}</Address>
        <BaseText>BALANCE: {formatted} ONE</BaseText>
        <Button onClick={() => setSendModalVisible(true)}>Send Money</Button>
      </Desc>
      <Modal visible={sendModalVisible} onCancel={() => setSendModalVisible(false)}>
        <Row>
          <Label>To</Label>
          <Input onChange={({ target: { value } }) => setTo(value)} value={to} margin='16px' style={{ fontSize: 9, flex: 1 }} />
        </Row>
        <Row>
          <Label>Amount</Label>
          <Row style={{ flex: 1 }}>
            <Input onChange={({ target: { value } }) => setAmount(value)} value={amount} margin='16px' />
            <Label>ONE</Label>
          </Row>
        </Row>
        <Row style={{ justifyContent: 'center', marginTop: 16 }}>
          <Button onClick={send}>Confirm</Button>
        </Row>
      </Modal>
      <Gallery style={{ flex: '100%' }}>
        <BaseText style={{ fontSize: 20, textTransform: 'uppercase' }}>NFT Gallary</BaseText>
        <FlexColumn style={{ justifyContent: 'center', flex: '100%' }}>
          <FlexRow style={{ justifyContent: 'center', width: '100%' }}>
            <BaseText>COMING SOON</BaseText>
          </FlexRow>
        </FlexColumn>
      </Gallery>
    </Main>
  )
}

export default Wallet
