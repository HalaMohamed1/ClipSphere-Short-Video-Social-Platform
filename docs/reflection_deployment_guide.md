# Reflection & Deployment Guide

## Technical Hurdles & Reflection

### 1. Video Processing & FFmpeg
One of the primary hurdles was ensuring that `ffprobe` and `ffmpeg` are correctly installed and available on the system PATH. The backend relies on these for:
-   **Duration Validation**: Rejecting videos longer than 300 seconds.
-   **Thumbnail Extraction**: Automatically creating a preview image for every upload.
*Solution*: Included `fluent-ffmpeg` and ensured the Docker environment or local machine has the binaries.

### 2. MinIO Object Storage Configuration
Setting up MinIO required careful bucket initialization and CORS policy configuration to allow frontend access (if using direct uploads) and internal backend streaming.
*Solution*: Added a `minio-init` service in `docker-compose` to automate bucket creation using the MinIO Client (`mc`).

### 3. Docker Networking
In a containerized environment, the backend cannot use `localhost:9000` to talk to MinIO; it must use the service name `storage:9000`. However, for the client (browser) to access the UI, `localhost:9001` is needed.
*Solution*: Used environment variables to switch between internal and external endpoints.

### 4. Background Processing & Load
Uploading multiple large videos simultaneously can saturate the Node.js event loop or disk I/O.
*Solution*: Implemented streaming uploads to MinIO to minimize memory footprint.

---

## Deployment Walkthrough (Step-by-Step)

### Prerequisites
-   **Docker & Docker Compose** installed.
-   **Stripe Account** (for API keys).
-   **FFmpeg** (if running locally without Docker).

### Step 1: Environment Setup
Copy `.env.example` to `.env` and fill in the required fields:
```bash
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 2: Start Infrastructure
Run the following command to start all services:
```bash
docker-compose up -d
```
This will start:
-   `clipsphere_database` (MongoDB)
-   `clipsphere_cache` (Redis)
-   `clipsphere_storage` (MinIO)
-   `clipsphere_minio_init` (Auto-configuration)

### Step 3: Start Application
Once the infrastructure is healthy (check with `docker-compose ps`), start the backend and frontend:
```bash
docker-compose up -d backend frontend nginx
```

### Step 4: Verification
-   **Frontend**: Open [http://localhost](http://localhost) (via Nginx).
-   **Backend Health**: [http://localhost/api/v1/health](http://localhost/api/v1/health).
-   **MinIO Console**: [http://localhost:9001](http://localhost:9001) (User: `minioadmin`, Pass: `minioadmin123`).

### Step 5: Troubleshooting
-   If video uploads fail, check if `minio-init` ran successfully.
-   Check logs: `docker-compose logs -f backend`.
-   Ensure `MAX_VIDEO_UPLOAD_MB` is sufficient for your test files.
