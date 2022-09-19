#!/usr/bin/env node
const apps = require('../app')
const config = require('../config')
const httpsServer = apps.httpsServer
const httpServer = apps.httpServer
console.log('Starting web server...')

httpsServer.listen(config.httpsPort || 8443, () => {
  const addr = httpsServer.address()
  console.log(`HTTPS server listening on port ${addr.port} at ${addr.address}`)
})

httpServer.listen(config.port || 3000, () => {
  const addr = httpServer.address()
  console.log(`HTTP server listening on port ${addr.port} at ${addr.address}`)
})
