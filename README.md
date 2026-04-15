# ClipSphere Backend - Person 2 (Sections 2 & 7)

## Overview
This is the implementation of **Section 2 (Secure Identity Management)** and **Section 7 (Admin Oversight & Analytics)** for the ClipSphere short video social platform.

## Project Structure

```
PERSON2/
├── src/
│   ├── controllers/
│   │   ├── authController.js       # Auth endpoints (register, login, profile)
│   │   └── adminController.js      # Admin endpoints (stats, moderation, health)
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect & restrictTo middleware
│   │   └── errorHandler.js         # Global error handling
│   ├── models/
│   │   └── User.js                 # User schema with validation
│   ├── routes/
│   │   ├── authRoutes.js           # /api/v1/auth routes
│   │   ├── userRoutes.js           # /api/v1/users routes
│   │   └── adminRoutes.js          # /api/v1/admin routes
│   ├── services/
│   │   ├── authService.js          # Auth business logic
│   │   └── adminService.js         # Admin business logic
│   ├── utils/
│   │   ├── appError.js             # Custom error class
│   │   ├── catchAsync.js           # Async error wrapper
│   │   └── database.js             # MongoDB connection
│   ├── validators/
│   │   └── authValidator.js        # Zod validation schemas
│   └── index.js                    # Server entry point
├── .env.example                    # Environment variables template
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Section 2: Secure Identity Management ✅

### Features Implemented

#### 1. **User Registration**

- **Endpoint**: `POST /api/v1/auth/register`
- **Validation**: Zod schema validation for username, email, password
- **Password Security**: Bcrypt hashing with salt factor 10
- **Email Uniqueness**: Enforced via MongoDB unique index
- **Response**: Returns user data and JWT token

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### 2. **User Login**

- **Endpoint**: `POST /api/v1/auth/login`
- **Authentication**: Validates email and password against hashed value
- **JWT Token**: 24-hour expiration token
- **Account Status**: Checks if user is active

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### 3. **Protect Middleware**

- **Middleware**: `protect` - Verifies JWT token
- **Verification**: Decodes token and confirms user still exists
- **Error Handling**: Handles expired/invalid tokens
- **Usage**: Applied to all protected routes

#### 4. **Get Current User Profile**

- **Endpoint**: `GET /api/v1/users/me`
- **Authentication**: Requires valid JWT (protect middleware)
- **Response**: Returns current user's complete profile

#### 5. **Update User Profile**

- **Endpoint**: `PATCH /api/v1/users/updateMe`
- **Fields**: Can update username, bio, avatarKey
- **Validation**: Zod schema prevents password/email changes
- **Uniqueness Check**: Verifies new username isn't already taken
- **Protection**: Prevents password and email updates through this endpoint

```json
{
  "username": "newusername",
  "bio": "My awesome bio",
  "avatarKey": "avatars/user123.jpg"
}
```

#### 6. **Get User Public Profile**

- **Endpoint**: `GET /api/v1/users/{id}`
- **Access**: Public (no authentication required)
- **Use Case**: View other users' profiles

#### 7. **Notification Preferences**

- **Endpoint**: `PATCH /api/v1/users/preferences`
- **Settings**:
  - **In-App Alerts**: followers, comments, likes, tips
  - **Email Alerts**: followers, comments, likes, tips
- **Nested Structure**: Organized under `notificationPreferences`
- **Granular Control**: Toggle each notification type individually

```json
{
  "notificationPreferences": {
    "inApp": {
      "followers": true,
      "comments": true,
      "likes": false,
      "tips": true
    },
    "email": {
      "followers": false,
      "comments": false,
      "likes": false,
      "tips": true
    }
  }
}
```

## Section 7: Admin Oversight & Analytics ✅

### Features Implemented

#### 1. **Admin Stats Aggregation**

- **Endpoint**: `GET /api/v1/admin/stats`
- **Protection**: `protect` + `restrictTo('admin')`
- **Using MongoDB Aggregation Pipeline**:
  - Total number of users
  - Count of active users
  - Users grouped by role (admin/user)
  - Most active users (signup order)
  - Total tips placeholder (Phase 3)

```json
{
  "totalUsers": 150,
  "activeUsers": 145,
  "usersByRole": [
    { "_id": "user", "count": 148 },
    { "_id": "admin", "count": 2 }
  ],
  "mostActiveUsers": [],
  "totalTips": 0
}
```

#### 2. **User Account Status Management**

- **Endpoint**: `PATCH /api/v1/admin/users/{id}/status`
- **Features**:
  - **Soft Delete**: Sets `active: false`
  - **Status Values**: active, suspended, flagged
  - **Use Case**: Admin ban hammer for violating users
  - **Reversible**: Can reactivate users

```json
{
  "status": "suspended",
  "active": false
}
```

#### 3. **Moderation Queue**

- **Endpoint**: `GET /api/v1/admin/moderation`
- **Query Parameters**:
  - `status`: flagged (default)
  - `limit`: 20 (default)
  - `skip`: 0 (default)
- **Returns**: All flagged/suspended/inactive users
- **Pagination Support**: Limit and skip parameters

#### 4. **Admin Health Check**

- **Endpoint**: `GET /api/v1/admin/health`
- **Metrics**:
  - Server uptime
  - Memory usage (heap used/total, external)
  - System memory (total/free)
  - Timestamp
- **Use Case**: Monitor system health and resource usage

## Technology Stack

### Core

- **Express.js** - REST API framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Document Mapper)

### Security

- **bcryptjs** - Password hashing (salt factor: 10)
- **jsonwebtoken** - JWT token generation & verification
- **express-mongo-sanitize** - NoSQL injection prevention
- **Zod** - Schema-based input validation

### Utilities

- **Morgan** - HTTP request logging
- **swagger-jsdoc** - API documentation generation
- **swagger-ui-express** - Interactive Swagger UI
- **dotenv** - Environment variable management

## Setup & Installation

### 1. Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Docker (optional, for local MinIO object storage and uploads)

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clipsphere
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
SERVER_URL=http://localhost:5000
```

