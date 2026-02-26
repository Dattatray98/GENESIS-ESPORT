import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
    teamName: string;
    leaderName: string;
    leaderId: string;
    email: string;
    phone: string;
    player2: string;
    player2Id: string;
    player3: string;
    player3Id: string;
    player4: string;
    player4Id: string;
    substitute?: string;
    substituteId?: string;
    documentUrl: string;
    totalKills: number;
    placementPoints: number;
    totalPoints: number;
    wins: number;
    alivePlayers: number;
    isVerified: boolean;
    seasonId: mongoose.Types.ObjectId;
    rank?: number;
    createdAt: Date;
}

const TeamSchema: Schema = new Schema({
    teamName: { type: String, required: true, unique: true },
    leaderName: { type: String, required: true },
    leaderId: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    player2: { type: String, required: true },
    player2Id: { type: String, required: true },
    player3: { type: String, required: true },
    player3Id: { type: String, required: true },
    player4: { type: String, required: true },
    player4Id: { type: String, required: true },
    substitute: { type: String },
    substituteId: { type: String },
    documentUrl: { type: String, required: true },
    totalKills: { type: Number, default: 0 },
    placementPoints: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    alivePlayers: { type: Number, default: 4 },
    isVerified: { type: Boolean, default: false },
    seasonId: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
    rank: { type: Number },
}, { timestamps: true });

TeamSchema.index({ totalPoints: -1, placementPoints: -1, totalKills: -1 });

export default mongoose.model<ITeam>('Team', TeamSchema);
