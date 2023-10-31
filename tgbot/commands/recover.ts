import { newSession } from '../src/controller.js'
import getButtons from "../ui/button.js"
import config from '../config.js'
import { CommandHandler } from "./start.js";

const recover: CommandHandler = async (userId) => {
  const sessionId = await newSession(userId)

  if (!sessionId) {
    return 'Hello! h1wallet is temporarily unavailable on Telegram. Please try again later or contact support.'
  }

  const buttons = getButtons([
    [
      'Open Wallet',
      `${config.wallet.client}/tg?userId=${userId}&sessionId=${sessionId}`
    ]
  ])

  return {
    buttons
  }
}

export default recover

