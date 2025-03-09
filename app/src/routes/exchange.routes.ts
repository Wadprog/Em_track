import { Router } from 'express'
import { ExchangeController } from '../controllers/exchange/exchange.controller'
import { validate } from '../middleware/validate.middleware'
import {
  createExchangeSchema,
  updateExchangeSchema,
  getExchangeSchema,
  deleteExchangeSchema,
  listExchangesSchema,
} from '../schema/exchange.schema'

const router = Router()
const exchangeController = new ExchangeController()

router
  .route('/')
  .post(validate(createExchangeSchema), exchangeController.create)
  .get(validate(listExchangesSchema), exchangeController.list)

router
  .route('/:id')
  .get(validate(getExchangeSchema), exchangeController.getById)
  .put(validate(updateExchangeSchema), exchangeController.update)
  .delete(validate(deleteExchangeSchema), exchangeController.delete)

export default router
