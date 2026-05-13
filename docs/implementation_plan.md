# Implementation Plan - ClipSphere Tasks

This plan outlines how to fulfill the user requests while strictly adhering to the constraint of **not editing any old files**.

## 1. Stress Test Script (`tests/stress_test.js`)
- **Objective**: Upload multiple videos simultaneously.
- **Features**:
  - Concurrent uploads using `Promise.all`.
  - Verification of duration gate (simulating > 5 mins).
  - Check for MinIO storage persistence.
  - Logging of response times and statuses.

## 2. Architecture Diagram (`docs/architecture_diagram.md`)
- **Objective**: Full system visualization.
- **Components**: Nginx, Frontend (Next.js), Backend (Express), MongoDB, Redis, Minio, Stripe CLI.
- **Data Flow**: Auth, Video Upload (Stream -> Minio), Feed retrieval, Payment webhooks.

## 3. API Documentation (`docs/api_documentation.md`)
- **Objective**: Comprehensive Swagger/Postman coverage.
- **Content**: Grouped by Phase (Auth, Social, Video, Payments, Admin).

## 4. Reflection & Deployment Guide (`docs/reflection_deployment_guide.md`)
- **Objective**: Technical hurdles and setup walkthrough.
- **Hurdles**: FFmpeg paths, Docker networking, MinIO CORS, Stripe secrets.
- **Walkthrough**: Step-by-step `docker-compose` instructions.

## 5. Recalculate Trending Score (`src/extensions/trendingScoreExtension.js`)
- **Objective**: Update `trendingScore` on review submission.
- **Implementation**: A new function that calculates the score based on:
  - `(avgRating * 4) + (likesCount * 0.1) + (views * 0.01)`.
  - This logic will be provided as a standalone module.

## 6. Following Boost Feed (`src/extensions/feedExtension.js`)
- **Objective**: Followed users first, then trending videos.
- **Implementation**: A new feed service function that performs a union/boost aggregation.

---

### Note on Integration
Since I am not allowed to edit existing files, I will provide these as **new extension files**. To activate them, a developer would need to:
1. Update `src/routes/videoRoutes.js` to point to the new controller methods.
2. Update `src/index.js` if new routes are added.
Instructions for this will be included in the Reflection & Deployment Guide.
