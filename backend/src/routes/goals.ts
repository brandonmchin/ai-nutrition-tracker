import express from 'express';
import { getGoals, setGoals } from '../controllers/goalsController';

const router = express.Router();

router.get('/:userId', getGoals);
router.post('/:userId', setGoals);

export default router;