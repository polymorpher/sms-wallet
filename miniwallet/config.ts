import { ethers } from 'ethers'
import 'dotenv/config'

export default {
  mainnet: {
    miniWallet: {
      initialOperatorThreshold: process.env.MINIWALLET_INITIAL_OPERATOR_THRESHOLD,
      initialOperators: JSON.parse(process.env.MINIWALLET_INITIAL_OPERATORS || '[]'),
      initialUserLimit: ethers.utils.parseEther(process.env.MINIWALLET_INIITIAL_USER_LIMIT || '1000000'),
      initialAuthLimit: ethers.utils.parseEther(process.env.MINIWALLET_INIITIAL_AUTH_LIMIT || '100000')
    }
  }
}
