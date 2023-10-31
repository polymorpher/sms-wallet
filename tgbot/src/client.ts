import { TelegramClient, Api, sessions } from 'telegram'
import fs from 'fs/promises'
import config from '../config'
import start, { CommandHandler } from '../commands/start.ts'
import { balance, balanceToken } from '../commands/balance.ts'
import { send, sendToken } from '../commands/send.ts'
import tokenAddress from '../commands/tokenAddress.ts'
import open from '../commands/openWallet.ts'
import lookup from '../commands/lookup.ts'
import recover from '../commands/recover.ts'

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

export async function listen (): Promise<void> {
  if (!client) {
    return
  }

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

    const commands: [RegExp, CommandHandler][] = [
      [/^\/start$/, start],
      [/^\/balance$/, balance],
      [/^\/balance (?<token>\w+)$/, balanceToken],
      [/^\/send (?<to>\w+) (?<amount>\w+)$/, send],
      [/^\/send (?<to>\w+) (?<amount>\w+) (?<token>\w+)$/, sendToken],
      [/^\/tokenaddress (?<tokenLabel>\w+)$/, tokenAddress],
      [/^\/open$/, open],
      [/^\/recover$/, recover],
      [/^\/lookup (?<tgUserName>\w+)$/, lookup],
    ]

    const from = update.message.peerId as Api.PeerUser
    const userId = from.userId.toString()

    for (const [regex, handler] of commands) {
      const match = regex.exec(update.message.message)

      if (match) {
        const message = await handler(userId, match.groups!)

        if (typeof message === "string") {
          await client.sendMessage(chatID, { message })
        } else {
          await client.sendMessage(chatID, message)
        }
        
        return
      }
    }
  })
}

export async function sendMessage (id: string, body: string): Promise<void> {
  if (!client) {
    return
  }
  await client.sendMessage(id, { message: body })
}
