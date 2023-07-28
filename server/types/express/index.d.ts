import { type PartialProcessedBody, type ProcessedBody } from '../index.ts'

declare global {
  namespace Express {
    interface Request {
      user: Record<string, any>
      processedBody: ProcessedBody | PartialProcessedBody
      clientIp?: string
    }
  }
}

export {}
