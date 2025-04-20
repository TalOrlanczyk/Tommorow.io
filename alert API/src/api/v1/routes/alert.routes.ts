import express, { Request, Response, Router } from 'express';
import { createAlert, getAlerts } from '../controllers/alerts';
import { validate } from '../../../middleware/validation';
import { createAlertSchema } from '../schemas/alerts';
import { asyncHandler } from '../../../utils/utils';

const alertRouter = Router();

alertRouter.post('/' , validate(createAlertSchema), asyncHandler(createAlert));
  
alertRouter.get('/', asyncHandler(getAlerts));

  

export default alertRouter; 