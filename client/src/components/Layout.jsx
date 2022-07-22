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

export const Main = styled(FlexColumn)`
  min-height: 100vh;
  gap: 32px;
  width: 100%;
  align-items: center;
`
