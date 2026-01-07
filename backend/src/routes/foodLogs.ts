import express from 'express';
import { 
  getFoodLogsByDate, 
  addFoodEntry, 
  deleteFoodEntry 
} from '../controllers/foodLogsController';

const router = express.Router();

router.get('/:userId/:date', getFoodLogsByDate);
router.post('/:userId/entries', addFoodEntry);
router.delete('/entries/:entryId', deleteFoodEntry);

export default router;