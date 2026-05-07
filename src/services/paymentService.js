import Stripe from 'stripe';
import mongoose from 'mongoose';
import { User } from '../db_core/models/User.js';
import { Transaction } from '../db_core/models/Transaction.js';
import { AppError } from '../utils/appError.js';

let stripe;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError('Stripe is not configured (STRIPE_SECRET_KEY)', 503);
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

const clientBase = () =>
  (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',')[0].trim();

function paymentIntentIdFromSession(session) {
  const pi = session.payment_intent;
  if (!pi) return null;
  return typeof pi === 'string' ? pi : pi.id;
}

/**
 * Derive amount in cents when session.amount_total is missing (Stripe edge cases).
 * See https://docs.stripe.com/payments/checkout/fulfillment#webhooks — retrieve expands payment_intent.
 */
async function amountTotalOrFromIntent(stripe, session) {
  if (session.amount_total != null && !Number.isNaN(Number(session.amount_total))) {
    return Number(session.amount_total);
  }
  const piRef = session.payment_intent;
  if (!piRef) return null;
  const piObj =
    typeof piRef === 'object' && piRef !== null && 'amount' in piRef
      ? piRef
      : await stripe.paymentIntents.retrieve(typeof piRef === 'string' ? piRef : piRef.id);

  const n = piObj.amount_received ?? piObj.amount;
  return n != null ? Number(n) : null;
}

export class PaymentService {
  /**
   * Stripe fulfillment docs: webhook receives an event identifier — retrieve the full Checkout Session,
   * then check payment_status before fulfilling (https://docs.stripe.com/payments/checkout/fulfillment).
   * Also handles checkout.session.async_payment_succeeded for delayed payment methods.
   */
  static async fulfillCheckoutFromStripeEvent(eventType, sessionIdFromEvent) {
    if (
      eventType !== 'checkout.session.completed' &&
      eventType !== 'checkout.session.async_payment_succeeded'
    ) {
      return { ok: true, skipped: true, reason: 'event_type_not_handled' };
    }

    if (!sessionIdFromEvent || typeof sessionIdFromEvent !== 'string') {
      return { ok: false, reason: 'missing_session_id' };
    }

    const stripe = getStripe();
    let session = await stripe.checkout.sessions.retrieve(sessionIdFromEvent, {
      expand: ['payment_intent'],
    });

    /** Only credit wallet when Stripe reports a paid session (immediate card payments are usually `paid`). */
    if (session.payment_status !== 'paid') {
      return {
        ok: true,
        deferred: true,
        payment_status: session.payment_status,
        session_id: session.id,
      };
    }

    return PaymentService.completeTipFromRetrievedPaidSession(session);
  }

  /**
   * After `checkout.sessions.retrieve` with expanded payment intent, when payment_status === `paid`.
   * Resolves amount_total from PI if needed (per Stripe fulfillment guidance).
   */
  static async completeTipFromRetrievedPaidSession(session) {
    const stripe = getStripe();
    const amount = await amountTotalOrFromIntent(stripe, session);
    if (amount == null) {
      console.warn('[stripe] paid session missing amount_total and PI amount', session.id);
      return { ok: false, reason: 'missing_amount', session_id: session.id };
    }

    const ledgerSession = {
      id: session.id,
      metadata: session.metadata ?? {},
      payment_intent: session.payment_intent,
      amount_total: amount,
    };

    return PaymentService.completeTipFromCheckoutSession(ledgerSession);
  }

