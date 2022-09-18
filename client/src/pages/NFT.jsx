import React, { useState, useEffect } from 'react'
import { BaseText, Desc, Label, LabelSmall } from '../components/Text'
import { Col, FlexColumn, FlexRow, Modal, Row } from '../components/Layout'
import { Button, FloatingSwitch, Input, LinkWrarpper } from '../components/Controls'
import styled from 'styled-components'
import { NFTUtils, processError, utils } from '../utils'
import apis from '../api'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import BN from 'bn.js'
import { TailSpin } from 'react-loading-icons'
import PhoneInput from 'react-phone-number-input'
import { walletActions } from '../state/modules/wallet'
import { balanceActions } from '../state/modules/balance'
import config from '../config'

export const MetadataURITransformer = (url) => {
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

export const useMetadata = ({
  uri, ipfsGateway = '',
  contentTypeOverride = null, animationUrlContentTypeOverride = null
} = {}) => {
  uri = NFTUtils.replaceIPFSLink(MetadataURITransformer(uri), ipfsGateway)
  const [metadata, setMetadata] = useState()
  const [contentType, setContentType] = useState(contentTypeOverride)
  const [resolvedImageUrl, setResolvedImageUrl] = useState(contentTypeOverride)
  const [resolvedAnimationUrl, setResolvedAnimationUrl] = useState(contentTypeOverride)
  const [animationUrlContentType, setAnimationUrlContentType] = useState(animationUrlContentTypeOverride)

  useEffect(() => {
    if (!uri) {
      return
    }
    const f = async function () {
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
    f()
  }, [uri])
  return { metadata, resolvedImageUrl, resolvedAnimationUrl, contentType, animationUrlContentType }
}

export const loadNFTData = ({ contractAddress, tokenId, tokenType }) => {
  const [state, setState] = useState({ contractName: null, contractSymbol: null, uri: null })
  useEffect(() => {
    if (!contractAddress || !tokenId || !tokenType) {
      return
    }
    async function f () {
      try {
        const { name: contractName, symbol: contractSymbol, uri } = await apis.blockchain.getTokenMetadata({ contractAddress, tokenId, tokenType })
        setState({ contractName, contractSymbol, uri })
      } catch (ex) {
        console.error(ex)
        toast.error(`Failed to get NFT metadata: ${processError(ex)}`)
      }
    }
    f()
  }, [contractAddress, tokenId, tokenType])
  return { ...state }
}

// eslint-disable-next-line no-unused-vars
const loadCachedMetadata = ({ address, contractAddress, tokenId, tokenType }) => {
  const [cached, setCached] = useState({})
  useEffect(() => {
    if (!contractAddress || !tokenId || !tokenType || !address) {
      return
    }
    async function g () {
      try {
        const {
          found,
          contractName, contractSymbol, name, description,
          image, video, imageType
        } = await apis.nft.getCachedData({ contractAddress, tokenId, tokenType })
        if (found) {
          setCached({
            contractName,
            contractSymbol,
            name,
            description,
            image,
            video,
            imageType
          })
        } else {
          console.log('Cache not found', { contractAddress, tokenId, tokenType })
        }
      } catch (ex) {
        console.error(ex)
        toast.error(`Failed to get cached NFT metadata: ${processError(ex)}`)
      }
    }
    g()
  }, [address, contractAddress, tokenId, tokenType])
  return { ...cached }
}

const loadNFTBalance = ({ contractAddress, address, tokenId, tokenType }) => {
  const dispatch = useDispatch()
  const key = utils.computeTokenKey({ contractAddress, tokenId, tokenType }).string
  const balance = useSelector(state => state.balance?.[address]?.tokenBalances?.[key] || '')
  useEffect(() => {
    if (!contractAddress || !tokenId || !tokenType || !address) {
      return
    }
    async function f () {
      dispatch(balanceActions.fetchTokenBalance({ address, contractAddress, tokenId, tokenType }))
    }
    f()
  }, [contractAddress, address, tokenId, tokenType])
  return new BN(balance)
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

export const NFTItem = ({ address, contractAddress, tokenId, tokenType, onSelect }) => {
  const { contractName, uri } = loadNFTData({ contractAddress, tokenId, tokenType })
  const balance = loadNFTBalance({ contractAddress, tokenId, tokenType, address })
  // eslint-disable-next-line no-unused-vars
  const { metadata, resolvedImageUrl, contentType, resolvedAnimationUrl, animationUrlContentType } = useMetadata({ uri, contractAddress, tokenType })
  const isImage = contentType?.startsWith('image')
  const isVideo = contentType?.startsWith('video')
  // const isAnimationUrlImage = animationUrlContentType?.startsWith('image')
  // const isAnimationUrlVideo = animationUrlContentType?.startsWith('video')
  if (balance.ltn(1)) {
    return <></>
  }

  return (
    <>
      <NFTItemContainer onClick={() => onSelect && onSelect({ resolvedImageUrl, contractAddress, isImage, isVideo, metadata, contractName, tokenId, tokenType })}>
        {!contentType && <Loading><TailSpin /> </Loading>}
        {isImage && <NFTImage src={resolvedImageUrl} />}
        {/* <NFTImage src='https://1wallet.mypinata.cloud/ipfs/QmUgueVH4cQgBEB8aJ3JJT8hMaDS4yHaHvBugGhGLyz9Nx/1.png' /> */}
        {isVideo && <NFTVideo src={resolvedImageUrl} loop muted autoplay />}
        <Row>
          <FlexColumn style={{ flex: 1 }}>
            <NFTName>{metadata?.displayName || metadata?.name}</NFTName>
            <NFTCollection>{contractName}</NFTCollection>
          </FlexColumn>
        </Row>
        {balance.gtn(1) && <NFTQuantity>x{balance.toString()}</NFTQuantity>}
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

const loadNFTs = ({ address }) => {
  const dispatch = useDispatch()
  const tracked = useSelector(state => state.wallet?.[address]?.trackedTokens || [])
  const [nfts, setNfts] = useState([...tracked, ...DUMMY_NFTS])
  useEffect(() => {
    async function f () {
      try {
        const nfts = await apis.nft.lookup({ address })
        console.log(nfts)
        const tokens = nfts.map(e => ({ ...e, key: utils.computeTokenKey(e).string }))
        dispatch(walletActions.overrideTokens({ tokens }))
        setNfts([...nfts, ...DUMMY_NFTS])
      } catch (ex) {
        console.error(ex)
        toast.error('Unable to look up NFTs owned by this wallet')
      }
    }
    f()
  }, [address])
  return nfts
}

const NFTSendModal = ({ modelVisible, setModelVisible, maxQuantity, contractAddress, tokenId, tokenType }) => {
  const dispatch = useDispatch()
  const [isAddressInput, setIsAddressInput] = useState(false)
  const [phone, setPhone] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('1')
  const [isSending, setIsSending] = useState(false)
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const pk = wallet[address]?.pk

  const send = async () => {
    const value = amount?.toString()
    if (!value || value === '0') {
      toast.error('Invalid amount')
      return
    }

    if (!(new BN(value).lte(new BN(maxQuantity)))) {
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
      const { transactionHash } = await apis.blockchain.sendToken({
        address,
        contractAddress,
        tokenId,
        tokenType,
        dest,
        amount: value
      })
      const key = utils.computeTokenKey({ contractAddress, tokenId, tokenType }).string
      // dispatch(balanceActions.fetchTokenBalance({ contractAddress, tokenId, tokenType, address }))
      dispatch(balanceActions.fetchTokenBalanceSuccess({ key, balance: new BN(maxQuantity).sub(new BN(value)).toString(), address }))
      toast.success(
        <FlexRow>
          <BaseText style={{ marginRight: 8 }}>Done!</BaseText>
          <LinkWrarpper target='_blank' href={utils.getExplorerUri(transactionHash)}>
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
  const sendWrapper = async () => {
    setIsSending(true)
    try {
      await send()
    } catch (ex) {
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
            value={phone} onChange={setPhone}
          />}
        {isAddressInput &&
          <Input
            onChange={({ target: { value } }) => setTo(value)}
            placeholder='0x1234abcde...'
            $width='100%' value={to} margin='16px' style={{ fontSize: 10, flex: 1 }}
          />}
        <FloatingSwitch href='#' onClick={() => setIsAddressInput(!isAddressInput)}>use {isAddressInput ? 'phone number' : 'crypto address'}</FloatingSwitch>
      </Row>
      {maxQuantity > 1 &&
        <Row>
          <Label>Amount</Label>
          <Row style={{ flex: 1 }}>
            <Input onChange={({ target: { value } }) => setAmount(value)} $width='100%' value={amount} margin='16px' />
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

const NFTViewer = ({ visible, setVisible, onClose, contractAddress, resolvedImageUrl, isImage, isVideo, metadata, contractName, tokenId, tokenType }) => {
  const dispatch = useDispatch()
  const [showDetails, setShowDetails] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)
  const [sendModelVisible, setSendModalVisible] = useState(false)
  const [managementVisible, setManagementVisible] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const pk = wallet[address]?.pk
  const key = utils.computeTokenKey({ contractAddress, tokenId, tokenType }).string
  const balance = new BN(useSelector(state => state.balance?.[address]?.tokenBalances?.[key] || ''))

  const showManagement = () => {
    setManagementVisible(true)
    setTimeout(() => setManagementVisible(false), 2500)
  }
  const untrack = async () => {
    try {
      setIsTracking(true)
      const signature = apis.web3.signWithBody({ contractAddress, tokenId }, pk)
      const { success, error } = await apis.nft.untrack({ contractAddress, tokenId, address, signature })
      if (!success) {
        toast.error(`Unable to hide token. Error: ${error}`)
        return
      }
      const key = utils.computeTokenKey({ contractAddress, tokenId, tokenType }).string
      dispatch(walletActions.untrackTokens({ tokens: [{ key, contractAddress, tokenId, tokenType }] }))
      toast.success(`Hiding ${tokenType} token (id=${tokenId}, contract=${utils.ellipsisAddress(contractAddress)})`)
      setManagementVisible(false)
      setVisible && setVisible(false)
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
          onClose && onClose()
          setVisible && setVisible(false)
        }}
      >
        <NFTViewerContainer>
          <NFTDisplayWrapper>
            {isImage && <NFTImageFull src={resolvedImageUrl} onClick={() => showManagement()} />}
            {isVideo && <NFTVideoFull src={resolvedImageUrl} onClick={() => showManagement()} loop muted autoplay />}
            {managementVisible &&
              <NFTManagementPanel>
                <Button style={{ width: '100%', height: '100%' }} onClick={() => untrack()}>
                  {isTracking ? <TailSpin /> : <><BaseText style={{ fontSize: 40 }}>✕</BaseText><br />Hide NFT</>}
                </Button>
              </NFTManagementPanel>}
          </NFTDisplayWrapper>

          <NFTName>{metadata?.displayName || metadata?.name}</NFTName>
          <NFTCollection>{contractName}</NFTCollection>
          <NFTDescription>{metadata?.description}</NFTDescription>
          {balance?.gtn(1) && <NFTQuantity>x{balance.toString()}</NFTQuantity>}
          <Row style={{ padding: '0 16px' }}>
            <Col style={{ flex: '100%' }}>
              {!showDetails && <LinkWrarpper href='#' onClick={() => setShowDetails(true)}><TechnicalText>Show Technical Details</TechnicalText></LinkWrarpper>}
              {showDetails && <LinkWrarpper href='#' onClick={() => setShowDetails(false)}><TechnicalText>Hide Technical Details</TechnicalText></LinkWrarpper>}
            </Col>
            <Button style={{ background: '#222', whiteSpace: 'nowrap' }} onClick={() => setSendModalVisible(true)}>Send NFT</Button>
          </Row>
          {showDetails &&
            <Col style={{ gap: 0, padding: '0 16px' }}>
              <Row>
                <TechnicalText>Contract: </TechnicalText>
                <TechnicalText onClick={() => {
                  setShowFullAddress(!showFullAddress)
                  navigator.clipboard.writeText(contractAddress)
                  toast.info('Copied address')
                }}
                >{showFullAddress ? contractAddress : utils.ellipsisAddress(contractAddress)}
                </TechnicalText>
              </Row>
              <Row>
                <TechnicalText>ID: </TechnicalText>
                <TechnicalText onClick={() => {
                  navigator.clipboard.writeText(tokenId)
                  toast.info('Copied Token ID')
                }}
                >{tokenId}
                </TechnicalText>
              </Row>
              <Row>
                <TechnicalText>Type: </TechnicalText>
                <TechnicalText onClick={() => {
                  navigator.clipboard.writeText(tokenType)
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

const NFTTracker = ({ visible, setVisible }) => {
  const dispatch = useDispatch()
  const [contract, setContract] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const wallet = useSelector(state => state.wallet || {})
  const address = Object.keys(wallet).find(e => apis.web3.isValidAddress(e))
  const pk = wallet[address]?.pk

  const track = async () => {
    try {
      setIsTracking(true)
      const tokenType = await apis.nft.getNFTType(contract)
      if (!tokenType) {
        toast.error('Unknown token type')
        return
      }
      const balance = await apis.blockchain.getTokenBalance({ tokenType, tokenId, contractAddress: contract, address })
      if (!new BN(balance).gtn(0)) {
        toast.error('You do not own the NFT')
        return
      }
      const signature = apis.web3.signWithBody([{ contractAddress: contract, tokenId, tokenType }], pk)
      const { success, error } = await apis.nft.track({ contractAddress: contract, tokenId, tokenType, address, signature })
      if (!success) {
        toast.error(`Unable to add token. Error: ${error}`)
        return
      }
      const key = utils.computeTokenKey({ contractAddress: contract, tokenId, tokenType }).string
      dispatch(walletActions.trackTokens({ tokens: [{ key, contractAddress: contract, tokenId, tokenType }] }))
      toast.success(`Added new ${tokenType} token (id=${tokenId}, contract=${utils.ellipsisAddress(contract)})`)
      setVisible && setVisible(false)
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
          onChange={({ target: { value } }) => setContract(value)}
          placeholder='0x1234abcde...'
          $width='100%' value={contract} margin='16px' style={{ fontSize: 10, flex: 1 }}
        />
      </Row>
      <Row>
        <LabelSmall>TokenID</LabelSmall>
        <Input onChange={({ target: { value } }) => setTokenId(value)} placeholder='123...' $width='100%' value={tokenId} margin='16px' />
      </Row>
      <Row style={{ justifyContent: 'center', marginTop: 16 }}>
        <Button onClick={track} disabled={isTracking}>{isTracking ? <TailSpin width={16} height={16} /> : 'Add'}</Button>
      </Row>
    </Modal>
  )
}

const NFTShowcase = ({ address }) => {
  const [viewerVisible, setViewerVisible] = useState(false)
  const [trackerVisible, setTrackerVisible] = useState(false)
  const nfts = loadNFTs({ address })
  const [selected, setSelected] = useState()
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
              <Button style={{ width: '100%' }} onClick={() => setTrackerVisible(true)}><BaseText style={{ fontSize: 40 }}>⊕</BaseText><br />Add NFT</Button>
            </Desc>
          </FlexRow>
        </FlexColumn>
      </Gallery>
      <NFTViewer visible={viewerVisible} setVisible={setViewerVisible} onClose={() => setSelected(null)} {...selected} />
      <NFTTracker visible={trackerVisible} setVisible={setTrackerVisible} />
    </>
  )
}

export default NFTShowcase
