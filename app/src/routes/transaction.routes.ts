import { Router } from 'express';
import { TransactionController } from '../controllers/transaction/transaction.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionSchema,
  deleteTransactionSchema,
  listTransactionsSchema,
} from '../schema/transaction.schema';

const router = Router();
const transactionController = new TransactionController();

router
  .route('/')
  .post(validate(createTransactionSchema), transactionController.create)
  .get(validate(listTransactionsSchema), transactionController.list);

router
  .route('/:id')
  .get(validate(getTransactionSchema), transactionController.getById)
  .put(validate(updateTransactionSchema), transactionController.update)
  .delete(validate(deleteTransactionSchema), transactionController.delete);

export default router; 