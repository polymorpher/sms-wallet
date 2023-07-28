import OtpInput from 'react-otp-input'
import React, { forwardRef } from 'react'
import { useWindowDimensions } from '../utils'

const OtpBox = ({ onChange, value, inputStyle, containerStyle, numOnly = true, autofill = false, ...params }, ref) => {
  const { isMobile } = useWindowDimensions()
  return (
    <OtpInput
      placeholder=''
      value={value}
      ref={ref}
      onChange={onChange}
      numInputs={6}
      isInputNum={numOnly}
      containerStyle={{
        flexWrap: 'wrap',
        gap: '4px',
        ...containerStyle
      }}
      inputStyle={{
        width: isMobile ? 24 : 40,
        height: isMobile ? 24 : 40,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
        marginRight: isMobile ? 12 : 16,
        ...inputStyle
      }}
      separator={<span> </span>}
      {...params}
      autoComplete={autofill ? 'one-time-code' : 'off'}
    />
  )
}

export default forwardRef(OtpBox)
