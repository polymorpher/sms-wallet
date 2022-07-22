import styled from 'styled-components'

export const Button = styled.button`
  font-family: 'DecimaMono', system-ui;
  font-size: 16px;
  font-weight: 200;
  border: none;
  
  width: 128px;
  color: white;
  background: black;
  padding: 8px 16px;
  text-align: center;
  &:hover{
    color: #dddddd;
    background: #444444;
    cursor: pointer;
  }
  &:disabled{
    background: #cccccc;
    cursor: not-allowed;
  }
`
