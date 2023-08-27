import dotenv from 'dotenv'
import Fingerprint from 'express-fingerprint'
import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import config from './config.ts'
import _index from './routes/index.ts'
import bodyParser from 'body-parser'
import https from 'https'
import http from 'http'
import fs from 'fs'
import compression from 'compression'
import _nft from './routes/nft.ts'
import _tg from './routes/tg.ts'
import requestIp from 'request-ip'

dotenv.config()

const app = express()
const env = process.env.NODE_ENV ?? 'development'
Error.stackTraceLimit = 100
app.locals.ENV = env
app.locals.ENV_DEVELOPMENT = env === 'development'

app.set('trust proxy', true)

let httpServer

const httpsOptions = {
  key: fs.readFileSync(config.https.key, { encoding: 'utf-8' }),
  cert: fs.readFileSync(config.https.cert, { encoding: 'utf-8' })
}

if (config.https.only) {
  const httpApp = express()
  const httpRouter = express.Router()
  httpApp.use('*', httpRouter)
  httpRouter.get('*', function (req, res) {
    const hostPort = (req.get('host') ?? '').split(':')
    const url = hostPort.length === 2 ? `https://${hostPort[0]}:${process.env.HTTPS_PORT}${req.originalUrl}` : `https://${hostPort[0]}${req.originalUrl}`
    res.redirect(url)
  })
  httpServer = http.createServer(httpApp)
} else {
  httpServer = http.createServer(app)
}
const httpsServer = https.createServer(httpsOptions, app)
app.use(compression())
app.use(Fingerprint({
  parameters: [
    // @ts-expect-error missing decl
    Fingerprint.useragent,
    // @ts-expect-error missing decl
    Fingerprint.acceptHeaders,
    // @ts-expect-error missing decl
    Fingerprint.geoip
  ]
}))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(requestIp.mw())

if (config.corsOrigins !== '') {
  app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', config.corsOrigins)
    if (config.corsOrigins === '*' || config.corsOrigins.includes(req.headers.origin as string)) {
      res.header('Access-Control-Allow-Origin', req.headers.origin ?? config.corsOrigins)
    } else {
      res.header('Access-Control-Allow-Origin', config.corsOrigins)
    }
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'X-SMS-WALLET-SECRET, X-SMS-WALLET-NETWORK, Accept, Accept-CH, Accept-Charset, Accept-Datetime, Accept-Encoding, Accept-Ext, Accept-Features, Accept-Language, Accept-Params, Accept-Ranges, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Expose-Headers, Access-Control-Max-Age, Access-Control-Request-Headers, Access-Control-Request-Method, Age, Allow, Alternates, Authentication-Info, Authorization, C-Ext, C-Man, C-Opt, C-PEP, C-PEP-Info, CONNECT, Cache-Control, Compliance, Connection, Content-Base, Content-Disposition, Content-Encoding, Content-ID, Content-Language, Content-Length, Content-Location, Content-MD5, Content-Range, Content-Script-Type, Content-Security-Policy, Content-Style-Type, Content-Transfer-Encoding, Content-Type, Content-Version, Cookie, Cost, DAV, DELETE, DNT, DPR, Date, Default-Style, Delta-Base, Depth, Derived-From, Destination, Differential-ID, Digest, ETag, Expect, Expires, Ext, From, GET, GetProfile, HEAD, HTTP-date, Host, IM, If, If-Match, If-Modified-Since, If-None-Match, If-Range, If-Unmodified-Since, Keep-Alive, Label, Last-Event-ID, Last-Modified, Link, Location, Lock-Token, MIME-Version, Man, Max-Forwards, Media-Range, Message-ID, Meter, Negotiate, Non-Compliance, OPTION, OPTIONS, OWS, Opt, Optional, Ordering-Type, Origin, Overwrite, P3P, PEP, PICS-Label, POST, PUT, Pep-Info, Permanent, Position, Pragma, ProfileObject, Protocol, Protocol-Query, Protocol-Request, Proxy-Authenticate, Proxy-Authentication-Info, Proxy-Authorization, Proxy-Features, Proxy-Instruction, Public, RWS, Range, Referer, Refresh, Resolution-Hint, Resolver-Location, Retry-After, Safe, Sec-Websocket-Extensions, Sec-Websocket-Key, Sec-Websocket-Origin, Sec-Websocket-Protocol, Sec-Websocket-Version, Security-Scheme, Server, Set-Cookie, Set-Cookie2, SetProfile, SoapAction, Status, Status-URI, Strict-Transport-Security, SubOK, Subst, Surrogate-Capability, Surrogate-Control, TCN, TE, TRACE, Timeout, Title, Trailer, Transfer-Encoding, UA-Color, UA-Media, UA-Pixels, UA-Resolution, UA-Windowpixels, URI, Upgrade, User-Agent, Variant-Vary, Vary, Version, Via, Viewport-Width, WWW-Authenticate, Want-Digest, Warning, Width, X-Content-Duration, X-Content-Security-Policy, X-Content-Type-Options, X-CustomHeader, X-DNSPrefetch-Control, X-Forwarded-For, X-Forwarded-Port, X-Forwarded-Proto, X-Frame-Options, X-Modified, X-OTHER, X-PING, X-PINGOTHER, X-Powered-By, X-Requested-With')
    next()
  })
}

app.options('*', async (_req, res) => {
  res.end()
})
app.use('/', _index)
app.use('/nft', _nft)
app.use('/tg', _tg)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = config.debug ? err : {}

  // render the error page
  res.status(err.status ?? 500)
  res.json({ error: res.locals.error, message: err.message })
})

export {
  httpServer,
  httpsServer
}
