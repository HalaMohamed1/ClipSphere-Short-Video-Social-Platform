import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post(
  '/stripe',
  express.raw({
    type: (req) =>
      /application\/json/i.test(String(req.headers['content-type'] ?? '')),
  }),
  handleStripeWebhook
);

export default router;
