import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import goalsRouter from './routes/goals';
import foodLogsRouter from './routes/foodLogs';
import usersRouter from './routes/users';
import aiRouter from './routes/ai';

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
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

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

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
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

// Start server
console.log('Attempting to start server on port', PORT);
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('=== Server Started Successfully ===');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Listening on 0.0.0.0:${PORT}`);
  console.log(`✓ Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`✓ Root endpoint: http://0.0.0.0:${PORT}/`);
  console.log('=== Ready to accept requests ===');
  
  // Test that the server is actually listening
  const address = server.address();
  if (address) {
    console.log('Server address:', address);
  }
}).on('error', (err: NodeJS.ErrnoException) => {
  console.error('✗ Failed to start server:', err);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});