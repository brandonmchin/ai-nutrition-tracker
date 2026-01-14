import express from 'express';
import { analyzeFoodDescription, analyzeFoodImage } from '../controllers/aiController';

const router = express.Router();

router.post('/analyze-food', analyzeFoodDescription);
router.post('/analyze-image', analyzeFoodImage);

export default router;