import Stripe from 'stripe';
import { PaymentService } from '../services/paymentService.js';

let stripe;

const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

export const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe webhook] signature / payload:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const obj = event.data?.object;
    const sessionId =
      typeof obj === 'string'
        ? obj
        : obj && typeof obj === 'object' && typeof obj.id === 'string'
          ? obj.id
          : null;

    if (!sessionId) {
      console.warn('[stripe webhook] missing checkout session id on', event.type, event.id);
      return res.status(200).json({ received: true });
    }

    try {
      const outcome = await PaymentService.fulfillCheckoutFromStripeEvent(event.type, sessionId);
      if (process.env.NODE_ENV === 'development') {
        console.log('[stripe webhook]', event.type, sessionId, outcome);
      }

      const warnReasons = [
        'no_pending_row',
        'invalid_creator_metadata',
        'missing_amount',
      ];
      if (outcome.reason && warnReasons.includes(outcome.reason)) {
        console.warn('[stripe webhook] tip not finalized', sessionId, outcome);
      }
      if (outcome.deferred) {
        console.log(
          `[stripe webhook] fulfillment deferred (${outcome.payment_status ?? '?'})`,
          sessionId
        );
      }
    } catch (error) {
      console.error('Stripe webhook fulfillment error:', error);
      
      return res.status(500).json({ error: 'Fulfillment failed' });
    }
  }

  res.status(200).json({ received: true });
};
