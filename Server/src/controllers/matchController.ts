import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Match from '../models/Match';

// ... existing controllers ...

// Helper to recalculate global rankings for a season
const recalculateGlobalStandings = async (seasonId: any) => {
    try {
        // Sum up all results from ALL completed AND live matches in this season
        const activeMatches = await Match.find({
            seasonId,
            status: { $in: ['completed', 'live'] }
        });

        const Team = mongoose.model('Team');
        const teams = await Team.find({ seasonId });

        const bulkOps = teams.map(team => {
            const teamIdStr = team._id.toString();
            let totalKills = 0;
            let placementPoints = 0;
            let wins = 0;

            activeMatches.forEach(m => {
                const teamResult = m.results?.find((r: any) => String(r.teamId?._id || r.teamId) === teamIdStr);
                if (teamResult) {
                    totalKills += Number(teamResult.kills || 0);
                    placementPoints += Number(teamResult.placementPoints || 0);
                    if (teamResult.rank === 1) wins += 1;
                }
            });

            return {
                updateOne: {
                    filter: { _id: team._id },
                    update: {
                        $set: {
                            totalKills,
                            placementPoints,
                            totalPoints: totalKills + placementPoints,
                            wins
                        }
                    }
                }
            };
        });

        if (bulkOps.length > 0) {
            await Team.bulkWrite(bulkOps);
        }
    } catch (error) {
        console.error('Failed to recalculate global standings:', error);
    }
};

// @desc    Add multiple teams to a match (for selection window)
// @route   POST /api/matches/:id/teams
// @access  Private/Admin
export const addTeamsToMatch = async (req: Request, res: Response) => {
    try {
        const { teamIds } = req.body; // Array of team IDs
        if (!Array.isArray(teamIds)) {
            return res.status(400).json({ message: 'teamIds must be an array' });
        }

        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'Match not found' });

        const existingTeamIds = (match.results || []).map(r => r.teamId?.toString());

        const newResults = teamIds
            .filter(id => !existingTeamIds.includes(id))
            .map(id => ({
                teamId: new mongoose.Types.ObjectId(id),
                kills: 0,
                placementPoints: 0,
                totalPoints: 0,
                rank: 0,
                alivePlayers: 4
            }));

        if (newResults.length > 0) {
            match.results = [...(match.results || []), ...newResults] as any;
            await match.save();
        }

        const populatedMatch = await Match.findById(match._id)
            .populate('seasonId', 'title')
            .populate('results.teamId', 'teamName');

        res.json(populatedMatch);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all matches for a season
// @route   GET /api/matches
// @access  Public
export const getMatches = async (req: Request, res: Response) => {
    try {
        const { seasonId } = req.query;
        const filter: any = {};
        if (seasonId) filter.seasonId = seasonId;

        const matches = await Match.find(filter)
            .populate('seasonId', 'title')
            .sort({ dateTime: 1 });

        res.json(matches);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single match by ID
// @route   GET /api/matches/:id
// @access  Public
export const getMatchById = async (req: Request, res: Response) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('seasonId', 'title')
            .populate('results.teamId', 'teamName');
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.json(match);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new match
// @route   POST /api/matches
// @access  Private/Admin
export const createMatch = async (req: Request, res: Response) => {
    try {
        const match = new Match(req.body);
        await match.save();
        res.status(201).json(match);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a match status or results
// @route   PUT /api/matches/:id
// @access  Private/Admin
export const updateMatch = async (req: Request, res: Response) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'Match not found' });

        if (match.status === 'completed') {
            return res.status(400).json({ message: 'Cannot update a completed match' });
        }

        const updatedMatch = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });

        const { results } = req.body; // Expecting an array of { teamId, kills, placementPoints, totalPoints, rank, alivePlayers }

        if (req.body.results && updatedMatch) {
            await recalculateGlobalStandings(updatedMatch.seasonId);
        }

        res.json(updatedMatch);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a match
// @route   DELETE /api/matches/:id
// @access  Private/Admin
export const deleteMatch = async (req: Request, res: Response) => {
    try {
        const match = await Match.findByIdAndDelete(req.params.id);
        if (!match) return res.status(404).json({ message: 'Match not found' });

        // Recalculate global standings after deletion
        await recalculateGlobalStandings(match.seasonId);

        res.json({ message: 'Match deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Finish a match and update global team standings
// @route   POST /api/matches/:id/finish
// @access  Private/Admin
export const finishMatch = async (req: Request, res: Response) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ message: 'Match not found' });

        const seasonId = match.seasonId;

        // 1. Mark this match as completed
        match.status = 'completed';

        // 2. Calculate Rank for THIS match based on match results
        if (match.results && match.results.length > 0) {
            const sortedResults = [...match.results].sort((a, b) => {
                const bTotal = Number(b.totalPoints || 0);
                const aTotal = Number(a.totalPoints || 0);
                if (bTotal !== aTotal) return bTotal - aTotal;

                const bPlace = Number(b.placementPoints || 0);
                const aPlace = Number(a.placementPoints || 0);
                if (bPlace !== aPlace) return bPlace - aPlace;

                return Number(b.kills || 0) - Number(a.kills || 0);
            });

            sortedResults.forEach((res, index) => {
                res.rank = index + 1;
            });
            match.results = sortedResults as any;
        }
        await match.save();

        // 3. Recalculate Global Standings (Helper handles logic now)
        await recalculateGlobalStandings(seasonId);

        res.json(match);
    } catch (error: any) {
        console.error('Error finishing match:', error);
        res.status(500).json({ message: error.message });
    }
};
