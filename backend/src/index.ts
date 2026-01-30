import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import goalsRouter from './routes/goals';
import foodLogsRouter from './routes/foodLogs';
import usersRouter from './routes/users';
import aiRouter from './routes/ai';
import favoritesRouter from './routes/favorites';

dotenv.config();

// Log environment info for debugging
console.log('=== Starting Application ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '3001');
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://ai-nutrition-tracker-production.up.railway.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or health checks)
    if (!origin) return callback(null, true);

    // Allow Railway's health check system
    if (origin.includes('healthcheck.railway.app') || origin.includes('railway.app')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log for debugging but allow in production
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root health check (for deployment) - must be before other routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Nutrition Tracker API is running', timestamp: new Date().toISOString() });
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nutrition Tracker API is running', timestamp: new Date().toISOString() });
});

// Railway health check endpoint (some platforms use this)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nutrition Tracker API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/food-logs', foodLogsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/favorites', favoritesRouter);

// Error handlers - log but don't exit immediately to help debug
process.on('uncaughtException', (error) => {
  console.error('=== Uncaught Exception ===');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('This will cause the process to exit in 5 seconds...');
  // Give time for logs to be written
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== Unhandled Rejection ===');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('This will cause the process to exit in 5 seconds...');
  // Give time for logs to be written
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

// Add error handling middleware (must be after routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Keep process alive interval (will be set after server starts)
let keepAliveInterval: NodeJS.Timeout | null = null;

// Start server
console.log('Attempting to start server on port', PORT);
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('=== Server Started Successfully ===');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Listening on 0.0.0.0:${PORT}`);
  console.log(`✓ Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`✓ Root endpoint: http://0.0.0.0:${PORT}/`);

  // Test that the server is actually listening
  const address = server.address();
  if (address) {
    console.log('Server address:', JSON.stringify(address));
  }

  // Verify server is actually accepting connections
  console.log('Testing server is ready...');
  const http = require('http');
  const testReq = http.get(`http://localhost:${PORT}/`, (res: any) => {
    console.log(`✓ Internal health check passed: ${res.statusCode}`);
    res.on('data', () => { });
    res.on('end', () => {
      console.log('=== Ready to accept requests ===');
    });
  });
  testReq.on('error', (err: any) => {
    console.error('✗ Internal health check failed:', err.message);
  });
  testReq.setTimeout(2000, () => {
    console.error('✗ Internal health check timed out');
    testReq.destroy();
  });

  // Keep process alive and log periodically to show it's running
  keepAliveInterval = setInterval(() => {
    console.log(`[${new Date().toISOString()}] Server is running and listening on port ${PORT}`);
  }, 30000); // Every 30 seconds
}).on('error', (err: NodeJS.ErrnoException) => {
  console.error('✗ Failed to start server:', err);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('=== SIGTERM received, shutting down gracefully ===');
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
  // Force exit after 10 seconds if server doesn't close
  setTimeout(() => {
    console.log('Forcing exit after timeout');
    process.exit(0);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('=== SIGINT received, shutting down gracefully ===');
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
  // Force exit after 10 seconds if server doesn't close
  setTimeout(() => {
    console.log('Forcing exit after timeout');
    process.exit(0);
  }, 10000);
});