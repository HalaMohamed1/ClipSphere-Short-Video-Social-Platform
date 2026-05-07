# ClipSphere - Complete Testing Guide
**Version 1.0 | May 7, 2026**

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- MongoDB running locally (mongodb://localhost:27017/clipsphere)
- Docker & Docker Compose (for MinIO)
- FFmpeg installed (`brew install ffmpeg` on macOS, `choco install ffmpeg` on Windows)
- Stripe CLI (for webhook testing)

### Environment Setup

#### 1. Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd nextjs-frontend && npm install && cd ..
```

#### 2. Start MongoDB
```bash
# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:5

# Or if installed locally
mongod
```

#### 3. Start MinIO (Local S3 Storage)
```bash
docker-compose up -d minio minio-init
# Access console at: http://localhost:9001
# Default credentials: minioadmin / minioadmin123
```

#### 4. Start Backend Server
```bash
npm start
# Server runs on http://localhost:5000
# Swagger docs at http://localhost:5000/api-docs
```

#### 5. Start Frontend Server
```bash
cd nextjs-frontend && npm run dev
# Frontend runs on http://localhost:3000
```

#### 6. (Optional) Setup Stripe Testing
```bash
# Install Stripe CLI
curl https://files.stripe.com/stripe-cli/install.sh | sh

# Login to your Stripe account
stripe login

# Forward webhooks locally
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe
# Copy the signing secret and add to .env as STRIPE_WEBHOOK_SECRET
```

---

## PHASE 1 - Backend Testing

### Test 1.1: Server Health Check
**Endpoint**: `GET /health`
**Expected**: 200 OK with server status

```bash
curl http://localhost:5000/health
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2026-05-07T10:00:00.000Z"
}
```

### Test 1.2: User Registration
**Endpoint**: `POST /api/v1/auth/register`

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "test1@example.com",
    "password": "Test1234"
  }'
```

**Validation Checks**:
- ✅ Username must be 3-30 characters, alphanumeric + underscore/dash
- ✅ Email must be valid format
- ✅ Password must be 8+ characters with uppercase, lowercase, and number
- ❌ Should reject if email already exists

**Expected Response** (201):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "testuser1",
      "email": "test1@example.com",
      "role": "user",
      "active": true
    },
    "token": "eyJhbGc..."
  }
}
```

### Test 1.3: User Login
**Endpoint**: `POST /api/v1/auth/login`

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test1@example.com",
    "password": "Test1234"
  }'
```

**Validation Checks**:
- ✅ Password must match hashed password in DB
- ✅ JWT token with 24h expiration
- ✅ Token set in httpOnly cookie

**Expected Response** (200):
```json
{
  "status": "success",
  "message": "Logged in successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### Test 1.4: Get Current User (Protected Route)
**Endpoint**: `GET /api/v1/users/me`

```bash
# With token from login (cookie stored)
curl -b cookies.txt http://localhost:5000/api/v1/users/me

# Or with Bearer token
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/v1/users/me
```

**Validation Checks**:
- ✅ Returns 401 without token
- ✅ Returns user data with valid token
- ✅ Password field not included in response

**Expected Response** (200):
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "username": "testuser1",
      "email": "test1@example.com",
      "role": "user"
    }
  }
}
```

### Test 1.5: Follow User
**Endpoint**: `POST /api/v1/users/:targetId/follow`

```bash
# First create a second user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "Test1234"
  }'

# Then follow them (replace <targetId> with user2's ID)
curl -X POST http://localhost:5000/api/v1/users/<targetId>/follow \
  -b cookies.txt \
  -H "Content-Type: application/json"
```

**Validation Checks**:
- ✅ Cannot follow yourself (400 error)
- ✅ Can follow a different user
- ✅ Duplicate follows prevented by unique index
- ✅ Returns 401 without authentication

**Expected Response** (201):
```json
{
  "status": "success",
  "message": "User followed successfully"
}
```

