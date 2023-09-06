import web3 from "../../shared/web3";
import { CommandHandler } from "./start";
import { Base } from "src/controller.ts";
import sharedUtils from '../../shared/utils'
import getButtons from "../ui/button.ts";
import config from '../config.ts'

export const send: CommandHandler = async (userId, args) => {
  const { to, amount } = args

  const query = [
    ['caller'],
    ['comment'],
    ['amount', amount],
    ['dest', to],
    ['calldata'],
    ['phone'],
    ['callback'],
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
  const query = [
    ['caller'],
    ['comment'],
    ['amount', amount],
    ['dest', to],
    ['calldata'],
    ['phone'],
    ['callback'],
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

