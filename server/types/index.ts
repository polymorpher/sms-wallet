export enum UserType {
  Unknown = 0,
  Phone = 1,
  TG = 2,
}

export interface ProcessedBody {
  userHandle: string
  address: string
  ekey: string
  eseed: string
  userType: UserType
}

export interface PartialProcessedBody {
  userHandle: string
  eseed: string
  userType: UserType
}
