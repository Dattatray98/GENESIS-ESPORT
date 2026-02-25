import { Request, Response } from 'express';
import Season from '../models/Season';

// @desc    Create a new season
// @route   POST /api/seasons
// @access  Private/Admin
export const createSeason = async (req: Request, res: Response) => {
    try {
        const { title, subtitle, startDate, endDate, prizePool, gameName, finalTeamCount, status } = req.body;

        const season = new Season({
            title,
            subtitle,
            startDate,
            endDate,
            prizePool,
            gameName,
            finalTeamCount,
            status
        });

        const createdSeason = await season.save();
        res.status(201).json(createdSeason);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all seasons
// @route   GET /api/seasons
// @access  Public
export const getSeasons = async (req: Request, res: Response) => {
    try {
        const seasons = await Season.find({}).sort({ createdAt: -1 });
        res.json(seasons);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active seasons
// @route   GET /api/seasons/active
// @access  Public
export const getActiveSeason = async (req: Request, res: Response) => {
    try {
        const seasons = await Season.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(seasons);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get season by ID
// @route   GET /api/seasons/:id
// @access  Public
export const getSeasonById = async (req: Request, res: Response) => {
    try {
        const season = await Season.findById(req.params.id);
        if (season) {
            res.json(season);
        } else {
            res.status(404).json({ message: 'Season not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update season
// @route   PATCH /api/seasons/:id
// @access  Private/Admin
export const updateSeason = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`[Season Update] Attempting to update season ID: "${id}"`);

        const season = await Season.findById(id);

        if (season) {
            console.log(`[Season Update] Found season: ${season.title}. Current status: ${season.status}, New status: ${req.body.status}`);
            
            // Map of fields that can be updated
            const fieldsToUpdate = [
                'title', 'subtitle', 'startDate', 'endDate', 
                'prizePool', 'gameName', 'finalTeamCount', 'status'
            ];

            fieldsToUpdate.forEach(field => {
                if (req.body[field] !== undefined) {
                    (season as any)[field] = req.body[field];
                }
            });

            // Automatically set endDate to current time if status is being set to 'Completed'
            // and no explicit endDate was provided in the request
            if (req.body.status === 'Completed' && !req.body.endDate) {
                console.log(`[Season Update] Status changed to Completed. Setting endDate to current time.`);
                season.endDate = new Date();
            }

            // CRITICAL: Handle legacy seasons missing endDate or startDate
            // This prevents ValidationError on existing documents
            if (!season.endDate) {
                console.log(`[Season Update] Field 'endDate' missing in DB for "${season.title}". Providing fallback.`);
                season.endDate = new Date();
            }
            if (!season.startDate) {
                console.log(`[Season Update] Field 'startDate' missing in DB for "${season.title}". Providing fallback.`);
                season.startDate = new Date(season.createdAt || Date.now());
            }

            const updatedSeason = await season.save();
            res.json(updatedSeason);
        } else {
            console.warn(`[Season Update] Season not found in DB for ID: "${id}"`);

            // Helpful diagnostic: Log all available season IDs
            const allSeasons = await Season.find({}, '_id title');
            console.log('[Season Update] Available Season IDs in DB:', allSeasons.map(s => ({ id: s._id, title: s.title })));

            res.status(404).json({
                message: 'Season not found in database',
                attemptedId: id,
                availableCount: allSeasons.length
            });
        }
    } catch (error: any) {
        console.error('[Season Update] Fatal Error:', error);
        res.status(400).json({ message: error.message });
    }
};
