import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import authRouter from './routes/auth';
import goalsRouter from './routes/goals';
import foodLogsRouter from './routes/foodLogs';
import usersRouter from './routes/users';
import aiRouter from './routes/ai';

dotenv.config();

// Run Prisma migrations on startup (production only)
if ((process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) && process.env.DATABASE_URL) {
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't exit - let the server start anyway for debugging
    // In production, you might want to exit here: process.exit(1);
  }
} else if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set - skipping migrations');
}

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

// Root health check (for deployment)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Nutrition Tracker API is running' });
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nutrition Tracker API is running' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/food-logs', foodLogsRouter);
app.use('/api/ai', aiRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/api/health`);
}).on('error', (err: NodeJS.ErrnoException) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});