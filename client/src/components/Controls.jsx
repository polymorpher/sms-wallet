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

export const Input = styled.input`
  width: ${props => typeof props.width === 'number' ? `${props.width || 400}px` : (props.width || 'auto')};
  margin-top: ${props => props.$marginTop || props.margin || '32px'};
  margin-bottom: ${props => props.$marginBottom || props.margin || '32px'};
  border: none;
  border-bottom: 1px dashed black;
  font-size: 16px;
  padding: 4px;
  &:hover{
    border-bottom: 1px dashed black;
  }
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
