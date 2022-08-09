import React, { useState, useRef, useEffect } from 'react'
import { Address, BaseText, Desc, Title } from '../components/Text'
import { FlexRow } from '../components/Layout'
import { Button } from '../components/Controls'
import html2canvas from 'html2canvas'
import styled from 'styled-components'
import { NFTUtils, processError, useWindowDimensions } from '../utils'
import apis from '../api'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import BN from 'bn.js'

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
        const metadata = await axios.get(uri)
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
    if (!contractAddress || !tokenId || tokenType) {
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
    if (!contractAddress || !tokenId || tokenType || !address) {
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
    if (!contractAddress || !tokenId || tokenType || !address) {
      return
    }
    async function f () {
      try {
        const balance = await apis.blockchain.getTokenBalance({ contractAddress, tokenId, tokenType })
        setBalance(balance)
      } catch (ex) {
        console.error(ex)
        toast.error(`Failed to get NFT balance: ${processError(ex)}`)
      }
    }
    f()
  }, [contractAddress, address, tokenId, tokenType])
  return balance
}

const NFTItemContainer = styled.div`
  color: white;
  background: black;
  width: 100%;
  max-width: 600px;
  min-height: 300px;
  max-height: 600px;
  position: relative;
`

const NFTImage = styled.img`
    object-fit: cover;
    width: 100%;
    height: 100%;
`

const NFTVideo = styled.video`
  object-fit: cover;
  width: 100%;
  height: 100%;
`

const NFTName = styled(BaseText)`
  color: white;
  background: black;
  font-size: 16px;
`

const NFTCollection = styled(BaseText)`
  color: white;
  background: black;
  font-size: 12px;
`

const NFTQuantity = styled(BaseText)`
  background: rgba(230, 230, 230, 0.8);
  border-radius: 10px;
  padding: 4px;
  color: black;
  position: absolute;
  top: 8px;
  left: 8px;
`

export const NFTItem = ({ address, contractAddress, tokenId, tokenType }) => {
  const { contractName, uri } = loadNFTData({ contractAddress, tokenId, tokenType })
  const balance = loadNFTBalance({ contractAddress, tokenId, tokenType, address })
  const { metadata, resolvedImageUrl, resolvedAnimationUrl, contentType, animationUrlContentType } = useMetadata({ name, symbol, uri, contractAddress, tokenType })
  const isImage = contentType?.startsWith('image')
  const isVideo = contentType?.startsWith('video')
  const isAnimationUrlImage = animationUrlContentType?.startsWith('image')
  const isAnimationUrlVideo = animationUrlContentType?.startsWith('video')
  if (balance.ltn(1)) {
    return <></>
  }
  return (
    <NFTItemContainer>
      {isImage && <NFTImage src={resolvedImageUrl} />}
      {isVideo && <NFTVideo src={resolvedImageUrl} loop muted autoplay />}
      <NFTName>{metadata?.displayName || metadata?.name}</NFTName>
      <NFTCollection>{contractName}</NFTCollection>
      {balance.gtn(1) && <NFTQuantity>{balance.toString()}</NFTQuantity>}
    </NFTItemContainer>
  )
}

const loadNFTs = ({ address }) => {
  return []
}
const NFTShowcase = (address) => {
  const nfts = loadNFTs({ address })
  return (
    <Desc $color='white' style={{ padding: 0 }}>
      {nfts.map((e, i) => {
        const { contractAddress, tokenId, tokenType } = e
        return <NFTItem key={`nft-${i}`} address={address} contractAddress={contractAddress} tokenType={tokenType} tokenId={tokenId} />
      })}
    </Desc>
  )
}

export default NFTShowcase
