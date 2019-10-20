import mongoose, { Document, Schema } from 'mongoose';

export interface IConfirmation extends Document {
	messages: {
		id: number;
		chatId: number;
	}[];
	text: string;
	instruments?: Map<string, number>;
	furniture?: Map<string, number>;
	consumables?: Map<string, number>;
	days?: number;
}

// Схема получения
export const ConfirmationSchema: Schema = new Schema(
	{
		messages: { type: [{ id: String, chatId: Number }], required: true },
		text: { type: String, required: true },
		instruments: { type: Map },
		furniture: { type: Map },
		consumables: { type: Map },
		days: { type: Number }
	},
	{ collection: 'confirmations' }
);

export default mongoose.model<IConfirmation>('Confirmation', ConfirmationSchema);
