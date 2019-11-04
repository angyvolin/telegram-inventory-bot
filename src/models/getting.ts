import mongoose, { Document, Schema } from 'mongoose';

export interface IGetting extends Document {
	chatId: number;
	active: boolean;
	instruments?: Map<string, number>;
	furniture?: Map<string, number>;
	consumables?: Map<string, number>;
	removedInstruments?: Map<string, number>; // Списанные инструменты
	removedFurniture?: Map<string, number>; // Списанная фурнитура
	removedConsumables?: Map<string, number>; // Списанные расходники
	created: Date;
	expires: Date;
}

// Схема получения
export const GettingSchema: Schema = new Schema(
	{
		chatId: { type: Number, required: true },
		active: { type: Boolean, required: true },
		instruments: { type: Map },
		furniture: { type: Map },
		consumables: { type: Map },
		removedInstruments: { type: Map },
		removedFurniture: { type: Map },
		removedConsumables: { type: Map },
		created: { type: Date, required: true, default: Date.now },
		expires: { type: Date, required: true }
	},
	{ collection: 'gettings' }
);

export default mongoose.model<IGetting>('Getting', GettingSchema);