### Test 1.6: Video Upload with Duration Validation
**Endpoint**: `POST /api/v1/videos`

```bash
# Create a test video file first (or use existing)
curl -X POST http://localhost:5000/api/v1/videos \
  -b cookies.txt \
  -F "file=@path/to/video.mp4" \
  -F "title=Test Video" \
  -F "description=This is a test video"
```

**Validation Checks**:
- ✅ Rejects video > 300 seconds (5 minutes)
- ✅ Validates MIME type (video/mp4)
- ✅ Generates FFmpeg thumbnail
- ✅ Stores in MinIO with presigned URL
- ✅ Saves metadata to MongoDB

**Expected Response** (201):
```json
{
  "status": "success",
  "data": {
    "video": {
      "_id": "...",
      "title": "Test Video",
      "description": "This is a test video",
      "owner": "...",
      "videoUrl": "...",
      "duration": 60,
      "status": "public",
      "views": 0
    }
  }
}
```

### Test 1.7: Get Video Feed
**Endpoint**: `GET /api/v1/videos?limit=10&skip=0`

```bash
curl http://localhost:5000/api/v1/videos
```

**Validation Checks**:
- ✅ Returns paginated results
- ✅ Only returns public videos
- ✅ Includes video owner info
- ✅ Includes review average rating

**Expected Response** (200):
```json
{
  "status": "success",
  "data": {
    "videos": [
      {
        "_id": "...",
        "title": "Test Video",
        "description": "...",
        "owner": { "_id": "...", "username": "..." },
        "duration": 60,
        "views": 0,
        "rating": 4.5,
        "reviewCount": 2
      }
    ],
    "total": 1,
    "page": 0
  }
}
```

### Test 1.8: Admin Statistics
**Endpoint**: `GET /api/v1/admin/stats` (Admin Only)

```bash
# Create an admin user (manually set role in MongoDB)
# mongo clipsphere
# db.users.updateOne({ _id: ObjectId("...") }, { $set: { role: "admin" } })

curl -b cookies.txt http://localhost:5000/api/v1/admin/stats
```

**Validation Checks**:
- ✅ Returns 403 for non-admin users
- ✅ Returns 401 without token
- ✅ Uses MongoDB aggregation pipelines
- ✅ Shows total users, videos, tips

**Expected Response** (200):
```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalUsers": 2,
      "totalVideos": 1,
      "totalTips": 0,
      "mostActiveUsers": [
        { "username": "testuser1", "videoCount": 1, "likeCount": 0 }
      ],
      "uptime": 3600,
      "memory": { "rss": "...", "heapUsed": "..." }
    }
  }
}
```

### Test 1.9: Submit Review
**Endpoint**: `POST /api/v1/videos/:videoId/reviews`

```bash
curl -X POST http://localhost:5000/api/v1/videos/<videoId>/reviews \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "text": "Amazing video!"
  }'
```

**Validation Checks**:
- ✅ Rating must be 1-5
- ✅ Prevents duplicate reviews from same user
- ✅ Enforces 401 authentication
- ✅ Uses unique compound index

**Expected Response** (201):
```json
{
  "status": "success",
  "data": {
    "review": {
      "_id": "...",
      "rating": 5,
      "text": "Amazing video!",
      "userId": "...",
      "videoId": "...",
      "createdAt": "2026-05-07T10:00:00.000Z"
    }
  }
}
```

### Test 1.10: Swagger Documentation
**URL**: `http://localhost:5000/api-docs`

**Validation Checks**:
- ✅ Page loads without errors
- ✅ All endpoints documented
- ✅ JWT Bearer authentication configured
- ✅ "Try it out" feature works for protected routes

---

## PHASE 2 - Frontend Testing

### Test 2.1: Homepage Loads
**URL**: `http://localhost:3000`

**Validation Checks**:
- ✅ Page loads without JavaScript errors
- ✅ Feed displays placeholder skeletons
- ✅ Navigation bar visible
- ✅ CSS loads correctly (no font warnings)

