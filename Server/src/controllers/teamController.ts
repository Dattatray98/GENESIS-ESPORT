import { Request, Response } from 'express';
import Team from '../models/Team';

// @desc    Register a new team
// @route   POST /api/teams/register
// @access  Private/Admin
export const registerTeam = async (req: Request, res: Response) => {
    try {
        const {
            teamName,
            leaderName,
            leaderId,
            email,
            phone,
            player2,
            player2Id,
            player3,
            player3Id,
            player4,
            player4Id,
            substitute,
            substituteId,
            documentUrl,
            seasonId
        } = req.body;

        if (!documentUrl) {
            return res.status(400).json({ message: 'Verification document link is required' });
        }

        const existingTeam = await Team.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({ message: 'Team name already registered' });
        }

        const newTeam = new Team({
            teamName,
            leaderName,
            leaderId,
            email,
            phone,
            player2,
            player2Id,
            player3,
            player3Id,
            player4,
            player4Id,
            substitute,
            substituteId,
            documentUrl,
            seasonId
        });

        await newTeam.save();

        res.status(201).json({
            message: 'Team registered successfully',
            team: newTeam
        });

    } catch (error: any) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] --- REGISTRATION ERROR ---`);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            message: 'Server error during registration.',
            error: error.message
        });
    }
};

import jwt from 'jsonwebtoken';
import User from '../models/User';

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public (Restricted) / Private (Admin)
export const getTeams = async (req: Request, res: Response) => {
    try {
        let isAdmin = false;

        // Check for token to see if we can provide full details
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
                const user = await User.findById(decoded.id);
                if (user && (user.role === 'admin' || user.role === 'registration_admin')) {
                    isAdmin = true;
                }
            } catch (err) {
                // Token invalid or expired, just treat as guest
                console.warn('Invalid token in public getTeams request');
            }
        }

        const { seasonId } = req.query;
        const filter: any = {};
        if (seasonId) {
            filter.seasonId = seasonId;
        } else {
            // Only show teams that have a season reference
            filter.seasonId = { $exists: true, $ne: null };
        }

        let teams;
        if (isAdmin) {
            // Admin gets everything, using lean for performance
            teams = await Team.find(filter)
                .populate('seasonId', 'title status')
                .sort({ totalPoints: -1, placementPoints: -1, totalKills: -1 })
                .lean();
        } else {
            // Guests only get public leaderboard data, excluding heavy fields
            teams = await Team.find(filter)
                .select('-email -phone -documentUrl')
                .populate('seasonId', 'title status')
                .sort({ totalPoints: -1, placementPoints: -1, totalKills: -1 })
                .lean();
        }

        res.json(teams);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update teams (bulk)
// @route   PUT /api/teams/update
// @access  Private/Admin
export const updateTeams = async (req: Request, res: Response) => {
    try {
        const { teams } = req.body;

        if (!Array.isArray(teams)) {
            return res.status(400).json({ message: "Invalid teams data" });
        }

        const bulkOps = teams.map((teamData: any) => ({
            updateOne: {
                filter: { _id: teamData._id },
                update: {
                    $set: {
                        totalKills: teamData.totalKills,
                        placementPoints: teamData.placementPoints,
                        totalPoints: teamData.totalPoints,
                        wins: teamData.wins,
                        alivePlayers: teamData.alivePlayers,
                        isVerified: teamData.isVerified,
                        seasonId: teamData.seasonId
                    }
                }
            }
        }));

        const result = await Team.bulkWrite(bulkOps);

        res.json({
            message: 'Teams updated successfully',
            count: result.modifiedCount + result.upsertedCount
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
