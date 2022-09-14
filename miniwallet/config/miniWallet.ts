import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import * as path from 'path'
const envPath = path.join(__dirname, '../env/miniWallet.env')
dotenv.config({ path: envPath })
// console.log(`miniWallet envPath: ${envPath}`)
// console.log(`miniWallet process.env: ${JSON.stringify(process.env)}`)
export default {
  miniWallet: {
    initialOperatorThreshold: process.env.INITIAL_OPERATOR_THRESHOLD,
    initialOperators: JSON.parse(process.env.INITIAL_OPERATORS || '[]'),
    initialUserLimit: ethers.utils.parseEther(process.env.INITIAL_USER_LIMIT || '1000000'),
    initialAuthLimit: ethers.utils.parseEther(process.env.INITIAL_AUTH_LIMIT || '100000')
  }

}
