/* eslint-disable no-unused-vars */
// Dependencies
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import express from 'express'
import methodOverride from 'method-override'
import path from 'path'
import engine from 'ejs-mate'
import axios from 'axios'
import db from './models'

// Database
import { testConnection } from './sequelize'

// Customs to
import common from './utils/common'
import RequestBody from './middleware/RequestBody'
import handlerRoutes from './routes/handler'
import { errorHandler } from './middleware/error.middleware'

// Import the ExchangeController
import { ExchangeController } from './controllers/exchange/exchange.controller'
import { TokenController } from './controllers/token/token.controller'
import { WalletController } from './controllers/wallet/wallet.controller'
dotenv.config()
const { sendErrorResponse } = common

const app = express()

// Initialize database connection
testConnection()
  .then(() => {
    db.sequelize.sync({ force: true })
    console.log('Database initialized')
  })
  .catch((err) => {
    console.error('Database initialization failed:', err)
    process.exit(1)
  })

// View engine setup
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')

app.engine('ejs', engine)
// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  express.static(path.join(__dirname, '../public'), {
    // Note: changed to '../public' to match correct path
    setHeaders: (res, path, stat) => {
      if (path.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript; charset=UTF-8')
      }
    },
  })
)

// app.use(cors())
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'cdn.jsdelivr.net',
          'https://cdn.jsdelivr.net',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:', 'cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
  })
)
app.use(RequestBody)
app.use(morgan('dev'))
app.use(methodOverride('_method'))

// API Routes
handlerRoutes(app)

// Token Routes
app.post('/api/tokens', async (req, res) => {
  try {
    const tokenController = new TokenController()
    await tokenController.create(req, res)
  } catch (error) {
    console.error(error)
    return sendErrorResponse(res, 500, [error])
  }
})
// wallet routes
app.post('/api/wallets', async (req, res) => {
  try {
    await new WalletController().create(req, res)
  } catch (error) {
    console.error(error)
    return sendErrorResponse(res, 500, [error])
  }
})
app.get('/api/wallets', async (req, res) => {
  try {
    await new WalletController().list(req, res)
  } catch (error) {
    console.error(error)
    return sendErrorResponse(res, 500, [error])
  }
})
app.get('/api/tokens', async (req, res) => {
  try {
    const tokenController = new TokenController()
    await tokenController.list(req, res)
  } catch (error) {
    console.error(error)
    return sendErrorResponse(res, 500, [error])
  }
})

// Exchange API Routes
app.post('/api/exchanges', async (req, res) => {
  try {
    const exchangeController = new ExchangeController()
    await exchangeController.create(req, res)
  } catch (error) {
    console.error(error)
    return sendErrorResponse(res, 500, [error])
  }
})

app.get('/api/exchanges', async (req, res) => {
  try {
    const exchangeController = new ExchangeController()
    await exchangeController.list(req, res)
  } catch (error) {
    console.error(error)
    return sendErrorResponse(res, 500, [error])
  }
})

// Web Routes for Views
app.post('/exchanges', async (req, res) => {
  try {
    await axios.post('http://localhost:3000/api/exchanges', req.body)
    return res.redirect('/exchanges')
  } catch (error) {
    console.error(error)
    // You might want to render the form again with error messages
    res.render('exchanges/new', {
      title: 'New Exchange',
      error: error.message,
    })
  }
})

app.get('/exchanges/new', (req, res) => {
  res.render('exchanges/new', {
    title: 'New Exchange',
    exchange: null,
  })
})

app.get('/exchanges', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/api/exchanges')
    const { data: exchanges, meta } = response.data

    res.render('exchanges/index', {
      title: 'Exchanges',
      exchanges,
      page: meta.page,
      totalPages: meta.totalPages,
    })
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
})

app.use('/', async (req, res) => {
  try {
    const [exchanges, tokens] = await Promise.all([
      axios.get('http://localhost:3000/api/exchanges').then((res) => res.data),
      axios.get('http://localhost:3000/api/tokens').then((res) => res.data),
    ])

    res.render('dashboard/index', {
      title: 'Dashboard',
      exchanges: exchanges.data,
      tokens: tokens.data,
      totalPages: 1,
    })
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
})

/* Handling all errors thrown */
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line prefer-arrow-callback
app.use(function (
  err: Error | any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  console.log('Error')
  console.log(err)
  const { status = 500 } = err
  return sendErrorResponse(res, status, [err])
})

// Error handling
app.use(errorHandler)

export default app
