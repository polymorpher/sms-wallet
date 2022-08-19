import styled from 'styled-components'
import { Input as InputDefault } from '../components/Controls'
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
