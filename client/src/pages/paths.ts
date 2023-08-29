export const base = process.env.PUBLIC_URL ?? ''

export default {
  root: base + '/',
  signup: base + '/signup',
  tg: base + '/tg',
  tgSignup: base + '/tg/signup',
  tgRecover: base + '/tg/recover',
  wallet: base + '/wallet',
  recover: base + '/recover',
  saveSecret: base + '/save-secret',
  archive: base + '/archive',
  sign: base + '/sign',
  call: base + '/call',
  request: base + '/request/:id'
}
