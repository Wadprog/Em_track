import { Router } from 'express';
import { WalletController } from '../controllers/wallet/wallet.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createWalletSchema,
  updateWalletSchema,
  getWalletSchema,
  deleteWalletSchema,
  listWalletsSchema,
} from '../schema/wallet.schema';

const router = Router();
const walletController = new WalletController();

router
  .route('/')
  .post(validate(createWalletSchema), walletController.create)
  .get(validate(listWalletsSchema), walletController.list);

router
  .route('/:id')
  .get(validate(getWalletSchema), walletController.getById)
  .put(validate(updateWalletSchema), walletController.update)
  .delete(validate(deleteWalletSchema), walletController.delete);

export default router; 