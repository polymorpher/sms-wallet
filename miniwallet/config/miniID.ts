import * as dotenv from 'dotenv'
import * as path from 'path'
const envPath = path.join(__dirname, '../env/miniID.env')
dotenv.config({ path: envPath })
// Note used currently as deploy is hardcoded
export default {
  miniID: {
    baseUri: process.env.BASE_URI || 'ipfs://Qmc8DVEthq7cZMTMyZ2NQ8dHkG99n549DMBwNzAypQgXe1/MiniID'
  }
}
