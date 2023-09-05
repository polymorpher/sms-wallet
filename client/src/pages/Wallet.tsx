import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import paths from './paths'
import { Address, BaseText, Desc, Label } from '../components/Text'
import { FlexRow, Modal, Row } from '../components/Layout'
import { processError, utils } from '../utils'

import { balanceActions } from '../state/modules/balance'
import { Button, FloatingSwitch, Input, LinkWrarpper } from '../components/Controls'
import { toast } from 'react-toastify'
import apis from '../api'
import PhoneInput from 'react-phone-number-input'
import { TailSpin } from 'react-loading-icons'
import MainContainer from '../components/Container'
import NFTShowcase from './NFT'
import { walletActions } from '../state/modules/wallet'
import { type RootState } from '../state/rootReducer'
import { type WalletState } from '../state/modules/wallet/reducers'
import { Navigate } from 'react-router'

const switchDestinationType = (prev: string) => {
  switch (prev) {
    case "address":
      return "phone"
    case "phone":
      return "tgid"
    case "tgid":
    default:
      return "address"
  }
}

enum DestinationType {
  "address" = "crypto address",
  "phone" = "phone number",
  "tgid" = "telegram id"
}

const Wallet = (): React.JSX.Element => {
  // const history = useHistory()
  const dispatch = useDispatch()
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const balance = useSelector<RootState, string>(state => state.balance[address ?? '']?.balance || '0')

  const [amount, setAmount] = useState('')
  const [sendModalVisible, setSendModalVisible] = useState(false)
  const [destinationType, setDestinationType] = useState<"address" | "phone" | "tgid">("address")
  const [destination, setDestination] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)

  const { formatted } = utils.computeBalance(balance)
  useEffect(() => {
    if (!address) {
      return
    }
    dispatch(balanceActions.fetchBalance({ address }))
    const h = setInterval(() => {
      dispatch(balanceActions.fetchBalance({ address }))
    }, 5000)
    return () => {
      clearInterval(h)
    }
  }, [dispatch, address])

  useEffect(() => {
    const keys = Object.keys(wallet)
    for (const k of keys) {
      if (k.startsWith('_')) {
        continue
      }
      if (!apis.web3.isValidAddress(k)) {
        console.log(`Deleting stale wallet ${k}`)
        dispatch(walletActions.deleteWallet(k))
      }
    }
  }, [wallet, dispatch])

  const pk = wallet[address ?? '']?.pk

  if (!pk || !address) {
    return <Navigate to={paths.signup} />
  }

  const send = async (): Promise<void> => {
    if (!address) {
      return
    }
    const { balance } = utils.toBalance(amount)
    const value = balance?.toString()
    // console.log(value, amount, balance)
    if (!value || value === '0') {
      toast.error('Invalid amount')
      return
    }

    if (!(BigInt(value) <= BigInt(balance))) {
      toast.error('Amount exceeds balance')
      return
    }

    let dest = destination

    switch (destinationType) {
      case "address":
        if (!(dest?.startsWith('0x')) || !apis.web3.isValidAddress(dest)) {
          toast.error('Invalid address')
        }
        return

      case "tgid":
        dest = "tg:" + dest

      case "phone":
        try {
          const signature = apis.web3.signWithNonce(destination, pk)
          dest = await apis.server.lookup({ destPhone: dest, address, signature })
          if (!apis.web3.isValidAddress(dest)) {
            toast.error(`Cannot find recipient with ${DestinationType[destinationType]} ${destination}`)
            return
          }
        } catch (ex) {
          console.error(ex)
          toast.error(`Error in looking up recipient: ${processError(ex)}`)
          return
        }
    }

    toast.info('Submitting transaction...')
    try {
      apis.web3.changeAccount(pk)
      const { hash } = await apis.web3.wallet(pk).sendTransaction({ value, from: address, to: dest })
      // console.log('done', transactionHash)
      toast.success(
        <FlexRow>
          <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
          <LinkWrarpper target='_blank' href={utils.getExplorerUri(hash)}>
            <BaseText>View transaction</BaseText>
          </LinkWrarpper>
        </FlexRow>)
      setSendModalVisible(false)
      dispatch(balanceActions.fetchBalance({ address }))
    } catch (ex) {
      console.error(ex)
      toast.error(`Error: ${processError(ex)}`)
    } finally {
      apis.web3.changeAccount()
    }
  }
  const sendWrapper = async (): Promise<void> => {
    setIsSending(true)
    try {
      await send()
    } catch (ex) {
      console.error(ex)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <MainContainer withMenu>
      <Desc style={{ padding: 0 }}>
        <Address>{wallet[address]?.phone}</Address>
        <Address onClick={() => {
          setShowFullAddress(!showFullAddress)
          navigator.clipboard.writeText(address).catch(console.error)
          toast.info(
            <FlexRow>
              <BaseText style={{ marginRight: 8 }}>Copied address!</BaseText>
              <LinkWrarpper target='_blank' href={utils.getExplorerHistoryUri(address)}>
                <BaseText>View wallet history</BaseText>
              </LinkWrarpper>
            </FlexRow>)
        }}
        >
          {showFullAddress ? address : utils.ellipsisAddress(address)}
        </Address>
        <BaseText>BALANCE: {formatted} ONE</BaseText>
        <Button onClick={() => { setSendModalVisible(true) }}>Send Money</Button>
      </Desc>
      <Modal style={{ maxWidth: 800, width: '100%', margin: 'auto' }} visible={sendModalVisible} onCancel={() => { setSendModalVisible(false) }}>
        <Row style={{ position: 'relative' }}>

          <Label>To</Label>
          {destinationType === "phone" ? (
            <PhoneInput
              margin='16px'
              inputComponent={Input}
              defaultCountry='US'
              placeholder='phone number of recipient'
              value={destination}
              onChange={e => setDestination(e ?? "")}
            />
          ) : (
            <Input
              onChange={e => setDestination(e.target.value)}
              placeholder={destinationType === "address" ? '0x1234abcde...' : "telegramid"}
              $width='100%'
              value={destination}
              $margin='16px'
              style={{ fontSize: 10, flex: 1 }}
            />
          )}
          <FloatingSwitch
            href="#"
            onClick={() => setDestinationType(switchDestinationType)}
          >
            switch to {DestinationType[switchDestinationType(destinationType)]}
          </FloatingSwitch>
        </Row>
        <Row>
          <Label>Amount</Label>
          <Row style={{ flex: 1 }}>
            <Input onChange={({ target: { value } }) => { setAmount(value) }} $width='100%' value={amount} $margin='16px' />
            <Label>ONE</Label>
          </Row>
        </Row>
        <Row style={{ justifyContent: 'center', marginTop: 16 }}>
          <Button onClick={sendWrapper} disabled={isSending}>{isSending ? <TailSpin width={16} height={16} /> : 'Confirm'}</Button>
        </Row>
      </Modal>
      <NFTShowcase address={address} />

    </MainContainer>
  )
}

export default Wallet
