
interface ProcessedBody {
  phoneNumber?: string
  address?: string
  ekey?: string
  eseed?: string
}

declare global {
  namespace Express {
    interface Request {
      user: Record<string, any>
      processedBody: ProcessedBody
      clientIp?: string
    }
  }
}

export {}
