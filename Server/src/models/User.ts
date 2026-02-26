import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user' | 'registration_admin';
    comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user', 'registration_admin'], default: 'user' }
}, { timestamps: true });

// Hash password before saving - Using async/await without next() to avoid TS overload issues
UserSchema.pre('save', async function (this: IUser) {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err: any) {
        throw new Error(err);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
