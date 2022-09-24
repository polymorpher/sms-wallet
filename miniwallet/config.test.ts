import { ethers } from 'ethers'
import 'dotenv/config'

export default {
  test: {
    miniWallet: {
      initialOperatorThreshold: process.env.HARDHAT_MINIWALLET_INITIAL_OPERATOR_THRESHOLD || '10',
      initialOperators: JSON.parse(process.env.HARDHAT_MINIWALLET_INITIAL_OPERATORS || '[]'),
      initialUserLimit: ethers.utils.parseEther(process.env.HARDHAT_MINIWALLET_INIITIAL_USER_LIMIT || '1000'),
      initialAuthLimit: ethers.utils.parseEther(process.env.HARDHAT_MINIWALLET_INIITIAL_AUTH_LIMIT || '100')
    }
  }
}
