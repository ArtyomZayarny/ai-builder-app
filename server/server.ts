import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import pool, { closePool } from './db/connection.js';
import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import aiRoutes from './routes/ai.routes.js';
import imagekitRoutes from './routes/imagekit.routes.js';
import pdfParserRoutes from './routes/pdfParser.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for correct IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// CORS configuration - allow frontend to access API
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://ai-builder-app-kappa.vercel.app',
    process.env.CLIENT_URL, // Additional URL from env (optional)
  ].filter((url): url is string => Boolean(url)), // Type guard to filter out undefined
  credentials: true,
};

// Middleware
app.use(securityHeaders); // Security headers (must be before other middleware)
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' })); // Limit request body size
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.send('Server is a live!');
});

// Basic health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'AI Resume Builder API is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// API Documentation (Scalar UI) - Only in development
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      // @ts-ignore - Optional dev dependency, not available in production
      const { apiReference } = await import('@scalar/express-api-reference');
      // @ts-ignore - Optional dev file, not compiled in production
      const { openApiDocument } = await import('./docs/openapi.js');
      
      app.use(
        '/docs',
        apiReference({
          spec: {
            content: openApiDocument,
          },
          theme: 'purple',
          darkMode: true,
          layout: 'modern',
          defaultOpenAllTags: true,
        })
      );

      app.get('/openapi.json', (_req: Request, res: Response) => {
        res.json(openApiDocument);
      });
      
      console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
      console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/openapi.json`);
    } catch (error) {
      console.warn('⚠️ API Documentation not available:', error);
    }
  })();
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/imagekit', imagekitRoutes);
app.use('/api/pdf', pdfParserRoutes);

// Public resume route (no auth required)
import resumeController from './controllers/resume.controller.js';
app.get('/api/public/:publicId', resumeController.getPublicResume);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🔄 Shutting down gracefully...');
  server.close(async () => {
    console.log('✅ HTTP server closed');
    await closePool();
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;

