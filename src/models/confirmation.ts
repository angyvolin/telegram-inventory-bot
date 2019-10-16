import mongoose, { Document, Schema } from 'mongoose';

export interface IConfirmation extends Document {
	messageIds: string[];
}

// Схема получения
export const ConfirmationSchema: Schema = new Schema(
	{
		messageIds: { type: [String], required: true }
	},
	{ collection: 'confirmations' }
);

export default mongoose.model<IConfirmation>('Confirmation', ConfirmationSchema);
