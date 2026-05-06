# Phase 3: Socket.io Infrastructure & Engagement Hub Documentation

## Overview

Person 1 has implemented a complete Socket.io infrastructure with personalized socket rooms, JWT authentication, and a global engagement hub with notification badges. This document explains how to use these features.

## Backend Setup

### 1. Socket.io Configuration

Socket.io is initialized in `src/index.js` with:
- JWT authentication on connection
- Personalized socket rooms (one per user ID)
- CORS configured for local development
- Helmet.js security headers
- Rate limiting on API routes

### 2. Personalized Socket Rooms

Each authenticated user automatically joins a private room with their user ID:
```javascript
socket.join(userId)
```

This ensures notifications only reach the intended recipient.

### 3. Emitting Engagement Events

Use the engagement emitter utilities in `src/utils/engagementEmitter.js` to emit events from controllers:

#### From Like Controller (Person 2)
```javascript
import { emitNewLikeEvent } from '../utils/engagementEmitter.js';
import { io } from '../index.js';

// In likeController.js
export const createLike = catchAsync(async (req, res, next) => {
  // ... like creation logic ...
  
  // Get video owner
  const video = await Video.findById(req.params.videoId).populate('owner');
  
  // Emit to video owner
  emitNewLikeEvent(
    io,
    video.owner._id,
    req.user.id,
    req.user.username,
    video._id,
    video.title
  );
  
  res.status(201).json({ status: 'success', data: like });
});
```

#### From Comment Controller (Person 2)
```javascript
import { emitNewCommentEvent } from '../utils/engagementEmitter.js';

export const createComment = catchAsync(async (req, res, next) => {
  // ... comment creation logic ...
  
  const video = await Video.findById(req.params.videoId).populate('owner');
  
  emitNewCommentEvent(
    io,
    video.owner._id,
    req.user.id,
    req.user.username,
    video._id,
    video.title,
    req.body.text
  );
  
  res.status(201).json({ status: 'success', data: comment });
});
```

#### From Tip/Webhook Handler (Person 3/4)
```javascript
import { emitNewTipEvent } from '../utils/engagementEmitter.js';

export const handleStripeWebhook = catchAsync(async (req, res) => {
  // ... webhook processing ...
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const creatorId = session.metadata.creatorId;
    
    emitNewTipEvent(
      io,
      creatorId,
      session.metadata.senderId,
      session.metadata.senderUsername,
      session.amount_total / 100,
      session.metadata.videoId,
      session.metadata.videoTitle
    );
  }
});
```

#### From Follow Controller
```javascript
import { emitNewFollowerEvent } from '../utils/engagementEmitter.js';

export const followUser = catchAsync(async (req, res) => {
  // ... follow logic ...
  
  emitNewFollowerEvent(
    io,
    req.params.userId,
    req.user.id,
    req.user.username
  );
  
  res.status(201).json({ status: 'success', data: follower });
});
```

## Frontend Implementation

### 1. Socket Service

Located in `nextjs-frontend/lib/socketService.js`:

```javascript
import { initializeSocket, getSocket, closeSocket } from '@/lib/socketService';

// Initialize connection (automatically done in useEngagementHub hook)
const socket = initializeSocket(token);

// Get existing connection
const socket = getSocket();

// Close connection
closeSocket();
```

### 2. Engagement Hub Hook

Located in `nextjs-frontend/hooks/useEngagementHub.js`:

```javascript
import { useEngagementHub } from '@/hooks/useEngagementHub';

export default function MyComponent() {
  const { 
    notifications,      // Array of engagement notifications
    hasUnread,          // Boolean: has unread notifications
    unreadCount,        // Number: count of unread notifications
    isLoading,          // Boolean: loading state
    error,              // String: error message if any
    clearNotifications, // Function: clear all notifications
    markAsRead,         // Function: mark specific notification as read
    removeNotification, // Function: remove specific notification
  } = useEngagementHub(shouldConnect); // shouldConnect defaults to !!user
}
```

### 3. Notification Badge

Located in `nextjs-frontend/components/NotificationBadge.tsx`:

```javascript
import { ActivityIcon } from '@/components/NotificationBadge';

export default function MyNav() {
  const { hasUnread, unreadCount } = useEngagementHub(!!user);
  
  return (
    <ActivityIcon 
      unreadCount={unreadCount} 
      hasUnread={hasUnread}
      onClick={() => router.push('/activity')}
    />
  );
}
```

The badge shows:
- Red animated dot when there are unread notifications
- Badge with count (e.g., "5", "99+") when unreadCount > 0

### 4. Activity Page

Located in `nextjs-frontend/app/activity/page.tsx`:

