import { phone } from 'phone'
import { StatusCodes } from 'http-status-codes'
import { User } from '../src/data/user.ts'
import stringify from 'json-stable-stringify'
import utils from '../utils.ts'
import { type NextFunction, type Request, type Response } from 'express'
// noinspection ES6PreferShortImport
import { type ProcessedBody, UserType } from '../types/index.ts'

export interface ParsedUserHandle {
  isValid: boolean
  userHandle: string
  userType: UserType
}
export function parseUserHandle (id: string): ParsedUserHandle {
  if (User.isTgUser(id)) {
    return { userType: UserType.TG, userHandle: User.getTgUserId(id), isValid: true }
  }
  const { isValid, phoneNumber } = phone(id)
  if (isValid) {
    return { isValid, userHandle: phoneNumber, userType: UserType.Phone }
  }
  return { isValid: false, userHandle: '', userType: UserType.Unknown }
}

export const partialReqCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { phone: userId, eseed } = req.body
  const { isValid, userHandle } = parseUserHandle(userId)
  if (!isValid) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'bad phone number' })
    return
  }
  if (!(eseed?.length >= 32)) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid eseed' })
    return
  }
  req.processedBody = { ...req.processedBody, userHandle, eseed: eseed.toLowerCase() }
  next()
}

export const reqCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await partialReqCheck(req, res, () => {
    const { ekey, address } = req.body

    if (!ekey || !address) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'need eseed, ekey' })
    }
    req.processedBody = { ...req.processedBody, ekey: ekey.toLowerCase(), address: address.toLowerCase() }
    next()
  })
}

export const checkExistence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.processedBody) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'missing account info' })
    return
  }
  const { userHandle, address } = req.processedBody as ProcessedBody
  let u = await User.findByUserHandle(userHandle)
  if (u) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'phone number already exists' })
    return
  }
  u = await User.findByAddress({ address })
  if (u) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'address already exists' })
    return
  }
  next()
}

export const hasUserSignedBody = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { address, signature, body } = req.body
  const msg = stringify(body)

  const expectedAddress = utils.ecrecover(msg, signature)
  // console.log(msg, expectedAddress, address)
  if (!address || !expectedAddress || address !== expectedAddress) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid signature' })
    return
  }
  const u = await User.findByAddress({ address })
  if (!u) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'user does not exist' })
    return
  }
  req.user = u
  next()
}
