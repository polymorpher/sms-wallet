import { TelegramClient, Api, sessions } from 'telegram'
import { type Button } from 'telegram/tl/custom/button.js'
import fs from 'fs/promises'
import config from '../config.ts'
import { newSession } from './controller.ts'

export let client: TelegramClient

async function loadSession (): Promise<string> {
  try {
    return await fs.readFile('.session', { encoding: 'utf-8' })
  } catch (ex: any) {
    console.error('Failed to read saved session')
    return ''
  }
}

async function saveSession (): Promise<string> {
  const s = (client.session as sessions.StringSession).save()
  await fs.writeFile('.session', s, { encoding: 'utf-8' })
  return s
}

export async function init (): Promise<void> {
  const stringSession = await loadSession()
  client = new TelegramClient(
    new sessions.StringSession(stringSession),
    config.bot.apiId,
    config.bot.apiHash,
    { connectionRetries: 5 }
  )
  await client.start({ botAuthToken: config.bot.botToken })
  await saveSession()
}

const buildOpenWalletButton = async (userId: string): Promise<Button | Api.ReplyInlineMarkup | null> => {
  const sessionId = await newSession(userId)
  if (!sessionId) {
    return null
  }
  const url = `${config.wallet.client}/tg?userId=${userId}&sessionId=${sessionId}`
  console.log(url)
  // return new Button(new Api.KeyboardButtonSimpleWebView({ text: 'Open Wallet', url }))
  return new Api.ReplyInlineMarkup({ rows: [new Api.KeyboardButtonRow({ buttons: [new Api.KeyboardButtonWebView({ text: 'Open Wallet', url })] })] })
}

export async function listen (): Promise<void> {
  if (!client) {
    return
  }

  // const openWalletButton = new Api.ReplyInlineMarkup({ rows: [new Api.KeyboardButtonRow({ buttons: [new Api.KeyboardButtonWebView({ text: 'Open Wallet', url: 'https://smswallet.xyz/?tg' })] })] })
  client.addEventHandler(async (update) => {
    // console.log(update)
    const chatID = Number(update?.message?.chatId)

    if (!(update instanceof Api.UpdateNewMessage)) {
      return
    }
    // console.log('Api.UpdateNewMessage', update)
    if (!(update.message instanceof Api.Message)) {
      return
    }

    if (update.message.message.startsWith('/start')) {
      console.log(update.message)
      const from = update.message.peerId as Api.PeerUser
      // console.log(from)
      const userId = from.userId.toString()
      const button = await buildOpenWalletButton(userId)
      if (!button) {
        await client.sendMessage(chatID, { message: 'Hello! SMS Wallet is temporarily unavailable on Telegram. Please try again later or contact support.' })
        return
      }
      await client.sendMessage(chatID, {
        message: 'Hello! Please open your wallet using the button below',
        buttons: button
      })
    }
  })
}

export async function sendMessage (id: string, body: string): Promise<void> {
  if (!client) {
    return
  }
  await client.sendMessage(id, { message: body })
}
