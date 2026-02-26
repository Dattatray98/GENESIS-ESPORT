import express from 'express';
import { registerTeam, getTeams, updateTeams } from '../controllers/teamController';
import { protect, admin, authorizeRoles } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/register', protect, authorizeRoles('admin', 'registration_admin'), registerTeam);
router.get('/', getTeams);
router.put('/update', protect, authorizeRoles('admin', 'registration_admin'), updateTeams);

export default router;
