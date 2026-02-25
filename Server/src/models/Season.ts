import mongoose, { Schema, Document } from 'mongoose';

export interface ISeason extends Document {
    title: string;
    subtitle: string;
    startDate: Date;
    endDate: Date;
    prizePool: string;
    gameName: string;
    finalTeamCount: number;
    status: 'active' | 'Completed';
    createdAt: Date;
}

const SeasonSchema: Schema = new Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    prizePool: { type: String, required: true },
    gameName: { type: String, required: true },
    finalTeamCount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'Completed'], default: 'active' },
}, { timestamps: true });

export default mongoose.model<ISeason>('Season', SeasonSchema);
