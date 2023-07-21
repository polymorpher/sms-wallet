interface ProcessedBody {
  phoneNumber?: string
  address?: string
  ekey?: string
  eseed?: string
}

declare global {
  namespace Express {
    export interface Request {
      user: Record<string, any>
      processedBody: ProcessedBody
    }
  }
}

export {}
