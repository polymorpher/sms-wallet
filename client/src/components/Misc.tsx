import React from 'react'
import { TailSpin } from 'react-loading-icons'

export const Loading = ({ size = 16 }: { size?: number }): JSX.Element => {
  return <TailSpin stroke='grey' width={size} height={size} />
}
