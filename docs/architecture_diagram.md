# ClipSphere Full Architecture Diagram

The following diagram illustrates the containers, networks, and data flow within the ClipSphere platform.

```mermaid
graph TD
    subgraph Client_Zone ["Client Zone"]
        User(["User Browser / Postman"])
    end

    subgraph Proxy_Layer ["Proxy Layer (Docker Network: clipsphere_net)"]
        Nginx["Nginx (Port 80)"]
    end

    subgraph Application_Layer ["Application Layer"]
        Frontend["Next.js Frontend (Port 3000)"]
        Backend["Node.js Express Backend (Port 5050)"]
    end

    subgraph Storage_Layer ["Storage & Cache Layer"]
        MongoDB[("MongoDB (Port 27017)")]
        Redis[("Redis Cache (Port 6379)")]
        MinIO[("MinIO Object Storage (Port 9000/9001)")]
    end

    subgraph External_Services ["External Services"]
        StripeAPI["Stripe API"]
        StripeCLI["Stripe CLI Container"]
    end

    %% Data Flow
    User -->|HTTP/S| Nginx
    Nginx -->|Proxy| Frontend
    Nginx -->|Proxy /api| Backend
    
    Frontend -->|Client-side API Calls| Nginx
    
    Backend -->|Queries| MongoDB
    Backend -->|Caching| Redis
    Backend -->|Upload/Stream| MinIO
    
    StripeAPI -->|Webhooks| StripeCLI
    StripeCLI -->|Forward| Backend
    Backend -->|Payments| StripeAPI

    subgraph Init_Process ["Initialization"]
        MinioInit["MinIO MC Init"] -->|Setup Buckets| MinIO
    end
```

## Data Flow Details

1.  **Authentication**: Handled by Backend using JWT and MongoDB.
2.  **Video Upload**:
    - Backend receives file via `multer`.
    - `ffprobe` checks duration.
    - File is streamed to **MinIO** `clipsphere-videos` bucket.
    - Thumbnail generated via `ffmpeg` and saved to `clipsphere-thumbnails` bucket.
3.  **Video Streaming**:
    - Backend generates presigned URLs or streams data directly from MinIO to the client.
4.  **Social Graph**:
    - Following/Follower relationships stored in MongoDB.
    - Used for the **Following Boost Feed**.
5.  **Payments**:
    - Stripe integration for premium features.
    - Webhooks handled via `stripe-cli` in development.