Shows all engagement notifications with:
- Notification type icon (❤️ like, 💬 comment, 👤 follow, 💰 tip)
- Message describing the engagement
- Timestamp of the event
- Clickable to navigate to related content
- Clear all button to dismiss notifications

## Notification Types

### 1. New Like
```javascript
{
  type: 'like',
  likerId: 'user_id',
  likerUsername: 'username',
  videoId: 'video_id',
  videoTitle: 'Video Title',
  timestamp: Date
}
```

### 2. New Comment
```javascript
{
  type: 'comment',
  commenterId: 'user_id',
  commenterUsername: 'username',
  videoId: 'video_id',
  videoTitle: 'Video Title',
  message: 'comment text',
  timestamp: Date
}
```

### 3. New Follower
```javascript
{
  type: 'follow',
  followerId: 'user_id',
  followerUsername: 'username',
  timestamp: Date
}
```

### 4. New Tip
```javascript
{
  type: 'tip',
  senderId: 'user_id',
  senderUsername: 'username',
  amount: 25.00,
  videoId: 'video_id',
  videoTitle: 'Video Title',
  timestamp: Date
}
```

## Zod Validation Schemas

Located in `src/validators/phase3Validator.js`:

Available schemas:
- `tipPaymentSchema` - Validate tip/payment data
- `engagementNotificationSchema` - Validate notification structure
- `notificationPreferenceSchema` - User notification preferences
- `reviewSubmissionSchema` - Review/rating data
- `likeActionSchema` - Like action data
- `commentActionSchema` - Comment action data
- `followActionSchema` - Follow action data

Example usage in middleware:
```javascript
import { validateRequest, tipPaymentSchema } from '../validators/phase3Validator.js';

router.post('/tips', validateRequest(tipPaymentSchema), tipController);
```

## Security & Best Practices

1. **JWT Authentication**: All socket connections require valid JWT tokens
2. **Personalized Rooms**: Events are only emitted to specific user rooms, not broadcast
3. **Helmet.js**: Security headers are applied to all HTTP responses
4. **CORS**: Configured for local development (http://localhost:3000)
5. **Rate Limiting**: Applied to all API routes to prevent abuse

## Testing Socket Connections

### Using Postman WebSocket
1. Connect to `ws://localhost:5000` with token in auth
2. Watch for `new-like`, `new-comment`, `new-follower`, `new-tip` events

### Using Browser Console
```javascript
// Get unread count
const { unreadCount } = useEngagementHub(true);
console.log(unreadCount);

// Check socket connection
const socket = getSocket();
console.log(socket.connected);
```

## Integration Checklist for Team Members

- [ ] Person 2 (Like System): Import and use `emitNewLikeEvent` in likeController
- [ ] Person 2 (Like System): Import and use `emitNewCommentEvent` in reviewController
- [ ] Person 2 (Comments): Update review component to show real-time updates
- [ ] Person 3 (Stripe): Import and use `emitNewTipEvent` in webhookController
- [ ] Person 4 (Webhooks): Ensure webhook handler emits tip events
- [ ] All: Test notification badge appears when events are emitted
- [ ] All: Test notifications clear when visiting activity page

## Troubleshooting

### Socket not connecting
- Check JWT token in browser cookies
- Verify Socket.io is listening on port 5000
- Check browser console for connection errors

### Notifications not appearing
- Verify event is being emitted with correct user ID
- Check that socket connection is established (console: `getSocket().connected`)
- Ensure notification listeners are set up in useEngagementHub

### Badge not updating
- Verify unreadCount state is being updated
- Check that clearNotifications is being called on activity page visit
- Ensure Navbar is re-rendering when state changes

## Files Created/Modified by Person 1

### Backend
- `src/middleware/socketAuth.js` - Socket.io JWT authentication
- `src/db_core/socketEvents.js` - Socket event handlers and utilities
- `src/validators/phase3Validator.js` - Zod validation schemas for Phase 3
- `src/utils/engagementEmitter.js` - Utility functions for controllers
- `src/index.js` - Updated with Socket.io, Helmet.js, improved CORS
- `package.json` - Added socket.io and helmet dependencies

### Frontend
- `nextjs-frontend/lib/socketService.js` - Socket.io client initialization
- `nextjs-frontend/lib/tokenUtils.js` - JWT token utilities
- `nextjs-frontend/hooks/useEngagementHub.js` - Engagement notifications hook
- `nextjs-frontend/components/NotificationBadge.tsx` - Badge component
- `nextjs-frontend/app/activity/page.tsx` - Activity/notifications page
- `nextjs-frontend/components/Navbar.tsx` - Updated with badge integration
- `nextjs-frontend/package.json` - Added socket.io-client and zod dependencies
