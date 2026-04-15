// MUST load dotenv before importing other modules
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root (one level up from src/)
const envPath = path.resolve(__dirname, '..', '.env');
console.log(`📁 Loading .env from: ${envPath}`);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error(`⚠️  Error loading .env file: ${result.error.message}`);
} else {
  console.log(`✅ .env file loaded. Parsed ${Object.keys(result.parsed || {}).length} variables`);
}

// Manually set from process.env or use defaults
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/clipsphere';
  console.log('⚠️  MONGODB_URI not found, using default: mongodb://localhost:27017/clipsphere');
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

console.log(`✅ MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`✅ NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`✅ PORT: ${process.env.PORT}`);

// Now import other modules
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { connectDB } from './utils/database.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ============= MIDDLEWARE =============

// Permissive CORS for dev / internal tools (do not use `origin: '*'` with credentials in production)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request logging
app.use(morgan('combined'));

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/upload', uploadRoutes);

// ============= ERROR HANDLING =============

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// ============= SERVER STARTUP =============

const startServer = () => {
  // Listen first so port 5000 is open immediately (Next.js proxy / health checks).
  // If we await MongoDB before listen(), a slow or down DB means ECONNREFUSED — not a "port conflict".
  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║   ClipSphere Backend Server Started    ║
╠════════════════════════════════════════╣
║  Port:     ${PORT}
║  ENV:      ${process.env.NODE_ENV}
║  API Docs: http://localhost:${PORT}/api-docs
╚════════════════════════════════════════╝
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop the other process or set PORT in .env`);
    } else {
      console.error('❌ Server listen error:', err.message);
    }
    process.exit(1);
  });

  connectDB();
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

export default app;
