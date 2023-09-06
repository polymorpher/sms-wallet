import { CommandHandler } from "./start";
import getButtons from "../ui/button";
import config from '../config'

const tokenAddress: CommandHandler = async (userId, args) => {
  const { to, amount } = args

  const calldata = {
    method: 'transfer(address recipient, uint256 amount)',
    parameters: [
      { type: 'address', value: to },
      { type: 'uint256', value: amount }
    ]
  }

  const query = [
    ['userId', userId],
    ['caller', "h1walletbot"],
    ['comment', "from bot command"],
    ['amount', amount],
    ['calldata', Buffer.from(JSON.stringify(calldata)).toString("base64")],
  ].map(q => `${q[0]}=${q[1]}}`).join('&')

  return {
    buttons: getButtons([
      [
        'Send',
        `${config.wallet.client}/call?${query}`
      ]
    ])
  }
}

export default tokenAddress

