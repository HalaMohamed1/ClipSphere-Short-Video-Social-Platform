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
  process.env.PORT = 5000;
}

console.log(` MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(` NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);

// Now import other modules
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB } from './utils/database.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { socketAuthMiddleware, attachSocketInstance } from './middleware/socketAuth.js';
import { initializeSocketEvents } from './db_core/socketEvents.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ============= SOCKET.IO SETUP =============

const io = new SocketIOServer(server, {
  cors: {
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Apply Socket.io authentication middleware
io.use(socketAuthMiddleware);
io.use(attachSocketInstance(io));

// Initialize Socket.io event handlers
initializeSocketEvents(io);

// ============= MIDDLEWARE =============

// Security headers with Helmet.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());

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
        url: process.env.SERVER_URL || 'http://localhost:5000',
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

    // Start listening on HTTP server (which includes Socket.io)
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   ClipSphere Backend Server Started    ║
╠════════════════════════════════════════╣
║  Port:     ${PORT}
║  ENV:      ${process.env.NODE_ENV}
║  API Docs: http://localhost:${PORT}/api-docs
║  Socket.io: ws://localhost:${PORT}
╚════════════════════════════════════════╝
      `);
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
export { server, io };
