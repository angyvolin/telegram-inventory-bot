import mongoose, { Document, Schema } from 'mongoose';

export interface IConsumable extends Document {
	photo?: string;
	name: string;
	amount: number;
}

// Схема инструмента
export const ConsumableSchema: Schema = new Schema(
	{
		photo: { type: String },
		name: { type: String, required: true },
		amount: { type: Number, required: true }
	},
	{ collection: 'consumables' }
);

export default mongoose.model<IConsumable>('Consumable', ConsumableSchema);
