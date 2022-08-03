export const base = process.env.PUBLIC_URL || ''

export default {
  root: base + '/',
  signup: base + '/signup',
  wallet: base + '/wallet',
  recover: base + '/recover',
  sign: base + '/sign',
  call: base + '/call',
  request: base + '/request/:id'
}
