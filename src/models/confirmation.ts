import mongoose, { Document, Schema } from 'mongoose';

export interface IConfirmation extends Document {
	chatId: number;
	messages: {
		id: number;
		chatId: number;
	}[];
	text: string; // Текст сообщения для подтверждения
	instruments?: Map<string, number>;
	furniture?: Map<string, number>;
	consumables?: Map<string, number>;
	days?: number; // Количество дней (если требуется)
	stockman?: number; // ChatId кладовщика (если требуется)
}

// Схема получения
export const ConfirmationSchema: Schema = new Schema(
	{
		chatId: { type: Number, required: true },
		messages: { type: [{ id: String, chatId: Number }], required: true },
		text: { type: String, required: true },
		instruments: { type: Map },
		furniture: { type: Map },
		consumables: { type: Map },
		days: { type: Number },
		stockman: { type: Number }
	},
	{ collection: 'confirmations' }
);

export default mongoose.model<IConfirmation>('Confirmation', ConfirmationSchema);
