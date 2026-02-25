import express from 'express';
import { createSeason, getSeasons, getActiveSeason, getSeasonById, updateSeason } from '../controllers/seasonController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, admin, createSeason);
router.get('/', getSeasons);
router.get('/active', getActiveSeason);
router.get('/:id', getSeasonById);
router.put('/:id', protect, admin, updateSeason);

export default router;