import mongoose, { Document, Schema } from 'mongoose';

export interface IConsumable extends Document {
	id: number;
	photo?: Buffer;
	name: string;
	amount: number;
}

// Схема инструмента
export const ConsumableSchema: Schema = new Schema(
	{
		id: { type: Number, required: true, unique: true },
		photo: { type: Buffer },
		name: { type: String, required: true },
		amount: { type: Number, required: true }
	},
	{ collection: 'consumables' }
);

export default mongoose.model<IConsumable>('Consumable', ConsumableSchema);
