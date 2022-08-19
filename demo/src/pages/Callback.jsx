import React from 'react'
import { BaseText } from '../components/Text'
import { MainContainer } from '../components/Layout'
import querystring from 'query-string'

const CallbackDemo = () => {
  const qs = querystring.parse(location.search)
  return (
    <MainContainer>
      <h1>Callback successful!</h1>
      <BaseText>Query parameters:</BaseText>
      {Object.entries(qs).map(([k, v], i) => {
        return <BaseText key={`${i}`}><b>{k}</b>: {v}</BaseText>
      })}
    </MainContainer>
  )
}

export default CallbackDemo
