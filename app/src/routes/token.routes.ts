import { Router } from 'express'
import { TokenController } from '../controllers/token/token.controller'
import { validate } from '../middleware/validate.middleware'
import {
  createTokenSchema,
  updateTokenSchema,
  getTokenSchema,
  deleteTokenSchema,
  listTokensSchema,
} from '../schema/token.schema'

const router = Router()
const tokenController = new TokenController()

router
  .route('/')
  .post(validate(createTokenSchema), tokenController.create)
  .get(validate(listTokensSchema), tokenController.list)

router
  .route('/:id')
  .get(validate(getTokenSchema), tokenController.getById)
  .put(validate(updateTokenSchema), tokenController.update)
  .delete(validate(deleteTokenSchema), tokenController.delete)

export default router