  /**
   * Applies wallet + ledger update for a paid Checkout Session (webhook + manual sync).
   * Idempotent: completes at most once per pending row keyed by checkout session id.
   */
  static async completeTipFromCheckoutSession(session) {
    const creatorIdStr = session.metadata?.creatorId;
    if (!creatorIdStr || !mongoose.Types.ObjectId.isValid(creatorIdStr)) {
      return { ok: false, reason: 'invalid_creator_metadata' };
    }

    const creatorOid = new mongoose.Types.ObjectId(creatorIdStr);
    const amount = session.amount_total;
    if (amount == null) {
      return { ok: false, reason: 'missing_amount' };
    }

    const paymentIntentId = paymentIntentIdFromSession(session);
    const setFields = { status: 'completed' };
    if (paymentIntentId) {
      setFields.stripePaymentId = paymentIntentId;
    }

    const updated = await Transaction.findOneAndUpdate(
      { stripePaymentId: session.id, status: 'pending' },
      { $set: setFields },
      { new: true }
    );

    if (updated) {
      await User.findByIdAndUpdate(creatorOid, {
        $inc: { walletBalance: amount },
      });

      if (global.io) {
        global.io.to(String(creatorOid)).emit('wallet_update', {
          message: 'Payment received',
          amount,
        });
      }

      return { ok: true, applied: true };
    }

    const alreadyDone = await Transaction.findOne({
      status: 'completed',
      $or: [
        { stripePaymentId: session.id },
        ...(paymentIntentId ? [{ stripePaymentId: paymentIntentId }] : []),
      ],
    });

    if (alreadyDone) {
      return { ok: true, applied: false, reason: 'already_completed' };
    }

    return { ok: false, reason: 'no_pending_row', sessionStripeId: session.id };
  }

  /**
   * After redirect from Stripe Checkout: confirm payment server-side when webhooks fail in dev.
   */
  static async syncCheckoutSessionForUser(sessionId, userId) {
    const stripe = getStripe();

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });
    } catch (e) {
      throw new AppError(
        `Could not retrieve Stripe session: ${e.message || 'unknown error'}`,
        400
      );
    }

    const senderId = session.metadata?.senderId ? String(session.metadata.senderId) : '';
    const creatorId = session.metadata?.creatorId ? String(session.metadata.creatorId) : '';
    const uid = String(userId);
    if (uid !== senderId && uid !== creatorId) {
      throw new AppError('Not allowed to finalize this checkout session', 403);
    }

    if (session.payment_status !== 'paid') {
      throw new AppError(`Checkout not paid yet (payment_status=${session.payment_status})`, 400);
    }

    const result = await PaymentService.completeTipFromRetrievedPaidSession(session);

    if (result.applied) {
      return { finalized: true, message: 'Tip credited to creator' };
    }

    if (result.ok && result.reason === 'already_completed') {
      return { finalized: false, message: 'Tip was already recorded' };
    }

    if (result.reason === 'no_pending_row') {
      throw new AppError(
        'No pending tip row for this session. Create checkout from ClipSphere again, or wait for webhook processing.',
        404
      );
    }

    throw new AppError(`Could not finalize checkout: ${result.reason || 'unknown'}`, 500);
  }

  static async createCheckoutSession({ senderId, creatorId, amount, currency, videoId }) {
    if (String(senderId) === String(creatorId)) {
      throw new AppError('You cannot tip yourself', 400);
    }

    const creator = await User.findById(creatorId).select('_id username');
    if (!creator) {
      throw new AppError('Creator not found', 404);
    }

    const stripe = getStripe();
    const base = clientBase();

    const cancelUrl = videoId
      ? `${base}/video/${videoId}`
      : `${base}/`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: `Tip for @${creator.username}`,
              description: 'ClipSphere creator tip',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/creator/wallet?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        creatorId: String(creatorId),
        senderId: String(senderId),
      },
    });

    await Transaction.create({
      amount,
      sender: senderId,
      recipient: creatorId,
      stripePaymentId: session.id,
      status: 'pending',
    });

    return { url: session.url, sessionId: session.id };
  }

  static async getMyTransactions(userId, { page, limit, role }) {
    const skip = (page - 1) * limit;
    const uid = new mongoose.Types.ObjectId(userId);

    const match =
      role === 'recipient'
        ? { recipient: uid }
        : role === 'sender'
          ? { sender: uid }
          : { $or: [{ sender: uid }, { recipient: uid }] };

    const [items, total] = await Promise.all([
      Transaction.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'username avatarKey')
        .populate('recipient', 'username avatarKey')
        .lean(),
      Transaction.countDocuments(match),
    ]);

    return {
      transactions: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  static async getMySummary(userId) {
    const user = await User.findById(userId).select('walletBalance username');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const pendingAgg = await Transaction.getPendingBalanceByCreator(userId);
    const pendingRow =
      Array.isArray(pendingAgg) && pendingAgg.length > 0 ? pendingAgg[0] : null;

    return {
      walletBalanceCents: user.walletBalance ?? 0,
      pendingTipsCents: pendingRow?.totalPendingBalance ?? 0,
      pendingTransactionCount: pendingRow?.transactionCount ?? 0,
    };
  }
}
