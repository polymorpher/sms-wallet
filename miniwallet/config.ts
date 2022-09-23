import { ethers } from 'ethers'
import 'dotenv/config'

export default {
  artifactsDirectory: process.env.ARTIFACTS_DIRECTORY || './artifacts/',
  mainnet: {
    miniWallet: {
      initialOperatorThreshold: process.env.MINIWALLET_INITIAL_OPERATOR_THRESHOLD || '100',
      initialOperators: JSON.parse(process.env.MINIWALLET_INITIAL_OPERATORS || '[]'),
      initialUserLimit: ethers.utils.parseEther(process.env.MINIWALLET_INIITIAL_USER_LIMIT || '1000000'),
      initialAuthLimit: ethers.utils.parseEther(process.env.MINIWALLET_INIITIAL_AUTH_LIMIT || '100000')
    }
  },
  ethlocal: {
    miniWallet: {
      initialOperatorThreshold: process.env.ETH_LOCAL_MINIWALLET_INITIAL_OPERATOR_THRESHOLD || '10',
      initialOperators: JSON.parse(process.env.ETH_LOCAL_MINIWALLET_INITIAL_OPERATORS || '[]'),
      initialUserLimit: ethers.utils.parseEther(process.env.ETH_LOCAL_MINIWALLET_INIITIAL_USER_LIMIT || '1000'),
      initialAuthLimit: ethers.utils.parseEther(process.env.ETH_LOCAL_MINIWALLET_INIITIAL_AUTH_LIMIT || '100')
    }
  },
  hardhat: {
    miniWallet: {
      initialOperatorThreshold: process.env.HARDHAT_MINIWALLET_INITIAL_OPERATOR_THRESHOLD || '10',
      initialOperators: JSON.parse(process.env.HARDHAT_MINIWALLET_INITIAL_OPERATORS || '[]'),
      initialUserLimit: ethers.utils.parseEther(process.env.HARDHAT_MINIWALLET_INIITIAL_USER_LIMIT || '1000'),
      initialAuthLimit: ethers.utils.parseEther(process.env.HARDHAT_MINIWALLET_INIITIAL_AUTH_LIMIT || '100')
    }
  }
}
