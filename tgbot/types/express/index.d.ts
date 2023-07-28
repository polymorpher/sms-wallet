declare global {
  namespace Express {
    interface Request {
      clientIp?: string
    }
  }
}

export {}
