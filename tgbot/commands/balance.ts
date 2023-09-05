import config from "config.ts";
import { CommandHandler } from "./start.ts";
import { JsonRpcProvider } from "ethers";
import { Base } from "src/controller.ts";

const provider = new JsonRpcProvider(config.rpc)

const balance: CommandHandler = async (userId) => {
  const address = await Base.post('/lookup', { destPhone: `tg:${userId}`})

  const balance = await provider.getBalance(address)

  return balance.toString()
}

export default balance

