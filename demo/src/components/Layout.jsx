import styled from 'styled-components'

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  //user-select: none;
`

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  //user-select: none;
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

export const LinkWrarpper = styled.a`
  margin-right: 12px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  &:hover{
    color: red;
  }
`

export const MainContainer = styled(Main)`
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
`

export const Line = styled.hr`
  margin: 24px 0;
  color: black;
  opacity: 0.5;
  width: 100%;
  size: 1px;
`
