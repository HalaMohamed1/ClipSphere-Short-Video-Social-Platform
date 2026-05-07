# ClipSphere - Quick Start Guide
**Get the application running in 5 minutes**

---

## Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Docker)
- Docker & Docker Compose
- FFmpeg (`brew install ffmpeg` on macOS)

---

## One-Command Startup

### Start Everything (Recommended)

```bash
# Terminal 1: MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:5

# Terminal 2: MinIO
docker-compose up -d minio minio-init

# Terminal 3: Backend
npm install
npm start
# Runs on http://localhost:5000

# Terminal 4: Frontend
cd nextjs-frontend && npm install && npm run dev
# Runs on http://localhost:3000
```

---

## Verify Installation

### 1. Check Backend Running
```bash
curl http://localhost:5000/health
```
**Expected**: `{"status":"success","message":"Server is running"}`

### 2. Check Frontend Running
Open: **http://localhost:3000**
**Expected**: Homepage loads with video feed

### 3. Check Swagger Docs
Open: **http://localhost:5000/api-docs**
**Expected**: Interactive API documentation

### 4. Check MinIO Console
Open: **http://localhost:9001**
**Credentials**: `minioadmin` / `minioadmin123`

---

## Quick Test Workflow

### 1. Create First Account
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "email": "demo@test.com",
    "password": "Demo1234"
  }'
```

### 2. Login in Browser
Open **http://localhost:3000/login**
- Email: `demo@test.com`
- Password: `Demo1234`

### 3. Upload Test Video
1. Click "Upload" in navbar
2. Select a video file < 5 minutes
3. Add title and description
4. Click Upload

### 4. View Video Feed
- Go back to home
- See your uploaded video
- Like the video
- Submit a review (1-5 stars)

### 5. Try Real-Time Features
1. Open two browser windows
2. In Window 1: Create and login User A
3. In Window 2: Create and login User B
4. In Window 2: Like User A's video
5. In Window 1: See notification toast (real-time!)

---

## File Structure

```
ClipSphere/
├── src/                          # Backend
│   ├── controllers/              # Business logic orchestration
│   ├── services/                 # Core business logic
│   ├── routes/                   # API endpoints
│   ├── models/                   # MongoDB schemas
│   ├── middleware/               # Auth, error handling, etc
│   ├── validators/               # Zod validation schemas
│   ├── utils/                    # Utilities
│   └── index.js                  # Main server file
│
├── nextjs-frontend/              # Frontend
│   ├── app/                      # Pages & layouts
│   │   ├── page.tsx              # Home (feed)
│   │   ├── login/page.tsx        # Login
│   │   ├── register/page.tsx     # Register
│   │   ├── upload/page.tsx       # Upload video
│   │   ├── video/[id]/page.tsx   # Video detail
│   │   ├── admin/page.tsx        # Admin dashboard
│   │   ├── settings/page.tsx     # Notification preferences
│   │   └── activity/page.tsx     # Real-time notifications
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities (API, Socket.io)
│   └── middleware.ts             # Route protection
│
├── docker-compose.yml            # MinIO & other services
├── .env                          # Backend environment variables
├── .env.example                  # Environment template
└── TESTING_GUIDE.md              # Detailed testing procedures
```

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clipsphere
JWT_SECRET=your_secret_here
MINIO_ENDPOINT=http://127.0.0.1:9000
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Common Commands

```bash
# View backend logs
npm start

# View frontend dev server
cd nextjs-frontend && npm run dev

# Run tests (when configured)
npm test

# Format code
npm run lint

# Build for production
npm run build
```

---

## API Endpoints Quick Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | ✗ | Create account |
| POST | `/auth/login` | ✗ | Login |
| GET | `/users/me` | ✓ | Get current user |
| POST | `/users/:id/follow` | ✓ | Follow user |
| DELETE | `/users/:id/unfollow` | ✓ | Unfollow user |
| GET | `/videos` | ✗ | Get all videos |
| POST | `/videos` | ✓ | Upload video |
| GET | `/videos/:id` | ✗ | Get video details |
| POST | `/videos/:id/reviews` | ✓ | Submit review |
| GET | `/admin/stats` | ✓ | Admin statistics |

---

## Troubleshooting

### "Port already in use" Error
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### "MongoDB connection refused"
```bash
# Start MongoDB
docker run -d -p 27017:27017 mongo:5

# Or if installed locally
mongod
```

### "Video upload fails"
```bash
# Verify FFmpeg installed
ffmpeg -version

# Check MinIO running
curl http://localhost:9001
```

### "Frontend can't reach API"
```bash
# Verify backend running
curl http://localhost:5000/health

# Check .env.local has correct URL
cat nextjs-frontend/.env.local
```

---

## Next Steps

1. **Read the docs**:
   - [PHASES_IMPLEMENTATION_COMPLETE.md](./PHASES_IMPLEMENTATION_COMPLETE.md) - Full feature documentation
   - [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive testing procedures

2. **Run tests**:
   - Follow TESTING_GUIDE.md for all 30+ test cases

3. **Explore the code**:
   - Backend: Start with `src/index.js` to understand setup
   - Frontend: Start with `nextjs-frontend/app/layout.tsx` to understand structure

4. **Deploy**:
   - Update `.env` with production values
   - Configure HTTPS/SSL
   - Set up monitoring and logging

---

## Support

- **API Docs**: http://localhost:5000/api-docs
- **Frontend**: http://localhost:3000
- **Database**: MongoDB at mongodb://localhost:27017
- **Storage**: MinIO console at http://localhost:9001

---

**Status**: ✅ All three phases implemented and ready to test!

