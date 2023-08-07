
export interface UseMetadataParams {
  uri?: string
  ipfsGateway?: string
  contentTypeOverride?: string
  animationUrlContentTypeOverride?: string
}

export interface UseMetadataResult {
  metadata?: Record<string, any>
  resolvedImageUrl?: string
  resolvedAnimationUrl?: string
  contentType?: string
  animationUrlContentType?: string
}

export interface NFTTokenSpec {
  contractAddress: string
  tokenId: string
  tokenType: string
}
export interface NFTTokenData {
  contractName?: string
  contractSymbol?: string
  uri?: string
}

export interface AddressSpecificNFTTokenSpec extends NFTTokenSpec {
  address: string
}

export interface SelectedNFT {
  resolvedImageUrl?: string
  contractAddress: string
  isImage?: boolean
  isVideo?: boolean
  metadata?: Record<string, any>
  contractName?: string
  tokenId: string
  tokenType: string
}

export interface NFTViewerParams {
  visible: boolean
  setVisible?: (visible: boolean) => any
  onClose?: () => any
  contractAddress?: string
  resolvedImageUrl?: string
  isImage?: boolean
  isVideo?: boolean
  metadata?: Record<string, any>
  contractName?: string
  tokenId?: string
  tokenType?: string
}
