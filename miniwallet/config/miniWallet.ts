import * as dotenv from 'dotenv'
import * as path from 'path'
const envPath = path.join(__dirname, '../env/miniWallet.env')
dotenv.config({ path: envPath })
export default {
  miniWallet: {
    initialOperatorThreshold: process.env.INITIAL_OPERATOR_THRESHOLD,
    initialOperators: JSON.parse(process.env.INITIAL_OPERATORS || '[]'),
    initialUserLimit: process.env.INITIAL_USER_LIMIT || '100000000000000000000',
    initialAuthLimit: process.env.INITIAL_AUTH_LIMIT || '10000000000000000000'
  }

}