### Test 2.2: Registration Page
**URL**: `http://localhost:3000/register`

**Steps**:
1. Enter username: `frontendtest`
2. Enter email: `frontend@test.com`
3. Enter password: `FrontendTest123`
4. Click Sign Up

**Validation Checks**:
- ✅ Form validates locally (password strength, email format)
- ✅ Submits to `/api/v1/auth/register`
- ✅ Redirects to homepage on success
- ✅ User appears in database

### Test 2.3: Login & Session Persistence
**URL**: `http://localhost:3000/login`

**Steps**:
1. Enter email and password
2. Click Login
3. Refresh page (F5)

**Validation Checks**:
- ✅ User remains logged in after refresh
- ✅ JWT stored in httpOnly cookie
- ✅ useAuth hook successfully loads user on mount
- ✅ Socket.io connects when authenticated

### Test 2.4: Video Upload
**URL**: `http://localhost:3000/upload`

**Steps**:
1. Select a video file (must be < 300s)
2. Enter title and description
3. Click Upload

**Validation Checks**:
- ✅ Validates video duration before upload
- ✅ Shows progress bar during upload
- ✅ Generates thumbnail from video
- ✅ Redirects to video detail page on success
- ✅ Video appears in feed immediately

**Note**: If video > 300s, should show error: "Video must be less than 5 minutes"

### Test 2.5: Video Feed & Infinite Scroll
**URL**: `http://localhost:3000`

**Steps**:
1. Homepage shows feed of videos
2. Scroll to bottom of page
3. More videos load automatically

**Validation Checks**:
- ✅ Feed displays video cards
- ✅ Each card shows: thumbnail, title, creator, views, rating
- ✅ Infinite scroll triggers at bottom (Intersection Observer)
- ✅ Pagination works (limit=10, skip increases)
- ✅ No "loading" state stalls

### Test 2.6: Video Detail & Player
**URL**: `http://localhost:3000/video/[videoId]`

**Steps**:
1. Click on a video in feed
2. Video player loads
3. Play/pause/volume controls work
4. Fullscreen works

**Validation Checks**:
- ✅ HTML5 player displays correctly
- ✅ Video streams from MinIO presigned URL
- ✅ Duration overlay shows
- ✅ Comments/reviews section loads
- ✅ Star rating component visible

### Test 2.7: Follow User from Video Detail
**Steps**:
1. Navigate to a video detail page
2. Find "Follow" button below video
3. Click Follow
4. Check user's profile page

**Validation Checks**:
- ✅ Button changes to "Unfollow" after click
- ✅ User added to followers list in DB
- ✅ Socket.io emits `new-follower` event
- ✅ Creator sees notification badge update

### Test 2.8: Submit Review & Rating
**Steps**:
1. On video detail page, scroll to reviews
2. Click stars to rate (1-5)
3. Enter review text
4. Click Submit

**Validation Checks**:
- ✅ Star rating component works
- ✅ Form validates (rating 1-5, text required)
- ✅ Review appears immediately (optimistic update)
- ✅ Video average rating updates
- ✅ Duplicate reviews prevented (error message)

### Test 2.9: Admin Dashboard
**URL**: `http://localhost:3000/admin`

**Prerequisites**: User must have admin role

**Validation Checks**:
- ✅ Page loads if user is admin
- ✅ Shows total users, videos, tips
- ✅ Shows most active users list
- ✅ Shows system health metrics
- ✅ Returns 403 Forbidden if not admin

### Test 2.10: Settings & Notification Preferences
**URL**: `http://localhost:3000/settings`

**Steps**:
1. Toggle notification preferences on/off
2. Select channels (In-app, Email)
3. Click Save

**Validation Checks**:
- ✅ Form loads with current preferences
- ✅ Toggles update UI immediately
- ✅ PATCH request sent to `/users/preferences`
- ✅ Success message shown
- ✅ Preferences persisted in DB

---

## PHASE 3 - Real-Time & Socket.io Testing

