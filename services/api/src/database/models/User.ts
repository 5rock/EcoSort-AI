import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string; // Used for auth
  // The client derives a separate encryption key from the password which is NEVER sent to the server.
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
