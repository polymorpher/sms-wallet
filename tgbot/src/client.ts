import { TelegramClient, Api, sessions } from 'telegram'
import { Button } from 'telegram/tl/custom/button.js'
import fs from 'fs/promises'
import config from '../config.ts'

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
    config.tg.apiId,
    config.tg.apiHash,
    { connectionRetries: 5 }
  )
  await client.start({ botAuthToken: config.tg.botToken })
  await saveSession()
}

export async function listen (): Promise<void> {
  if (!client) {
    return
  }
  const openWalletButton = new Button(new Api.KeyboardButtonSimpleWebView({ text: 'Open Wallet', url: 'https://smswallet.xyz/?tg' }))
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
      await client.sendMessage(chatID, {
        message: 'Hello! Please open your wallet using the button below',
        buttons: openWalletButton
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
