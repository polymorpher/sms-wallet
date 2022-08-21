import React from 'react'
import { BaseText } from '../components/Text'
import { MainContainer } from '../components/Layout'
import querystring from 'query-string'
import { JSONBlock } from './DemoStyles'

const CallbackDemo = () => {
  const qs = querystring.parse(location.search)
  return (
    <MainContainer style={{ padding: 16, width: '100%' }}>
      <h1>Callback successful!</h1>
      <BaseText>Query parameters:</BaseText>
      {Object.entries(qs).map(([k, v], i) => {
        return <JSONBlock style={{ width: '100%' }} key={`${i}`}><b>{k}</b>: {v}</JSONBlock>
      })}
    </MainContainer>
  )
}

export default CallbackDemo
