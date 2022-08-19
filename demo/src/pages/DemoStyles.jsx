import styled from 'styled-components'
import { Input as InputDefault, TextArea as TextAreaDefault } from '../components/Controls'
import { BaseText } from '../components/Text'

export const Table = styled.table`
  tr {
    vertical-align: top;
    td {
      padding: 16px;
    }
  }

`

export const Input = styled(InputDefault)`
  margin: 0;
  width: 480px;
  &:disabled{
    background-color: #aaa;
    cursor: not-allowed;
  }
`

export const TextArea = styled(TextAreaDefault)`
  margin: 0;
  width: 480px;
  height: 240px;
  &:disabled{
    background-color: #aaa;
    cursor: not-allowed;
  }
`

export const SecondaryText = styled(BaseText)`
  color: darkgrey;
  white-space: nowrap;
`

export const Param = styled(BaseText)`
  color: black;
`

export const Wrapped = styled(BaseText)`
  width: 480px;
  word-break: break-all;

`
export const JSONBlock = styled(Wrapped)`
  font-size: 12px;
`

export const QRImage = styled.img`
  border: 1px solid lightgrey;
  border-radius: 8px;
  box-shadow: 0 0 10px lightgrey;
  width: 256px;
  height: 256px;
  object-fit: contain;
`