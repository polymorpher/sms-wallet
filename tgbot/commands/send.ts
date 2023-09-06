import { CommandHandler } from "./start";
import getButtons from "../ui/button.ts";
import config from '../config.ts'

export const send: CommandHandler = async (userId, args) => {
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

export const sendToken: CommandHandler = async (userId, args) => {
  const { to, amount, token } = args

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
    ['dest', token],
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

