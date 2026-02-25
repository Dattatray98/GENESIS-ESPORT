import express from 'express';
import { getMatches, createMatch, updateMatch, deleteMatch, getMatchById, finishMatch, addTeamsToMatch } from '../controllers/matchController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();
console.log('[DEBUG] Match Router Initialized');

router.get('/', (req, res, next) => {
    console.log('[DEBUG] GET /api/matches hit');
    next();
}, getMatches);
router.get('/:id', getMatchById);
router.post('/add', protect, admin, createMatch);
router.post('/:id/finish', protect, admin, finishMatch);
router.post('/:id/teams', protect, admin, addTeamsToMatch);
router.put('/:id', protect, admin, updateMatch);
router.delete('/:id', protect, admin, deleteMatch);

export default router;
