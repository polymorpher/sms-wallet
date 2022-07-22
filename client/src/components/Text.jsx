import styled from 'styled-components'

export const BaseText = styled.div`
  color: ${props => props.$color || 'inherit'};
  font-size: 16px;
`

export const Title = styled.div`
  font-size: 20px;
  margin: 16px auto;
  text-align: center;
  text-transform: uppercase;
`
