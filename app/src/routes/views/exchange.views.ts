import { Router } from 'express'
import { ExchangeController } from '../../controllers/exchange/exchange.controller'

const router = Router()
const exchangeController = new ExchangeController()

// List exchanges
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = req.query.search as string

    const result = await exchangeController.list(req, res)
    const { data: exchanges, meta } = result

    res.render('../views/exchanges/index', {
      exchanges,
      page,
      limit,
      search,
      totalPages: meta.totalPages,
    })
  } catch (error) {
    res.redirect('/')
  }
})

// Show new exchange form
router.get('/new', (req, res) => {
  res.render('../views/exchanges/form', {
    exchange: null,
  })
})

// Show edit exchange form
router.get('/:id/edit', async (req, res) => {
  try {
    const result = await exchangeController.getById(req, res)
    res.render('../views/exchanges/form', {
      exchange: result,
    })
  } catch (error) {
    res.redirect('/exchanges')
  }
})

// Show exchange details
router.get('/:id', async (req, res) => {
  try {
    const result = await exchangeController.getById(req, res)
    res.render('../views/exchanges/show', {
      exchange: result,
    })
  } catch (error) {
    res.redirect('/exchanges')
  }
})

// Create exchange
router.post('/', async (req, res) => {
  try {
    await exchangeController.create(req, res)
    res.redirect('/exchanges')
  } catch (error) {
    res.redirect('/exchanges/new')
  }
})

// Update exchange
router.put('/:id', async (req, res) => {
  try {
    await exchangeController.update(req, res)
    res.redirect('/exchanges')
  } catch (error) {
    res.redirect(`/exchanges/${req.params.id}/edit`)
  }
})

// Delete exchange
router.delete('/:id', async (req, res) => {
  try {
    await exchangeController.delete(req, res)
    res.redirect('/exchanges')
  } catch (error) {
    res.redirect('/exchanges')
  }
})

export default router
