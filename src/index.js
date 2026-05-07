// MUST load dotenv before importing other modules
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { setServers, setDefaultResultOrder } from 'dns';

// Force Google DNS to resolve MongoDB Atlas SRV records (fixes querySrv ECONNREFUSED)
setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
setDefaultResultOrder('ipv4first');


// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root (one level up from src/)
const envPath = path.resolve(__dirname, '..', '.env');
console.log(` Loading .env from: ${envPath}`);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error(`  Error loading .env file: ${result.error.message}`);
} else {
  console.log(` .env file loaded. Parsed ${Object.keys(result.parsed || {}).length} variables`);
}

// Manually set from process.env or use defaults
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/clipsphere';
  console.log('  MONGODB_URI not found, using default: mongodb://localhost:27017/clipsphere');
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production';
}
if (!process.env.PORT) {
  // 5000 is often taken by macOS AirPlay Receiver (Control Center); 5050 avoids EADDRINUSE in local dev.
  process.env.PORT = 5050;
}

console.log(` MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(` NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);

// Now import other modules
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { connectDB } from './utils/database.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './io/socketManager.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = Number(process.env.PORT) || 5050;

// ============= MIDDLEWARE =============

// Request logging
app.use(morgan('combined'));

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: clientOrigins.length ? clientOrigins : true,
    credentials: true,
  })
);
app.use(cookieParser());

app.use((req, res, next) => {
  if (typeof req.originalUrl === 'string' && req.originalUrl.startsWith('/api')) {
    res.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
  }
  next();
});

// Mount webhook routes BEFORE express.json() so Stripe can get the raw body
app.use('/api/v1/webhooks', webhookRoutes);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// ============= SWAGGER SETUP =============

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClipSphere API',
      version: '1.0.0',
      description: 'ClipSphere - Short Video Social Platform API Documentation',
      contact: {
        name: 'ClipSphere Team',
      },
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5050',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header. Format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/docs/openapi/*.swagger.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============= ROUTES =============

// Health check (public)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiLimiter); // Apply rate limiter to all API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/payments', paymentRoutes);

// ============= ERROR HANDLING =============

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// ============= SERVER STARTUP =============

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Socket.IO
    initializeSocket(httpServer);

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   ClipSphere Backend Server Started    ║
╠════════════════════════════════════════╣
║  Port:     ${PORT}
║  ENV:      ${process.env.NODE_ENV}
║  API Docs: http://localhost:${PORT}/api-docs
║  WebSocket: ws://localhost:${PORT}
╚════════════════════════════════════════╝
      `);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`
❌ Port ${PORT} is already in use.

  • Pick another port: PORT=5051 npm start
    (also set NEXT_PUBLIC_API_URL in nextjs-frontend/.env.local to match)

  • If you need port 5000: on macOS, disable AirPlay Receiver
    System Settings → General → AirDrop & Handoff → AirPlay Receiver → Off

`);
        process.exit(1);
      }
      throw err;
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

export default app;
