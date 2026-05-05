import Stripe from 'stripe';
import { User } from '../db_core/models/User.js';
import { Transaction } from '../db_core/models/Transaction.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const creatorId = session.metadata.creatorId;
        const amount = session.amount_total;
        const stripePaymentId = session.payment_intent;

        try {
            await User.collection.updateOne(
                { _id: creatorId },
                { $inc: { walletBalance: amount } }
            );

            await Transaction.findOneAndUpdate(
                { stripePaymentId },
                { status: 'completed' }
            );

            if (global.io) {
                global.io.to(creatorId).emit('wallet_update', {
                    message: 'Payment received',
                    amount: amount
                });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Database update failed' });
        }
    }

    res.status(200).json({ received: true });
};
