import { Router } from 'express'
// import exchangeViews from './exchange.views'
// import walletViews from './wallet.views'
// import tokenViews from './token.views'
// import transactionViews from './transaction.views'

import exchangeViews from './exchange.views'

const router = Router()

// Home page
router.get('/', (req, res) => {
  res.render('../views/home', {
    stats: {
      exchangeCount: 0,
      walletCount: 0,
      tokenCount: 0,
      transactionCount: 0,
    },
  })
})

// Mount resource views
// router.use('/exchanges', exchangeViews)
// router.use('/wallets', walletViews)
// router.use('/tokens', tokenViews)
// router.use('/transactions', transactionViews)

export default router
