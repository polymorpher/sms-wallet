import { Base } from '../src/controller.ts'
import type { CommandHandler } from './start.ts'

const lookup: CommandHandler = async (userId) => {
  const { data } = await Base.post('/lookup', { destPhone: `tg:${userId}`})

  return data.address
}

export default lookup
