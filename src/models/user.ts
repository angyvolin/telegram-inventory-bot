import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
	chatId: number;
	username?: string;
	name?: string;
	phoneNumber?: string;
	isAdmin?: boolean;
}

// Схема пользователя
export const UserSchema: Schema = new Schema(
	{
		chatId: { type: Number, required: true, unique: true },
		username: { type: String },
		name: { type: String },
		phoneNumber: { type: String },
		isAdmin: { type: Boolean }
	},
	{ collection: 'users' }
);

export default mongoose.model<IUser>('User', UserSchema);
