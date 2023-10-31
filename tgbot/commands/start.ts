import { SendMessageParams } from "telegram/client/messages";
import { newSession } from '../src/controller.ts'
import getButtons from "../ui/button.ts"
import config from '../config.ts'

export type CommandHandler = (userId: string, arg: Record<string, string>) => Promise<SendMessageParams | string>

const start: CommandHandler = async (userId) => {
  const sessionId = await newSession(userId)

  if (!sessionId) {
    return 'Hello! h1wallet is temporarily unavailable on Telegram. Please try again later or contact support.'
  }

  // return new Button(new Api.KeyboardButtonSimpleWebView({ text: 'Open Wallet', url }))

  const buttons = getButtons([
    [
      'Open Wallet',
      `${config.wallet.client}/tg?userId=${userId}&sessionId=${sessionId}`
    ],
    [
      'Recover',
      `${config.wallet.client}/tg/recover?userId=${userId}&sessionId=${sessionId}`
    ],
    [
      'Send Money',
      `${config.wallet.client}/tg?userId=${userId}&sessionId=${sessionId}&send-money=1`
    ]
  ])

  return {
    message: `
Hello! Please open your wallet using the button below or you can use the following commands.

/balance
/balance <token>
/send <to> <amount>
/send <to> <amount> <token / token label>    (token label is a string, e.g. usdc, we should support common ones)
/tokenaddress <token label>
/open    (prompt single button)
/recover   (prompt single button)
/lookup <tg username>      (find someone's address)
`,
    buttons
  }
}

export default start

