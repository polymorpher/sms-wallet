import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import paths from './paths'
import { Address, BaseText, Desc, Gallery, Heading, Title } from '../components/Text'
import { FlexColumn, FlexRow, Main } from '../components/Layout'
import { utils } from '../utils'
// import { useHistory } from 'react-router'
import { balanceActions } from '../state/modules/balance'
import { Button } from '../components/Controls'

const Wallet = () => {
  // const history = useHistory()
  const dispatch = useDispatch()
  const wallet = useSelector(state => state.wallet || {})
  const balance = useSelector(state => state.balance || {})
  const { formatted } = utils.computeBalance(balance)
  const address = Object.keys(wallet)[0]
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

  }
  return (
    <Main style={{ gap: 24 }}>
      <Heading>SMS Wallet</Heading>
      <Title style={{ margin: 16 }}> Your Wallet </Title>
      <Desc>
        <Address>{address}</Address>
        <BaseText>BALANCE: {formatted} ONE</BaseText>
        <Button onClick={send}>Send Money</Button>
      </Desc>
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
