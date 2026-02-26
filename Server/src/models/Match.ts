import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
    seasonId: mongoose.Types.ObjectId;
    matchNumber: number;
    gameName: string;
    mapName: string;
    roomId?: string;
    password?: string;
    maxPlayers?: number;
    dateTime: Date;
    status: 'upcoming' | 'live' | 'completed';
    results?: {
        teamId: mongoose.Types.ObjectId;
        kills: number;
        placementPoints: number;
        totalPoints: number;
        rank: number;
        alivePlayers: number;
    }[];
    streamUrl?: string;
}

const MatchSchema: Schema = new Schema({
    seasonId: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
    matchNumber: { type: Number, required: true },
    gameName: { type: String, default: 'BGMI' },
    mapName: { type: String, required: true },
    roomId: { type: String },
    password: { type: String },
    maxPlayers: { type: Number, default: 60 },
    dateTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'completed'],
        default: 'upcoming'
    },
    results: [{
        teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
        kills: { type: Number, default: 0 },
        placementPoints: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 },
        rank: { type: Number },
        alivePlayers: { type: Number, default: 4 }
    }],
    streamUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<IMatch>('Match', MatchSchema);
