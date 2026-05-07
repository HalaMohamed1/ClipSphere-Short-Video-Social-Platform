import express from 'express';
import { protect } from '../middleware/auth.js';
import { PaymentController } from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect);

router.post('/sync-checkout-session', PaymentController.syncCheckoutSession);
router.post('/create-checkout-session', PaymentController.createCheckoutSession);
router.get('/me/transactions', PaymentController.getMyTransactions);
router.get('/me/summary', PaymentController.getMySummary);

export default router;
