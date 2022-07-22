import styled from 'styled-components'

export const BaseText = styled.div`
  color: ${props => props.$color || 'inherit'};
  font-size: 16px;
`
export const Label = styled(BaseText)`
  width: ${props => props.$width || '64px'}
`
export const Address = styled(BaseText)`
  word-break: break-word;
  padding: 8px 32px;
  user-select: all;
`

export const Title = styled.div`
  font-size: 20px;
  margin: 16px auto;
  text-align: center;
  text-transform: uppercase;
`

export const Heading = styled.div`
  text-transform: uppercase;
  padding: 16px;
  background: black;
  color: white;
  height: 32px;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

export const Desc = styled.div`
  box-sizing: border-box;
  padding: 16px;
  color: black;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
`

export const Gallery = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
  //min-height: 400px;
  background: black;
  color: white;
`
