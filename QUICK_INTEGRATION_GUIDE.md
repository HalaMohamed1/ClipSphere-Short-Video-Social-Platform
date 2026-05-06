# Quick Integration Guide - Socket.io for Controllers

## For Person 2: Like System + Engagement UI

### 1. Update Like Controller

```javascript
// src/controllers/likeController.js
import { catchAsync } from '../utils/catchAsync.js';
import Like from '../db_core/models/Like.js';
import Video from '../db_core/models/Video.js';
import { emitNewLikeEvent } from '../utils/engagementEmitter.js';
import { io } from '../index.js'; // Import io instance

export const createLike = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  // Check if already liked
  const existingLike = await Like.findOne({ user: userId, video: videoId });
  if (existingLike) {
    return res.status(400).json({
      status: 'fail',
      message: 'You have already liked this video',
    });
  }

  // Create like
  const like = await Like.create({
    user: userId,
    video: videoId,
  });

  // Get video with owner
  const video = await Video.findById(videoId).populate('owner', 'username email');

  // ✅ EMIT LIKE EVENT TO VIDEO OWNER
  emitNewLikeEvent(
    io,
    video.owner._id,              // Recipient (video owner)
    userId,                        // Sender (who liked)
    req.user.username,            // Sender username
    videoId,                       // Video ID
    video.title                    // Video title
  );

  // Increment video like count if tracking
  await Video.findByIdAndUpdate(videoId, {
    $inc: { likesCount: 1 },
  });

  res.status(201).json({
    status: 'success',
    data: like,
  });
});

export const deleteLike = catchAsync(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  const like = await Like.findOneAndDelete({
    user: userId,
    video: videoId,
  });

  if (!like) {
    return res.status(404).json({
      status: 'fail',
      message: 'Like not found',
    });
  }

  // Decrement like count
  await Video.findByIdAndUpdate(videoId, {
    $inc: { likesCount: -1 },
  });

  res.status(204).json({
    status: 'success',
  });
});
```

### 2. Update Review Controller (for comments)

```javascript
// src/controllers/reviewController.js
import { catchAsync } from '../utils/catchAsync.js';
import Review from '../db_core/models/Review.js';
import Video from '../db_core/models/Video.js';
import { emitNewCommentEvent } from '../utils/engagementEmitter.js';
import { io } from '../index.js';

export const createReview = catchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  // Check existing review
  const existingReview = await Review.findOne({
    user: userId,
    video: videoId,
  });

  if (existingReview) {
    return res.status(400).json({
      status: 'fail',
      message: 'You have already reviewed this video',
    });
  }

  // Create review
  const review = await Review.create({
    rating,
    comment,
    user: userId,
    video: videoId,
  });

  // Get video with owner
  const video = await Video.findById(videoId).populate('owner', 'username');

  // ✅ EMIT COMMENT EVENT TO VIDEO OWNER (if comment exists)
  if (comment) {
    emitNewCommentEvent(
      io,
      video.owner._id,              // Recipient
      userId,                        // Sender
      req.user.username,            // Sender username
      videoId,                       // Video ID
      video.title,                   // Video title
      comment                        // Comment text
    );
  }

  res.status(201).json({
    status: 'success',
    data: review,
  });
});
```

### 3. Frontend: Display Toast Notification

```javascript
// nextjs-frontend/components/NotificationToast.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useEngagementHub } from '@/hooks/useEngagementHub';

export default function NotificationToast() {
  const { notifications } = useEngagementHub(true);
  const [displayedToasts, setDisplayedToasts] = useState([]);

  useEffect(() => {
    if (notifications.length > displayedToasts.length) {
      const newNotification = notifications[0];
      setDisplayedToasts((prev) => [...prev, newNotification]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setDisplayedToasts((prev) =>
          prev.filter((notif) => notif.id !== newNotification.id)
        );
      }, 4000);
    }
  }, [notifications, displayedToasts.length]);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {displayedToasts.map((notification) => (
        <div
          key={notification.id}
          className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {notification.type === 'like' && '❤️'}
              {notification.type === 'comment' && '💬'}
              {notification.type === 'follow' && '👤'}
              {notification.type === 'tip' && '💰'}
            </span>
            <span>
              {notification.type === 'like' && `${notification.likerUsername} liked your video`}
              {notification.type === 'comment' && `${notification.commenterUsername} commented`}
              {notification.type === 'follow' && `${notification.followerUsername} followed you`}
              {notification.type === 'tip' && `${notification.senderUsername} tipped you $${notification.amount}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## For Person 3 & 4: Stripe & Webhooks

