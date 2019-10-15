import mongoose, { Document, Schema } from 'mongoose';

export interface IPerson extends Document {
	fullName: string;
	name: string;
	chatId: number;
	type: number;
}

// Схема персоны (имеющей определенную роль)
export const PersonSchema: Schema = new Schema(
	{
		fullName: { type: String, required: true },
		name: { type: String, required: true },
		chatId: { type: Number, required: true, unique: true },
		type: { type: Number, required: true }
	},
	{ collection: 'persons' }
);

export default mongoose.model<IPerson>('Person', PersonSchema);
