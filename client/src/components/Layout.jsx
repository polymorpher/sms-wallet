import React from 'react'
import styled from 'styled-components'
export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  user-select: none;
`

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  user-select: none;
  position: relative;
`

export const Row = styled(FlexRow)`
  align-items: center;
  width: 100%;
  gap: 16px;
`

export const Col = styled(FlexColumn)`
  width: 100%;
  gap: 16px;
`

export const Main = styled(FlexColumn)`
  min-height: 100vh;
  gap: 32px;
  width: 100%;
  align-items: center;
`

const ModalContainer = styled.div`
  position: fixed;
  z-index: ${props => props.$zIndex || 5};
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`
const ModalShadow = styled.div`
  //pointer-events: none;
  opacity: 0.3;
  position: fixed;
  background: black;
  width: 100%;
  height: 100%;
`

const ModalBody = styled(FlexColumn)`
  padding: 24px;
  width: 100%;
  height: auto;
  background: white;
  color: black;
`

export const Modal = ({ style, shadowStyle, children, zIndex, visible, onCancel }) => {
  if (!visible) {
    return <></>
  }
  return (
    <ModalContainer $zIndex={zIndex}>
      <ModalShadow style={shadowStyle} onClick={onCancel} />
      <ModalBody style={style}>
        {children}
      </ModalBody>
    </ModalContainer>
  )
}
