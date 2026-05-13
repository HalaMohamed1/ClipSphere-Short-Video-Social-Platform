# ClipSphere API Documentation

This document covers all phases of the ClipSphere API, including Authentication, Video Management, Social Interactions, Payments, and Administration.

## Base URL
`http://localhost:5050/api/v1`

---

## 1. Authentication (Phase 1)

### POST `/auth/register`
Register a new user.
- **Body**: `{ username, email, password }`
- **Response**: `201 Created` with user data and token.

### POST `/auth/login`
Authenticate a user.
- **Body**: `{ email, password }`
- **Response**: `200 OK` with JWT token.

---

## 2. Video Management (Phase 2)

### POST `/videos/upload` (Multipart/form-data)
Upload a new video.
- **Field**: `video` (File, max 200MB, max 5 mins)
- **Field**: `title` (String)
- **Field**: `description` (String)
- **Response**: `201 Created`.
- **Note**: Triggers automatic thumbnail generation and MinIO storage.

### GET `/videos/public`
Retrieve public video feed.
- **Query Params**: `page`, `limit`, `category`, `search`, `feed` (discover|trending).
- **Response**: List of videos with metadata.

### GET `/videos/:id/stream`
Stream video content.
- **Headers**: Supports `Range` headers for seekable playback.

---

## 3. Social & Engagement (Phase 3)

### POST `/videos/:videoId/reviews`
Submit a review for a video.
- **Body**: `{ rating, comment }`
- **Response**: `201 Created`.
- **New Feature**: Updates the video's `trendingScore`.

### GET `/videos/following-feed`
Retrieve videos from users you follow.
- **Query Params**: `page`, `limit`.
- **Enhanced Logic**: Boosts followed users first, then sorts by trendingScore.

### POST `/users/:userId/follow`
Follow a user.

---

## 4. Payments (Phase 4)

### POST `/payments/create-checkout-session`
Initiate a Stripe payment for premium features.
- **Response**: `200 OK` with Stripe URL.

### POST `/webhooks/stripe`
Handle payment success events.
- **Note**: Handled automatically via `stripe-cli` forwarder.

---

## 5. Administration (Phase 5)

### GET `/admin/stats`
Retrieve platform-wide statistics.
- **Auth**: Requires `admin` role.

### PATCH `/admin/videos/:id/flag`
Flag a video for community guideline violations.
