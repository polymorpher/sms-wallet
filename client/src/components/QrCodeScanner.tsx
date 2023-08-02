import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import QrReader from 'react-qr-reader'
import { useWindowDimensions, getDataURLFromFile, getTextFromFile } from '../utils'
import { TailSpin } from 'react-loading-icons'
import QrIcon from '../../assets/qr.svg'
import jsQR from 'jsqr'
import { Button } from './Controls'
import { IconImg } from './Menu'
import { Row } from './Layout'
import Upload from 'rc-upload'
import Select from 'react-select'
import { BaseText } from './Text'

const QrCodeScanner = ({ onScan, shouldInit, style }): React.JSX.Element => {
  const ref = useRef()
  const { isMobile } = useWindowDimensions()
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [device, setDevice] = useState<MediaDeviceInfo | undefined>()
  const [qrCodeImageUploading, setQrCodeImageUploading] = useState<boolean>(false)
  const [allowed, setAllowed] = useState(true)

  useEffect(() => {
    const f = async (): Promise<void> => {
      if (!allowed) {
        return
      }
      const d = await navigator.mediaDevices.enumerateDevices()
      const cams = d.filter(e => e.kind === 'videoinput')
      if (cams.length <= 0) {
        toast.error('Cannot access camera. Please select your QR Code')
        return
      }
      if (cams.length >= 1 && !cams[0].label) {
        setTimeout(async () => { f().catch(console.error) }, 2500)
        console.log('got empty labels. retrying in 2.5s')
      }
      console.log(cams)
      setVideoDevices(cams)
      if (isMobile) {
        const backCam = cams.find(e => e.label.toLowerCase().includes('back'))
        setDevice(backCam ?? cams[0])
      } else {
        setDevice(cams[0])
      }
    }
    shouldInit && videoDevices.length === 0 && f()
  }, [isMobile, videoDevices.length, shouldInit, allowed])

  useEffect(() => {
    if (device && shouldInit && allowed && ref?.current) {
      (ref.current as QrReader).initiate()
    }
  }, [device, shouldInit, allowed])

  const onChange = (v): void => {
    const d = videoDevices.find(e => e.deviceId === v.value)
    setDevice(d)
  }

  const onError = (err): void => {
    if (err?.name === 'NotAllowedError') {
      console.log('Not allowed')
      setAllowed(false)
      return
    }
    console.error(err)
    toast.error(`Failed to parse QR code. Error: ${err}`)
  }

  const convertURIToImageData = async (uri): Promise<ImageData> => await new Promise((resolve, reject): void => {
    if (!uri) {
      onError('No URI detected')
      reject(new Error('No URI detected'))
      return
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) {
      onError('No context')
      reject(new Error('No context'))
      return
    }
    const image = new Image()
    image.addEventListener('load', function (): void {
      canvas.width = image.width
      canvas.height = image.height
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(context.getImageData(0, 0, canvas.width, canvas.height))
    }, false)

    image.src = uri
  })

  const beforeUpload = async (file): Promise<undefined | boolean> => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    const isJson = file.type === 'application/json'
    if (!isJpgOrPng && !isJson) {
      toast.error('You can only select JSON or JPG/PNG file')
      return
    }
    try {
      setQrCodeImageUploading(true)
      if (isJson) {
        const jsonData = await getTextFromFile(file) as string
        // console.log(jsonData)
        const parsed = JSON.parse(jsonData)
        onScan(parsed, true)
        return
      }
      const imageUri = await getDataURLFromFile(file)
      const imageData = await convertURIToImageData(imageUri)
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
      if (!qrCode) {
        toast.error('Fail to parse the uploaded image.')
        return
      }
      onScan(qrCode.data)
    } catch (ex) {
      console.error(ex)
      toast.error('An error occurred while parsing the QR Code image. Please contact 1wallet developer')
    } finally {
      setQrCodeImageUploading(false)
    }
    return false
  }
  const options = videoDevices.map(d => ({ label: d.label || d.deviceId, value: d.deviceId })) // .concat([{ value: 'a', label: 'b' }])

  return (
    <>
      {
        videoDevices && device && allowed
          ? (
            <>
              <Row style={{ justifyContent: 'flex-end' }}>
                <Select
                  // style={{}}
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      width: 240,
                      zIndex: 12
                    })
                  }}
                  options={options}
                  value={{ label: device.label, value: device.deviceId }} onChange={onChange}
                />
              </Row>
              <QrReader
                ref={ref}
                deviceIdChooser={(_, devices) => {
                  if (device) {
                    return devices.filter(d => d.deviceId === device.deviceId)[0].deviceId
                  }
                  return devices[0].deviceId
                }}
                delay={300}
                onError={onError}
                onScan={onScan}
                style={{ width: '100%', ...style }}
              />
            </>
            )
          : <></>
      }
      {!allowed &&
        <BaseText $color='red'>
          You disallowed SMS Wallet to use your camera.
        </BaseText>}
      <Row style={{ marginTop: 16, justifyContent: 'center' }}>
        <Upload beforeUpload={beforeUpload}>
          <Button style={{ width: 'auto', display: 'flex', gap: 16 }}>
            {qrCodeImageUploading
              ? <TailSpin width={16} height={16} />
              : <IconImg style={{ width: 16, height: 16, color: 'white' }} src={QrIcon as string} />}
            <BaseText>Select a Photo Instead</BaseText>
          </Button>
        </Upload>
      </Row>
    </>
  )
}

export default QrCodeScanner
