import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
    teamName: string;
    leaderName: string;
    email: string;
    phone: string;
    player2: string;
    player3: string;
    player4: string;
    substitute?: string;
    documentUrl: string;
    totalKills: number;
    placementPoints: number;
    totalPoints: number;
    wins: number;
    isVerified: boolean;
    rank?: number;
    createdAt: Date;
}

const TeamSchema: Schema = new Schema({
    teamName: { type: String, required: true, unique: true },
    leaderName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    player2: { type: String, required: true },
    player3: { type: String, required: true },
    player4: { type: String, required: true },
    substitute: { type: String },
    documentUrl: { type: String, required: true },
    totalKills: { type: Number, default: 0 },
    placementPoints: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    rank: { type: Number },
}, { timestamps: true });

TeamSchema.index({ totalPoints: -1, placementPoints: -1, totalKills: -1 });

export default mongoose.model<ITeam>('Team', TeamSchema);
