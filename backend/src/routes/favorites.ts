import express from 'express';
import { addFavorite, getFavorites, deleteFavorite } from '../controllers/favoritesController';

const router = express.Router();

router.post('/:userId', addFavorite);
router.get('/:userId', getFavorites);
router.delete('/:id', deleteFavorite);

export default router;
