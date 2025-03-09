import express from 'express';

// Custom imports
import * as schema from '../../schema/profile';
import profileController from '../../controllers/strategy';
import validateResource from '../../middleware/validateResource';


const router = express.Router();

router.post(
  '/',
  validateResource(schema.createProfileSchema),
  profileController.createOne
);

router
  .route('/:id')
  .get(profileController.getOne)
  .put(profileController.editOne)
  .delete(profileController.deleteOne);

export default router;
