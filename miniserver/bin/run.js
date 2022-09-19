#!/usr/bin/env node
const apps = require('../app')
const config = require('../config')
const httpsServer = apps.httpsServer
const httpServer = apps.httpServer
console.log('Starting web server...')

httpsServer.listen(config.httpsPort || 8443, () => {
  const { port, address } = httpsServer.address()
  console.log(`HTTPS server listening on port ${port} at ${address}`)
})

httpServer.listen(config.port || 3000, () => {
  const { port, address } = httpServer.address()
  console.log(`HTTP server listening on port ${port} at ${address}`)
})
