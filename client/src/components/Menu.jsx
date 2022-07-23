import styled from 'styled-components'
import { BaseText } from './Text'

export const MenuIconContainer = styled.div`
  right: 16px;
  top: 16px;
  display: flex;
  flex-direction: column;
  align-items: end;
  height: 100%;
`
export const IconImg = styled.img`
  height: 24px;
  cursor: pointer;
  object-fit: contain;
`

export const MenuItems = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: end;
  margin-right: 8px;
`
export const MenuItemLink = styled(BaseText)`
  font-size: 24px;
  &:hover{
    cursor: pointer;
  }
`
