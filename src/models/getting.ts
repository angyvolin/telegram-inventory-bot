import mongoose, { Document, Schema } from 'mongoose';

export interface IGetting extends Document {
	chatId: number;
	instruments?: Map<string, number>;
	furniture?: Map<string, number>;
	consumables?: Map<string, number>;
	created: Date;
	expires?: Date;
}

// Схема получения
export const GettingSchema: Schema = new Schema(
	{
		chatId: { type: Number, required: true },
		instruments: { type: Map },
		furniture: { type: Map },
		consumables: { type: Map },
		created: { type: Date, required: true, default: Date.now },
		expires: { type: Date }
	},
	{ collection: 'gettings' }
);

export default mongoose.model<IGetting>('Getting', GettingSchema);
