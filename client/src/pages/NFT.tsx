import React, { useState, useEffect } from 'react'
import { BaseText, Desc, Label, LabelSmall } from '../components/Text'
import { Col, FlexColumn, FlexRow, Modal, Row } from '../components/Layout'
import { Button, FloatingSwitch, Input, LinkWrarpper } from '../components/Controls'
import styled from 'styled-components'
import { NFTUtils, processError, utils } from '../utils'
import apis, { type TrackedNFT } from '../api'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import BN from 'bn.js'
import { TailSpin } from 'react-loading-icons'
import PhoneInput from 'react-phone-number-input'
import { walletActions } from '../state/modules/wallet'
import { balanceActions } from '../state/modules/balance'
import config from '../config'
import { type RootState } from '../state/rootReducer'
import { type TrackedToken } from '../state/modules/wallet/actions'
import { type WalletState } from '../state/modules/wallet/reducers'

export const MetadataURITransformer = (url?: string): string | undefined => {
  const IPFSIO = /https:\/\/ipfs\.io\/ipfs\/(.+)/
  if (!url) {
    return url
  }
  const m = url.match(IPFSIO)
  if (m) {
    const hash = m[1]
    return NFTUtils.replaceIPFSLink(hash)
  }
  return url
}

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

export const useMetadata = ({ uri, ipfsGateway, contentTypeOverride, animationUrlContentTypeOverride }: UseMetadataParams): UseMetadataResult => {
  uri = NFTUtils.replaceIPFSLink(MetadataURITransformer(uri), ipfsGateway)
  const [metadata, setMetadata] = useState<Record<string, any>>()
  const [contentType, setContentType] = useState<string | undefined>(contentTypeOverride)
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | undefined>()
  const [resolvedAnimationUrl, setResolvedAnimationUrl] = useState<string | undefined>()
  const [animationUrlContentType, setAnimationUrlContentType] = useState<string | undefined>(animationUrlContentTypeOverride)

  useEffect(() => {
    const f = async function (): Promise<void> {
      if (!uri) {
        return
      }
      try {
        const { data: metadata } = await axios.get(uri)
        setMetadata(metadata)
        if (!metadata.image) {
          return
        }
        const resolvedImageUrl = NFTUtils.replaceIPFSLink(metadata.image, ipfsGateway)
        if (!contentType) {
          const { headers: { 'content-type': contentType } } = await axios.head(resolvedImageUrl)
          setContentType(contentType)
        }
        setResolvedImageUrl(resolvedImageUrl)
        if (metadata.animation_url) {
          const animationUrl = NFTUtils.replaceIPFSLink(metadata?.animation_url || metadata?.properties?.animation_url, ipfsGateway)
          const { headers: { 'content-type': animationUrlContentType } } = await axios.head(animationUrl)
          setResolvedAnimationUrl(animationUrl)
          setAnimationUrlContentType(animationUrlContentType)
        }
      } catch (ex) {
        console.error(ex)
        toast.error(`Unable to retrieve data for token uri ${uri}`)
      }
    }
    f().catch(console.error)
  }, [uri, contentType, ipfsGateway])
  return { metadata, resolvedImageUrl, resolvedAnimationUrl, contentType, animationUrlContentType }
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
export const useNFTData = ({ contractAddress, tokenId, tokenType }: NFTTokenSpec): NFTTokenData => {
  const [state, setState] = useState<NFTTokenData>({ })
  useEffect(() => {
    if (!contractAddress || !tokenId || !tokenType) {
      return
    }
    async function f (): Promise<void> {
      try {
        const { name: contractName, symbol: contractSymbol, uri } = await apis.blockchain.getTokenMetadata({ contractAddress, tokenId, tokenType })
        setState({ contractName, contractSymbol, uri })
      } catch (ex) {
        console.error(ex)
        toast.error(`Failed to get NFT metadata: ${processError(ex)}`)
      }
    }
    f().catch(console.error)
  }, [contractAddress, tokenId, tokenType])
  return { ...state }
}

// eslint-disable-next-line no-unused-vars
const useCachedMetadata = ({ address, contractAddress, tokenId, tokenType }: AddressSpecificNFTTokenSpec): UseMetadataResult & NFTTokenData => {
  const [cached, setCached] = useState<UseMetadataResult & NFTTokenData>({})
  useEffect(() => {
    if (!contractAddress || !tokenId || !tokenType || !address) {
      return
    }
    async function g (): Promise<void> {
      try {
        const {
          found,
          contractName, contractSymbol, name, description,
          image, video, imageType
        } = await apis.nft.getCachedData(address, contractAddress, tokenId, tokenType)
        if (found) {
          setCached({
            contractName,
            contractSymbol,
            metadata: {
              name,
              description,
              image,
              video,
              imageType
            }
          })
        } else {
          console.log('Cache not found', { contractAddress, tokenId, tokenType })
        }
      } catch (ex) {
        console.error(ex)
        toast.error(`Failed to get cached NFT metadata: ${processError(ex)}`)
      }
    }
    g().catch(console.error)
  }, [address, contractAddress, tokenId, tokenType])
  return { ...cached }
}

const useNFTBalance = ({ contractAddress, address, tokenId, tokenType }: AddressSpecificNFTTokenSpec): bigint => {
  const dispatch = useDispatch()
  const key = utils.computeTokenKey({ contractAddress, tokenId, tokenType }).string
  const balance = useSelector<RootState, string>(state => state.balance?.[address]?.tokenBalances?.[key] || '')
  useEffect(() => {
    if (!contractAddress || !tokenId || !tokenType || !address) {
      return
    }
    async function f (): Promise<void> {
      dispatch(balanceActions.fetchTokenBalance({ address, contractAddress, tokenId, tokenType }))
    }
    f().catch(console.error)
  }, [dispatch, contractAddress, address, tokenId, tokenType])
  return BigInt(balance)
}

export const Gallery = styled.div`
  display: flex;
  flex-direction: column;
  //padding: 16px 0;
  box-sizing: border-box;
  width: 100%;
  //min-height: 400px;
  background: black;
  color: white;
`

const NFTItemContainer = styled(Col)`
  color: white;
  background: #222;
  //border: green solid 1px;
  width: 100%;
  margin: 16px;
  box-sizing: content-box;
  max-width: 600px;
  min-height: 300px;
  position: relative;
  border-radius: 24px;
  padding-bottom: 32px;
  cursor: pointer;
`

const NFTImage = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-radius: 24px 24px 0 0;
`

const NFTImageFull = styled.img`
  object-fit: contain;
  width: 100%;
  height: auto;
`

const Loading = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const NFTVideo = styled.video`
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-radius: 24px 24px 0 0;
`

const NFTVideoFull = styled.video`
  object-fit: contain;
  width: 100%;
  height: 100%;
`

const NFTViewerContainer = styled.div`
  color: white;
  background: black;
  width: 100%;
  height: 100%;
  display: flex;
  gap: 16px;
  flex-direction: column;
`

const NFTName = styled(BaseText)`
  color: white;
  background: transparent;
  text-align: left;
  font-size: 16px;
  font-weight: 400;
  padding-left: 16px;
  user-select: all;
  margin-bottom: 8px;
`

const NFTCollection = styled(BaseText)`
  color: #ccc;
  background: transparent;
  font-size: 12px;
  font-weight: 100;
  text-align: left;
  padding-left: 16px;
  user-select: all;
`

const NFTDescription = styled(BaseText)`
  font-size: 12px;
  color: white;
  background: transparent;
  font-weight: 100;
  text-align: left;
  user-select: auto;
  padding-left: 16px;
`

const NFTQuantity = styled(BaseText)`
  background: rgba(230, 230, 230, 0.5);
  border-radius: 8px;
  padding: 4px 8px;
  color: black;
  position: absolute;
  top: 16px;
  left: 16px;
`

const TechnicalText = styled(BaseText)`
  word-break: break-word;
  padding: 0;
  user-select: all;
  font-size: 10px;
  color: white;
`

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

export const NFTItem = ({ address, contractAddress, tokenId, tokenType, onSelect }: AddressSpecificNFTTokenSpec & { onSelect?: (selected: SelectedNFT) => void }): React.JSX.Element => {
  const { contractName, uri } = useNFTData({ contractAddress, tokenId, tokenType })
  const balance = useNFTBalance({ contractAddress, tokenId, tokenType, address })
  // eslint-disable-next-line no-unused-vars
  const { metadata, resolvedImageUrl, contentType } = useMetadata({ uri })
  const isImage = contentType?.startsWith('image')
  const isVideo = contentType?.startsWith('video')
  // const isAnimationUrlImage = animationUrlContentType?.startsWith('image')
  // const isAnimationUrlVideo = animationUrlContentType?.startsWith('video')
  if (balance < 1n) {
    return <></>
  }

  return (
    <>
      <NFTItemContainer onClick={() => {
        onSelect?.({ resolvedImageUrl, contractAddress, isImage, isVideo, metadata, contractName, tokenId, tokenType })
      }}>
        {!contentType && <Loading><TailSpin /> </Loading>}
        {isImage && <NFTImage src={resolvedImageUrl} />}
        {/* <NFTImage src='https://1wallet.mypinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/1.png' /> */}
        {isVideo && <NFTVideo src={resolvedImageUrl} loop muted autoPlay />}
        <Row>
          <FlexColumn style={{ flex: 1 }}>
            <NFTName>{metadata?.displayName || metadata?.name}</NFTName>
            <NFTCollection>{contractName}</NFTCollection>
          </FlexColumn>
        </Row>
        {balance > 1n && <NFTQuantity>x{balance.toString()}</NFTQuantity>}
      </NFTItemContainer>
    </>
  )
}

// eslint-disable-next-line no-unused-vars
let DUMMY_NFTS
if (config.chainId === 1666600000) {
  DUMMY_NFTS = config.mainnet.nfts
} else {
  DUMMY_NFTS = config.test.nfts
}

const useNFTs = (address: string): TrackedNFT[] => {
  const dispatch = useDispatch()
  const tracked = useSelector<RootState, TrackedToken[]>(state => state.wallet?.[address]?.trackedTokens ?? [])
  const [nfts, setNfts] = useState<TrackedNFT[]>([...tracked, ...DUMMY_NFTS])
  useEffect(() => {
    async function f (): Promise<void> {
      try {
        const nfts = await apis.nft.lookup(address)
        console.log(nfts)
        const tokens = nfts.map(e => ({ ...e, key: utils.computeTokenKey(e).string }))
        dispatch(walletActions.overrideTokens({ address, tokens }))
        setNfts([...nfts, ...DUMMY_NFTS])
      } catch (ex) {
        console.error(ex)
        toast.error('Unable to look up NFTs owned by this wallet')
      }
    }
    f().catch(console.error)
  }, [dispatch, address])
  return nfts
}

export interface NFTSendModalParams {
  modelVisible?: boolean
  setModelVisible: (visible: boolean) => any
  maxQuantity: bigint
  contractAddress: string
  tokenId: string
  tokenType: string
}

const NFTSendModal = ({ modelVisible, setModelVisible, maxQuantity, contractAddress, tokenId, tokenType }: NFTSendModalParams): React.JSX.Element => {
  const dispatch = useDispatch()
  const [isAddressInput, setIsAddressInput] = useState(false)
  const [phone, setPhone] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('1')
  const [isSending, setIsSending] = useState(false)
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const pk = wallet[address ?? '']?.pk

  const send = async (): Promise<void> => {
    if (!address || !pk) {
      return
    }
    const value = amount?.toString()
    if (!value || value === '0') {
      toast.error('Invalid amount')
      return
    }

    if (!(BigInt(value) < maxQuantity)) {
      toast.error('Amount exceeds balance')
      return
    }
    let dest = to
    if (isAddressInput) {
      if (!(dest?.startsWith('0x')) || !apis.web3.isValidAddress(dest)) {
        toast.error('Invalid address')
        return
      }
    } else {
      try {
        const signature = apis.web3.signWithNonce(phone, pk)
        dest = await apis.server.lookup({ destPhone: phone, address, signature })
        if (!apis.web3.isValidAddress(dest)) {
          toast.error(`Cannot find recipient with phone number ${phone}`)
          return
        }
      } catch (ex) {
        console.error(ex)
        toast.error(`Error in looking up recipient: ${processError(ex)}`)
        return
      }
    }
    toast.info('Submitting transaction...')
    try {
      apis.web3.changeAccount(pk)
      const { hash } = await apis.blockchain.sendToken({
        address,
        contractAddress,
        tokenId,
        tokenType,
        dest,
        amount: value
      })
      const key = utils.computeTokenKey({ contractAddress, tokenId, tokenType }).string
      // dispatch(balanceActions.fetchTokenBalance({ contractAddress, tokenId, tokenType, address }))
      dispatch(balanceActions.fetchTokenBalanceSuccess({ key, balance: (BigInt(maxQuantity) - BigInt(value)).toString(), address }))
      toast.success(
        <FlexRow>
          <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
          <LinkWrarpper target='_blank' href={utils.getExplorerUri(hash)}>
            <BaseText>View transaction</BaseText>
          </LinkWrarpper>
        </FlexRow>)
      setModelVisible(false)
    } catch (ex) {
      console.error(ex)
      toast.error(`Error: ${processError(ex)}`)
    } finally {
      apis.web3.changeAccount()
    }
  }
  const sendWrapper = async (): Promise<void> => {
    setIsSending(true)
    try {
      await send()
    } catch (ex: any) {
      console.error(ex)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Modal style={{ maxWidth: 800, width: '100%', margin: 'auto' }} visible={modelVisible} onCancel={() => setModelVisible(false)}>
      <Row style={{ position: 'relative' }}>
        <Label>To</Label>
        {!isAddressInput &&
          <PhoneInput
            margin='16px'
            inputComponent={Input}
            defaultCountry='US'
            placeholder='phone number of recipient'
            value={phone} onChange={(e) => { setPhone(e ?? '') }}
          />}
        {isAddressInput &&
          <Input
            onChange={({ target: { value } }) => { setTo(value) }}
            placeholder='0x1234abcde...'
            $width='100%' value={to} $margin='16px' style={{ fontSize: 10, flex: 1 }}
          />}
        <FloatingSwitch href='#' onClick={() => { setIsAddressInput(!isAddressInput) }}>use {isAddressInput ? 'phone number' : 'crypto address'}</FloatingSwitch>
      </Row>
      {maxQuantity > 1 &&
        <Row>
          <Label>Amount</Label>
          <Row style={{ flex: 1 }}>
            <Input onChange={({ target: { value } }) => { setAmount(value) }} $width='100%' value={amount} $margin='16px' />
            <Label>COPIES</Label>
          </Row>
        </Row>}
      <Row style={{ justifyContent: 'center', marginTop: 16 }}>
        <Button onClick={sendWrapper} disabled={isSending}>{isSending ? <TailSpin width={16} height={16} /> : 'Confirm'}</Button>
      </Row>
    </Modal>
  )
}

const NFTManagementPanel = styled.div`
  top: 0;
  position: absolute;
  background-color: grey;
  opacity: 0.7;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`
const NFTDisplayWrapper = styled.div`
  cursor: pointer;
  position: relative;
`

export interface NFTViewerParams {
  visible: boolean
  setVisible?: (visible: boolean) => any
  onClose?: () => any
  contractAddress: string
  resolvedImageUrl: string
  isImage: string
  isVideo: string
  metadata: Record<string, any>
  contractName: string
  tokenId: string
  tokenType: string
}

const NFTViewer = ({ visible, setVisible, onClose, contractAddress, resolvedImageUrl, isImage, isVideo, metadata, contractName, tokenId, tokenType }: NFTViewerParams): React.JSX.Element => {
  const dispatch = useDispatch()
  const [showDetails, setShowDetails] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)
  const [sendModelVisible, setSendModalVisible] = useState(false)
  const [managementVisible, setManagementVisible] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const pk = wallet[address ?? '']?.pk
  const key = utils.computeTokenKey({ contractAddress, tokenId, tokenType }).string
  const balance = BigInt(useSelector<RootState, string>(state => state.balance?.[address ?? '']?.tokenBalances?.[key] || ''))

  const showManagement = (): void => {
    setManagementVisible(true)
    setTimeout(() => { setManagementVisible(false) }, 2500)
  }
  const untrack = async (): Promise<void> => {
    if (!address || !pk) {
      return
    }
    try {
      setIsTracking(true)
      const signature = apis.web3.signWithBody({ contractAddress, tokenId }, pk)
      const { success } = await apis.nft.untrack({ contractAddress, tokenId, address, signature })
      if (!success) {
        toast.error('Unable to hide token')
        return
      }
      const key = utils.computeTokenKey({ contractAddress, tokenId, tokenType }).string
      dispatch(walletActions.untrackTokens({ address, keys: [key] }))
      toast.success(`Hiding ${tokenType} token (id=${tokenId}, contract=${utils.ellipsisAddress(contractAddress)})`)
      setManagementVisible(false)
      setVisible?.(false)
    } catch (ex) {
      console.error(ex)
      toast.error(`Failed to hide token. Error: ${processError(ex)}`)
    } finally {
      setIsTracking(false)
    }
  }
  return (
    <>
      <Modal
        style={{ maxWidth: 800, width: '100%', margin: 'auto', padding: 0, paddingBottom: 24, background: 'black' }}
        shadowStyle={{ opacity: 0.8 }}
        visible={visible} onCancel={() => {
          onClose?.()
          setVisible?.(false)
        }}
      >
        <NFTViewerContainer>
          <NFTDisplayWrapper>
            {isImage && <NFTImageFull src={resolvedImageUrl} onClick={() => { showManagement() }} />}
            {isVideo && <NFTVideoFull src={resolvedImageUrl} onClick={() => { showManagement() }} loop muted autoPlay />}
            {managementVisible &&
              <NFTManagementPanel>
                <Button style={{ width: '100%', height: '100%' }} onClick={async () => { await untrack() }}>
                  {isTracking ? <TailSpin /> : <><BaseText style={{ fontSize: 40 }}>✕</BaseText><br />Hide NFT</>}
                </Button>
              </NFTManagementPanel>}
          </NFTDisplayWrapper>

          <NFTName>{metadata?.displayName || metadata?.name}</NFTName>
          <NFTCollection>{contractName}</NFTCollection>
          <NFTDescription>{metadata?.description}</NFTDescription>
          {balance > 1n && <NFTQuantity>x{balance.toString()}</NFTQuantity>}
          <Row style={{ padding: '0 16px' }}>
            <Col style={{ flex: '100%' }}>
              {!showDetails && <LinkWrarpper href='#' onClick={() => { setShowDetails(true) }}><TechnicalText>Show Technical Details</TechnicalText></LinkWrarpper>}
              {showDetails && <LinkWrarpper href='#' onClick={() => { setShowDetails(false) }}><TechnicalText>Hide Technical Details</TechnicalText></LinkWrarpper>}
            </Col>
            <Button style={{ background: '#222', whiteSpace: 'nowrap' }} onClick={() => { setSendModalVisible(true) }}>Send NFT</Button>
          </Row>
          {showDetails &&
            <Col style={{ gap: 0, padding: '0 16px' }}>
              <Row>
                <TechnicalText>Contract: </TechnicalText>
                <TechnicalText onClick={() => {
                  setShowFullAddress(!showFullAddress)
                  navigator.clipboard.writeText(contractAddress).catch(console.error)
                  toast.info('Copied address')
                }}
                >{showFullAddress ? contractAddress : utils.ellipsisAddress(contractAddress)}
                </TechnicalText>
              </Row>
              <Row>
                <TechnicalText>ID: </TechnicalText>
                <TechnicalText onClick={() => {
                  navigator.clipboard.writeText(tokenId).catch(console.error)
                  toast.info('Copied Token ID')
                }}
                >{tokenId}
                </TechnicalText>
              </Row>
              <Row>
                <TechnicalText>Type: </TechnicalText>
                <TechnicalText onClick={() => {
                  navigator.clipboard.writeText(tokenType).catch(console.error)
                  toast.info('Copied Token Type')
                }}
                >{tokenType}
                </TechnicalText>
              </Row>
            </Col>}
        </NFTViewerContainer>
      </Modal>
      <NFTSendModal
        contractAddress={contractAddress}
        tokenId={tokenId}
        tokenType={tokenType}
        modelVisible={sendModelVisible}
        setModelVisible={setSendModalVisible}
        maxQuantity={balance}
      />
    </>
  )
}

export interface NFTTrackerParams {
  visible: boolean
  setVisible: (visible: boolean) => any
}

const NFTTracker = ({ visible, setVisible }: NFTTrackerParams): React.JSX.Element => {
  const dispatch = useDispatch()
  const [contract, setContract] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const wallet = useSelector<RootState, WalletState>(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const pk = wallet[address ?? '']?.pk

  const track = async (): Promise<void> => {
    if (!address || !pk) {
      return
    }
    try {
      setIsTracking(true)
      const tokenType = await apis.nft.getNFTType(contract)
      if (!tokenType) {
        toast.error('Unknown token type')
        return
      }
      const balance = await apis.blockchain.getTokenBalance({ tokenType, tokenId, contractAddress: contract, address })
      if (!(balance > 0n)) {
        toast.error('You do not own the NFT')
        return
      }
      const signature = apis.web3.signWithBody([{ contractAddress: contract, tokenId, tokenType }], pk)
      const { success } = await apis.nft.track({ contractAddress: contract, tokenId, tokenType, address, signature })
      if (!success) {
        toast.error('Unable to add token')
        return
      }
      const key = utils.computeTokenKey({ contractAddress: contract, tokenId, tokenType }).string
      dispatch(walletActions.trackTokens({ address, tokens: [{ key, contractAddress: contract, tokenId, tokenType }] }))
      toast.success(`Added new ${tokenType} token (id=${tokenId}, contract=${utils.ellipsisAddress(contract)})`)
      setVisible?.(false)
    } catch (ex) {
      console.error(ex)
      toast.error(`Failed to add token. Error: ${processError(ex)}`)
    } finally {
      setIsTracking(false)
    }
  }

  return (
    <Modal style={{ maxWidth: 800, width: '100%', padding: 8, margin: 'auto' }} visible={visible} onCancel={() => setVisible(false)}>
      <Row style={{ position: 'relative' }}>

        <LabelSmall>Contract</LabelSmall>
        <Input
          onChange={({ target: { value } }) => { setContract(value) }}
          placeholder='0x1234abcde...'
          $width='100%' value={contract} $margin='16px' style={{ fontSize: 10, flex: 1 }}
        />
      </Row>
      <Row>
        <LabelSmall>TokenID</LabelSmall>
        <Input onChange={({ target: { value } }) => { setTokenId(value) }} placeholder='123...' $width='100%' value={tokenId} $margin='16px' />
      </Row>
      <Row style={{ justifyContent: 'center', marginTop: 16 }}>
        <Button onClick={track} disabled={isTracking}>{isTracking ? <TailSpin width={16} height={16} /> : 'Add'}</Button>
      </Row>
    </Modal>
  )
}

const NFTShowcase = ({ address }: { address: string }): React.JSX.Element => {
  const [viewerVisible, setViewerVisible] = useState<boolean>(false)
  const [trackerVisible, setTrackerVisible] = useState<boolean>(false)
  const nfts = useNFTs(address)
  const [selected, setSelected] = useState<SelectedNFT | undefined>()
  // console.log(nfts)
  useEffect(() => {
    if (selected) {
      setViewerVisible(true)
    }
  }, [selected])
  return (
    <>
      <Gallery style={{ flex: '100%' }}>
        <BaseText style={{ padding: 16, fontSize: 20, textTransform: 'uppercase' }}>Your NFTs</BaseText>
        <FlexColumn style={{ justifyContent: 'center', flex: '100%' }}>
          <FlexRow style={{ justifyContent: 'center', width: '100%' }}>
            <Desc $color='white' style={{ padding: '0 24px' }}>
              {nfts.map((e, i) => {
                const { contractAddress, tokenId, tokenType } = e
                return <NFTItem key={`nft-${i}`} address={address} contractAddress={contractAddress} tokenType={tokenType} tokenId={tokenId} onSelect={setSelected} />
              })}
              {nfts.length === 0 &&
                <BaseText style={{ marginBottom: 32 }}>
                  Nothing to show here :( <br />
                  Try adding some NFTs you own
                </BaseText>}
              <Button style={{ width: '100%' }} onClick={() => { setTrackerVisible(true) }}><BaseText style={{ fontSize: 40 }}>⊕</BaseText><br />Add NFT</Button>
            </Desc>
          </FlexRow>
        </FlexColumn>
      </Gallery>
      <NFTViewer visible={viewerVisible} setVisible={setViewerVisible} onClose={() => { setSelected(undefined) }} {...selected} />
      <NFTTracker visible={trackerVisible} setVisible={setTrackerVisible} />
    </>
  )
}

export default NFTShowcase
