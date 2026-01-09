import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import goalsRouter from './routes/goals';
import foodLogsRouter from './routes/foodLogs';
import usersRouter from './routes/users';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
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
  console.log(`Server running on http://localhost:${PORT}`);
});