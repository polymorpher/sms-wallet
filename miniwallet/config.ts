import { ethers } from 'ethers'
import 'dotenv/config'

export default {
  initialOperatorThreshold: process.env.INITIAL_OPERATOR_THRESHOLD,
  initialOperators: JSON.parse(process.env.INITIAL_OPERATORS || '[]'),
  initialUserLimit: ethers.utils.parseEther(process.env.INIITIAL_USER_LIMIT || '1000000'),
  initialAuthLimit: ethers.utils.parseEther(process.env.INIITIAL_AUTH_LIMIT || '100000'),

  test: {
    initialOperatorThreshold: process.env.TEST_INITIAL_OPERATOR_THRESHOLD,
    initialOperators: JSON.parse(process.env.TEST_INITIAL_OPERATORS || '[]'),
    initialUserLimit: ethers.utils.parseEther(process.env.TEST_INIITIAL_USER_LIMIT || '1000'),
    initialAuthLimit: ethers.utils.parseEther(process.env.TEST_INIITIAL_AUTH_LIMIT || '100')
  }
}
