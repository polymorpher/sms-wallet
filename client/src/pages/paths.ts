export const base = process.env.PUBLIC_URL ?? ''
console.log('base', base)
export default {
  root: base + '/',
  signup: base + '/signup',
  tgSignup: base + '/tg',
  wallet: base + '/wallet',
  recover: base + '/recover',
  archive: base + '/archive',
  sign: base + '/sign',
  call: base + '/call',
  request: base + '/request/:id'
}
