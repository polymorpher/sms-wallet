import { Api } from "telegram";
import { SendMessageParams } from "telegram/client/messages";
import { type Button } from 'telegram/tl/custom/button.js'
import { newSession } from '../src/controller.ts'
import config from '../config.ts'

export type CommandHandler = (userId: string, arg: Record<string, string>) => Promise<SendMessageParams | string>

const buildOpenWalletButton = async (userId: string): Promise<Button | Api.ReplyInlineMarkup | null> => {
  const sessionId = await newSession(userId)
  if (!sessionId) {
    return null
  }
  const url = `${config.wallet.client}/tg?userId=${userId}&sessionId=${sessionId}`
  console.log(url)
  // return new Button(new Api.KeyboardButtonSimpleWebView({ text: 'Open Wallet', url }))
  return new Api.ReplyInlineMarkup({
    rows: [
      new Api.KeyboardButtonRow({
        buttons: [
          new Api.KeyboardButtonWebView({
            text: 'Open Wallet',
            url: `${config.wallet.client}/tg?userId=${userId}&sessionId=${sessionId}`
          }),
          new Api.KeyboardButtonWebView({
            text: 'Recover',
            url: `${config.wallet.client}/tg/recover?userId=${userId}&sessionId=${sessionId}`
          }),
          new Api.KeyboardButtonWebView({
            text: 'Send Money',
            url: `${config.wallet.client}/tg?userId=${userId}&sessionId=${sessionId}`
          })
        ]
      })
    ]
  })
}

const start: CommandHandler = async (userId) => {
  const buttons = await buildOpenWalletButton(userId)

  if (!buttons) {
    return 'Hello! h1wallet is temporarily unavailable on Telegram. Please try again later or contact support.'
  }

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

