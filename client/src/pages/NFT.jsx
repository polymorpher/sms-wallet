import React, { useState, useRef, useEffect } from 'react'
import { Address, BaseText, Desc, Title } from '../components/Text'
import { Col, FlexColumn, FlexRow, Modal, Row } from '../components/Layout'
import { Button, LinkWrarpper } from '../components/Controls'
import html2canvas from 'html2canvas'
import styled from 'styled-components'
import { NFTUtils, processError, useWindowDimensions, utils } from '../utils'
import apis from '../api'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import BN from 'bn.js'
import { TailSpin } from 'react-loading-icons'

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
        if (metadata.image && (metadata.image.length - metadata.image.lastIndexOf('.')) > 5 && !contentTypeOverride) {
          const resolvedImageUrl = NFTUtils.replaceIPFSLink(metadata.image, ipfsGateway)
          const { headers: { 'content-type': contentType } } = await axios.head(resolvedImageUrl)
          setResolvedImageUrl(resolvedImageUrl)
          setContentType(contentType)
          if (metadata.animation_url) {
            const animationUrl = NFTUtils.replaceIPFSLink(metadata?.animation_url || metadata?.properties?.animation_url, ipfsGateway)
            const { headers: { 'content-type': animationUrlContentType } } = await axios.head(animationUrl)
            setResolvedAnimationUrl(animationUrl)
            setAnimationUrlContentType(animationUrlContentType)
          }
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
  const [balance, setBalance] = useState(new BN(0))
  useEffect(() => {
    if (!contractAddress || !tokenId || !tokenType || !address) {
      return
    }
    async function f () {
      try {
        const balance = await apis.blockchain.getTokenBalance({ address, contractAddress, tokenId, tokenType })
        setBalance(new BN(balance))
      } catch (ex) {
        console.error(ex)
        toast.error(`Failed to get NFT balance: ${processError(ex)}`)
      }
    }
    f()
  }, [contractAddress, address, tokenId, tokenType])
  return balance
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
`

const NFTCollection = styled(BaseText)`
  color: #ccc;
  background: transparent;
  font-size: 12px;
  font-weight: 100;
  text-align: left;
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

export const NFTItem = ({ address, contractAddress, tokenId, tokenType, onSelect }) => {
  const { contractName, uri } = loadNFTData({ contractAddress, tokenId, tokenType })
  const balance = loadNFTBalance({ contractAddress, tokenId, tokenType, address })
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
      <NFTItemContainer onClick={() => onSelect && onSelect({ resolvedImageUrl, contractAddress, isImage, isVideo, metadata, balance, contractName, tokenId, tokenType })}>
        {!contentType && <Loading><TailSpin /> </Loading>}
        {isImage && <NFTImage src={resolvedImageUrl} />}
        {isVideo && <NFTVideo src={resolvedImageUrl} loop muted autoplay />}
        <NFTName>{metadata?.displayName || metadata?.name}</NFTName>
        <NFTCollection>{contractName}</NFTCollection>
        {balance.gtn(1) && <NFTQuantity>x{balance.toString()}</NFTQuantity>}
      </NFTItemContainer>
    </>
  )
}

const loadNFTs = ({ address }) => {
  return [{
    contractAddress: '0x426dD435EE83dEdb5af8eDa2729a9064C415777B',
    tokenId: '1',
    tokenType: 'ERC721',
  }, {
    contractAddress: '0x426dD435EE83dEdb5af8eDa2729a9064C415777B',
    tokenId: '2',
    tokenType: 'ERC721',
  }, {
    contractAddress: '0x6b2d0691dfF5eb5Baa039b9aD9597B9169cA44d0',
    tokenId: '1',
    tokenType: 'ERC1155',
  }, {
    contractAddress: '0x6b2d0691dfF5eb5Baa039b9aD9597B9169cA44d0',
    tokenId: '2',
    tokenType: 'ERC1155',
  }]
}
const NFTViewer = ({ contractAddress, resolvedImageUrl, isImage, isVideo, metadata, balance, contractName, tokenId, tokenType }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)
  console.log(resolvedImageUrl, isImage, isVideo, metadata, balance, contractName)
  return (
    <NFTViewerContainer>
      {isImage && <NFTImageFull src={resolvedImageUrl} />}
      {isVideo && <NFTVideoFull src={resolvedImageUrl} loop muted autoplay />}
      <NFTName>{metadata?.displayName || metadata?.name}</NFTName>
      <NFTCollection>{contractName}</NFTCollection>
      {balance.gtn(1) && <NFTQuantity>x{balance.toString()}</NFTQuantity>}
      {!showDetails && <LinkWrarpper style={{ color: 'white' }} href='#' onClick={() => setShowDetails(true)}>Show Technical Details</LinkWrarpper>}
      {showDetails &&
        <Col style={{ gap: 0 }}>
          <Row>
            <BaseText>Contract: </BaseText>
            <Address
              style={{ padding: 0 }} onClick={() => {
                setShowFullAddress(!showFullAddress)
                navigator.clipboard.writeText(contractAddress)
                toast.info('Copied address')
              }}
            >{showFullAddress ? contractAddress : utils.ellipsisAddress(contractAddress)}
            </Address>
          </Row>
          <BaseText>Token ID: {tokenId}</BaseText>
          <BaseText>Token Type: {tokenType}</BaseText>
        </Col>}

    </NFTViewerContainer>
  )
}
const NFTShowcase = ({ address }) => {
  const [modelVisible, setModalVisible] = useState(false)
  const nfts = loadNFTs({ address })
  const [selected, setSelected] = useState({})
  // console.log(nfts)
  useEffect(() => {
    if (new BN(selected?.balance).gtn(0)) {
      setModalVisible(true)
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
            </Desc>
          </FlexRow>
        </FlexColumn>
      </Gallery>
      <Modal style={{ maxWidth: 800, width: '100%', margin: 'auto', padding: 16, background: 'black' }} visible={modelVisible} onCancel={() => setModalVisible(false)}>
        <NFTViewer {...selected} />
      </Modal>
    </>
  )
}

export default NFTShowcase
