import type { CommandHandler } from './start.ts'
import getButtons from '../ui/button.ts'

export const tokenAddressMap = {
  USDT: '0x9A89d0e1b051640C6704Dde4dF881f73ADFEf39a',
  USDC: '0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5',
  LINK: '0x218532a12a389a4a92fC0C5Fb22901D1c19198aA',
  DAI: '0x1d374ED0700a0aD3cd4945D66a5B1e08e5db20A8',
  AXS: '0x14A7B318fED66FfDcc80C1517C172c13852865De'
}

const tokenAddress: CommandHandler = async (userId, args) => {
  const { tokenLabel } = args

  if (tokenAddressMap[tokenLabel.toUpperCase()]) {
    return 'Unknown token name'
  }

  return {
    buttons: getButtons([
      [
        'Open token',
        `https://explorer.harmony.one/address/${tokenAddressMap[tokenLabel.toUpperCase()]}?activeTab=3`
      ]
    ]),
    message: tokenAddressMap[tokenLabel.toUpperCase()]
  }
}

export default tokenAddress