Also set **S3 / MinIO** variables from `.env.example` (`S3_ENDPOINT`, `S3_PUBLIC_URL`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_VIDEOS`, `S3_BUCKET_THUMBNAILS`, upload limits) so uploads work when MinIO is running.

### 4. Start MongoDB

The API **exits if it cannot connect** to MongoDB. You need a server on **`localhost:27017`** (or change `MONGODB_URI`).

```bash
# Easiest: MongoDB in Docker (matches default MONGODB_URI in .env)
docker compose up -d mongodb

# Or install MongoDB locally and run:
mongod

# Or use MongoDB Atlas (set MONGODB_URI in .env)
```

### 5. Run Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start at: `http://localhost:5000`

To run **Express and Next.js together** (so the `/api` proxy always has a backend), from the repo root:

```bash
npm run dev:all
```

This starts the API first and waits until port **5000** accepts connections before starting Next (via `wait-on`), so you avoid immediate `ECONNREFUSED` proxy errors. **MongoDB must be running** or the API will never listen and `wait-on` will hang until it times out.

### 6. MinIO (Docker) and uploads

Object storage is **S3-compatible** via **MinIO**. From the repository root:

```bash
docker compose up -d
```

- **S3 API:** `http://127.0.0.1:9000` — **Console:** `http://127.0.0.1:9001`
- Default credentials are defined in `docker-compose.yml` (`MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`; defaults match `.env.example` for `S3_ACCESS_KEY` / `S3_SECRET_KEY`).
- The `minio-init` service creates buckets `clipsphere-videos` and `clipsphere-thumbnails`, applies **CORS** for local Next.js (`http://localhost:3000`), and sets **anonymous download** on those buckets so public URLs work in development.

**Viewing MongoDB and MinIO data**

- **Mongo Express** (started with the same `docker compose up -d`): [http://127.0.0.1:8081](http://127.0.0.1:8081) — browse databases, collections, and documents (e.g. `clipsphere`). Basic auth is disabled for local dev.
- **MinIO Console:** [http://127.0.0.1:9001](http://127.0.0.1:9001) — browse buckets and uploaded files using the MinIO root credentials from `docker-compose.yml`.

Upload endpoints (all require JWT unless noted otherwise):


| Method | Path                       | Description                                                                          |
| ------ | -------------------------- | ------------------------------------------------------------------------------------ |
| `POST` | `/api/v1/upload/presign`   | Returns a presigned **PUT** URL for direct browser → MinIO upload                    |
| `POST` | `/api/v1/upload/video`     | Multipart field `file` — **Multer** enforces video MIME types and `UPLOAD_MAX_BYTES` |
| `POST` | `/api/v1/upload/thumbnail` | Multipart field `file` — image types and `UPLOAD_THUMBNAIL_MAX_BYTES`                |


**Suggested order to run everything:** MongoDB → `docker compose up -d` (MinIO + Mongo Express) → backend `npm run dev` → Next.js (below).

### 7. Next.js frontend (upload test page)

```bash
cd nextjs-frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000/upload` to exercise multipart and presigned uploads. Log in via `POST /api/v1/auth/login`, then store the JWT in the browser as `localStorage.token` (see **Authentication Flow**). The upload page does not validate files in the frontend; the API enforces type and size.

The Express API uses **permissive CORS** (`Access-Control-Allow-Origin: *` in [`src/index.js`](src/index.js)) so any origin can call the API directly. For production, tighten this. The Next app can also use same-origin **`/api/v1/...`** with [`nextjs-frontend/next.config.mjs`](nextjs-frontend/next.config.mjs) rewrites; `NEXT_PUBLIC_API_URL=http://localhost:5000` is normalized to use the proxy in [`nextjs-frontend/lib/apiBase.ts`](nextjs-frontend/lib/apiBase.ts).

**If API calls fail:** confirm the backend is running in a **separate terminal** from the repo root (`npm run dev`). If Next logs **`Failed to proxy` … `ECONNREFUSED`**, nothing is listening on port 5000—usually the API never started (or MongoDB is down and the server exited). Check with `curl http://127.0.0.1:5000/health`. Set `NEXT_INTERNAL_API_URL` in `nextjs-frontend/.env.local` if the API uses a non-default host/port.

## API Documentation

### Interactive Swagger UI

Access the complete interactive API documentation:

```
http://localhost:5000/api-docs
```

Features:

- All endpoints with request/response schemas
- JWT Bearer authentication setup
- "Try it out" functionality for testing
- Parameter documentation

## Authentication Flow

### JWT Token Management

1. **Registration/Login**: Receive JWT token
2. **Store Token**: Save in client (localStorage/sessionStorage)
3. **Include in Requests**: Add to Authorization header
4. **Format**: `Authorization: Bearer <token>`
5. **Expiration**: 24 hours (configurable)

### Token Refresh (Future Phase)

- Currently: Implement token refresh endpoint
- Use refresh tokens for extended sessions

## Error Handling

### Global Error Middleware

Catches all errors and returns consistent JSON responses:

```json
{
  "status": "fail",
  "message": "Error description",
  "errors": [] // For validation errors
}
```

### Error Types Handled

- **Validation Errors** (400):
  - Zod validation failures
  - Mongoose schema validation
- **Authentication Errors** (401):
  - Invalid/expired JWT
  - Missing authentication token
- **Authorization Errors** (403):
  - Insufficient permissions
  - Admin-only endpoints
- **Not Found Errors** (404):
  - User not found
  - Invalid resource ID
- **Conflict Errors** (400):
  - Duplicate email/username
  - Duplicate database entries

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed, 8+ chars),
  role: String (enum: 'user', 'admin'),
  bio: String (0-500 chars),
  avatarKey: String (optional, MinIO key),
  active: Boolean (default: true),
  accountStatus: String (enum: 'active', 'suspended', 'flagged'),
  notificationPreferences: {
    inApp: {
      followers: Boolean,
      comments: Boolean,
      likes: Boolean,
      tips: Boolean
    },
    email: {
      followers: Boolean,
      comments: Boolean,
      likes: Boolean,
      tips: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Select `ClipSphere.postman_collection.json`
4. Import with default settings

### Import Environment

1. Click "Import" → "Environment"
2. Select `ClipSphere.postman_environment.json`
3. Set active environment

## Test Workflow

1. **Register**: Create new user account
2. **Login**: Get JWT token
3. **Protected Routes**: Use token in Bearer authorization
4. **Admin Routes**: Switch to admin user token
5. **Test All Sections**: Verify each endpoint

## Key Middleware & Utilities

### Middleware Stack

```
Morgan (logging)
  ↓
Body Parser (JSON)
  ↓
Mongo Sanitize (NoSQL injection prevention)
  ↓
Swagger Docs
  ↓
Routes
  ↓
Protect (JWT verification) - on protected routes
  ↓
RestrictTo (role check) - on admin routes
  ↓
Error Handler (global)
```

### Helper Functions

- `**catchAsync(fn)**`: Wrap async route handlers to catch errors
- `**generateToken(id)**`: Create JWT token
- `**checkOwnership(id)**`: Verify resource ownership (used with videos)
- `**AppError**`: Custom error class with status codes

## Validation Rules

### Username

- Minimum 3 characters
- Maximum 30 characters
- Alphanumeric, underscore, hyphen only
- Must be unique

### Email

- Valid email format
- Must be unique
- Case-insensitive

### Password

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Bcrypt hashed with salt 10

### Bio

- Maximum 500 characters
- Optional field

## Future Enhancements (Phase 2+)

- Email verification endpoint
- Password reset functionality
- OAuth2 integration (Google, GitHub)
- Two-factor authentication (2FA)
- Session management
- Rate limiting
- Advanced user analytics
- Activity logs

## Integration with Other Sections

### Section 1 (Foundational Structure)

- Uses global error handler ✅
- Uses Morgan logging ✅
- Uses mongo-sanitize ✅
- Provides `User` model schema ✅

### Section 3 (RBAC)

- Implements role field in User model ✅
- Provides `restrictTo` middleware ✅
- Ready for ownership middleware integration ✅

### Section 4 (Database Schemas)

- Provides complete User schema ✅
- Includes compound indexes ✅
- Includes pre-save hooks ✅

### Section 5 (Social Graph)

- Ready for follow/unfollow logic
- User model includes notification preferences ✅

### Section 6 (Media & Review)

- Supports ownership checking with protect middleware ✅
- Ready for video ownership validation ✅

### Section 8 (Swagger)

- All endpoints documented with Swagger JSDoc ✅
- JWT Bearer auth configured ✅
- Interactive /api-docs endpoint ✅

## Notes for Developers

### Password Hashing

- Bcrypt automatically generates salt
- Never log or display passwords
- Always use `comparePassword()` method for validation

### JWT Security

- Store secret in `.env`, never commit
- Use HTTPS in production
- Implement token refresh for long sessions
- Consider implementing blacklist for logout

### Admin Operations

- All admin routes check role in `restrictTo('admin')`
- Admin can bypass ownership checks for certain operations
- Ensure audit logging for sensitive operations

### Data Privacy

- Never return password in responses
- Use `.select('-password')` in queries
- Sanitize error messages in production

## Troubleshooting

### "User already exists"

- Email or username already registered
- Check database entries
- Ensure email is lowercase in registration

### "Invalid token"

- Token expired (24h default)
- Token malformed or corrupted
- Secret key changed
- Re-login to get new token

### "MongoDB connection error"

- Verify `MONGODB_URI` in `.env`
- Ensure MongoDB server is running
- Check network connectivity
- Verify authentication credentials

### "Admin access required"

- User role must be 'admin'
- Check user record in database
- Switch to admin user token in Postman

## Support & Contribution

For issues or feature requests, please create an issue or PR in the project repository.

---

**Created for ClipSphere Phase 1 - Backend Foundations & Security**  
**Person 2 Implementation - Sections 2 & 7**