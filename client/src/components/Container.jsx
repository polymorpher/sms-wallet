import React, { useState } from 'react'
import { BaseText, Heading } from './Text'
import { IconImg, MenuIconContainer, MenuItemLink, MenuItems } from './Menu'
import MenuIcon from '../../assets/menu.svg'
import { Col, Main, Modal, Row } from './Layout'
import { Button } from './Controls'
import { walletActions } from '../state/modules/wallet'
import { useDispatch, useSelector } from 'react-redux'

const MainContainer = ({ children, withMenu }) => {
  const dispatch = useDispatch()
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet)[0]

  const [menuVisible, setMenuVisible] = useState(false)
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const logout = () => {
    dispatch(walletActions.deleteWallet(address))
    setLogoutModalVisible(false)
    setMenuVisible(false)
  }

  return (
    <Main style={{ gap: 24 }}>
      <Heading style={{ justifyContent: 'flex-end', alignItems: 'flex-start', minHeight: 56 }}>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>SMS Wallet</div>
        {withMenu &&
          <MenuIconContainer $expanded={menuVisible}>
            <IconImg onClick={() => setMenuVisible(!menuVisible)} src={MenuIcon} />
            {menuVisible &&
              <MenuItems>
                {wallet && <MenuItemLink onClick={() => { window.location.reload() }}>{wallet[address].phone}</MenuItemLink>}
                <MenuItemLink onClick={() => setLogoutModalVisible(true)}>Logout</MenuItemLink>
              </MenuItems>}
          </MenuIconContainer>}
      </Heading>
      {children}
      {withMenu &&
        <Modal visible={logoutModalVisible} onCancel={() => setLogoutModalVisible(false)}>
          <Col>
            <BaseText>This will delete all data. To restore your wallet, you need to use the Recovery QR Code and to
              verify your phone number again
            </BaseText>
            <BaseText>Are you sure?</BaseText>
            <Row style={{ justifyContent: 'flex-end' }}><Button onClick={logout}>CONFIRM</Button></Row>
          </Col>
        </Modal>}
    </Main>
  )
}

export default MainContainer
