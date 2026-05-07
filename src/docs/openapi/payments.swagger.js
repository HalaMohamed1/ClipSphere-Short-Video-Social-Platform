/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Stripe tipping, wallet summary, and transaction history
 */

/**
 * @swagger
 * /api/v1/payments/create-checkout-session:
 *   post:
 *     summary: Create a Stripe Checkout session for a one-time tip (cents)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creatorId
 *               - amount
 *             properties:
 *               creatorId:
 *                 type: string
 *                 description: Mongo ObjectId of the creator receiving the tip
 *               amount:
 *                 type: integer
 *                 description: Amount in cents (minimum 50 for USD)
 *               currency:
 *                 type: string
 *                 default: usd
 *               videoId:
 *                 type: string
 *                 description: Optional — used for cancel redirect to /video/:id
 *     responses:
 *       200:
 *         description: Session created; redirect the browser to data.url
 *       400:
 *         description: Validation error or self-tip
 *       503:
 *         description: Stripe not configured
 */

/**
 * @swagger
 * /api/v1/payments/sync-checkout-session:
 *   post:
 *     summary: Finalize a tip after Stripe Checkout redirect (fallback if webhook misses local dev)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Stripe Checkout Session id from success URL (?session_id=…)
 *     responses:
 *       200:
 *         description: Ledger synced or already finalized
 */

/**
 * @swagger
 * /api/v1/payments/me/transactions:
 *   get:
 *     summary: List my tip transactions (sent and/or received)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [all, recipient, sender]
 *           default: all
 *     responses:
 *       200:
 *         description: Paginated transaction list
 */

/**
 * @swagger
 * /api/v1/payments/me/summary:
 *   get:
 *     summary: Wallet balance (cents) and pending tips total for the current user as recipient
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary
 */

export {};