### Test 3.1: Socket Connection
**How to Check**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Should see: `[Socket.IO] Connected to server: <socket-id>`

**Expected Behavior**:
- ✅ Socket connects automatically when user logs in
- ✅ Socket disconnects when user logs out
- ✅ Auto-reconnects if connection drops
- ✅ Joins user's personal room: `user_<userId>`

### Test 3.2: Live Like Notifications
**How to Test**:
1. User A: Open a video detail page
2. User B: Open different browser, login
3. User B: Like User A's video
4. User A: Should see toast notification slide in from top-right

**Toast Content**:
- "Username liked your video 'Video Title'"
- Red dot appears on Activity icon in navbar
- Badge count increments

**Expected Behavior**:
- ✅ Notification appears in < 1 second
- ✅ Toast auto-dismisses after 5 seconds
- ✅ Multiple likes show separate toasts
- ✅ Badge persists until Activity page visited

### Test 3.3: Real-Time Badge Updates
**How to Test**:
1. User A: Open homepage, look at navbar
2. User B: Follow/like/comment on User A's content
3. User A: Should see red dot on Activity icon

**Expected Behavior**:
- ✅ Badge appears immediately
- ✅ Badge count increases (max "99+")
- ✅ Persists across page navigation
- ✅ Clears when Activity page clicked

### Test 3.4: Activity Page
**URL**: `http://localhost:3000/activity`

**How to Test**:
1. Generate some notifications (likes, follows, comments)
2. Open Activity page
3. Should see engagement feed

**Expected Content**:
- Recent likes (username, video, timestamp)
- Recent follows (username, timestamp)
- Recent comments (username, comment preview, video, timestamp)
- Recent tips (username, amount, timestamp)

**Expected Behavior**:
- ✅ Displays in reverse chronological order
- ✅ Clicking notification navigates to video/profile
- ✅ Badge clears when page loaded
- ✅ Updates in real-time as new notifications arrive

### Test 3.5: Stripe Checkout (Tip Feature)
**Prerequisites**: Stripe test keys in .env, Stripe CLI webhook listening

**How to Test**:
1. Open video detail page
2. Find "Tip Creator" button
3. Click to open Stripe checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Enter any future date and CVC

**Expected Flow**:
- ✅ Checkout modal opens
- ✅ Shows amount and creator info
- ✅ Form validates required fields
- ✅ Upon payment, success page shown
- ✅ Creator sees "new-tip" notification
- ✅ Wallet balance updated in DB
- ✅ Transaction recorded in DB

**Stripe Test Cards**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`

### Test 3.6: Webhook Processing
**How to Test** (with Stripe CLI):
```bash
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe
# Copy signing secret, add to .env
```

1. Make a test payment through checkout
2. Check terminal for webhook logs
3. Verify in MongoDB that wallet balance updated

**Expected Behavior**:
- ✅ Webhook received with correct signature
- ✅ `checkout.session.completed` event processed
- ✅ User wallet updated
- ✅ `new-tip` event emitted to creator's socket room
- ✅ Transaction recorded with amount and status

---

## Performance & Load Testing

### Test P1: 100 Concurrent Users
```bash
# Using Apache Bench
ab -n 1000 -c 100 http://localhost:5000/api/v1/videos

# Expected: < 1% error rate, avg response time < 500ms
```

### Test P2: 10,000 Videos in Feed
1. Populate MongoDB with 10,000 test videos
2. Load homepage
3. Scroll through multiple pages
4. Check response times

**Expected Behavior**:
- ✅ Pagination prevents memory crash
- ✅ Response times consistent
- ✅ UI remains responsive

### Test P3: Large Video Upload
1. Upload video > 200MB
2. Monitor upload progress
3. Verify storage limits respected

**Expected Behavior**:
- ✅ Progress bar shows accurate percentage
- ✅ Upload completes without truncation
- ✅ File integrity verified

---

## Security Testing

### Test S1: SQL Injection Prevention
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin\" OR \"1\"=\"1",
    "password": "test"
  }'
```

