// import {
// tokenRoutes,
// walletRoutes,
// exchangeRoutes,
// transactionRoutes,
// } from './index'
// import walletRoutes from './wallet.routes'
import exchangeRoutes from './exchange.routes'
// import transactionRoutes from './transaction.routes'

export default (app) => {
  // app.use('/api/token', tokenRoutes)
  // app.use('/api/wallet', walletRoutes)
  app.use('/api/exchange', exchangeRoutes)
  // app.use('/api/transaction', transactionRoutes)
}
