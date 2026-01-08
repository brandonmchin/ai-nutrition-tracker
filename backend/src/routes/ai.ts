import express from 'express';
import { analyzeFoodDescription } from '../controllers/aiController';

const router = express.Router();

router.post('/analyze-food', analyzeFoodDescription);

export default router;