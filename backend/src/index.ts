import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import goalsRouter from './routes/goals';
import foodLogsRouter from './routes/foodLogs';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nutrition Tracker API is running' });
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/food-logs', foodLogsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});