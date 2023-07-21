import express from 'express'
import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import { pickBy } from 'lodash-es'
import { TelegramClient, Api, password as Password } from 'telegram'

const router = express.Router()

const AxiosBase = axios.create({ timeout: 15000 })
router.get('/health', async (req, res) => {
  console.log('[/health]', JSON.stringify(req.fingerprint))
  res.send('OK').end()
})

// router.get('/')

export default router
