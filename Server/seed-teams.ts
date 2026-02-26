import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from './src/models/Team';
import Season from './src/models/Season';

dotenv.config();

const seedTeams = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');

        console.log('Connecting to DB...');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // 1. Get or create a season
        let season = await Season.findOne({ status: 'active' });
        if (!season) {
            console.log('No active season found, creating a dummy season...');
            season = await Season.create({
                title: 'Genesis Championship S1',
                subtitle: 'The Battle for Genesis Begins',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                prizePool: '1,00,000',
                gameName: 'BGMI',
                finalTeamCount: 20,
                status: 'active'
            });
        }

        const seasonId = season._id;
        console.log(`Using Season: ${season.title} (${seasonId})`);

        // 2. Generate 20 teams
        const teams = [];
        const documentUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3";

        for (let i = 1; i <= 20; i++) {
            teams.push({
                teamName: `Team Genesis ${i}`,
                leaderName: `Leader ${i}`,
                email: `leader${i}@genesis.com`,
                phone: `98765432${i.toString().padStart(2, '0')}`,
                player2: `Player ${i}_2`,
                player3: `Player ${i}_3`,
                player4: `Player ${i}_4`,
                substitute: i % 2 === 0 ? `Sub ${i}` : undefined,
                documentUrl: documentUrl,
                totalKills: 0,
                placementPoints: 0,
                totalPoints: 0,
                wins: 0,
                alivePlayers: 4,
                isVerified: true,
                seasonId: seasonId,
                rank: i
            });
        }

        // 3. Clear existing teams
        console.log('Clearing all existing teams...');
        await Team.deleteMany({});

        // 4. Insert teams
        console.log('Seeding teams...');
        await Team.insertMany(teams);

        console.log('Successfully seeded 20 teams!');
        process.exit(0);
    } catch (error: any) {
        console.error('Error during seeding:', error.message);
        process.exit(1);
    }
};

seedTeams();