**Expected**: 400 error (email validation fails) or 401 (invalid credentials)

### Test S2: NoSQL Injection Prevention
```bash
# MongoDB uses express-mongo-sanitize
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@test.com",
    "password": "Test1234",
    "$ne": null
  }'
```

**Expected**: Invalid input error ($ characters sanitized)

### Test S3: CORS Policy
```bash
# From different domain
curl -H "Origin: http://malicious-site.com" \
  http://localhost:5000/api/v1/users/me
```

**Expected**: CORS error (origin not in whitelist)

### Test S4: JWT Expiration
1. Login and get token
2. Wait for expiration (or modify .env JWT_EXPIRE to 1s)
3. Try to use expired token

**Expected**: 401 Token Expired error

---

## Debugging Tips

### Common Issues

#### Frontend shows "API Error" but no details
**Solution**: Check browser DevTools Console for actual error, check backend logs

#### Video upload fails with "Validation error"
**Solutions**:
- Check FFmpeg is installed: `ffmpeg -version`
- Verify video duration < 300s: `ffprobe -show_format <video>`
- Check MinIO is running: `curl http://localhost:9000`
- Verify MINIO_ACCESS_KEY in .env is `minioadmin`

#### Socket.io not connecting
**Solutions**:
- Check browser console for connection errors
- Verify NEXT_PUBLIC_API_URL is correct in .env.local
- Backend should show `[Socket.IO] New client connected`
- Check CORS configuration in src/index.js

#### MongoDB connection timeout
**Solutions**:
- Verify MongoDB running: `mongo clipsphere`
- Check MONGODB_URI in .env
- Try: `mongod --dbpath /path/to/data`

#### "Port already in use" error
**Solutions**:
- Backend (5000): `lsof -i :5000` then `kill -9 <PID>`
- Frontend (3000): `lsof -i :3000` then `kill -9 <PID>`
- Change port in .env (PORT=5001) and update frontend .env.local

---

## Success Criteria

### Phase 1 Complete When
- ✅ All 10 backend tests pass
- ✅ Swagger UI loads and documents all endpoints
- ✅ No security warnings in OWASP scan

### Phase 2 Complete When
- ✅ All 10 frontend tests pass
- ✅ No console errors in browser DevTools
- ✅ Responsive design works on mobile/tablet/desktop

### Phase 3 Complete When
- ✅ All 6 real-time tests pass
- ✅ Socket.io connects and emits events
- ✅ Stripe payments process successfully
- ✅ Webhook updates database correctly

---

## Postman Collection

A Postman collection is available at: `ClipSphere-Person2.postman_collection.json`

**How to Import**:
1. Open Postman
2. Click Import
3. Select the collection file
4. Select environment: `ClipSphere-Person2.postman_environment.json`
5. Use the pre-configured requests to test all endpoints

**Environment Variables**:
- `BASE_URL`: http://localhost:5000/api/v1
- `TOKEN`: Auto-populated after login request
- `USER_ID`: Auto-populated from login response

---

## Final Verification Checklist

- [ ] All Phase 1 tests pass
- [ ] All Phase 2 tests pass
- [ ] All Phase 3 tests pass
- [ ] No console errors or warnings
- [ ] Swagger documentation loads
- [ ] Admin dashboard accessible
- [ ] Email notifications sending
- [ ] Stripe webhooks processing
- [ ] Socket.io events emitting
- [ ] Video upload and streaming working
- [ ] Database queries perform well
- [ ] Security headers present
- [ ] CORS properly configured

---

## Deployment Readiness

Once all tests pass:

1. **Database**: Backup MongoDB data, ensure indexes
2. **Environment**: Update .env for production
3. **Security**: Regenerate JWT_SECRET, update Stripe keys
4. **SSL**: Configure HTTPS certificates
5. **Monitoring**: Set up logging and alerting
6. **Backup**: Plan database backup strategy
7. **Documentation**: Finalize API documentation for clients

