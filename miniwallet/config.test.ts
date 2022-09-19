import { ethers } from 'ethers'
import 'dotenv/config'

export default {
  test: {
    operator: JSON.parse(process.env.TEST_MINIWALLET_INITIAL_OPERATORS || '[]')[0] || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    user: process.env.TEST_USER || '0xEf4634BdBc6F6528EacB49278d7E17BCB9e2689A',
    creator: process.env.TEST_CREATOR || '0x1cf6490889A92371fdBC610C4A862061F28BaFfA',
    miniWallet: {
      initialOperatorThreshold: process.env.TEST_MINIWALLET_INITIAL_OPERATOR_THRESHOLD || '10',
      initialOperators: JSON.parse(process.env.TEST_MINIWALLET_INITIAL_OPERATORS || '[]'),
      initialUserLimit: ethers.utils.parseEther(process.env.TEST_MINIWALLET_INIITIAL_USER_LIMIT || '1000'),
      initialAuthLimit: ethers.utils.parseEther(process.env.TEST_MINIWALLET_INIITIAL_AUTH_LIMIT || '100')
    }
  }
}
