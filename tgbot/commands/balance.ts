import web3 from '../../shared/web3.ts'
import type { CommandHandler } from './start.ts'
import { Base } from '../src/controller.ts'
import sharedUtils from '../../shared/utils.ts'

export const balance: CommandHandler = async (userId) => {
  const { data } = await Base.post('/lookup', { destPhone: `tg:${userId}`})

  const balance = await web3.getBalance({ address: data.address })

  const formatted = sharedUtils.formatNumber(sharedUtils.toOne(balance.toString()))

  return `${balance.toString()}\n${formatted} ONE`
}

export const balanceToken: CommandHandler = async (userId, args) => {
  const { data } = await Base.post('/lookup', { destPhone: `tg:${userId}`})

  const balance = await web3.getTokenBalance({
    address: data.address,
    contractAddress: args.token,
    tokenType: 'ERC20',
    tokenId: undefined
  })

  const formatted = sharedUtils.formatNumber(sharedUtils.toOne(balance.toString()))

  return `${balance.toString()}\n${formatted} ONE`
}

