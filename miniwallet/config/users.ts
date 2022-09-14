import * as dotenv from 'dotenv'
import * as path from 'path'
const envPath = path.join(__dirname, '../env/users.env')
dotenv.config({ path: envPath })

export default {
  users: {
    operator: JSON.parse(process.env.INITIAL_OPERATORS || '[]')[0] || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    user: process.env.USER1 || '0xEf4634BdBc6F6528EacB49278d7E17BCB9e2689A',
    creator: process.env.CREATOR || '0x1cf6490889A92371fdBC610C4A862061F28BaFfA'
  }
}