### 1. Update Webhook Controller

```javascript
// src/controllers/webhookController.js
import { catchAsync } from '../utils/catchAsync.js';
import Transaction from '../db_core/models/Transaction.js';
import User from '../db_core/models/User.js';
import { emitNewTipEvent } from '../utils/engagementEmitter.js';
import { io } from '../index.js';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout session completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Get metadata
      const { creatorId, senderId, senderUsername, videoId, videoTitle } = session.metadata;
      const amount = session.amount_total / 100; // Convert cents to dollars

      // Create transaction record
      const transaction = await Transaction.create({
        sender: senderId,
        recipient: creatorId,
        amount,
        stripePaymentId: session.payment_intent,
        status: 'completed',
      });

      // Update creator's wallet
      await User.findByIdAndUpdate(creatorId, {
        $inc: { 'wallet.pending': amount },
      });

      // ✅ EMIT TIP EVENT TO CREATOR
      emitNewTipEvent(
        io,
        creatorId,              // Recipient (creator)
        senderId,               // Sender
        senderUsername,         // Sender username
        amount,                 // Tip amount
        videoId,                // Video ID
        videoTitle              // Video title
      );

      console.log(`✅ Tip processed: $${amount} from ${senderUsername} to creator`);
    } catch (error) {
      console.error('Error processing tip:', error);
    }
  }

  res.json({ received: true });
});
```

### 2. Create Transaction Model

```javascript
// src/db_core/models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    stripePaymentId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
```

### 3. Create Transaction History API

```javascript
// src/routes/transactionRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { getTransactions, getBalance } from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect); // Require authentication

router.get('/', getTransactions);
router.get('/balance', getBalance);

export default router;
```

```javascript
// src/controllers/transactionController.js
import { catchAsync } from '../utils/catchAsync.js';
import Transaction from '../db_core/models/Transaction.js';
import User from '../db_core/models/User.js';

export const getTransactions = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;

  const filter = { recipient: userId };
  if (status) filter.status = status;

  const transactions = await Transaction.find(filter)
    .populate('sender', 'username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Transaction.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      transactions,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: page,
    },
  });
});

export const getBalance = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      pending: user.wallet?.pending || 0,
      available: user.wallet?.available || 0,
      total: (user.wallet?.pending || 0) + (user.wallet?.available || 0),
    },
  });
});
```

---

## Testing the Integration

### 1. Test Like Event
```bash
curl -X POST http://localhost:5000/api/v1/videos/{videoId}/likes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Check Socket Connection
Open browser console:
```javascript
getSocket().connected  // Should be true
getSocket().id         // Should show socket ID
```

### 3. Verify Badge Updates
```javascript
const { unreadCount, hasUnread } = useEngagementHub(true);
console.log(unreadCount, hasUnread);
```

### 4. Test Activity Page
Navigate to `http://localhost:3000/activity` - should show notifications

---

## Summary

**What Person 1 provided:**
- ✅ Socket.io infrastructure
- ✅ Personalized rooms (automatic)
- ✅ Engagement event emitters
- ✅ Frontend badge + notifications
- ✅ Zod validation schemas
- ✅ Security (Helmet + CORS)

**What you need to do:**
- [ ] Call emitter functions from your controllers
- [ ] Pass correct user IDs and metadata
- [ ] Test that events are emitted
- [ ] Display toasts/notifications on frontend
