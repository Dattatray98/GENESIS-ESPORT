import { Request, Response } from 'express';
import Team from '../models/Team';
import { cloudinary } from '../config/cloudinary';
import fs from 'fs';

// @desc    Register a new team
// @route   POST /api/teams/register
// @access  Private/Admin
export const registerTeam = async (req: Request, res: Response) => {
    let localFilePath: string | undefined;
    try {
        console.log('--- Registration Start ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('File:', req.file);

        const {
            teamName,
            leaderName,
            email,
            phone,
            player2,
            player3,
            player4,
            substitute
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Verification document file is required' });
        }

        localFilePath = req.file.path;
        const stats = fs.statSync(localFilePath);
        console.log(`[DEBUG] Local file exists: ${localFilePath} (${stats.size} bytes)`);

        // Upload to Cloudinary manually
        console.log('[DEBUG] Calling cloudinary.uploader.upload...');
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: 'GENESIS-Cloud',
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
        });
        console.log('[DEBUG] Cloudinary upload returned successfully');

        const documentUrl = result.secure_url;

        // Delete local file
        fs.unlinkSync(localFilePath);
        localFilePath = undefined;

        console.log('Checking for existing team:', teamName);
        const existingTeam = await Team.findOne({ teamName });
        if (existingTeam) {
            console.warn('Team already registered:', teamName);
            return res.status(400).json({ message: 'Team name already registered' });
        }

        console.log('Creating new team document...');
        const newTeam = new Team({
            teamName,
            leaderName,
            email,
            phone,
            player2,
            player3,
            player4,
            substitute,
            documentUrl: documentUrl
        });

        console.log('Saving to MongoDB...');
        await newTeam.save();
        console.log('Save successful!');

        res.status(201).json({
            message: 'Team registered successfully',
            team: newTeam
        });

    } catch (error: any) {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] --- REGISTRATION ERROR ---`);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);

        // Safe file log
        try {
            fs.appendFileSync('registration_error.log', `[${timestamp}] ${error.message}\n${error.stack}\n\n`);
        } catch (logErr) {
            console.error('Failed to write to registration_error.log');
        }

        // Cleanup local file if it still exists
        try {
            if (localFilePath && fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (cleanupErr) {
            console.error('Failed to cleanup local file');
        }

        res.status(500).json({
            message: 'Server error during registration. Please check logs.',
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
                if (user && user.role === 'admin') {
                    isAdmin = true;
                }
            } catch (err) {
                // Token invalid or expired, just treat as guest
                console.warn('Invalid token in public getTeams request');
            }
        }

        let teams;
        if (isAdmin) {
            // Admin gets everything, using lean for performance
            teams = await Team.find()
                .sort({ totalPoints: -1, placementPoints: -1, totalKills: -1 })
                .lean();
        } else {
            // Guests only get public leaderboard data, excluding heavy fields
            teams = await Team.find()
                .select('-email -phone -documentUrl')
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
                filter: { teamName: teamData.teamName },
                update: {
                    $set: {
                        totalKills: teamData.totalKills,
                        placementPoints: teamData.placementPoints,
                        totalPoints: teamData.totalPoints,
                        wins: teamData.wins,
                        isVerified: teamData.isVerified,
                    }
                },
                upsert: true
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
