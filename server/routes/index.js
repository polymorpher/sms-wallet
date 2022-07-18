const express = require('express')
const config = require('../config')
const router = express.Router()
const { StatusCodes } = require('http-status-codes')
const { Logger } = require('../logger')
router.get('/health', generalLimiter(), async (req, res) => {
  Logger.log('[/health]', req.fingerprint)
  res.send('OK').end()
})

module.exports = router
