import mongoose, { Document, Schema } from 'mongoose';

export interface IConfirmation extends Document {
	messages: [
		{
			id: number;
			chatId: number;
			text: string;
		}
	];
}

// Схема получения
export const ConfirmationSchema: Schema = new Schema(
	{
		messages: { type: [{ id: String, chatId: Number }], required: true }
	},
	{ collection: 'confirmations' }
);

export default mongoose.model<IConfirmation>('Confirmation', ConfirmationSchema);
