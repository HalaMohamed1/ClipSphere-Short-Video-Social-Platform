import { catchAsync } from '../utils/catchAsync.js';
import { PaymentService } from '../services/paymentService.js';
import {
  createCheckoutSessionSchema,
  listTransactionsQuerySchema,
  syncCheckoutSessionSchema,
} from '../validators/paymentValidator.js';

export class PaymentController {
  static createCheckoutSession = catchAsync(async (req, res) => {
    const body = createCheckoutSessionSchema.parse(req.body);

    const result = await PaymentService.createCheckoutSession({
      senderId: req.user._id,
      creatorId: body.creatorId,
      amount: body.amount,
      currency: body.currency,
      videoId: body.videoId,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  static syncCheckoutSession = catchAsync(async (req, res) => {
    const body = syncCheckoutSessionSchema.parse(req.body);

    const data = await PaymentService.syncCheckoutSessionForUser(
      body.sessionId,
      req.user._id
    );

    res.status(200).json({
      status: 'success',
      data,
    });
  });

  static getMyTransactions = catchAsync(async (req, res) => {
    const query = listTransactionsQuerySchema.parse(req.query);

    const data = await PaymentService.getMyTransactions(req.user._id, query);

    res.status(200).json({
      status: 'success',
      data,
    });
  });

  static getMySummary = catchAsync(async (req, res) => {
    const data = await PaymentService.getMySummary(req.user._id);

    res.status(200).json({
      status: 'success',
      data,
    });
  });
}
